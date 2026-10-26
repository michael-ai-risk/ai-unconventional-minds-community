import { Link, createFileRoute } from "@tanstack/react-router";
import { topics } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/ai-topics")({
  head: () => ({ meta: [{ title: "AI话题 · AI非正常人类情报站" }] }),
  component: TopicsPage,
});

function TopicsPage() {
  const { lang, t } = useI18n();
  const pick = (value: { zh: string; en: string }) => value[lang];
  return (
    <main className="mx-auto min-h-[65vh] max-w-7xl px-4 py-12 md:py-16">
      <p className="label-mono text-accent">4SEAS / AI TOPICS</p>
      <h1 className="mt-3 font-cn-black text-4xl md:text-6xl">
        {lang === "zh" ? "AI话题" : "AI Topics"}
      </h1>
      <p className="mt-5 max-w-3xl text-lg text-muted-foreground">
        {lang === "zh"
          ? "从问题开始的双语编辑话题。这里不是实时新闻流，也不代表用户投稿。欢迎带着自己的经验继续讨论。"
          : "Bilingual editorial prompts that start with questions. This is not a live news feed or user-submission archive. Bring your own experience to the conversation."}
      </p>
      <div className="mt-9 grid gap-4 md:grid-cols-2">
        {topics.map((topic, index) => (
          <Link
            key={topic.slug}
            to="/ai-topics/$slug"
            params={{ slug: topic.slug }}
            className="group border-2 border-foreground p-5 md:p-6 hover:bg-secondary"
          >
            <p className="label-mono text-accent">EDITORIAL PROMPT / 0{index + 1}</p>
            <h2 className="mt-4 font-cn-black text-xl md:text-2xl">{pick(topic.title)}</h2>
            <p className="mt-3 text-muted-foreground">{pick(topic.summary)}</p>
            <span className="mt-6 inline-block font-bold group-hover:text-primary">
              {t("readTopic")} ↗
            </span>
          </Link>
        ))}
      </div>
      <p className="mt-8 border-l-4 border-primary pl-4 text-sm text-muted-foreground">
        {lang === "zh"
          ? "编辑话题用于开启交流。真实用户投稿会在接入投稿功能后单独标示；目前没有用户投稿内容。"
          : "Editorial prompts are here to open conversation. User submissions will be labeled separately if a submission feature is added; there are none at present."}
      </p>
    </main>
  );
}
