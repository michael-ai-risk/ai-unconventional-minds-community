import { createFileRoute } from "@tanstack/react-router";
import { chiangMaiTopics } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { localizeContent } from "@/lib/content-locales";

export const Route = createFileRoute("/chiang-mai")({
  head: () => ({ meta: [{ title: "清迈生活 · AI非正常人类情报站" }] }),
  component: ChiangMaiPage,
});

function ChiangMaiPage() {
  const { lang, t } = useI18n();
  const pick = (value: { zh: string; en: string; zhTW?: string; th?: string; ja?: string; ko?: string }) =>
    localizeContent(value, lang);
  return (
    <main className="mx-auto min-h-[65vh] max-w-7xl px-4 py-12 md:py-16">
      <p className="label-mono text-accent">4SEAS / CHIANG MAI</p>
      <h1 className="mt-3 font-cn-black text-4xl md:text-6xl">
        {t("chiangMaiTitle")}
      </h1>
      <p className="mt-5 max-w-3xl text-lg text-muted-foreground">
        {t("chiangMaiIntro")}
      </p>
      <div className="mt-9 grid gap-0 border-t-2 border-foreground sm:grid-cols-2 lg:grid-cols-3">
        {chiangMaiTopics.map((item, index) => (
          <article
            key={pick(item.title)}
            className="border-b-2 border-foreground p-5 sm:border-r-2 lg:last:border-r-0"
          >
            <p className="font-display text-4xl text-primary">0{index + 1}</p>
            <h2 className="mt-3 font-cn-black text-xl">{pick(item.title)}</h2>
            <p className="mt-2 text-muted-foreground">{pick(item.body)}</p>
          </article>
        ))}
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        {t("chiangMaiDisclaimer")}
      </p>
    </main>
  );
}
