import { createFileRoute } from "@tanstack/react-router";
import { firstEvent } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/events")({
  head: () => ({ meta: [{ title: "活动 · AI非正常人类情报站" }] }),
  component: EventsPage,
});

function EventsPage() {
  const { lang, t } = useI18n();
  const pick = (value: { zh: string; en: string }) => value[lang];
  return (
    <main className="mx-auto min-h-[65vh] max-w-7xl px-4 py-12 md:py-16">
      <p className="label-mono text-accent">4SEAS / EVENTS</p>
      <h1 className="mt-3 font-cn-black text-4xl md:text-6xl">
        {lang === "zh" ? "活动" : "Events"}
      </h1>
      <p className="mt-5 max-w-3xl text-lg text-muted-foreground">
        {lang === "zh"
          ? "清迈免费线下聚会。时间和地点确认后才会发布，提交小调查不代表座位已经确认。"
          : "Free in-person gatherings in Chiang Mai. Dates and venues will be posted once confirmed; the survey is not a seat confirmation."}
      </p>
      <section className="paper mt-10 border-2 border-foreground p-6 md:p-9">
        <div className="flex flex-wrap gap-2 label-mono">
          <span className="bg-primary px-2 py-1 text-primary-foreground">{t("freeEvent")}</span>
          <span className="border border-paper-foreground px-2 py-1">{t("eventTba")}</span>
          <span className="border border-paper-foreground px-2 py-1">
            {pick(firstEvent.language)}
          </span>
        </div>
        <h2 className="mt-6 font-cn-black text-2xl md:text-4xl">{pick(firstEvent.title)}</h2>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed">{pick(firstEvent.description)}</p>
        <dl className="mt-7 grid gap-4 border-t border-paper-foreground/30 pt-5 sm:grid-cols-2">
          <div>
            <dt className="label-mono text-paper-muted">
              {lang === "zh" ? "日期与时间" : "Date and time"}
            </dt>
            <dd className="mt-1 font-bold">{lang === "zh" ? "尚未确认" : "Not confirmed"}</dd>
          </div>
          <div>
            <dt className="label-mono text-paper-muted">{lang === "zh" ? "地点" : "Venue"}</dt>
            <dd className="mt-1 font-bold">{lang === "zh" ? "尚未确认" : "Not confirmed"}</dd>
          </div>
        </dl>
        <a
          href="https://tally.so/r/PRdaO5"
          target="_blank"
          rel="noopener noreferrer"
          className="stamp-ink mt-7 inline-flex border-2 border-paper-foreground px-5 py-3 font-bold"
        >
          {t("survey")} ↗
        </a>
        <p className="mt-3 text-sm text-paper-muted">
          {lang === "zh"
            ? "这是一份自愿填写的意向调查，不是正式报名确认。"
            : "This is an optional interest survey, not a confirmed registration."}
        </p>
      </section>
      <section className="mt-12 border-t-2 border-foreground pt-6">
        <h2 className="font-cn-black text-2xl">{lang === "zh" ? "活动回顾" : "Event recaps"}</h2>
        <p className="mt-3 text-muted-foreground">
          {lang === "zh"
            ? "目前还没有活动回顾。活动结束后，有资料可以分享时会放在这里。"
            : "There are no recaps yet. Materials will be shared here after a gathering when available."}
        </p>
      </section>
    </main>
  );
}
