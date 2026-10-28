import { describe, expect, it } from "vitest";
import { topicEntries, topicArticles, topicCategories } from "@/lib/ai-topic-catalog";

describe("AI topic map", () => {
  it("contains twelve top-level categories and the wealth subcategories", () => {
    expect(topicCategories).toHaveLength(12);
    expect(topicCategories.map((category) => category.id)).toEqual(
      Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0")),
    );
    expect(
      topicCategories.find((category) => category.id === "08")?.subcategories?.map(({ id }) => id),
    ).toEqual(["assets", "tokens", "capital"]);
  });

  it("keeps 120 base entries plus 30 additional wealth topics without duplicate titles", () => {
    expect(topicEntries).toHaveLength(150);
    expect(new Set(topicEntries.map((topic) => topic.id)).size).toBe(150);
    expect(new Set(topicEntries.map((topic) => topic.slug)).size).toBe(150);
    expect(new Set(topicEntries.map((topic) => topic.title.normalize("NFKC").trim())).size).toBe(
      150,
    );
    expect(topicEntries.filter((topic) => topic.status === "candidate")).toHaveLength(144);
    expect(topicEntries.filter((topic) => topic.status === "published")).toHaveLength(6);
    for (const category of topicCategories) {
      expect(topicEntries.filter((topic) => topic.categoryId === category.id)).toHaveLength(
        category.id === "08" ? 40 : 10,
      );
    }
    for (const topic of topicEntries) {
      expect(topic.path).toBe(`/ai-topics/${topic.slug}`);
      expect(topic.language).toBe("zh");
      expect(["candidate", "draft", "published"]).toContain(topic.status);
      expect(["research", "experience", "discussion", "case"]).toContain(topic.contentType);
    }
  });

  it("publishes only the six sourced priority articles as readable topic records", () => {
    expect(topicArticles).toHaveLength(6);
    expect(
      topicArticles.every((article) => article.status === "published" && article.language === "zh"),
    ).toBe(true);
    for (const article of topicArticles) {
      const candidate = topicEntries.find((topic) => topic.slug === article.slug);
      expect(candidate?.status).toBe("published");
      expect(candidate?.path).toBe(`/ai-topics/${article.slug}`);
      expect(article.sections.length).toBeGreaterThanOrEqual(6);
      expect(article.sources.length).toBeGreaterThan(0);
      expect(article.sources.every((source) => source.url.startsWith("https://"))).toBe(true);
    }
    expect(topicEntries.filter((topic) => topic.status === "published")).toHaveLength(6);
  });
});
