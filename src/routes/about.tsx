import { Link, createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "关于我们 · AI非正常人类情报站" }] }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useI18n();
  const points = [t("aboutPoint1"), t("aboutPoint2"), t("aboutPoint3"), t("aboutPoint4")];
  return (
    <main className="mx-auto min-h-[65vh] max-w-7xl px-4 py-12 md:py-16">
      <p className="label-mono text-accent">4SEAS / ABOUT</p>
      <h1 className="mt-3 font-cn-black text-4xl md:text-6xl">{t("navAbout")}</h1>
      <section className="paper mt-8 border-2 border-foreground p-6 md:p-9">
        <p className="label-mono">WHY WE MEET</p>
        <h2 className="mt-4 max-w-4xl font-cn-black text-2xl leading-snug md:text-4xl">
          {t("aboutWhyTitle")}
        </h2>
        <p className="mt-5 max-w-3xl leading-relaxed">
          {t("aboutWhyBody")}
        </p>
      </section>
      <section className="mt-10 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="font-cn-black text-2xl">
            {t("aboutWelcome")}
          </h2>
          <ul className="mt-4 space-y-3">
            {points.map((point) => (
              <li key={point} className="border-l-4 border-primary pl-4">
                {point}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-cn-black text-2xl">
            {t("aboutJoin")}
          </h2>
          <p className="mt-4 leading-relaxed">
            {t("aboutJoinBody")}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/events"
              className="border-2 border-foreground px-4 py-3 font-bold hover:bg-secondary"
            >
              {t("navEvents")} ↗
            </Link>
            <a
              href="https://tally.so/r/PRdaO5"
              target="_blank"
              rel="noopener noreferrer"
              className="stamp border-2 border-primary bg-primary px-4 py-3 font-bold text-primary-foreground"
            >
              {t("survey")} ↗
            </a>
          </div>
        </div>
      </section>
      <p className="mt-10 border-t-2 border-foreground pt-5 text-sm text-muted-foreground">
        {t("aboutCommunityNote")} {" "}
        <Link to="/community-rules" className="underline underline-offset-4">
          {t("navRules")}
        </Link>
        .
      </p>
    </main>
  );
}
