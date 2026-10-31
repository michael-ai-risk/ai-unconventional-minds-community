import { createFileRoute, Link } from "@tanstack/react-router";
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
export const Route = createFileRoute("/events/$slug")({
  head: () => ({ meta: [{ title: "活动详情 · AI非正常人类情报站" }] }),
  component: EventDetailPage,
});
function EventDetailPage() {
  const { slug } = Route.useParams();
  const { lang, t, pick } = useI18n();
  const firstMeetup = slug === FIRST_EVENT_SLUG;
  const copy = firstMeetupContent[lang];
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
      ) : firstMeetup ? (
        <article className="paper mt-8 border-2 border-foreground p-5 md:p-10">
          <div className="flex flex-wrap gap-2 label-mono">
            <span className="bg-primary px-2 py-1 text-primary-foreground">{copy.freeTag}</span>
            <span className="border border-paper-foreground px-2 py-1">{copy.timeAndPlaceTag}</span>
            <span className="border border-paper-foreground px-2 py-1">{copy.languageTag}</span>
          </div>
          <h1 className="mt-6 max-w-4xl font-cn-black text-3xl leading-tight md:text-5xl">
            {copy.title}
          </h1>
          <p className="mt-4 max-w-4xl text-xl leading-relaxed text-muted-foreground">
            {copy.subtitle}
          </p>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)] lg:items-start">
            <div>
              <div className="prose-zine space-y-4">
                {copy.intro.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <dl className="mt-8 grid gap-4 border-t border-paper-foreground/30 pt-5 sm:grid-cols-2">
                <div>
                  <dt className="label-mono text-paper-muted">{copy.cityLabel}</dt>
                  <dd className="mt-1 font-bold">{copy.city}</dd>
                </div>
                <div>
                  <dt className="label-mono text-paper-muted">{copy.venueLabel}</dt>
                  <dd className="mt-1 font-bold">{copy.toBeAnnounced}</dd>
                </div>
                <div>
                  <dt className="label-mono text-paper-muted">{copy.dateTimeLabel}</dt>
                  <dd className="mt-1 font-bold">{copy.toBeAnnounced}</dd>
                </div>
                <div>
                  <dt className="label-mono text-paper-muted">{copy.capacityLabel}</dt>
                  <dd className="mt-1 font-bold">{copy.capacity}</dd>
                </div>
              </dl>
              <p className="mt-4 border-l-4 border-primary pl-4 text-sm leading-relaxed">
                {copy.eventNote}
              </p>
            </div>
            <aside aria-label={copy.posterHeading}>
              <FirstEventPoster className="mx-auto w-full max-w-[22rem] lg:mx-0 lg:justify-self-end" />
            </aside>
          </div>

          <section
            aria-labelledby="meetup-speakers-title"
            className="mt-10 border-t-2 border-paper-foreground/30 pt-8"
          >
            <p className="label-mono text-paper-muted">{copy.speakersKicker}</p>
            <h2 id="meetup-speakers-title" className="mt-2 font-cn-black text-2xl md:text-3xl">
              {copy.speakersHeading}
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {copy.speakers.map((speaker) => (
                <article
                  key={speaker.name}
                  className="min-w-0 border-2 border-paper-foreground p-5"
                >
                  <p className="font-cn-black text-xl">{speaker.name}</p>
                  <p className="mt-1 label-mono text-accent">{speaker.role}</p>
                  <h3 className="mt-4 break-words font-cn-black text-lg leading-snug">
                    {speaker.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{speaker.summary}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-10 border-t-2 border-paper-foreground/30 pt-8">
            <p className="label-mono text-paper-muted">01</p>
            <h2 className="mt-2 font-cn-black text-2xl md:text-3xl">{copy.topicsHeading}</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {copy.topics.map((topic, index) => (
                <article key={topic.title} className="border-2 border-paper-foreground p-5">
                  <p className="label-mono text-accent">0{index + 1}</p>
                  <h3 className="mt-3 font-cn-black text-lg">{topic.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{topic.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-10 border-t-2 border-paper-foreground/30 pt-8">
            <p className="label-mono text-paper-muted">02</p>
            <h2 className="mt-2 font-cn-black text-2xl md:text-3xl">{copy.audienceHeading}</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {copy.audience.map((person) => (
                <li
                  key={person}
                  className="border-l-4 border-accent bg-background/60 p-4 leading-relaxed"
                >
                  {person}
                </li>
              ))}
            </ul>
            <p className="mt-5 font-bold">{copy.noPrerequisites}</p>
          </section>

          <section className="mt-10 border-t-2 border-paper-foreground/30 pt-8">
            <p className="label-mono text-paper-muted">03</p>
            <h2 className="mt-2 font-cn-black text-2xl md:text-3xl">{copy.formatHeading}</h2>
            <p className="mt-3 text-lg leading-relaxed">{copy.formatIntro}</p>
            <ol className="mt-5 grid gap-3 md:grid-cols-2">
              {copy.formatSteps.map((step, index) => (
                <li
                  key={step}
                  className="flex gap-4 border-2 border-paper-foreground p-4 leading-relaxed"
                >
                  <span className="label-mono shrink-0 text-accent">0{index + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-10 flex flex-col gap-4 border-t-2 border-paper-foreground/30 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm text-muted-foreground">{t("surveyNotBooking")}</p>
            <a
              href="https://tally.so/r/PRdaO5"
              target="_blank"
              rel="noreferrer"
              className="shrink-0 bg-primary px-5 py-3 text-center font-bold text-primary-foreground"
            >
              {t("survey")} ↗
            </a>
          </section>
        </article>
      ) : (
        <article className="paper mt-8 border-2 border-foreground p-6 md:p-10">
          <p className="label-mono">
            {event.is_free ? t("freeEvent") : t("paid")} · {statusLabel(event.status)}
          </p>
          <h1 className="mt-4 font-cn-black text-3xl leading-tight md:text-5xl">
            {pick(event, "title")}
          </h1>
          <p className="mt-5 text-xl text-muted-foreground">{pick(event, "summary")}</p>
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
          <p className="mt-3 text-sm text-muted-foreground">{t("surveyNotBooking")}</p>
        </article>
      )}
    </main>
  );
}
