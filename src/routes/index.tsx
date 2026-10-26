import { createFileRoute } from "@tanstack/react-router";
import hero from "@/assets/hero-collage.jpg";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI非正常人类情报站 · AI Unconventional Minds Station" },
      { name: "description", content: "清迈免费线下AI知识社区 · A free in-person AI knowledge community in Chiang Mai." },
      { property: "og:title", content: "AI非正常人类情报站 · AI Unconventional Minds Station" },
      { property: "og:description", content: "借AI跨越专业边界，不必成为全能专家 / Go beyond your discipline with AI—without mastering everything." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { t } = useI18n();
  const pillars = [1, 2, 3, 4] as const;
  return (
    <main>
      <section className="grain border-b-2 border-foreground">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-[1.2fr_1fr] md:py-20">
          <div className="rise-in">
            <p className="label-mono text-accent">{t("heroKicker")}<span className="blink">_</span></p>
            <h1 className="mt-4 font-cn-black text-4xl md:text-6xl">
              {t("heroTitleA")}
              <span className="mt-2 block bg-primary px-2 text-primary-foreground">{t("heroTitleB")}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">{t("heroBody")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="https://tally.so/r/PRdaO5" target="_blank" rel="noopener noreferrer" className="stamp border-2 border-primary bg-primary px-5 py-3 font-bold text-primary-foreground transition-transform hover:-translate-y-0.5">
                {t("ctaSurvey")} ↗
              </a>
            </div>
            <p className="mt-3 label-mono text-muted-foreground">{t("surveyNote")}</p>
          </div>
          <img src={hero} alt="" width={1280} height={1280} className="w-full border-2 border-foreground" />
        </div>
      </section>
      <div className="overflow-hidden border-b-2 border-foreground bg-primary py-2 text-primary-foreground">
        <div className="marquee-track flex w-max whitespace-nowrap label-mono">
          <span className="px-4">{t("marquee")}</span><span className="px-4">{t("marquee")}</span>
        </div>
      </div>
      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="font-cn-black text-3xl">{t("homePillarsTitle")}</h2>
        <div className="mt-8 grid border-t-2 border-foreground md:grid-cols-4">
          {pillars.map((n) => (
            <div key={n} className="border-b-2 border-foreground p-5 md:border-r-2 md:last:border-r-0">
              <p className="font-display text-5xl text-primary">0{n}</p>
              <h3 className="mt-3 font-cn-black text-xl">{t(`pillar${n}T`)}</h3>
              <p className="mt-2 text-muted-foreground">{t(`pillar${n}B`)}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="paper border-y-2 border-foreground">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <span className="label-mono bg-accent px-2 py-1 text-accent-foreground">{t("draftBadge")}</span>
          <h2 className="mt-4 font-cn-black text-3xl">{t("showcaseTitle")}</h2>
          <p className="mt-3 max-w-2xl">{t("showcaseBody")}</p>
          <a href="https://view.genially.com/6adebb6469f1a5f7e73b6825" target="_blank" rel="noopener noreferrer" className="stamp-ink mt-6 inline-block border-2 border-paper-foreground px-5 py-3 font-bold">
            {t("showcaseCta")} ↗
          </a>
        </div>
      </section>
      <footer className="mx-auto max-w-7xl px-4 py-10 label-mono text-muted-foreground">
        <p>{t("notPromise")}</p>
        <p className="mt-2">{t("footerNote")}</p>
      </footer>
    </main>
  );
}
