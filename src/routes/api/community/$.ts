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
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) return null;
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

async function allowWrite(actor: Actor, action: string, max = 5): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000);
  const key = `${actor.id}:${action}`;
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

async function publicPosts(request: Request) {
  const actor = await signedIn(request);
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
    `SELECT p.id,p.category_slug,p.title,p.body,p.created_at,p.updated_at,
       CASE WHEN pr.visibility = 'private' THEN '社区成员' ELSE COALESCE(pr.display_name,u.name,'社区成员') END AS author_name,
       CASE WHEN p.author_id=? THEN 1 ELSE 0 END AS is_author,
       CASE WHEN pr.visibility = 'public' THEN pr.avatar_url ELSE NULL END AS author_avatar,
       (SELECT COUNT(*) FROM comments c WHERE c.post_id=p.id AND c.status='visible') AS comment_count
     FROM posts p LEFT JOIN profiles pr ON pr.user_id=p.author_id LEFT JOIN "user" u ON u.id=p.author_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
  )
    .bind(actor?.id ?? "", ...bindings)
    .all();
  return json({ posts: rows.results });
}

async function postDetail(request: Request, id: string) {
  const post = await env.DB.prepare(
    `SELECT p.id,p.category_slug,p.title,p.body,p.created_at,p.updated_at,
       CASE WHEN pr.visibility = 'private' THEN '社区成员' ELSE COALESCE(pr.display_name,u.name,'社区成员') END AS author_name,
       CASE WHEN p.author_id=? THEN 1 ELSE 0 END AS is_author,
       CASE WHEN pr.visibility = 'public' THEN pr.avatar_url ELSE NULL END AS author_avatar
     FROM posts p LEFT JOIN profiles pr ON pr.user_id=p.author_id LEFT JOIN "user" u ON u.id=p.author_id
     WHERE p.id=? AND p.status='visible'`,
  )
    .bind((await signedIn(request))?.id ?? "", id)
    .first();
  if (!post) return fail(404, "Post not found");
  const comments = await env.DB.prepare(
    `SELECT c.id,c.post_id,c.parent_id,c.body,c.created_at,c.updated_at,
       CASE WHEN c.author_id=? THEN 1 ELSE 0 END AS is_author,
       CASE WHEN pr.visibility = 'private' THEN '社区成员' ELSE COALESCE(pr.display_name,u.name,'社区成员') END AS author_name,
       CASE WHEN pr.visibility = 'public' THEN pr.avatar_url ELSE NULL END AS author_avatar
     FROM comments c LEFT JOIN profiles pr ON pr.user_id=c.author_id LEFT JOIN "user" u ON u.id=c.author_id
     WHERE c.post_id=? AND c.status='visible' ORDER BY c.created_at ASC LIMIT 200`,
  )
    .bind((await signedIn(request))?.id ?? "", id)
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

async function createPost(request: Request, actor: Actor) {
  if (!(await allowWrite(actor, "post:create", 4)))
    return fail(429, "Please wait before posting again.");
  const body = await bodyObject(request, 9_000);
  const title = text(body?.title, 3, 160);
  const content = text(body?.body, 1, 8_000);
  const category = text(body?.category, 1, 40);
  if (!title || !content || !category)
    return fail(400, "Check the title, body, and category lengths.");
  const categoryRow = await env.DB.prepare("SELECT slug FROM categories WHERE slug=? AND enabled=1")
    .bind(category)
    .first();
  if (!categoryRow) return fail(400, "Unknown category.");
  const id = crypto.randomUUID();
  await env.DB.prepare("INSERT INTO posts(id,author_id,category_slug,title,body) VALUES(?,?,?,?,?)")
    .bind(id, actor.id, category, title, content)
    .run();
  return json({ id }, 201);
}

async function createComment(request: Request, actor: Actor, postId: string) {
  if (!(await allowWrite(actor, "comment:create", 12)))
    return fail(429, "Please wait before commenting again.");
  const body = await bodyObject(request, 5_000);
  const content = text(body?.body, 1, 4_000);
  const parentId = typeof body?.parentId === "string" ? body.parentId : null;
  if (!content) return fail(400, "Comment must be between 1 and 4000 characters.");
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
  await env.DB.prepare(
    "INSERT INTO comments(id,post_id,author_id,parent_id,body) VALUES(?,?,?,?,?)",
  )
    .bind(id, postId, actor.id, parentId, content)
    .run();
  return json({ id }, 201);
}

async function createReport(request: Request, actor: Actor, type: string, id: string) {
  if (!(await allowWrite(actor, "report:create", 5)))
    return fail(429, "Please wait before sending another report.");
  if (type !== "post" && type !== "comment") return fail(400, "Unsupported report target.");
  const body = await bodyObject(request, 2_000);
  const reason = text(body?.reason, 3, 1_000);
  if (!reason) return fail(400, "Report reason must be between 3 and 1000 characters.");
  const table = type === "post" ? "posts" : "comments";
  const target = await env.DB.prepare(`SELECT id FROM ${table} WHERE id=?`).bind(id).first();
  if (!target) return fail(404, "Report target not found.");
  const duplicate = await env.DB.prepare(
    "SELECT id FROM reports WHERE reporter_id=? AND target_type=? AND target_id=? AND status='open' LIMIT 1",
  )
    .bind(actor.id, type, id)
    .first();
  if (duplicate) return json({ accepted: true });
  const reportId = crypto.randomUUID();
  await env.DB.prepare(
    "INSERT INTO reports(id,reporter_id,target_type,target_id,reason) VALUES(?,?,?,?,?)",
  )
    .bind(reportId, actor.id, type, id, reason)
    .run();
  return json({ accepted: true }, 201);
}

async function adminApi(request: Request, actor: Actor, segments: string[]) {
  const isAdmin = await hasAdminRole(actor);
  const isStaff = isAdmin || (await hasStaffRole(actor));
  if (!isStaff) return fail(403, "Staff access required.");
  const [resource, id] = segments;
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
    await env.DB.prepare(
      "UPDATE reports SET status=?,resolved_by=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='open'",
    )
      .bind(status, actor.id, id)
      .run();
    return json({ updated: true });
  }
  if (resource === "posts" && id && request.method === "PATCH") {
    const body = await bodyObject(request, 9_000);
    const status = body?.status;
    if (status !== "hidden" && status !== "visible") return fail(400, "Invalid moderation status.");
    await env.DB.prepare("UPDATE posts SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?")
      .bind(status, id)
      .run();
    return json({ updated: true });
  }
  if (resource === "comments" && id && request.method === "PATCH") {
    const body = await bodyObject(request, 5_000);
    const status = body?.status;
    if (status !== "hidden" && status !== "visible") return fail(400, "Invalid moderation status.");
    await env.DB.prepare("UPDATE comments SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?")
      .bind(status, id)
      .run();
    return json({ updated: true });
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
        await env.DB.prepare(
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
        return json({ updated: true });
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
      await env.DB.prepare(
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
      return json({ updated: true });
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
    if (resource === "profile") {
      const actor = await signedIn(request);
      if (!actor) return fail(401, "Sign in required.");
      const profile = await env.DB.prepare(
        `SELECT COALESCE(p.display_name,u.name) AS display_name,p.avatar_url,COALESCE(p.visibility,'public') AS visibility
         FROM "user" u LEFT JOIN profiles p ON p.user_id=u.id WHERE u.id=?`,
      )
        .bind(actor.id)
        .first();
      return json({ profile });
    }
    if (resource === "admin") {
      const actor = await signedIn(request);
      if (!actor) return fail(401, "Sign in required.");
      return adminApi(request, actor, segments.slice(1));
    }
    return fail(404, "Route not found.");
  }

  if (!csrfOk(request)) return fail(403, "Same-origin requests only.");
  const actor = await signedIn(request);
  if (!actor) return fail(401, "Sign in required.");
  if (resource === "admin") return adminApi(request, actor, segments.slice(1));

  if (resource === "profile" && (request.method === "PATCH" || request.method === "POST")) {
    const body = await bodyObject(request, 3_000);
    const displayName = text(body?.["displayName"], 1, 60);
    const visibility = body?.["visibility"] === "private" ? "private" : "public";
    const avatar =
      body?.["avatarUrl"] === "" || body?.["avatarUrl"] == null
        ? null
        : text(body["avatarUrl"], 1, 1_000);
    if (!displayName || (body?.["avatarUrl"] && (!avatar || !avatar.startsWith("https://"))))
      return fail(400, "Use a nickname of 1–60 characters and an optional HTTPS avatar URL.");
    await env.DB.prepare(
      `INSERT INTO profiles(user_id,display_name,avatar_url,visibility) VALUES(?,?,?,?)
       ON CONFLICT(user_id) DO UPDATE SET display_name=excluded.display_name,avatar_url=excluded.avatar_url,visibility=excluded.visibility,updated_at=CURRENT_TIMESTAMP`,
    )
      .bind(actor.id, displayName, avatar, visibility)
      .run();
    return json({ saved: true });
  }

  if (resource === "posts" && !id && request.method === "POST") return createPost(request, actor);
  if (resource === "posts" && id && subresource === "comments" && request.method === "POST")
    return createComment(request, actor, id);
  if (resource === "posts" && id && request.method === "PATCH") {
    if (!(await allowWrite(actor, "post:update", 15)))
      return fail(429, "Please wait before editing again.");
    const body = await bodyObject(request, 9_000);
    if (!body) return fail(400, "Invalid request data.");
    const title = text(body.title, 3, 160);
    const content = text(body.body, 1, 8_000);
    if (!title || !content) return fail(400, "Check the title and body lengths.");
    const staff = await hasStaffRole(actor);
    const result = await env.DB.prepare(
      `UPDATE posts SET title=?,body=?,updated_at=CURRENT_TIMESTAMP
       WHERE id=? AND (author_id=? OR ?=1) AND status != 'hidden'`,
    )
      .bind(title, content, id, actor.id, staff ? 1 : 0)
      .run();
    return result.meta.changes
      ? json({ updated: true })
      : fail(404, "Post not found or not editable.");
  }
  if (resource === "posts" && id && request.method === "DELETE") {
    const staff = await hasStaffRole(actor);
    const result = await env.DB.prepare("DELETE FROM posts WHERE id=? AND (author_id=? OR ?=1)")
      .bind(id, actor.id, staff ? 1 : 0)
      .run();
    return result.meta.changes
      ? json({ deleted: true })
      : fail(404, "Post not found or not editable.");
  }
  if (resource === "comments" && id && request.method === "PATCH") {
    if (!(await allowWrite(actor, "comment:update", 20)))
      return fail(429, "Please wait before editing again.");
    const body = await bodyObject(request, 5_000);
    const content = text(body?.body, 1, 4_000);
    if (!content) return fail(400, "Comment must be between 1 and 4000 characters.");
    const staff = await hasStaffRole(actor);
    const result = await env.DB.prepare(
      `UPDATE comments SET body=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND (author_id=? OR ?=1) AND status != 'hidden'`,
    )
      .bind(content, id, actor.id, staff ? 1 : 0)
      .run();
    return result.meta.changes
      ? json({ updated: true })
      : fail(404, "Comment not found or not editable.");
  }
  if (resource === "comments" && id && request.method === "DELETE") {
    const staff = await hasStaffRole(actor);
    const result = await env.DB.prepare("DELETE FROM comments WHERE id=? AND (author_id=? OR ?=1)")
      .bind(id, actor.id, staff ? 1 : 0)
      .run();
    return result.meta.changes
      ? json({ deleted: true })
      : fail(404, "Comment not found or not editable.");
  }
  if (resource === "reports" && id && request.method === "POST")
    return createReport(request, actor, id, subresource || "");
  if (resource === "events" && id && subresource === "interest" && request.method === "POST") {
    if (!(await allowWrite(actor, "event:interest", 4)))
      return fail(429, "Please wait before registering interest again.");
    const eventId = id;
    const event = await env.DB.prepare("SELECT id FROM events WHERE id=? AND published=1")
      .bind(eventId)
      .first();
    if (!event) return fail(404, "Event not found.");
    await env.DB.prepare("INSERT OR IGNORE INTO event_interest(id,event_id,user_id) VALUES(?,?,?)")
      .bind(crypto.randomUUID(), eventId, actor.id)
      .run();
    return json({ accepted: true }, 201);
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
