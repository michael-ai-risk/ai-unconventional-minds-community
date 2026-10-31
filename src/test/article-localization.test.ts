import { describe, expect, it } from "vitest";
import { topicArticles } from "@/lib/ai-topic-catalog";
import {
  articleTranslations,
  hasArticleTranslation,
  localizeArticle,
} from "@/lib/article-localization";

describe("full editorial article translations", () => {
  for (const lang of ["zhTW", "en", "th", "ja", "ko"] as const) {
    it(`provides six complete bodies and source explanations in ${lang}`, () => {
      expect(Object.keys(articleTranslations[lang]).sort()).toEqual(
        topicArticles.map(({ slug }) => slug).sort(),
      );
      for (const original of topicArticles) {
        expect(hasArticleTranslation(original, lang)).toBe(true);
        const translated = localizeArticle(original, lang);
        expect(translated.language).toBe(lang);
        expect(translated.sections).toHaveLength(original.sections.length);
        for (const [index, section] of translated.sections.entries()) {
          expect(section.paragraphs).toHaveLength(original.sections[index]!.paragraphs.length);
          expect(section.heading.trim().length).toBeGreaterThan(3);
          for (const paragraph of section.paragraphs) {
            expect(paragraph.trim().length).toBeGreaterThan(20);
            if (lang === "en" || lang === "th" || lang === "ko") {
              expect(paragraph).not.toMatch(/\p{Script=Han}/u);
            }
          }
        }
        expect(translated.sources.map(({ url, label }) => ({ url, label }))).toEqual(
          original.sources.map(({ url, label }) => ({ url, label })),
        );
        expect(translated.sources.every(({ scope }) => scope.trim().length > 10)).toBe(true);
        expect(translated.status).toBe(original.status);
      }
    });
  }

  it("retains the numerical study limits in each language", () => {
    const original = topicArticles.find(({ slug }) => slug === "ai-replace-jobs")!;
    for (const lang of ["zhTW", "en", "th", "ja", "ko"] as const) {
      const text = localizeArticle(original, lang)
        .sections.flatMap(({ paragraphs }) => paragraphs)
        .join(" ")
        .normalize("NFKC");
      expect(text).toContain("5,179");
      expect(text).toContain("14%");
      expect(text).toContain("2023");
      expect(text).toContain("2026");
    }
  });

  it("distinguishes model tokens from financial tokens in every asset article", () => {
    const article = topicArticles.find(({ slug }) => slug === "ai-assets-and-wealth")!;
    expect(localizeArticle(article, "en").sections[1]!.paragraphs[0]).toContain(
      "not tradable financial tokens",
    );
    expect(localizeArticle(article, "ja").sections[1]!.paragraphs[0]).toContain(
      "金融トークンではありません",
    );
    expect(localizeArticle(article, "ko").sections[1]!.paragraphs[0]).toContain(
      "금융 토큰이 아닙니다",
    );
    expect(localizeArticle(article, "th").sections[1]!.paragraphs[0]).toContain(
      "ไม่ใช่โทเคนการเงิน",
    );
    expect(localizeArticle(article, "zhTW").sections[1]!.paragraphs[0]).toContain(
      "不是可交易的金融代幣",
    );
  });

  it("does not silently classify an unknown or incomplete translation as readable", () => {
    const article = { ...topicArticles[0]!, slug: "missing-translation" };
    expect(hasArticleTranslation(article, "en")).toBe(false);
    expect(localizeArticle(article, "en").language).toBe("zh");
    expect(hasArticleTranslation({ ...topicArticles[0]!, sections: [] }, "en")).toBe(false);
    const chinese = topicArticles[0]!;
    expect(localizeArticle(chinese, "zh").sections).toBe(chinese.sections);
    expect(localizeArticle(chinese, "zh").sources).toBe(chinese.sources);
  });

  it("prevents an unexpected translated metadata field from replacing a source URL", () => {
    const article = topicArticles[0]!;
    const note = articleTranslations.en[article.slug]!.sourceNotes[0]!;
    const extra = note as unknown as Record<string, unknown>;
    extra["url"] = "https://invalid.example/replaced-citation";
    try {
      expect(localizeArticle(article, "en").sources[0]!.url).toBe(article.sources[0]!.url);
    } finally {
      delete extra["url"];
    }
  });
});
