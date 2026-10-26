import { Link, createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { firstEvent, themes, topics } from "@/lib/content";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "AI非正常人类情报站 · AI Unconventional Minds Station" }] }),
  component: Home,
});

function Home() {
  const { lang, t } = useI18n();
  const pick = (value: { zh: string; en: string }) => value[lang];

  return (
    <main>
      <section className="grain border-b-2 border-foreground">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-[1.1fr_.9fr] md:items-center md:py-20">
          <div className="rise-in">
            <p className="label-mono text-accent">
              {t("homeKicker")}
              <span className="blink">_</span>
            </p>
            <h1 className="mt-5 font-cn-black text-4xl leading-tight md:text-6xl">
              {t("homeTitleA")}
              <span className="mt-3 block bg-primary px-2 py-2 text-primary-foreground">
                {t("homeTitleB")}
              </span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {t("homeIntro")}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="https://tally.so/r/PRdaO5"
                target="_blank"
                rel="noopener noreferrer"
                className="stamp border-2 border-primary bg-primary px-5 py-3 font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                {t("survey")} ↗
              </a>
              <Link
                to="/events"
                className="border-2 border-foreground px-5 py-3 font-bold hover:bg-secondary"
              >
                {t("navEvents")} ↗
              </Link>
            </div>
            <p className="mt-3 label-mono text-muted-foreground">{t("surveyNote")}</p>
          </div>
          <figure className="overflow-hidden border-2 border-foreground bg-paper shadow-[8px_8px_0_0_var(--foreground)]">
            <img
              src="/hero-collage.svg"
              alt={
                lang === "zh"
                  ? "清迈AI情报站复古拼贴主题插画"
                  : "Retro zine collage for the Chiang Mai AI community"
              }
              className="block h-full min-h-[20rem] w-full object-cover"
              width="900"
              height="900"
            />
            <figcaption className="border-t-2 border-foreground bg-background px-3 py-2 label-mono">
              {lang === "zh"
                ? "社区制作的拼贴插画 · ORIGINAL ASSET UNAVAILABLE"
                : "COMMUNITY-MADE COLLAGE · ORIGINAL ASSET UNAVAILABLE"}
            </figcaption>
          </figure>
        </div>
      </section>

      <div
        className="overflow-hidden border-b-2 border-foreground bg-primary py-2 text-primary-foreground"
        aria-hidden="true"
      >
        <div className="marquee-track flex w-max whitespace-nowrap label-mono">
          <span className="px-4">
            {lang === "zh"
              ? "一起聊AI ✦ 分享真实经历 ✦ 认识有趣的人 ✦ 免费 · 开放 · 轻松 ✦ "
              : "TALK AI ✦ SHARE REAL EXPERIENCES ✦ MEET CURIOUS PEOPLE ✦ FREE · OPEN · RELAXED ✦ "}
          </span>
          <span className="px-4">
            {lang === "zh"
              ? "一起聊AI ✦ 分享真实经历 ✦ 认识有趣的人 ✦ 免费 · 开放 · 轻松 ✦ "
              : "TALK AI ✦ SHARE REAL EXPERIENCES ✦ MEET CURIOUS PEOPLE ✦ FREE · OPEN · RELAXED ✦ "}
          </span>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label-mono text-accent">01 / THEMES</p>
            <h2 className="mt-2 font-cn-black text-3xl">{t("homeThemes")}</h2>
          </div>
          <p className="max-w-xl text-sm text-muted-foreground">
            {lang === "zh"
              ? "从海报的开放讨论精神出发，主题可以很技术，也可以很日常。"
              : "Inspired by the poster's open-conversation spirit, topics can be technical or everyday."}
          </p>
        </div>
        <div className="mt-7 grid border-t-2 border-foreground sm:grid-cols-2 lg:grid-cols-4">
          {themes.map((item) => (
            <article
              key={item.number}
              className="border-b-2 border-foreground p-5 sm:border-r-2 lg:last:border-r-0"
            >
              <p className="font-display text-5xl text-primary">{item.number}</p>
              <h3 className="mt-4 font-cn-black text-xl">{pick(item.title)}</h3>
              <p className="mt-2 text-muted-foreground">{pick(item.body)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="paper border-y-2 border-foreground">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label-mono">02 / EVENTS</p>
              <h2 className="mt-2 font-cn-black text-3xl">{t("latestEvent")}</h2>
            </div>
            <Link to="/events" className="font-bold underline underline-offset-4">
              {t("seeAll")} ↗
            </Link>
          </div>
          <article className="mt-7 grid gap-5 border-2 border-paper-foreground p-5 md:grid-cols-[1fr_auto] md:items-center md:p-7">
            <div>
              <p className="label-mono text-paper-muted">
                {t("freeEvent")} · {pick(firstEvent.language)}
              </p>
              <h3 className="mt-3 font-cn-black text-2xl">{pick(firstEvent.title)}</h3>
              <p className="mt-3 max-w-3xl">{pick(firstEvent.description)}</p>
            </div>
            <div className="border-l-0 border-paper-foreground/30 pt-4 label-mono md:border-l md:pl-6 md:pt-0">
              {t("eventTba")}
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label-mono text-accent">03 / EDITORIAL</p>
            <h2 className="mt-2 font-cn-black text-3xl">{t("latestTopics")}</h2>
          </div>
          <Link to="/ai-topics" className="font-bold underline underline-offset-4">
            {t("seeAll")} ↗
          </Link>
        </div>
        <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {topics.slice(0, 3).map((topic, i) => (
            <Link
              key={topic.slug}
              to="/ai-topics/$slug"
              params={{ slug: topic.slug }}
              className="group border-2 border-foreground p-5 transition-colors hover:bg-secondary"
            >
              <p className="label-mono text-accent">
                {t("editorialLabel")} · 0{i + 1}
              </p>
              <h3 className="mt-4 font-cn-black text-xl">{pick(topic.title)}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{pick(topic.summary)}</p>
              <p className="mt-6 font-bold group-hover:text-primary">{t("readTopic")} ↗</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="paper border-y-2 border-foreground">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 md:grid-cols-[.8fr_1.2fr] md:items-center">
          <div>
            <p className="label-mono">04 / CONVERSATION</p>
            <h2 className="mt-2 font-cn-black text-3xl">{t("latestDiscussions")}</h2>
          </div>
          <div className="border-l-4 border-accent bg-white/40 p-5">
            <p>{t("noDiscussions")}</p>
            <Link
              to="/discussions"
              className="mt-4 inline-block font-bold underline underline-offset-4"
            >
              {t("navDiscussions")} ↗
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
