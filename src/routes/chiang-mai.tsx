import { createFileRoute } from "@tanstack/react-router";
import { chiangMaiTopics } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/chiang-mai")({
  head: () => ({ meta: [{ title: "清迈生活 · AI非正常人类情报站" }] }),
  component: ChiangMaiPage,
});

function ChiangMaiPage() {
  const { lang } = useI18n();
  const pick = (value: { zh: string; en: string }) => value[lang];
  return (
    <main className="mx-auto min-h-[65vh] max-w-7xl px-4 py-12 md:py-16">
      <p className="label-mono text-accent">4SEAS / CHIANG MAI</p>
      <h1 className="mt-3 font-cn-black text-4xl md:text-6xl">
        {lang === "zh" ? "清迈生活" : "Chiang Mai"}
      </h1>
      <p className="mt-5 max-w-3xl text-lg text-muted-foreground">
        {lang === "zh"
          ? "这里也可以聊聊在清迈的日常和新鲜发现。分享个人经验时，记得每个人的情况不同，实时信息请向相关场所或官方渠道确认。"
          : "There is room here for everyday life and new discoveries in Chiang Mai, too. Personal experiences vary; check time-sensitive details with venues or official sources."}
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
        {lang === "zh"
          ? "本站不发布未经核实的房租、签证政策、开放时间或活动日期。"
          : "This site does not publish unverified rents, visa rules, opening hours, or event dates."}
      </p>
    </main>
  );
}
