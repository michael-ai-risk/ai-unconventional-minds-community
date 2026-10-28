import { describe, expect, it } from "vitest";
import { topicArticles, topicCategories, topicEntries } from "@/lib/ai-topic-catalog";
import { localizeTopic, matchesTopicSearch, topicTranslations } from "@/lib/topic-localization";

describe("localized topic catalog", () => {
  for (const lang of ["zhTW", "en", "th", "ja", "ko"] as const) {
    it(`covers all 150 IDs in ${lang} without orphan entries or Chinese fallback`, () => {
      expect(Object.keys(topicTranslations[lang]).sort()).toEqual(
        topicEntries.map(({ id }) => id).sort(),
      );
      for (const topic of topicEntries) {
        const translated = localizeTopic(topic, lang);
        expect(translated.title.trim().length).toBeGreaterThan(5);
        expect(translated.summary.trim().length).toBeGreaterThan(15);
        if (lang !== "zhTW") {
          expect(translated.title).not.toBe(topic.title);
          expect(translated.summary).not.toBe(topic.summary);
        }
        if (lang === "en")
          expect(translated.title + translated.summary).not.toMatch(/[\p{Script=Han}]/u);
        if (lang === "th") expect(translated.title).toMatch(/[\p{Script=Thai}]/u);
        if (lang === "ja")
          expect(translated.title).toMatch(/[\p{Script=Hiragana}\p{Script=Katakana}]/u);
        if (lang === "ko") expect(translated.title).toMatch(/[\p{Script=Hangul}]/u);
        expect(matchesTopicSearch(topic, lang, translated.title)).toBe(true);
        expect(matchesTopicSearch(topic, lang, translated.summary.slice(0, 12))).toBe(true);
        expect(matchesTopicSearch(topic, lang, topic.title)).toBe(true);
      }
    });
  }

  it("searches the selected language category and normalizes character width and case", () => {
    const topic = topicEntries.find(({ id }) => id === "05-01")!;
    expect(matchesTopicSearch(topic, "en", "ＣＨＡＴＧＰＴ")).toBe(true);
    for (const lang of ["zhTW", "en", "th", "ja", "ko"] as const) {
      const category = topicCategories.find(({ id }) => id === topic.categoryId)!;
      expect(matchesTopicSearch(topic, lang, category.title[lang], category.title[lang])).toBe(
        true,
      );
      expect(matchesTopicSearch(topic, lang, "no-matching-topic-12345")).toBe(false);
    }
  });

  it("preserves Chinese source records and never publishes translated article bodies", () => {
    for (const topic of topicEntries) expect(localizeTopic(topic, "zh")).toBe(topic);
    expect(topicEntries.filter(({ status }) => status === "candidate")).toHaveLength(144);
    expect(topicArticles).toHaveLength(6);
    expect(topicArticles.every(({ language }) => language === "zh")).toBe(true);
  });

  it("keeps model tokens separate from blockchain tokens in every translated summary", () => {
    const token = topicEntries.find(({ id }) => id === "08-tokens-01")!;
    expect(localizeTopic(token, "en").summary).toContain("not interchangeable");
    expect(localizeTopic(token, "th").summary).toContain("ใช้แทนกันไม่ได้");
    expect(localizeTopic(token, "ja").summary).toContain("交換できません");
    expect(localizeTopic(token, "ko").summary).toContain("같은 뜻이 아닙니다");
    expect(localizeTopic(token, "zhTW").summary).toContain("含義不能互換");
  });
});
