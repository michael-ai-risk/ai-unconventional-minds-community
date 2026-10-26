import { auth } from "@/lib/auth";
import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";

type Actor = { id: string };
type Role = "admin" | "moderator" | "member";
type Body = {
  title?: unknown;
  body?: unknown;
  category?: unknown;
  parentId?: unknown;
  reason?: unknown;
  status?: unknown;
  slug?: unknown;
  titleZh?: unknown;
  titleEn?: unknown;
  summaryZh?: unknown;
  summaryEn?: unknown;
  bodyZh?: unknown;
  bodyEn?: unknown;
  published?: unknown;
  startsAt?: unknown;
  venueZh?: unknown;
  venueEn?: unknown;
  categorySlug?: unknown;
  displayName?: unknown;
  [key: string]: unknown;
};

const json = (data: unknown, status = 200) =>
  Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });

const fail = (status: number, message: string) => json({ error: message }, status);

async function bodyObject(request: Request, maxBytes = 12_000): Promise<Body | null> {
  const size = Number(request.headers.get("content-length") || 0);
  if (size > maxBytes) return null;
  if (!request.body) return null;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } catch {
    return null;
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const text = new TextDecoder().decode(bytes);
  try {
    const value: unknown = JSON.parse(text);
    return value && typeof value === "object" && !Array.isArray(value) ? (value as Body) : null;
  } catch {
    return null;
  }
}

function text(value: unknown, min: number, max: number): string | null {
  if (typeof value !== "string") return null;
  const clean = value.trim();
  return clean.length >= min && clean.length <= max ? clean : null;
}

function csrfOk(request: Request): boolean {
  const origin = request.headers.get("origin");
  return !!origin && origin === new URL(request.url).origin;
}

async function signedIn(request: Request): Promise<Actor | null> {
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user?.id ? { id: session.user.id } : null;
}

async function hasStaffRole(actor: Actor): Promise<boolean> {
  const role = await env.DB.prepare(
    "SELECT 1 FROM roles WHERE user_id = ? AND role IN ('admin','moderator') LIMIT 1",
  )
    .bind(actor.id)
    .first();
  return !!role;
}

async function hasAdminRole(actor: Actor): Promise<boolean> {
  const role = await env.DB.prepare(
    "SELECT 1 FROM roles WHERE user_id = ? AND role = 'admin' LIMIT 1",
  )
    .bind(actor.id)
    .first();
  return !!role;
}

async function digest(value: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sourceFingerprint(request: Request): Promise<string> {
  const ip = request.headers.get("cf-connecting-ip") || "local-unknown";
  // Anonymous writes need a keyed source fingerprint before Better Auth is
  // initialized. Prefer the app secret, but allow the configured Preview secret
  // as root key while auth setup is optional; HKDF keeps this use domain-separated.
  const secret = env.BETTER_AUTH_SECRET || env.TURNSTILE_SECRET_KEY;
  if (!secret) throw new Error("Rate-limit fingerprint secret is not configured");
  const encoder = new TextEncoder();
  const material = await crypto.subtle.importKey("raw", encoder.encode(secret), "HKDF", false, [
    "deriveKey",
  ]);
  const key = await crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: encoder.encode("ai-unconventional-minds-community:rate-limit:v1"),
      info: encoder.encode("source-fingerprint"),
    },
    material,
    { name: "HMAC", hash: "SHA-256", length: 256 },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(ip));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

async function allowWrite(request: Request, action: string, max = 5): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000);
  const key = `${await sourceFingerprint(request)}:${action}`;
  await env.DB.prepare(
    `INSERT INTO rate_limits(key,window_started,hits) VALUES(?,?,1)
     ON CONFLICT(key) DO UPDATE SET
       hits = CASE WHEN window_started <= ? THEN 1 ELSE hits + 1 END,
       window_started = CASE WHEN window_started <= ? THEN excluded.window_started ELSE window_started END`,
  )
    .bind(key, now, now - 60, now - 60)
    .run();
  const row = await env.DB.prepare("SELECT hits FROM rate_limits WHERE key = ?")
    .bind(key)
    .first<{ hits: number }>();
  return (row?.hits ?? 0) <= max;
}

function createEditToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function editTokenHash(request: Request): Promise<string | null> {
  const token = request.headers.get("x-content-token");
  return token && /^[A-Za-z0-9_-]{40,50}$/.test(token) ? digest(token) : null;
}

async function ownsContent(
  request: Request,
  table: "posts" | "comments",
  id: string,
): Promise<boolean> {
  const tokenHash = await editTokenHash(request);
  if (!tokenHash) return false;
  const row = await env.DB.prepare(`SELECT 1 FROM ${table} WHERE id=? AND owner_token_hash=?`)
    .bind(id, tokenHash)
    .first();
  return !!row;
}

async function validStaff(request: Request): Promise<Actor | null> {
  const actor = await signedIn(request);
  return actor && (await hasStaffRole(actor)) ? actor : null;
}

async function publicPosts(request: Request) {
  const url = new URL(request.url);
  const category = text(url.searchParams.get("category"), 1, 40);
  const query = text(url.searchParams.get("q"), 1, 100);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 20), 1), 30);
  const offset = Math.min(Math.max(Number(url.searchParams.get("offset") || 0), 0), 500);
  const conditions = ["p.status = 'visible'"];
  const bindings: unknown[] = [];
  if (category) {
    conditions.push("p.category_slug = ?");
    bindings.push(category);
  }
  if (query) {
    conditions.push("(p.title LIKE ? ESCAPE '\\' OR p.body LIKE ? ESCAPE '\\')");
    const term = `%${query.replace(/[\\%_]/g, "\\$&")}%`;
    bindings.push(term, term);
  }
  bindings.push(limit, offset);
  const rows = await env.DB.prepare(
    `SELECT p.id,p.category_slug,p.title,p.body,p.author_name,p.created_at,p.updated_at,
       CASE WHEN pr.visibility = 'public' THEN pr.avatar_url ELSE NULL END AS author_avatar,
       (SELECT COUNT(*) FROM comments c WHERE c.post_id=p.id AND c.status='visible') AS comment_count
     FROM posts p LEFT JOIN profiles pr ON pr.user_id=p.author_id LEFT JOIN "user" u ON u.id=p.author_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
  )
    .bind(...bindings)
    .all();
  return json({ posts: rows.results });
}

async function postDetail(request: Request, id: string) {
  const actor = await signedIn(request);
  const tokenHash = await editTokenHash(request);
  const post = await env.DB.prepare(
    `SELECT p.id,p.category_slug,p.title,p.body,p.author_name,p.status,p.created_at,p.updated_at,
       CASE WHEN pr.visibility = 'public' THEN pr.avatar_url ELSE NULL END AS author_avatar
     FROM posts p LEFT JOIN profiles pr ON pr.user_id=p.author_id LEFT JOIN "user" u ON u.id=p.author_id
     WHERE p.id=? AND (p.status='visible' OR p.owner_token_hash=?)`,
  )
    .bind(id, tokenHash ?? "")
    .first();
  if (!post) return fail(404, "Post not found");
  if (post["status"] !== "visible" && !(await hasStaffRole(actor ?? { id: "" })) && !tokenHash)
    return fail(404, "Post not found");
  const comments = await env.DB.prepare(
    `SELECT c.id,c.post_id,c.parent_id,c.body,c.author_name,c.status,c.created_at,c.updated_at,
       CASE WHEN pr.visibility = 'public' THEN pr.avatar_url ELSE NULL END AS author_avatar
     FROM comments c LEFT JOIN profiles pr ON pr.user_id=c.author_id LEFT JOIN "user" u ON u.id=c.author_id
     WHERE c.post_id=? AND (c.status='visible' OR (? IS NOT NULL AND c.owner_token_hash=?)) ORDER BY c.created_at ASC LIMIT 200`,
  )
    .bind(id, tokenHash, tokenHash ?? "")
    .all();
  return json({ post, comments: comments.results });
}

async function listPublic(table: "events" | "articles", slug?: string) {
  if (slug) {
    const row = await env.DB.prepare(`SELECT * FROM ${table} WHERE slug=? AND published=1`)
      .bind(slug)
      .first();
    return row ? json({ [table === "events" ? "event" : "article"]: row }) : fail(404, "Not found");
  }
  const rows = await env.DB.prepare(
    table === "events"
      ? "SELECT * FROM events WHERE published=1 ORDER BY CASE status WHEN 'scheduled' THEN 0 ELSE 1 END, starts_at DESC LIMIT 50"
      : "SELECT * FROM articles WHERE published=1 ORDER BY published_at DESC LIMIT 50",
  ).all();
  return json({ [table]: rows.results });
}

async function createPost(request: Request) {
  const body = await bodyObject(request, 9_000);
  const title = text(body?.title, 3, 160);
  const content = text(body?.body, 1, 8_000);
  const category = text(body?.category, 1, 40);
  const displayName = text(body?.displayName ?? "", 0, 60) || "访客 / Guest";
  if (!title || !content || !category)
    return fail(400, "Check the title, body, and category lengths.");
  if (!(await allowWrite(request, "post:create", 12)))
    return fail(429, "Too many posts from this network. Please wait a little and try again.");
  const categoryRow = await env.DB.prepare("SELECT slug FROM categories WHERE slug=? AND enabled=1")
    .bind(category)
    .first();
  if (!categoryRow) return fail(400, "Unknown category.");
  const id = crypto.randomUUID();
  const editToken = createEditToken();
  await env.DB.prepare(
    "INSERT INTO posts(id,author_id,author_name,owner_token_hash,category_slug,title,body,status) VALUES(?,?,?,?,?,?,?,'pending')",
  )
    .bind(id, "community-guest", displayName, await digest(editToken), category, title, content)
    .run();
  return json({ id, editToken, status: "pending" }, 201);
}

async function createComment(request: Request, postId: string) {
  const body = await bodyObject(request, 5_000);
  const content = text(body?.body, 1, 4_000);
  const displayName = text(body?.displayName ?? "", 0, 60) || "访客 / Guest";
  const parentId = typeof body?.parentId === "string" ? body.parentId : null;
  if (!content) return fail(400, "Comment must be between 1 and 4000 characters.");
  if (!(await allowWrite(request, "comment:create", 60)))
    return fail(429, "Too many comments from this network. Please wait a little and try again.");
  const post = await env.DB.prepare("SELECT id FROM posts WHERE id=? AND status='visible'")
    .bind(postId)
    .first();
  if (!post) return fail(404, "Post not found.");
  if (parentId) {
    const parent = await env.DB.prepare(
      "SELECT id FROM comments WHERE id=? AND post_id=? AND status='visible'",
    )
      .bind(parentId, postId)
      .first();
    if (!parent) return fail(400, "Reply target is invalid.");
  }
  const id = crypto.randomUUID();
  const editToken = createEditToken();
  await env.DB.prepare(
    "INSERT INTO comments(id,post_id,author_id,author_name,owner_token_hash,parent_id,body,status) VALUES(?,?,?,?,?,?,?,'pending')",
  )
    .bind(id, postId, "community-guest", displayName, await digest(editToken), parentId, content)
    .run();
  return json({ id, editToken, status: "pending" }, 201);
}

async function createReport(request: Request, type: string, id: string) {
  if (!(await allowWrite(request, "report:create", 20)))
    return fail(429, "Too many reports from this network. Please wait before trying again.");
  if (type !== "post" && type !== "comment") return fail(400, "Unsupported report target.");
  const body = await bodyObject(request, 2_000);
  const reason = text(body?.reason, 3, 1_000);
  if (!reason) return fail(400, "Report reason must be between 3 and 1000 characters.");
  const table = type === "post" ? "posts" : "comments";
  const target = await env.DB.prepare(`SELECT id FROM ${table} WHERE id=?`).bind(id).first();
  if (!target) return fail(404, "Report target not found.");
  const fingerprint = await digest(`${await sourceFingerprint(request)}:${type}:${id}`);
  const duplicate = await env.DB.prepare(
    "SELECT id FROM reports WHERE reporter_fingerprint=? AND status='open' LIMIT 1",
  )
    .bind(fingerprint)
    .first();
  if (duplicate) return json({ accepted: true });
  const reportId = crypto.randomUUID();
  await env.DB.prepare(
    "INSERT INTO reports(id,reporter_id,reporter_fingerprint,target_type,target_id,reason) VALUES(?,?,?,?,?,?)",
  )
    .bind(reportId, "community-guest", fingerprint, type, id, reason)
    .run();
  return json({ accepted: true }, 201);
}

async function adminApi(request: Request, actor: Actor, segments: string[]) {
  const isAdmin = await hasAdminRole(actor);
  const isStaff = isAdmin || (await hasStaffRole(actor));
  if (!isStaff) return fail(403, "Staff access required.");
  const [resource, id] = segments;
  if (resource === "posts" && !id && request.method === "GET") {
    const rows = await env.DB.prepare(
      "SELECT id,author_name,category_slug,title,body,status,created_at FROM posts WHERE status='pending' ORDER BY created_at ASC LIMIT 100",
    ).all();
    return json({ posts: rows.results });
  }
  if (resource === "comments" && !id && request.method === "GET") {
    const rows = await env.DB.prepare(
      "SELECT id,post_id,parent_id,author_name,body,status,created_at FROM comments WHERE status='pending' ORDER BY created_at ASC LIMIT 200",
    ).all();
    return json({ comments: rows.results });
  }
  if (resource === "reports" && request.method === "GET") {
    const rows = await env.DB.prepare(
      `SELECT r.*, p.title AS post_title, c.body AS comment_body
       FROM reports r LEFT JOIN posts p ON r.target_type='post' AND r.target_id=p.id
       LEFT JOIN comments c ON r.target_type='comment' AND r.target_id=c.id
       WHERE r.status='open' ORDER BY r.created_at ASC LIMIT 100`,
    ).all();
    return json({ reports: rows.results });
  }
  if (resource === "reports" && id && request.method === "PATCH") {
    if (!isAdmin && !(await hasStaffRole(actor))) return fail(403, "Staff access required.");
    const body = await bodyObject(request, 1_000);
    const status = body?.status;
    if (status !== "resolved" && status !== "dismissed") return fail(400, "Invalid report status.");
    const result = await env.DB.prepare(
      "UPDATE reports SET status=?,resolved_by=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='open'",
    )
      .bind(status, actor.id, id)
      .run();
    return result.meta.changes ? json({ updated: true }) : fail(404, "Report not found.");
  }
  if (resource === "posts" && id && request.method === "PATCH") {
    const body = await bodyObject(request, 9_000);
    const status = body?.status;
    if (!["hidden", "visible", "pending"].includes(String(status)))
      return fail(400, "Invalid moderation status.");
    const result = await env.DB.prepare(
      "UPDATE posts SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",
    )
      .bind(status, id)
      .run();
    return result.meta.changes ? json({ updated: true }) : fail(404, "Post not found.");
  }
  if (resource === "comments" && id && request.method === "PATCH") {
    const body = await bodyObject(request, 5_000);
    const status = body?.status;
    if (!["hidden", "visible", "pending"].includes(String(status)))
      return fail(400, "Invalid moderation status.");
    const result = await env.DB.prepare(
      "UPDATE comments SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",
    )
      .bind(status, id)
      .run();
    return result.meta.changes ? json({ updated: true }) : fail(404, "Comment not found.");
  }
  if ((resource === "posts" || resource === "comments") && id && request.method === "DELETE") {
    const result = await env.DB.prepare(`DELETE FROM ${resource} WHERE id=?`).bind(id).run();
    return result.meta.changes ? json({ deleted: true }) : fail(404, "Content not found.");
  }
  if (resource === "events" || resource === "articles") {
    const table = resource;
    if (!isAdmin) return fail(403, "Admin access required.");
    if (request.method === "GET") {
      const rows = await env.DB.prepare(
        `SELECT * FROM ${table} ORDER BY updated_at DESC LIMIT 100`,
      ).all();
      return json({ [table]: rows.results });
    }
    if ((!id && request.method !== "POST") || (id && request.method !== "PUT"))
      return fail(405, "Method not allowed.");
    const body = await bodyObject(request, 30_000);
    if (!body) return fail(400, "Invalid request data.");
    const slug = text(body.slug, 3, 120);
    const titleZh = text(body.titleZh, 1, 160);
    const titleEn = text(body.titleEn, 1, 160);
    const summaryZh = text(body.summaryZh ?? "", 0, 2_000);
    const summaryEn = text(body.summaryEn ?? "", 0, 2_000);
    const bodyZh = text(body.bodyZh ?? "", 0, 20_000);
    const bodyEn = text(body.bodyEn ?? "", 0, 20_000);
    const published = body.published === true ? 1 : 0;
    if (
      !slug ||
      !titleZh ||
      !titleEn ||
      summaryZh === null ||
      summaryEn === null ||
      bodyZh === null ||
      bodyEn === null
    )
      return fail(400, "Required bilingual fields are missing or too long.");
    if (table === "events") {
      const status = ["tba", "scheduled", "past", "cancelled"].includes(String(body.status))
        ? String(body.status)
        : "tba";
      const startsAt =
        status === "scheduled" && typeof body.startsAt === "string" ? body.startsAt : null;
      const venueZh = typeof body.venueZh === "string" ? text(body.venueZh, 0, 300) : null;
      const venueEn = typeof body.venueEn === "string" ? text(body.venueEn, 0, 300) : null;
      if (status === "scheduled" && (!startsAt || !venueZh || !venueEn))
        return fail(400, "Scheduled events need a confirmed date and both venue names.");
      if (id && request.method === "PUT") {
        const result = await env.DB.prepare(
          `UPDATE events SET slug=?,title_zh=?,title_en=?,summary_zh=?,summary_en=?,body_zh=?,body_en=?,status=?,starts_at=?,venue_zh=?,venue_en=?,published=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`,
        )
          .bind(
            slug,
            titleZh,
            titleEn,
            summaryZh,
            summaryEn,
            bodyZh,
            bodyEn,
            status,
            startsAt,
            venueZh,
            venueEn,
            published,
            id,
          )
          .run();
        return result.meta.changes ? json({ updated: true }) : fail(404, "Event not found.");
      }
      const eventId = crypto.randomUUID();
      await env.DB.prepare(
        `INSERT INTO events(id,slug,title_zh,title_en,summary_zh,summary_en,body_zh,body_en,status,starts_at,venue_zh,venue_en,published,created_by)
         VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      )
        .bind(
          eventId,
          slug,
          titleZh,
          titleEn,
          summaryZh,
          summaryEn,
          bodyZh,
          bodyEn,
          status,
          startsAt,
          venueZh,
          venueEn,
          published,
          actor.id,
        )
        .run();
      return json({ id: eventId }, 201);
    }
    const category = text(body.categorySlug, 1, 60) ?? "learning";
    if (id && request.method === "PUT") {
      const result = await env.DB.prepare(
        `UPDATE articles SET slug=?,title_zh=?,title_en=?,excerpt_zh=?,excerpt_en=?,body_zh=?,body_en=?,category_slug=?,published=?,published_at=CASE WHEN ?=1 THEN COALESCE(published_at,CURRENT_TIMESTAMP) ELSE NULL END,updated_at=CURRENT_TIMESTAMP WHERE id=?`,
      )
        .bind(
          slug,
          titleZh,
          titleEn,
          summaryZh,
          summaryEn,
          bodyZh,
          bodyEn,
          category,
          published,
          published,
          id,
        )
        .run();
      return result.meta.changes ? json({ updated: true }) : fail(404, "Article not found.");
    }
    const articleId = crypto.randomUUID();
    await env.DB.prepare(
      `INSERT INTO articles(id,slug,title_zh,title_en,excerpt_zh,excerpt_en,body_zh,body_en,category_slug,published,published_at,created_by)
       VALUES(?,?,?,?,?,?,?,?,?,?,CASE WHEN ?=1 THEN CURRENT_TIMESTAMP ELSE NULL END,?)`,
    )
      .bind(
        articleId,
        slug,
        titleZh,
        titleEn,
        summaryZh,
        summaryEn,
        bodyZh,
        bodyEn,
        category,
        published,
        published,
        actor.id,
      )
      .run();
    return json({ id: articleId }, 201);
  }
  return fail(404, "Admin route not found.");
}

async function handle(request: Request) {
  const segments = new URL(request.url).pathname
    .replace(/^\/api\/community\/?/, "")
    .split("/")
    .filter(Boolean)
    .map((part) => decodeURIComponent(part));
  const [resource, id, subresource, subid] = segments;
  if (request.method === "GET") {
    if (resource === "posts" && !id) return publicPosts(request);
    if (resource === "posts" && id) return postDetail(request, id);
    if (resource === "events") return listPublic("events", id);
    if (resource === "articles") return listPublic("articles", id);
    if (resource === "categories") {
      const rows = await env.DB.prepare(
        "SELECT slug,title_zh,title_en FROM categories WHERE enabled=1 ORDER BY sort_order",
      ).all();
      return json({ categories: rows.results });
    }
    if (resource === "admin") {
      const actor = await signedIn(request);
      if (!actor) return fail(401, "Sign in required.");
      return adminApi(request, actor, segments.slice(1));
    }
    return fail(404, "Route not found.");
  }

  if (!csrfOk(request)) return fail(403, "Same-origin requests only.");
  if (resource === "admin") {
    const actor = await signedIn(request);
    if (!actor) return fail(401, "Staff sign-in required.");
    return adminApi(request, actor, segments.slice(1));
  }

  if (resource === "posts" && !id && request.method === "POST") return createPost(request);
  if (resource === "posts" && id && subresource === "comments" && request.method === "POST")
    return createComment(request, id);
  if (resource === "posts" && id && request.method === "PATCH") {
    const actor = await signedIn(request);
    const staff = actor ? await hasStaffRole(actor) : false;
    if (!staff && !(await ownsContent(request, "posts", id)))
      return fail(403, "The private edit key is invalid or missing.");
    if (!(await allowWrite(request, "post:update", 30)))
      return fail(429, "Too many edits from this network. Please wait before trying again.");
    const body = await bodyObject(request, 9_000);
    if (!body) return fail(400, "Invalid request data.");
    const title = text(body.title, 3, 160);
    const content = text(body.body, 1, 8_000);
    if (!title || !content) return fail(400, "Check the title and body lengths.");
    const tokenHash = await editTokenHash(request);
    const result = await env.DB.prepare(
      `UPDATE posts SET title=?,body=?,updated_at=CURRENT_TIMESTAMP
       WHERE id=? AND (?=1 OR owner_token_hash=?) AND status != 'hidden'`,
    )
      .bind(title, content, id, staff ? 1 : 0, tokenHash ?? "")
      .run();
    return result.meta.changes
      ? json({ updated: true })
      : fail(404, "Post not found or not editable.");
  }
  if (resource === "posts" && id && request.method === "DELETE") {
    const actor = await signedIn(request);
    const staff = actor ? await hasStaffRole(actor) : false;
    if (!staff && !(await ownsContent(request, "posts", id)))
      return fail(403, "The private edit key is invalid or missing.");
    const tokenHash = await editTokenHash(request);
    const result = await env.DB.prepare(
      "DELETE FROM posts WHERE id=? AND (?=1 OR owner_token_hash=?)",
    )
      .bind(id, staff ? 1 : 0, tokenHash ?? "")
      .run();
    return result.meta.changes
      ? json({ deleted: true })
      : fail(404, "Post not found or not editable.");
  }
  if (resource === "comments" && id && request.method === "PATCH") {
    const actor = await signedIn(request);
    const staff = actor ? await hasStaffRole(actor) : false;
    if (!staff && !(await ownsContent(request, "comments", id)))
      return fail(403, "The private edit key is invalid or missing.");
    if (!(await allowWrite(request, "comment:update", 40)))
      return fail(429, "Too many edits from this network. Please wait before trying again.");
    const body = await bodyObject(request, 5_000);
    const content = text(body?.body, 1, 4_000);
    if (!content) return fail(400, "Comment must be between 1 and 4000 characters.");
    const tokenHash = await editTokenHash(request);
    const result = await env.DB.prepare(
      `UPDATE comments SET body=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND (?=1 OR owner_token_hash=?) AND status != 'hidden'`,
    )
      .bind(content, id, staff ? 1 : 0, tokenHash ?? "")
      .run();
    return result.meta.changes
      ? json({ updated: true })
      : fail(404, "Comment not found or not editable.");
  }
  if (resource === "comments" && id && request.method === "DELETE") {
    const actor = await signedIn(request);
    const staff = actor ? await hasStaffRole(actor) : false;
    if (!staff && !(await ownsContent(request, "comments", id)))
      return fail(403, "The private edit key is invalid or missing.");
    const tokenHash = await editTokenHash(request);
    const result = await env.DB.prepare(
      "DELETE FROM comments WHERE id=? AND (?=1 OR owner_token_hash=?)",
    )
      .bind(id, staff ? 1 : 0, tokenHash ?? "")
      .run();
    return result.meta.changes
      ? json({ deleted: true })
      : fail(404, "Comment not found or not editable.");
  }
  if (resource === "reports" && id && request.method === "POST")
    return createReport(request, id, subresource || "");
  if (resource === "events" && id && subresource === "interest" && request.method === "POST") {
    return fail(410, "Event interest is handled by the optional Tally survey.");
  }
  return fail(404, "Route not found.");
}

export const Route = createFileRoute("/api/community/$")({
  server: {
    handlers: {
      GET: ({ request }) =>
        handle(request).catch((error) => {
          console.error("Community GET failed", error);
          return fail(500, "Community service is unavailable.");
        }),
      POST: ({ request }) =>
        handle(request).catch((error) => {
          console.error("Community POST failed", error);
          return fail(500, "Community service is unavailable.");
        }),
      PUT: ({ request }) =>
        handle(request).catch((error) => {
          console.error("Community PUT failed", error);
          return fail(500, "Community service is unavailable.");
        }),
      PATCH: ({ request }) =>
        handle(request).catch((error) => {
          console.error("Community PATCH failed", error);
          return fail(500, "Community service is unavailable.");
        }),
      DELETE: ({ request }) =>
        handle(request).catch((error) => {
          console.error("Community DELETE failed", error);
          return fail(500, "Community service is unavailable.");
        }),
    },
  },
});
