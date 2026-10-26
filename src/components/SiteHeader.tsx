import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useI18n, type Lang } from "@/lib/i18n";

export function SiteHeader() {
  const { t, lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const links = [
    { to: "/", label: t("navHome") },
    { to: "/events", label: t("navEvents") },
    { to: "/ai-topics", label: t("navTopics") },
    { to: "/discussions", label: t("navDiscussions") },
    { to: "/chiang-mai", label: t("navChiangMai") },
    { to: "/about", label: t("navAbout") },
  ] as const;
  return (
    <header className="sticky top-0 z-40 border-b-2 border-foreground bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="bg-primary px-2 py-1 font-display text-lg text-primary-foreground">
            AI
          </span>
          <span className="font-cn-black text-sm md:text-base">{t("siteName")}</span>
        </Link>
        <nav
          aria-label={t("mainNavigation")}
          className="hidden items-center gap-1 lg:flex"
        >
          {links.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{ className: "bg-primary text-primary-foreground" }}
              className="px-2 py-2 text-sm hover:bg-secondary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <select
            value={lang}
            onChange={(event) => setLang(event.target.value as Lang)}
            aria-label={t("langSwitchLabel")}
            className="border-2 border-primary bg-background px-2 py-1.5 text-sm text-foreground hover:bg-primary hover:text-primary-foreground"
          >
            <option value="zh">简体中文</option>
            <option value="zhTW">繁體中文</option>
            <option value="en">English</option>
            <option value="th">ไทย</option>
          </select>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            className="label-mono border-2 border-foreground px-3 py-1.5 lg:hidden"
          >
            {open ? t("close") : t("menu")}
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="mobile-navigation"
          aria-label={t("mainNavigation")}
          className="border-t-2 border-foreground bg-paper text-paper-foreground lg:hidden"
        >
          <div className="mx-auto grid max-w-7xl grid-cols-2 px-4 py-3 sm:grid-cols-3">
            {links.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                activeProps={{ className: "bg-primary" }}
                className="border-b border-paper-foreground/20 px-3 py-4 font-bold hover:bg-primary/50"
              >
                {item.label} <span aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
