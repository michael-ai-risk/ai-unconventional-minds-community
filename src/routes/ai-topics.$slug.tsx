import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { topics } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { localizeContent } from "@/lib/content-locales";

export const Route = createFileRoute("/ai-topics/$slug")({
  head: () => ({ meta: [{ title: "AI话题 · AI非正常人类情报站" }] }),
  component: TopicDetailPage,
});

function TopicDetailPage() {
  const { slug } = Route.useParams();
  const { lang, t, pick: pickRow } = useI18n();
  const topic = topics.find((item) => item.slug === slug);
  const [article, setArticle] = useState<Record<string, string> | null>(null);
  const [articleLoading, setArticleLoading] = useState(true);
  useEffect(() => {
    fetch("/api/community/articles/" + encodeURIComponent(slug))
      .then(async (r) => {
        if (!r.ok) return null;
        const data = (await r.json()) as { article?: Record<string, string> };
        return data.article ?? null;
      })
      .then(setArticle)
      .catch(() => setArticle(null))
      .finally(() => setArticleLoading(false));
  }, [slug]);
  if (!topic && articleLoading)
    return (
      <main className="mx-auto min-h-[65vh] max-w-3xl px-4 py-16">
        <p role="status">{t("articleLoading")}</p>
      </main>
    );
  if (!topic && !article)
    return (
      <main className="mx-auto min-h-[65vh] max-w-3xl px-4 py-16">
        <h1 className="font-cn-black text-4xl">
          {t("topicNotFound")}
        </h1>
        <Link to="/ai-topics" className="mt-5 inline-block underline underline-offset-4">
          {t("backToTopics")}
        </Link>
      </main>
    );
  if (article)
    return (
      <main className="mx-auto min-h-[65vh] max-w-4xl px-4 py-12 md:py-16">
        <Link to="/ai-topics" className="label-mono text-primary">
          ← {t("backToTopics")}
        </Link>
        <p className="mt-8 label-mono text-accent">PUBLISHED ARTICLE</p>
        <h1 className="mt-3 font-cn-black text-3xl leading-tight md:text-5xl">
          {pickRow(article, "title")}
        </h1>
        <p className="mt-5 text-xl text-muted-foreground">{pickRow(article, "excerpt")}</p>
        <article className="prose-zine mt-9 whitespace-pre-wrap">{pickRow(article, "body")}</article>
        <div className="paper mt-10 border-2 border-foreground p-5">
          <p className="font-bold">{t("keepTalking")}</p>
          <Link
            to="/discussions"
            className="mt-4 inline-block font-bold underline underline-offset-4"
          >
            {t("navDiscussions")} ↗
          </Link>
        </div>
      </main>
    );
  if (!topic) return null;
  const pick = (value: { zh: string; en: string; zhTW?: string; th?: string }) =>
    localizeContent(value, lang);
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
        <p className="font-bold">{t("nextSteps")}</p>
        <p className="mt-2">
          {t("nextStepsBody")}
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
