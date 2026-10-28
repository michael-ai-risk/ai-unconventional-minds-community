import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  getArticleBySlug,
  getTopicEntryBySlug,
  getCategory,
  topicArticles,
  topicEntries,
  topicPageCopy,
  topicText,
  topicTypeCopyKey,
} from "@/lib/ai-topic-catalog";
import { topics } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { localizeContent } from "@/lib/content-locales";

export const Route = createFileRoute("/ai-topics/$slug")({
  head: () => ({ meta: [{ title: "AI Topics · AI非正常人类情报站" }] }),
  component: TopicDetailPage,
});

function TopicDetailPage() {
  const { slug } = Route.useParams();
  const { lang, t, pick: pickRow } = useI18n();
  const candidate = getTopicEntryBySlug(slug);
  const editorialArticle = getArticleBySlug(slug);
  const legacyPrompt = topics.find((item) => item.slug === slug);
  const [communityArticle, setCommunityArticle] = useState<Record<string, string> | null>(null);
  const [articleLoading, setArticleLoading] = useState(
    !candidate && !editorialArticle && !legacyPrompt,
  );
  const category = candidate ? getCategory(candidate.categoryId) : undefined;
  const copy = (key: keyof typeof topicPageCopy) => topicText(topicPageCopy[key], lang);
  const localizedPrompt = (value: {
    zh: string;
    en: string;
    zhTW?: string;
    th?: string;
    ja?: string;
    ko?: string;
  }) => localizeContent(value, lang);

  useEffect(() => {
    if (candidate || editorialArticle || legacyPrompt) {
      setCommunityArticle(null);
      setArticleLoading(false);
      return;
    }
    setArticleLoading(true);
    fetch("/api/community/articles/" + encodeURIComponent(slug))
      .then(async (response) => {
        if (!response.ok) return null;
        const data = (await response.json()) as { article?: Record<string, string> };
        return data.article ?? null;
      })
      .then(setCommunityArticle)
      .catch(() => setCommunityArticle(null))
      .finally(() => setArticleLoading(false));
  }, [candidate, editorialArticle, legacyPrompt, slug]);

  if (!candidate && !editorialArticle && !legacyPrompt && articleLoading)
    return (
      <main className="mx-auto min-h-[65vh] max-w-3xl px-4 py-16">
        <p role="status">{t("articleLoading")}</p>
      </main>
    );

  if (!candidate && !editorialArticle && !legacyPrompt && !communityArticle)
    return (
      <main className="mx-auto min-h-[65vh] max-w-3xl px-4 py-16">
        <h1 className="font-cn-black text-4xl">{t("topicNotFound")}</h1>
        <Link to="/ai-topics" className="mt-5 inline-block underline underline-offset-4">
          {copy("back")}
        </Link>
      </main>
    );

  if (editorialArticle) {
    if (editorialArticle.status !== "published") {
      return (
        <main className="mx-auto min-h-[65vh] max-w-3xl px-4 py-12 md:py-16">
          <Link to="/ai-topics" className="label-mono text-primary">
            ← {copy("back")}
          </Link>
          <p className="mt-8 border-2 border-foreground p-5" role="status">
            {copy("draftUnavailable")}
          </p>
        </main>
      );
    }
    if (lang !== "zh") {
      return (
        <main className="mx-auto min-h-[65vh] max-w-3xl px-4 py-12 md:py-16">
          <Link to="/ai-topics" className="label-mono text-primary">
            ← {copy("back")}
          </Link>
          <h1 className="mt-8 font-cn-black text-3xl md:text-5xl">{editorialArticle.title}</h1>
          <p className="mt-5 border-2 border-foreground p-5" role="status">
            {copy("articlesNote")}
          </p>
        </main>
      );
    }
    const related = topicEntries
      .filter(
        (entry) =>
          entry.slug !== editorialArticle.slug && entry.categoryId === editorialArticle.categoryId,
      )
      .slice(0, 3);
    return (
      <main className="mx-auto min-h-[65vh] max-w-4xl px-4 py-12 md:py-16">
        <Link to="/ai-topics" className="label-mono text-primary">
          ← {copy("back")}
        </Link>
        <p className="mt-8 label-mono text-accent">
          {editorialArticle.categoryId} / EDITORIAL / {copy("statusPublished")}
        </p>
        <h1 className="mt-3 font-cn-black text-3xl leading-tight md:text-5xl">
          {editorialArticle.title}
        </h1>
        <p className="mt-5 text-xl text-muted-foreground">{editorialArticle.summary}</p>
        <article className="prose-zine mt-9">
          {editorialArticle.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </section>
          ))}
          <section>
            <h2>{copy("sources")}</h2>
            <ul>
              {editorialArticle.sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noreferrer">
                    {source.label}
                  </a>
                  <span>
                    {" "}
                    — {source.published}. {source.scope}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </article>
        <p className="mt-6 border-l-4 border-primary pl-4 text-sm text-muted-foreground">
          {copy("sourceNote")}
        </p>
        {related.length > 0 && (
          <section className="mt-10 border-t-2 border-foreground pt-6">
            <h2 className="font-cn-black text-2xl">{copy("relatedTopics")}</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link
                    to="/ai-topics/$slug"
                    params={{ slug: item.slug }}
                    className="block border-2 border-foreground p-4 underline underline-offset-4 hover:bg-secondary"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        <div className="paper mt-10 border-2 border-foreground p-5">
          <p className="font-bold">{t("keepTalking")}</p>
          <p className="mt-2 text-sm text-muted-foreground">{copy("candidateOnly")}</p>
          <Link
            to="/discussions"
            className="mt-4 inline-block font-bold underline underline-offset-4"
          >
            {copy("discussion")} ↗
          </Link>
        </div>
      </main>
    );
  }

  if (candidate) {
    const article = getArticleBySlug(candidate.slug);
    if (article?.status === "published") {
      return (
        <main className="mx-auto min-h-[65vh] max-w-3xl px-4 py-12 md:py-16">
          <Link to="/ai-topics" className="label-mono text-primary">
            ← {copy("back")}
          </Link>
          <h1 className="mt-8 font-cn-black text-3xl md:text-5xl">{article.title}</h1>
          <p className="mt-5 border-2 border-foreground p-5" role="status">
            {copy("articlesNote")}
          </p>
        </main>
      );
    }
    const related = candidate.relatedCategoryIds
      .flatMap((id) => topicArticles.filter((item) => item.categoryId === id))
      .slice(0, 4);
    return (
      <main className="mx-auto min-h-[65vh] max-w-4xl px-4 py-12 md:py-16">
        <Link to="/ai-topics" className="label-mono text-primary">
          ← {copy("back")}
        </Link>
        <p className="mt-8 label-mono text-accent">
          {candidate.id} / {topicText(category?.title ?? topicPageCopy.title, lang)}
        </p>
        <h1 className="mt-3 font-cn-black text-3xl leading-tight md:text-5xl">{candidate.title}</h1>
        <p className="mt-5 text-xl text-muted-foreground">{candidate.summary}</p>
        <div className="mt-7 grid gap-3 border-y-2 border-foreground py-4 sm:grid-cols-2">
          <p>
            <strong>{copy("topicType")}:</strong> {copy(topicTypeCopyKey[candidate.contentType])}
          </p>
          <p>
            <strong>{copy("topicStatus")}:</strong> {copy("statusCandidate")}
          </p>
          <p>
            <strong>{copy("language")}:</strong> {copy("chinese")}
          </p>
          <p>
            <strong>URL:</strong> <code>{candidate.path}</code>
          </p>
        </div>
        <p className="mt-6 border-l-4 border-primary pl-4 text-muted-foreground">
          {copy("candidateOnly")}
        </p>
        <div className="paper mt-8 border-2 border-foreground p-5">
          <p className="font-bold">{t("keepTalking")}</p>
          <p className="mt-2 text-sm text-muted-foreground">{copy("discussionBoundary")}</p>
          <Link
            to="/discussions"
            className="mt-4 inline-block font-bold underline underline-offset-4"
          >
            {copy("discussion")} ↗
          </Link>
        </div>
        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="font-cn-black text-2xl">{copy("relatedTopics")}</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link
                    to="/ai-topics/$slug"
                    params={{ slug: item.slug }}
                    className="block border-2 border-foreground p-4 underline underline-offset-4 hover:bg-secondary"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    );
  }

  if (legacyPrompt) {
    return (
      <main className="mx-auto min-h-[65vh] max-w-4xl px-4 py-12 md:py-16">
        <Link to="/ai-topics" className="label-mono text-primary">
          ← {t("backToTopics")}
        </Link>
        <p className="mt-8 label-mono text-accent">{t("editorialLabel")}</p>
        <h1 className="mt-3 font-cn-black text-3xl leading-tight md:text-5xl">
          {localizedPrompt(legacyPrompt.title)}
        </h1>
        <p className="mt-5 text-xl text-muted-foreground">
          {localizedPrompt(legacyPrompt.summary)}
        </p>
        <article className="prose-zine mt-9">
          {legacyPrompt.sections.map((section) => (
            <section key={localizedPrompt(section.heading)}>
              <h2>{localizedPrompt(section.heading)}</h2>
              {section.paragraphs.map((paragraph, index) => (
                <p key={index}>{localizedPrompt(paragraph)}</p>
              ))}
            </section>
          ))}
        </article>
        <div className="paper mt-10 border-2 border-foreground p-5">
          <p className="font-bold">{t("nextSteps")}</p>
          <p className="mt-2">{t("nextStepsBody")}</p>
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

  return (
    <main className="mx-auto min-h-[65vh] max-w-4xl px-4 py-12 md:py-16">
      <Link to="/ai-topics" className="label-mono text-primary">
        ← {copy("back")}
      </Link>
      <p className="mt-8 label-mono text-accent">PUBLISHED / COMMUNITY EDITORIAL</p>
      <h1 className="mt-3 font-cn-black text-3xl leading-tight md:text-5xl">
        {pickRow(communityArticle!, "title")}
      </h1>
      <p className="mt-5 text-xl text-muted-foreground">{pickRow(communityArticle!, "excerpt")}</p>
      <article className="prose-zine mt-9 whitespace-pre-wrap">
        {pickRow(communityArticle!, "body")}
      </article>
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
}
