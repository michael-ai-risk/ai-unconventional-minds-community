import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/community-rules")({
  head: () => ({ meta: [{ title: "社区规则 · AI非正常人类情报站" }] }),
  component: RulesPage,
});

function RulesPage() {
  const { t } = useI18n();
  const rules = [
    [t("ruleRespectTitle"), t("ruleRespectBody")],
    [t("rulePrivacyTitle"), t("rulePrivacyBody")],
    [t("ruleExperienceTitle"), t("ruleExperienceBody")],
    [t("ruleVoluntaryTitle"), t("ruleVoluntaryBody")],
    [t("ruleCareTitle"), t("ruleCareBody")],
  ];
  return (
    <main className="mx-auto min-h-[65vh] max-w-4xl px-4 py-12 md:py-16">
      <p className="label-mono text-accent">4SEAS / COMMUNITY CARE</p>
      <h1 className="mt-3 font-cn-black text-4xl md:text-5xl">
        {t("navRules")}
      </h1>
      <p className="mt-5 text-lg text-muted-foreground">
        {t("rulesIntro")}
      </p>
      <div className="mt-8 space-y-6">
        {rules.map(([title, body], index) => (
          <section key={title} className="border-t-2 border-foreground pt-5">
            <p className="label-mono text-accent">0{index + 1}</p>
            <h2 className="mt-2 font-cn-black text-xl">{title}</h2>
            <p className="mt-2 text-muted-foreground">{body}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
