import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

type EventRecord = {
  id: string;
  slug: string;
  title_zh: string;
  title_en: string;
  summary_zh: string;
  summary_en: string;
  body_zh: string;
  body_en: string;
  status: string;
  starts_at: string | null;
  venue_zh: string | null;
  venue_en: string | null;
  language_zh: string;
  language_en: string;
  is_free: number;
  recap_zh: string | null;
  recap_en: string | null;
};
export const Route = createFileRoute("/events/$slug")({
  head: () => ({ meta: [{ title: "活动详情 · AI非正常人类情报站" }] }),
  component: EventDetailPage,
});
function EventDetailPage() {
  const { slug } = Route.useParams();
  const { lang, t } = useI18n();
  const en = lang === "en";
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/community/events/" + encodeURIComponent(slug))
      .then(async (r) => {
        const data = (await r.json()) as { event?: EventRecord; error?: string };
        if (!r.ok) throw new Error(data.error || "Event not found");
        setEvent(data.event ?? null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [slug]);
  const date = event?.starts_at
    ? new Date(event.starts_at).toLocaleString(en ? "en-GB" : "zh-CN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : en
      ? "Not confirmed"
      : "尚未确认";
  return (
    <main className="mx-auto min-h-[65vh] max-w-4xl px-4 py-12 md:py-16">
      <Link to="/events" className="label-mono text-primary">
        ← {en ? "All events" : "全部活动"}
      </Link>
      {error && (
        <p role="alert" className="mt-6 border-2 border-red-700 p-4 text-red-800">
          {error}
        </p>
      )}
      {!event ? (
        !error && (
          <p role="status" className="mt-8">
            {en ? "Loading event…" : "正在读取活动…"}
          </p>
        )
      ) : (
        <article className="paper mt-8 border-2 border-foreground p-6 md:p-10">
          <p className="label-mono">
            {event.is_free ? t("freeEvent") : en ? "Paid" : "收费"} ·{" "}
            {event.status === "tba" ? t("eventTba") : event.status}
          </p>
          <h1 className="mt-4 font-cn-black text-3xl leading-tight md:text-5xl">
            {en ? event.title_en : event.title_zh}
          </h1>
          <p className="mt-5 text-xl text-muted-foreground">
            {en ? event.summary_en : event.summary_zh}
          </p>
          <div className="prose-zine mt-8">
            <p>{en ? event.body_en : event.body_zh}</p>
          </div>
          <dl className="mt-8 grid gap-4 border-t border-paper-foreground/30 pt-5 sm:grid-cols-2">
            <div>
              <dt className="label-mono text-paper-muted">{en ? "Date and time" : "日期与时间"}</dt>
              <dd className="mt-1 font-bold">{date}</dd>
            </div>
            <div>
              <dt className="label-mono text-paper-muted">{en ? "Venue" : "地点"}</dt>
              <dd className="mt-1 font-bold">
                {event.status === "scheduled"
                  ? en
                    ? event.venue_en
                    : event.venue_zh
                  : en
                    ? "Not confirmed"
                    : "尚未确认"}
              </dd>
            </div>
            <div>
              <dt className="label-mono text-paper-muted">{en ? "Language" : "语言"}</dt>
              <dd className="mt-1">{en ? event.language_en : event.language_zh}</dd>
            </div>
          </dl>
          {event.recap_zh || event.recap_en ? (
            <section className="mt-8 border-t border-paper-foreground/30 pt-5">
              <h2 className="font-cn-black text-2xl">{en ? "Event recap" : "活动回顾"}</h2>
              <p className="mt-3 whitespace-pre-wrap">{en ? event.recap_en : event.recap_zh}</p>
            </section>
          ) : null}
          <a
            href="https://tally.so/r/PRdaO5"
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-block bg-primary px-5 py-3 font-bold text-primary-foreground"
          >
            {en ? "Share your thoughts (optional)" : "参与活动小调查（自愿填写）"} ↗
          </a>
          <p className="mt-3 text-sm text-muted-foreground">
            {en
              ? "The survey is optional and is not a booking or account sign-up."
              : "问卷完全自愿，不是活动报名、座位确认或加入社区的条件。"}
          </p>
        </article>
      )}
    </main>
  );
}
