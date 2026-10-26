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
  const { lang, t, pick } = useI18n();
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
  const locale = lang === "zh" ? "zh-CN" : lang === "zhTW" ? "zh-TW" : lang === "th" ? "th-TH" : "en-GB";
  const statusLabel = (status: string) =>
    status === "tba"
      ? t("eventTba")
      : status === "scheduled"
        ? t("eventScheduled")
        : status === "past"
          ? t("eventPast")
          : status === "cancelled"
            ? t("eventCancelled")
            : status;
  const date = event?.starts_at
    ? new Date(event.starts_at).toLocaleString(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : t("notConfirmed");
  return (
    <main className="mx-auto min-h-[65vh] max-w-4xl px-4 py-12 md:py-16">
      <Link to="/events" className="label-mono text-primary">
        ← {t("allEvents")}
      </Link>
      {error && (
        <p role="alert" className="mt-6 border-2 border-red-700 p-4 text-red-800">
          {error}
        </p>
      )}
      {!event ? (
        !error && (
          <p role="status" className="mt-8">
            {t("loadingEvent")}
          </p>
        )
      ) : (
        <article className="paper mt-8 border-2 border-foreground p-6 md:p-10">
          <p className="label-mono">
            {event.is_free ? t("freeEvent") : t("paid")} ·{" "}
            {statusLabel(event.status)}
          </p>
          <h1 className="mt-4 font-cn-black text-3xl leading-tight md:text-5xl">
            {pick(event, "title")}
          </h1>
          <p className="mt-5 text-xl text-muted-foreground">
            {pick(event, "summary")}
          </p>
          <div className="prose-zine mt-8">
            <p>{pick(event, "body")}</p>
          </div>
          <dl className="mt-8 grid gap-4 border-t border-paper-foreground/30 pt-5 sm:grid-cols-2">
            <div>
              <dt className="label-mono text-paper-muted">{t("dateTime")}</dt>
              <dd className="mt-1 font-bold">{date}</dd>
            </div>
            <div>
              <dt className="label-mono text-paper-muted">{t("venue")}</dt>
              <dd className="mt-1 font-bold">
                {event.status === "scheduled" ? pick(event, "venue") : t("notConfirmed")}
              </dd>
            </div>
            <div>
              <dt className="label-mono text-paper-muted">{t("languageLabel")}</dt>
              <dd className="mt-1">{pick(event, "language")}</dd>
            </div>
          </dl>
          {event.recap_zh || event.recap_en ? (
            <section className="mt-8 border-t border-paper-foreground/30 pt-5">
              <h2 className="font-cn-black text-2xl">{t("eventRecap")}</h2>
              <p className="mt-3 whitespace-pre-wrap">{pick(event, "recap")}</p>
            </section>
          ) : null}
          <a
            href="https://tally.so/r/PRdaO5"
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-block bg-primary px-5 py-3 font-bold text-primary-foreground"
          >
            {t("surveyOptional")} ↗
          </a>
          <p className="mt-3 text-sm text-muted-foreground">
            {t("surveyNotBooking")}
          </p>
        </article>
      )}
    </main>
  );
}
