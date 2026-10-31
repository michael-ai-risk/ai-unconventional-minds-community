import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { FirstEventPoster } from "@/components/FirstEventPoster";
import { firstMeetupContent } from "@/lib/first-meetup-content";

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
const FIRST_EVENT_SLUG = "ai-unconventional-minds-first-meetup";
export const Route = createFileRoute("/events")({
  head: () => ({ meta: [{ title: "活动 · AI非正常人类情报站" }] }),
  component: EventsRouteComponent,
});

function EventsRouteComponent() {
  const isDetailRoute = useRouterState({
    select: (state) => state.location.pathname.startsWith("/events/"),
  });

  return isDetailRoute ? <Outlet /> : <EventsPage />;
}

function EventsPage() {
  const { lang, t, pick } = useI18n();
  const firstMeetup = firstMeetupContent[lang];
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/community/events")
      .then(async (r) => {
        const data = (await r.json()) as { events?: EventRecord[]; error?: string };
        if (!r.ok) throw new Error(data.error || "Events unavailable");
        setEvents(data.events ?? []);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, []);
  const date = (value: string | null) => {
    const locale =
      lang === "zh"
        ? "zh-CN"
        : lang === "zhTW"
          ? "zh-TW"
          : lang === "th"
            ? "th-TH"
            : lang === "ja"
              ? "ja-JP"
              : lang === "ko"
                ? "ko-KR"
                : "en-GB";
    return value
      ? new Date(value).toLocaleString(locale, {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : t("notConfirmed");
  };
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
  return (
    <main className="mx-auto min-h-[65vh] max-w-7xl px-4 py-12 md:py-16">
      <p className="label-mono text-accent">4SEAS / EVENTS</p>
      <h1 className="mt-3 font-cn-black text-4xl md:text-6xl">{t("navEvents")}</h1>
      <p className="mt-5 max-w-3xl text-lg text-muted-foreground">{t("eventsIntro")}</p>
      {error && (
        <p role="alert" className="mt-6 border-2 border-red-700 p-4 text-red-800">
          {t("eventServiceUnavailable") + error}
        </p>
      )}
      {loading ? (
        <p role="status" className="mt-8">
          {t("loadingEvents")}
        </p>
      ) : !events.length && !error ? (
        <p className="mt-8 border-2 border-foreground p-5">{t("noEvents")}</p>
      ) : (
        <div className="mt-8 space-y-6">
          {events.map((item) => (
            <article key={item.id} className="paper border-2 border-foreground p-6 md:p-9">
              <div className="flex flex-wrap gap-2 label-mono">
                {item.slug === FIRST_EVENT_SLUG ? (
                  <>
                    <span className="bg-primary px-2 py-1 text-primary-foreground">
                      {firstMeetup.freeTag}
                    </span>
                    <span className="border border-paper-foreground px-2 py-1">
                      {firstMeetup.timeAndPlaceTag}
                    </span>
                    <span className="border border-paper-foreground px-2 py-1">
                      {firstMeetup.languageTag}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="bg-primary px-2 py-1 text-primary-foreground">
                      {item.is_free ? t("freeEvent") : t("paid")}
                    </span>
                    <span className="border border-paper-foreground px-2 py-1">
                      {statusLabel(item.status)}
                    </span>
                    <span className="border border-paper-foreground px-2 py-1">
                      {pick(item, "language")}
                    </span>
                  </>
                )}
              </div>
              <h2 className="mt-6 font-cn-black text-2xl md:text-4xl">
                {item.slug === FIRST_EVENT_SLUG ? firstMeetup.title : pick(item, "title")}
              </h2>
              <p className="mt-4 max-w-3xl text-lg leading-relaxed">
                {item.slug === FIRST_EVENT_SLUG ? firstMeetup.subtitle : pick(item, "summary")}
              </p>
              <div
                className={`mt-6 grid gap-6 ${
                  item.slug === FIRST_EVENT_SLUG
                    ? "md:grid-cols-[minmax(0,1fr)_minmax(15rem,22rem)] md:items-start"
                    : ""
                }`}
              >
                <div>
                  {item.slug === FIRST_EVENT_SLUG ? (
                    <dl className="grid gap-4 border-t border-paper-foreground/30 pt-5 sm:grid-cols-2">
                      <div>
                        <dt className="label-mono text-paper-muted">{firstMeetup.cityLabel}</dt>
                        <dd className="mt-1 font-bold">{firstMeetup.city}</dd>
                      </div>
                      <div>
                        <dt className="label-mono text-paper-muted">{firstMeetup.venueLabel}</dt>
                        <dd className="mt-1 font-bold">{firstMeetup.toBeAnnounced}</dd>
                      </div>
                      <div>
                        <dt className="label-mono text-paper-muted">{firstMeetup.dateTimeLabel}</dt>
                        <dd className="mt-1 font-bold">{firstMeetup.toBeAnnounced}</dd>
                      </div>
                      <div>
                        <dt className="label-mono text-paper-muted">{firstMeetup.capacityLabel}</dt>
                        <dd className="mt-1 font-bold">{firstMeetup.capacity}</dd>
                      </div>
                    </dl>
                  ) : (
                    <dl className="grid gap-4 border-t border-paper-foreground/30 pt-5 sm:grid-cols-2">
                      <div>
                        <dt className="label-mono text-paper-muted">{t("dateTime")}</dt>
                        <dd className="mt-1 font-bold">{date(item.starts_at)}</dd>
                      </div>
                      <div>
                        <dt className="label-mono text-paper-muted">{t("venue")}</dt>
                        <dd className="mt-1 font-bold">
                          {item.status === "scheduled" ? pick(item, "venue") : t("notConfirmed")}
                        </dd>
                      </div>
                    </dl>
                  )}
                  {item.slug === FIRST_EVENT_SLUG ? (
                    <p className="mt-4 text-sm text-muted-foreground">{firstMeetup.eventNote}</p>
                  ) : null}
                  <div className="mt-6 flex flex-wrap gap-4">
                    <Link
                      to="/events/$slug"
                      params={{ slug: item.slug }}
                      className="border-2 border-paper-foreground px-5 py-3 font-bold"
                    >
                      {t("eventDetails")} ↗
                    </Link>
                    <a
                      href="https://tally.so/r/PRdaO5"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="stamp-ink border-2 border-paper-foreground px-5 py-3 font-bold"
                    >
                      {t("survey")} ↗
                    </a>
                  </div>
                </div>
                {item.slug === FIRST_EVENT_SLUG ? (
                  <FirstEventPoster className="mx-auto w-full max-w-[22rem] md:mx-0 md:justify-self-end" />
                ) : null}
              </div>
              {item.recap_zh || item.recap_en ? (
                <p className="mt-6 border-t border-paper-foreground/30 pt-4">
                  {pick(item, "recap")}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      )}
      <p className="mt-5 text-sm text-muted-foreground">{t("surveyFooter")}</p>
    </main>
  );
}
