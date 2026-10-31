import type { Lang } from "./i18n";
import en from "./topic-locales/en.txt?raw";
import zhTW from "./topic-locales/zhTW.txt?raw";
import th from "./topic-locales/th.txt?raw";
import ja from "./topic-locales/ja.txt?raw";
import ko from "./topic-locales/ko.txt?raw";

export type TopicTranslation = { title: string; summary: string };
type TranslatedLanguage = Exclude<Lang, "zh">;

// Static, versioned editorial drafts; never call an external translator at runtime.
function parseCatalog(source: string): Record<string, TopicTranslation> {
  const entries: Record<string, TopicTranslation> = {};
  for (const line of source.trim().split(/\r?\n/)) {
    const [id, title, summary, extra] = line.split("|");
    if (!id || !title?.trim() || !summary?.trim() || extra || entries[id]) {
      throw new Error(`Invalid or duplicate topic translation: ${id}`);
    }
    entries[id] = { title, summary };
  }
  return entries;
}

export const topicTranslations: Record<TranslatedLanguage, Record<string, TopicTranslation>> = {
  en: parseCatalog(en),
  zhTW: parseCatalog(zhTW),
  th: parseCatalog(th),
  ja: parseCatalog(ja),
  ko: parseCatalog(ko),
};

export const topicTranslationReview = {
  status: "AI_ASSISTED_DRAFT",
  nativeSpeakerReviewed: false,
  traditionalChineseConversion: "OpenCC s2twp; editorial draft",
} as const;

export function localizeTopic(
  topic: TopicTranslation & { id: string },
  lang: Lang,
): TopicTranslation {
  return lang === "zh" ? topic : (topicTranslations[lang][topic.id] ?? topic);
}

export function matchesTopicSearch(
  topic: TopicTranslation & { id: string },
  lang: Lang,
  query: string,
  categoryText = "",
): boolean {
  const localized = localizeTopic(topic, lang);
  const normalize = (text: string) => text.normalize("NFKC").toLocaleLowerCase().trim();
  return normalize(
    `${localized.title} ${localized.summary} ${categoryText} ${topic.title} ${topic.summary}`,
  ).includes(normalize(query));
}
