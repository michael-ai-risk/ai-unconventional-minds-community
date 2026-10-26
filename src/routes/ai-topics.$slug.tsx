import { Link, createFileRoute } from "@tanstack/react-router";
import { topics } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/ai-topics/$slug")({
  head: () => ({ meta: [{ title: "AI话题 · AI非正常人类情报站" }] }),
  component: TopicDetailPage,
});

function TopicDetailPage() {
  const { slug } = Route.useParams();
  const { lang, t } = useI18n();
  const topic = topics.find((item) => item.slug === slug);
  if (!topic)
    return (
      <main className="mx-auto min-h-[65vh] max-w-3xl px-4 py-16">
        <h1 className="font-cn-black text-4xl">
          {lang === "zh" ? "没有找到这个话题" : "Topic not found"}
        </h1>
        <Link to="/ai-topics" className="mt-5 inline-block underline underline-offset-4">
          {t("backToTopics")}
        </Link>
      </main>
    );
  const pick = (value: { zh: string; en: string }) => value[lang];
  return (
    <main className="mx-auto min-h-[65vh] max-w-4xl px-4 py-12 md:py-16">
      <Link to="/ai-topics" className="label-mono text-primary">
        ← {t("backToTopics")}
      </Link>
      <p className="mt-8 label-mono text-accent">{t("editorialLabel")}</p>
      <h1 className="mt-3 font-cn-black text-3xl leading-tight md:text-5xl">{pick(topic.title)}</h1>
      <p className="mt-5 text-xl text-muted-foreground">{pick(topic.summary)}</p>
      <article className="prose-zine mt-9">
        {topic.sections.map((section) => (
          <section key={pick(section.heading)}>
            <h2>{pick(section.heading)}</h2>
            {section.paragraphs.map((paragraph, index) => (
              <p key={index}>{pick(paragraph)}</p>
            ))}
          </section>
        ))}
      </article>
      <div className="paper mt-10 border-2 border-foreground p-5">
        <p className="font-bold">{lang === "zh" ? "接下来可以怎么做？" : "Where to go next"}</p>
        <p className="mt-2">
          {lang === "zh"
            ? "欢迎带着自己的经历，在线下聚会或未来开放的讨论区继续聊。"
            : "Bring your own experience to a gathering or to the discussion board when it becomes available."}
        </p>
        <Link
          to="/discussions"
          className="mt-4 inline-block font-bold underline underline-offset-4"
        >
          {t("navDiscussions")} ↗
        </Link>
      </div>
    </main>
  );
}
