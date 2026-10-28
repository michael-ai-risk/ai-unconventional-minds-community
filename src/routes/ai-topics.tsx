import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  getArticleBySlug,
  getTopicEntryBySlug,
  topicArticles,
  topicCategories,
  topicEntries,
  topicPageCopy,
  topicText,
  topicTypeCopyKey,
} from "@/lib/ai-topic-catalog";
import { useI18n } from "@/lib/i18n";
import { localizeContent } from "@/lib/content-locales";
import { localizeTopic, matchesTopicSearch } from "@/lib/topic-localization";

export const Route = createFileRoute("/ai-topics")({
  head: () => ({ meta: [{ title: "AI Topics · AI非正常人类情报站" }] }),
  component: TopicsRouteComponent,
});

function TopicsRouteComponent() {
  const isDetailRoute = useRouterState({
    select: (state) => state.location.pathname.startsWith("/ai-topics/"),
  });

  return isDetailRoute ? <Outlet /> : <TopicsPage />;
}

function TopicsPage() {
  const { lang } = useI18n();
  const [articles, setArticles] = useState<CommunityArticle[]>([]);
  const [apiError, setApiError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    fetch("/api/community/articles")
      .then(async (response) => {
        const data = (await response.json()) as { articles?: CommunityArticle[]; error?: string };
        if (!response.ok) throw new Error(data.error || "Article service unavailable");
        setArticles(data.articles ?? []);
      })
      .catch((error) => setApiError(error instanceof Error ? error.message : String(error)));
  }, []);

  const filteredTopics = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return topicEntries.filter((topic) => {
      if (selectedCategory !== "all" && topic.categoryId !== selectedCategory) return false;
      if (selectedSubcategory !== "all" && !topic.id.includes(`08-${selectedSubcategory}-`))
        return false;
      if (!term) return true;
      const category = topicCategories.find((item) => item.id === topic.categoryId);
      return matchesTopicSearch(topic, lang, term, category ? topicText(category.title, lang) : "");
    });
  }, [lang, search, selectedCategory, selectedSubcategory]);

  const selectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory("all");
    setVisibleCount(12);
  };
  const selectedCategoryInfo = topicCategories.find((category) => category.id === selectedCategory);
  const pick = (value: {
    zh: string;
    en: string;
    zhTW?: string;
    th?: string;
    ja?: string;
    ko?: string;
  }) => localizeContent(value, lang);

  return (
    <main className="mx-auto min-h-[65vh] max-w-7xl px-4 py-12 md:py-16">
      <header className="border-b-2 border-foreground pb-8 md:pb-10">
        <p className="label-mono text-accent">{topicText(topicPageCopy.kicker, lang)}</p>
        <h1 className="mt-3 font-cn-black text-4xl md:text-6xl">
          {topicText(topicPageCopy.title, lang)}
        </h1>
        <p className="mt-5 max-w-4xl text-xl leading-relaxed text-muted-foreground md:text-2xl">
          {topicText(topicPageCopy.subtitle, lang)}
        </p>
        <p className="mt-4 max-w-4xl leading-relaxed text-muted-foreground">
          {topicText(topicPageCopy.intro, lang)}
        </p>
        <div className="mt-7 border-l-4 border-primary pl-4">
          <p className="label-mono">{topicText(topicPageCopy.sharedQuestion, lang)}</p>
          <p className="mt-2 font-bold">{topicText(topicPageCopy.sharedQuestionText, lang)}</p>
        </div>
      </header>

      <section className="mt-10" aria-labelledby="editorial-reads">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="label-mono text-accent">EDITORIAL / 01—06</p>
            <h2 id="editorial-reads" className="mt-2 font-cn-black text-2xl md:text-3xl">
              {topicText(topicPageCopy.articlesTitle, lang)}
            </h2>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {topicText(topicPageCopy.articlesNote, lang)}
          </p>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {topicArticles.map((article, index) => {
            const canRead = article.status === "published";
            const entry = getTopicEntryBySlug(article.slug);
            const localized = entry && lang !== "zh" ? localizeTopic(entry, lang) : article;
            const className =
              "paper flex h-full flex-col border-2 border-foreground p-5 transition-colors hover:bg-primary";
            const contents = (
              <>
                <p className="label-mono text-accent">
                  {String(index + 1).padStart(2, "0")} /{" "}
                  {topicText(topicPageCopy.statusPublished, lang)}
                </p>
                <h3 className="mt-3 font-cn-black text-xl">{localized.title}</h3>
                <p className="mt-3 flex-1 text-paper-muted">{localized.summary}</p>
                <span className="mt-5 inline-block font-bold">
                  {canRead && lang === "zh"
                    ? `${topicText(topicPageCopy.read, lang)} ↗`
                    : topicText(topicPageCopy.chineseOnly, lang)}
                </span>
              </>
            );
            return canRead ? (
              <Link
                key={article.slug}
                to="/ai-topics/$slug"
                params={{ slug: article.slug }}
                className={className}
              >
                {contents}
              </Link>
            ) : (
              <article key={article.slug} className={`${className} cursor-default`}>
                {contents}
              </article>
            );
          })}
        </div>
      </section>

      <section
        className="mt-12 border-t-2 border-foreground pt-8"
        aria-labelledby="topic-categories"
      >
        <p className="label-mono text-accent">MAP / 12 AREAS</p>
        <h2 id="topic-categories" className="mt-2 font-cn-black text-2xl md:text-3xl">
          {topicText(topicPageCopy.categoryTitle, lang)}
        </h2>
        <p className="mt-2 text-muted-foreground">{topicText(topicPageCopy.categoryHelp, lang)}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topicCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              aria-pressed={selectedCategory === category.id}
              onClick={() => selectCategory(category.id)}
              className={`min-h-32 border-2 border-foreground p-4 text-left transition-colors hover:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${selectedCategory === category.id ? "bg-primary text-primary-foreground" : "paper"}`}
            >
              <span className="label-mono">{category.id}</span>
              <span className="mt-2 block font-cn-black text-lg">
                {topicText(category.title, lang)}
              </span>
              <span className="mt-2 block text-sm leading-relaxed opacity-80">
                {topicText(category.scope, lang)}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-12 border-t-2 border-foreground pt-8" aria-labelledby="topic-library">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="label-mono text-accent">CATALOG / {topicEntries.length}</p>
            <h2 id="topic-library" className="mt-2 font-cn-black text-2xl md:text-3xl">
              {topicText(topicPageCopy.libraryTitle, lang)}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {topicText(topicPageCopy.titlesChineseNote, lang)}
            </p>
          </div>
          <p className="max-w-xl text-sm text-muted-foreground">
            {topicText(topicPageCopy.topicEntryCount, lang)}
          </p>
          <span className="font-bold">
            {topicEntries.length} {topicText(topicPageCopy.topicEntry, lang)}
          </span>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(16rem,0.5fr)]">
          <label className="sr-only" htmlFor="topic-search">
            {topicText(topicPageCopy.search, lang)}
          </label>
          <input
            id="topic-search"
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setVisibleCount(12);
            }}
            placeholder={topicText(topicPageCopy.search, lang)}
            className="min-h-12 w-full min-w-0 border-2 border-foreground bg-background px-4"
          />
          <label className="sr-only" htmlFor="topic-category-filter">
            {topicText(topicPageCopy.allCategories, lang)}
          </label>
          <select
            id="topic-category-filter"
            value={selectedCategory}
            onChange={(event) => selectCategory(event.target.value)}
            className="min-h-12 w-full min-w-0 border-2 border-foreground bg-background px-4"
          >
            <option value="all">{topicText(topicPageCopy.allCategories, lang)}</option>
            {topicCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.id} / {topicText(category.title, lang)}
              </option>
            ))}
          </select>
        </div>

        {selectedCategoryInfo?.id === "08" && selectedCategoryInfo.subcategories && (
          <div className="mt-3 max-w-xl">
            <label className="sr-only" htmlFor="topic-subcategory-filter">
              {topicText(topicPageCopy.subcategory, lang)}
            </label>
            <select
              id="topic-subcategory-filter"
              value={selectedSubcategory}
              onChange={(event) => {
                setSelectedSubcategory(event.target.value);
                setVisibleCount(12);
              }}
              className="min-h-12 w-full border-2 border-foreground bg-background px-4"
            >
              <option value="all">{topicText(topicPageCopy.allSubcategories, lang)}</option>
              {selectedCategoryInfo.subcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {topicText(subcategory.title, lang)}
                </option>
              ))}
            </select>
          </div>
        )}

        <p className="mt-4 text-sm text-muted-foreground">
          {topicText(topicPageCopy.showing, lang)} {Math.min(visibleCount, filteredTopics.length)}{" "}
          {topicText(topicPageCopy.of, lang)} {filteredTopics.length}
        </p>
        {filteredTopics.length ? (
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredTopics.slice(0, visibleCount).map((topic) => {
              const localized = localizeTopic(topic, lang);
              const article = getArticleBySlug(topic.slug);
              const canReadArticle = article?.status === "published" && lang === "zh";
              return (
                <Link
                  key={topic.id}
                  to="/ai-topics/$slug"
                  params={{ slug: topic.slug }}
                  className="group paper border-2 border-foreground p-4 transition-colors hover:bg-primary"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="label-mono text-accent">{topic.id}</span>
                    <span>
                      {topicText(topicPageCopy[topicTypeCopyKey[topic.contentType]], lang)}
                    </span>
                    <span className="ml-auto font-bold">
                      {topicText(
                        topic.status === "published"
                          ? topicPageCopy.statusPublished
                          : topicPageCopy.statusCandidate,
                        lang,
                      )}
                    </span>
                  </div>
                  <h3 className="mt-3 font-cn-black text-lg">{localized.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-paper-muted">
                    {localized.summary}
                  </p>
                  <span className="mt-4 inline-block font-bold group-hover:underline">
                    {canReadArticle
                      ? `${topicText(topicPageCopy.read, lang)} ↗`
                      : `${topicText(topicPageCopy.viewTopic, lang)} ↗`}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="mt-5 border-2 border-foreground p-5" role="status">
            {topicText(topicPageCopy.noResults, lang)}
          </p>
        )}
        {visibleCount < filteredTopics.length && (
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + 12)}
            className="mt-5 border-2 border-foreground px-5 py-3 font-bold hover:bg-primary hover:text-primary-foreground"
          >
            {topicText(topicPageCopy.loadMore, lang)}
          </button>
        )}
      </section>

      {articles.length > 0 && (
        <section className="mt-12 border-t-2 border-foreground pt-8">
          <p className="label-mono text-accent">PUBLISHED / COMMUNITY EDITORIAL</p>
          <h2 className="mt-2 font-cn-black text-2xl">
            {topicText(topicPageCopy.articlesTitle, lang)}
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {articles.map((article) => (
              <Link
                key={article["slug"]}
                to="/ai-topics/$slug"
                params={{ slug: article["slug"] }}
                className="paper border-2 border-foreground p-5 hover:bg-primary"
              >
                <p className="label-mono">{article["category_slug"] ?? ""}</p>
                <h3 className="mt-3 font-cn-black text-xl">
                  {pick({
                    zh: article["title_zh"] ?? "",
                    zhTW: article["title_zh_tw"] ?? "",
                    en: article["title_en"] ?? "",
                    th: article["title_th"] ?? "",
                    ja: article["title_ja"] ?? "",
                    ko: article["title_ko"] ?? "",
                  })}
                </h3>
                <p className="mt-2 text-paper-muted">
                  {pick({
                    zh: article["excerpt_zh"] ?? "",
                    zhTW: article["excerpt_zh_tw"] ?? "",
                    en: article["excerpt_en"] ?? "",
                    th: article["excerpt_th"] ?? "",
                    ja: article["excerpt_ja"] ?? "",
                    ko: article["excerpt_ko"] ?? "",
                  })}
                </p>
                <span className="mt-4 inline-block font-bold">
                  {topicText(topicPageCopy.read, lang)} ↗
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
      {apiError && (
        <p role="status" className="mt-6 text-sm text-muted-foreground">
          {apiError}
        </p>
      )}
      <p className="mt-8 border-l-4 border-primary pl-4 text-sm text-muted-foreground">
        {topicText(topicPageCopy.sourceNote, lang)}
      </p>
    </main>
  );
}

type CommunityArticle = {
  slug: string;
  category_slug?: string;
  title_zh?: string;
  title_zh_tw?: string;
  title_en?: string;
  title_th?: string;
  title_ja?: string;
  title_ko?: string;
  excerpt_zh?: string;
  excerpt_zh_tw?: string;
  excerpt_en?: string;
  excerpt_th?: string;
  excerpt_ja?: string;
  excerpt_ko?: string;
};
