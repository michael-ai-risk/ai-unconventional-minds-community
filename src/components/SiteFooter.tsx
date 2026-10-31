import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="border-t-2 border-foreground bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-cn-black">{t("siteName")}</p>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">{t("footer")}</p>
        </div>
        <nav
          aria-label={t("additionalLinks")}
          className="flex flex-wrap gap-x-5 gap-y-2 text-sm underline underline-offset-4"
        >
          <Link to="/community-rules">{t("navRules")}</Link>
          <Link to="/privacy">{t("navPrivacy")}</Link>
          <a href="https://tally.so/r/PRdaO5" target="_blank" rel="noopener noreferrer">
            {t("survey")} ↗
          </a>
        </nav>
      </div>
    </footer>
  );
}
