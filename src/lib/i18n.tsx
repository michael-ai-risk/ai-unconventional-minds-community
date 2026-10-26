import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { dict, type DictKey } from "./dictionary";

export type Lang = "zh" | "en";
const STORAGE_KEY = "aims.lang";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: DictKey) => string;
  /** Pick the bilingual field: pick(row, "title") -> row.title_zh / row.title_en */
  pick: (row: Record<string, unknown>, field: string) => string;
  fmtDate: (iso: string | null | undefined) => string;
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("zh");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "zh") setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const t = useCallback((key: DictKey) => dict[key]?.[lang] ?? key, [lang]);

  const pick = useCallback(
    (row: Record<string, unknown>, field: string) => {
      const primary = row[`${field}_${lang}`];
      const fallback = row[`${field}_${lang === "zh" ? "en" : "zh"}`];
      return (typeof primary === "string" && primary) || (typeof fallback === "string" ? fallback : "") || "";
    },
    [lang],
  );

  const fmtDate = useCallback(
    (iso: string | null | undefined) => {
      if (!iso) return "";
      return new Date(iso).toLocaleDateString(lang === "zh" ? "zh-CN" : "en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
    [lang],
  );

  return <I18nContext.Provider value={{ lang, setLang, t, pick, fmtDate }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
