import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";

export function SiteHeader() {
  const { t, lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b-2 border-foreground bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="bg-primary px-2 py-1 font-display text-lg text-primary-foreground">AI</span>
          <span className="font-cn-black text-sm md:text-base">{t("siteName")}</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === "zh" ? "en" : "zh")}
            aria-label={t("langSwitchLabel")}
            className="label-mono border-2 border-primary px-3 py-1.5 text-primary hover:bg-primary hover:text-primary-foreground"
          >
            {t("langSwitch")}
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="label-mono border-2 border-foreground px-3 py-1.5"
          >
            {open ? t("close") : t("menu")}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t-2 border-foreground bg-paper text-paper-foreground">
          <p className="mx-auto max-w-7xl px-4 py-4 label-mono">
            {t("navEvents")} · {t("navIntel")} · {t("navDiscuss")} · {t("navProjects")} · {t("navGuide")} · {t("navAbout")}
          </p>
        </nav>
      )}
    </header>
  );
}
