import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useI18n } from "@/lib/i18n";

type RecordRow = Record<string, string | number | null> & {
  id: string;
  slug: string;
  title_zh: string;
  title_en: string;
};
type Report = {
  id: string;
  target_type: string;
  target_id: string;
  reason: string;
  status: string;
  post_title: string | null;
  comment_body: string | null;
};
async function api<T extends Record<string, unknown> = Record<string, unknown>>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch("/api/community/" + path, {
    credentials: "include",
    ...init,
    headers: { ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers },
  });
  const raw: unknown = await response.json().catch(() => ({}));
  const data = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  if (!response.ok)
    throw new Error(
      typeof data["error"] === "string"
        ? data["error"]
        : "Request failed (" + response.status + ")",
    );
  return data as T;
}

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "管理 · AI非正常人类情报站" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { lang } = useI18n();
  const en = lang === "en";
  const { data: session, isPending } = authClient.useSession();
  const [reports, setReports] = useState<Report[]>([]);
  const [events, setEvents] = useState<RecordRow[]>([]);
  const [articles, setArticles] = useState<RecordRow[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [eventId, setEventId] = useState("");
  const [articleId, setArticleId] = useState("");
  const [event, setEvent] = useState({
    slug: "",
    titleZh: "",
    titleEn: "",
    summaryZh: "",
    summaryEn: "",
    bodyZh: "",
    bodyEn: "",
    status: "tba",
    startsAt: "",
    venueZh: "",
    venueEn: "",
    published: true,
  });
  const [article, setArticle] = useState({
    slug: "",
    titleZh: "",
    titleEn: "",
    summaryZh: "",
    summaryEn: "",
    bodyZh: "",
    bodyEn: "",
    categorySlug: "learning",
    published: true,
  });
  const load = useCallback(async () => {
    setError("");
    try {
      const [reportResult, eventResult, articleResult] = await Promise.all([
        api<{ reports?: Report[] }>("admin/reports"),
        api<{ events?: RecordRow[] }>("admin/events"),
        api<{ articles?: RecordRow[] }>("admin/articles"),
      ]);
      setReports(reportResult.reports ?? []);
      setEvents(eventResult.events ?? []);
      setArticles(articleResult.articles ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);
  useEffect(() => {
    if (session?.user) void load();
  }, [session, load]);
  const resolveReport = async (report: Report, status: "resolved" | "dismissed", hide: boolean) => {
    setError("");
    try {
      if (hide)
        await api(
          "admin/" + (report.target_type === "comment" ? "comments/" : "posts/") + report.target_id,
          { method: "PATCH", body: JSON.stringify({ status: "hidden" }) },
        );
      await api("admin/reports/" + report.id, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };
  const saveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api("admin/events" + (eventId ? "/" + eventId : ""), {
        method: eventId ? "PUT" : "POST",
        body: JSON.stringify(event),
      });
      setEventId("");
      setEvent({
        slug: "",
        titleZh: "",
        titleEn: "",
        summaryZh: "",
        summaryEn: "",
        bodyZh: "",
        bodyEn: "",
        status: "tba",
        startsAt: "",
        venueZh: "",
        venueEn: "",
        published: true,
      });
      setMessage(en ? "Event saved." : "活动已保存。");
      await load();
    } catch (x) {
      setError(x instanceof Error ? x.message : String(x));
    } finally {
      setBusy(false);
    }
  };
  const saveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api("admin/articles" + (articleId ? "/" + articleId : ""), {
        method: articleId ? "PUT" : "POST",
        body: JSON.stringify(article),
      });
      setArticleId("");
      setArticle({
        slug: "",
        titleZh: "",
        titleEn: "",
        summaryZh: "",
        summaryEn: "",
        bodyZh: "",
        bodyEn: "",
        categorySlug: "learning",
        published: true,
      });
      setMessage(en ? "Article saved." : "话题文章已保存。");
      await load();
    } catch (x) {
      setError(x instanceof Error ? x.message : String(x));
    } finally {
      setBusy(false);
    }
  };
  const field = (label: string, value: string, change: (v: string) => void, multiline = false) => (
    <label className="block text-sm font-bold">
      {label}
      {multiline ? (
        <textarea
          required
          value={value}
          onChange={(e) => change(e.target.value)}
          rows={3}
          className="mt-1 block w-full border-2 border-foreground bg-transparent p-2"
        />
      ) : (
        <input
          required
          value={value}
          onChange={(e) => change(e.target.value)}
          className="mt-1 block w-full border-b-2 border-foreground bg-transparent px-1 py-2"
        />
      )}
    </label>
  );
  return (
    <main className="mx-auto min-h-[65vh] max-w-7xl px-4 py-12 md:py-16">
      <p className="label-mono text-accent">4SEAS / ADMIN</p>
      <h1 className="mt-3 font-cn-black text-4xl md:text-6xl">
        {en ? "Community desk" : "社区管理台"}
      </h1>
      <p className="mt-4 max-w-3xl text-muted-foreground">
        {en
          ? "Private staff tools for reports, gatherings, and editorial topics."
          : "仅供有权限的工作人员处理举报、活动与编辑话题。"}
      </p>
      {isPending ? (
        <p role="status" className="mt-8">
          {en ? "Checking access…" : "正在确认权限…"}
        </p>
      ) : !session?.user ? (
        <p className="mt-8 border-2 border-foreground p-5">
          {en ? "Sign in with a staff account to continue." : "请先使用工作人员账号登录。"}
        </p>
      ) : (
        <>
          {error && (
            <p role="alert" className="mt-5 border-2 border-red-700 p-3 text-red-800">
              {error}
            </p>
          )}
          {message && (
            <p role="status" className="mt-5 border-2 border-primary p-3">
              {message}
            </p>
          )}
          <section className="mt-10">
            <h2 className="font-cn-black text-3xl">{en ? "Open reports" : "待处理举报"}</h2>
            {reports.length ? (
              <div className="mt-4 space-y-3">
                {reports.map((r) => (
                  <article key={r.id} className="paper border-2 border-foreground p-4">
                    <p className="label-mono">
                      {r.target_type} · {r.status}
                    </p>
                    <p className="mt-2 font-bold">
                      {r.post_title || r.comment_body || r.target_id}
                    </p>
                    <p className="mt-1">{r.reason}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        onClick={() => void resolveReport(r, "resolved", true)}
                        className="bg-primary px-4 py-2 font-bold text-primary-foreground"
                      >
                        {en ? "Hide content & resolve" : "隐藏内容并解决"}
                      </button>
                      <button
                        onClick={() => void resolveReport(r, "dismissed", false)}
                        className="border-2 border-foreground px-4 py-2 font-bold"
                      >
                        {en ? "Dismiss report" : "驳回举报"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-muted-foreground">
                {en ? "No open reports." : "目前没有待处理举报。"}
              </p>
            )}
          </section>
          <section className="mt-12 grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="font-cn-black text-3xl">{en ? "Events" : "活动"}</h2>
              <div className="mt-3 space-y-2">
                {events.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setEventId(item.id);
                      setEvent({
                        slug: item.slug,
                        titleZh: item.title_zh,
                        titleEn: item.title_en,
                        summaryZh: String(item["summary_zh"] || ""),
                        summaryEn: String(item["summary_en"] || ""),
                        bodyZh: String(item["body_zh"] || ""),
                        bodyEn: String(item["body_en"] || ""),
                        status: String(item["status"] || "tba"),
                        startsAt: String(item["starts_at"] || ""),
                        venueZh: String(item["venue_zh"] || ""),
                        venueEn: String(item["venue_en"] || ""),
                        published: Number(item["published"]) === 1,
                      });
                    }}
                    className="block w-full border-b border-foreground/40 py-2 text-left"
                  >
                    {item.title_zh} · {item["status"]}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => void saveEvent(e)}
                className="paper mt-4 grid gap-3 border-2 border-foreground p-4"
              >
                {field("Slug", event.slug, (v) => setEvent({ ...event, slug: v }))}
                {field("标题 / Title (中文)", event.titleZh, (v) =>
                  setEvent({ ...event, titleZh: v }),
                )}
                {field("Title (English)", event.titleEn, (v) => setEvent({ ...event, titleEn: v }))}
                {field(
                  "简介 / Summary (中文)",
                  event.summaryZh,
                  (v) => setEvent({ ...event, summaryZh: v }),
                  true,
                )}
                {field(
                  "Summary (English)",
                  event.summaryEn,
                  (v) => setEvent({ ...event, summaryEn: v }),
                  true,
                )}
                {field(
                  "活动说明 / Description (中文)",
                  event.bodyZh,
                  (v) => setEvent({ ...event, bodyZh: v }),
                  true,
                )}
                {field(
                  "Description (English)",
                  event.bodyEn,
                  (v) => setEvent({ ...event, bodyEn: v }),
                  true,
                )}
                <label>
                  {en ? "Status" : "状态"}
                  <select
                    value={event.status}
                    onChange={(e) => setEvent({ ...event, status: e.target.value })}
                    className="ml-2 border border-foreground bg-transparent p-2"
                  >
                    <option value="tba">TBA</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="past">Past</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </label>
                {event.status === "scheduled" && (
                  <>
                    {field("Start date/time (ISO)", event.startsAt, (v) =>
                      setEvent({ ...event, startsAt: v }),
                    )}
                    {field("地点（中文）", event.venueZh, (v) =>
                      setEvent({ ...event, venueZh: v }),
                    )}
                    {field("Venue (English)", event.venueEn, (v) =>
                      setEvent({ ...event, venueEn: v }),
                    )}
                  </>
                )}
                <button
                  disabled={busy}
                  className="bg-primary px-4 py-3 font-bold text-primary-foreground"
                >
                  {eventId ? (en ? "Update event" : "更新活动") : en ? "Create event" : "创建活动"}
                </button>
              </form>
            </div>
            <div>
              <h2 className="font-cn-black text-3xl">{en ? "AI topics" : "AI话题文章"}</h2>
              <div className="mt-3 space-y-2">
                {articles.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setArticleId(item.id);
                      setArticle({
                        slug: item.slug,
                        titleZh: item.title_zh,
                        titleEn: item.title_en,
                        summaryZh: String(item["excerpt_zh"] || ""),
                        summaryEn: String(item["excerpt_en"] || ""),
                        bodyZh: String(item["body_zh"] || ""),
                        bodyEn: String(item["body_en"] || ""),
                        categorySlug: String(item["category_slug"] || "learning"),
                        published: Number(item["published"]) === 1,
                      });
                    }}
                    className="block w-full border-b border-foreground/40 py-2 text-left"
                  >
                    {item.title_zh}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => void saveArticle(e)}
                className="paper mt-4 grid gap-3 border-2 border-foreground p-4"
              >
                {field("Slug", article.slug, (v) => setArticle({ ...article, slug: v }))}
                {field("标题 / Title (中文)", article.titleZh, (v) =>
                  setArticle({ ...article, titleZh: v }),
                )}
                {field("Title (English)", article.titleEn, (v) =>
                  setArticle({ ...article, titleEn: v }),
                )}
                {field(
                  "摘要（中文）",
                  article.summaryZh,
                  (v) => setArticle({ ...article, summaryZh: v }),
                  true,
                )}
                {field(
                  "Summary (English)",
                  article.summaryEn,
                  (v) => setArticle({ ...article, summaryEn: v }),
                  true,
                )}
                {field(
                  "正文（中文）",
                  article.bodyZh,
                  (v) => setArticle({ ...article, bodyZh: v }),
                  true,
                )}
                {field(
                  "Body (English)",
                  article.bodyEn,
                  (v) => setArticle({ ...article, bodyEn: v }),
                  true,
                )}
                <button
                  disabled={busy}
                  className="bg-primary px-4 py-3 font-bold text-primary-foreground"
                >
                  {articleId
                    ? en
                      ? "Update article"
                      : "更新文章"
                    : en
                      ? "Create article"
                      : "创建文章"}
                </button>
              </form>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
