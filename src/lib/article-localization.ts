import type { Lang } from "./i18n";
import type { TopicArticle } from "./ai-topic-catalog";
import enSource from "./article-locales/en.json?raw";
import zhTWSource from "./article-locales/zhTW.json?raw";
import thSource from "./article-locales/th.json?raw";
import jaSource from "./article-locales/ja.json?raw";
import koSource from "./article-locales/ko.json?raw";

export type ArticleTranslation = Pick<TopicArticle, "title" | "summary" | "sections"> & {
  sourceNotes: Array<{ published: string; scope: string }>;
};
export const articleTranslations: Record<
  Exclude<Lang, "zh">,
  Record<string, ArticleTranslation>
> = {
  en: JSON.parse(enSource),
  zhTW: JSON.parse(zhTWSource),
  th: JSON.parse(thSource),
  ja: JSON.parse(jaSource),
  ko: JSON.parse(koSource),
};

export function hasArticleTranslation(article: TopicArticle, lang: Lang): boolean {
  if (lang === "zh") return true;
  const translation = articleTranslations[lang][article.slug];
  return (
    !!translation &&
    !!translation.title.trim() &&
    !!translation.summary.trim() &&
    translation.sections.length === article.sections.length &&
    translation.sections.every(
      (section, index) =>
        !!section.heading.trim() &&
        section.paragraphs.length === article.sections[index]?.paragraphs.length &&
        section.paragraphs.every((paragraph) => !!paragraph.trim()),
    ) &&
    translation.sourceNotes.length === article.sources.length &&
    translation.sourceNotes.every((source) => !!source.published.trim() && !!source.scope.trim())
  );
}

export function localizeArticle(article: TopicArticle, lang: Lang) {
  if (lang === "zh" || !hasArticleTranslation(article, lang))
    return { ...article, language: "zh" as Lang };
  const translation = articleTranslations[lang][article.slug]!;
  return {
    ...article,
    title: translation.title,
    summary: translation.summary,
    sections: translation.sections,
    language: lang,
    // Reference identity and URLs always come from the original; translations
    // cannot silently replace or invent citations.
    sources: article.sources.map((source, index) => ({
      ...source,
      published: translation.sourceNotes[index]!.published,
      scope: translation.sourceNotes[index]!.scope,
    })),
  };
}
