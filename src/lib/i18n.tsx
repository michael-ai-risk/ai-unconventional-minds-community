import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { dict, type DictKey } from "./dictionary";
import { jaDict } from "./dictionary-ja";
import { koDict } from "./dictionary-ko";

export type Lang = "zh" | "zhTW" | "en" | "th" | "ja" | "ko";
export type LocaleText = { zh: string; en: string; zhTW?: string; th?: string; ja?: string; ko?: string };

export function selectLocale(value: LocaleText, lang: Lang): string {
  return value[lang] || (lang === "zhTW" ? value.zh : value.en);
}
const STORAGE_KEY = "aims.lang";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: DictKey) => string;
  /** Pick the best available localized field from static or D1 content. */
  pick: (row: object, field: string) => string;
  fmtDate: (iso: string | null | undefined) => string;
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("zh");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "zh" || saved === "zhTW" || saved === "th" || saved === "ja" || saved === "ko")
      setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : lang === "zhTW" ? "zh-TW" : lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const t = useCallback(
    (key: DictKey) => (lang === "ja" ? jaDict[key] : lang === "ko" ? koDict[key] : dict[key]?.[lang]) ?? dict[key]?.en ?? key,
    [lang],
  );

  const pick = useCallback(
    (row: object, field: string) => {
      const fields = row as Record<string, unknown>;
      const suffixes: Record<Lang, string[]> = {
        zh: ["zh", "en"],
        zhTW: ["zh_tw", "zhTW", "zh", "en"],
        en: ["en", "zh", "zh_tw"],
        th: ["th", "en", "zh", "zh_tw"],
        ja: ["ja", "en", "zh", "zh_tw"],
        ko: ["ko", "en", "zh", "zh_tw"],
      };
      for (const suffix of suffixes[lang]) {
        const candidate = fields[`${field}_${suffix}`];
        if (typeof candidate === "string" && candidate.trim()) return candidate;
      }
      return "";
    },
    [lang],
  );

  const fmtDate = useCallback(
    (iso: string | null | undefined) => {
      if (!iso) return "";
      const locale = lang === "zh" ? "zh-CN" : lang === "zhTW" ? "zh-TW" : lang === "th" ? "th-TH" : lang === "ja" ? "ja-JP" : lang === "ko" ? "ko-KR" : "en-GB";
      return new Date(iso).toLocaleDateString(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
    [lang],
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t, pick, fmtDate }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
