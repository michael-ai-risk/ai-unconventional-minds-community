import { Link, createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "关于我们 · AI非正常人类情报站" }] }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useI18n();
  const topics = [
    ["aboutTopic1Title", "aboutTopic1Body"],
    ["aboutTopic2Title", "aboutTopic2Body"],
    ["aboutTopic3Title", "aboutTopic3Body"],
    ["aboutTopic4Title", "aboutTopic4Body"],
    ["aboutTopic5Title", "aboutTopic5Body"],
    ["aboutTopic6Title", "aboutTopic6Body"],
  ] as const;
  const participationPoints = [
    "aboutParticipationPoint1",
    "aboutParticipationPoint2",
    "aboutParticipationPoint3",
    "aboutParticipationPoint4",
    "aboutParticipationPoint5",
  ] as const;
  const members = [
    {
      name: "Michael",
      role: "Founder",
      avatar: "/avatars/michael.svg",
      bio: "aboutMichaelBio",
      sharing: "aboutMichaelSharing",
    },
    {
      name: "海",
      role: "Business & Markets",
      avatar: "/avatars/hai.svg",
      bio: "aboutHaiBio",
      sharing: "aboutHaiSharing",
    },
    {
      name: "Abby",
      role: "Digital Products",
      avatar: "/avatars/abby.svg",
      bio: "aboutAbbyBio",
      sharing: "aboutAbbySharing",
    },
  ] as const;

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 md:py-16">
      <p className="label-mono text-accent">4SEAS / ABOUT</p>
      <h1 className="mt-3 font-cn-black text-4xl md:text-6xl">{t("navAbout")}</h1>

      <section
        aria-labelledby="about-why-title"
        className="paper mt-8 border-2 border-foreground p-6 md:p-9"
      >
        <p className="label-mono">WHY WE MEET</p>
        <h2
          id="about-why-title"
          className="mt-4 max-w-4xl font-cn-black text-2xl leading-snug md:text-4xl"
        >
          {t("aboutWhyTitle")}
        </h2>
        <p className="mt-5 max-w-4xl whitespace-pre-line leading-relaxed">{t("aboutWhyBody")}</p>
      </section>

      <section
        aria-labelledby="about-founder-title"
        className="mt-10 border-2 border-foreground bg-background p-6 md:p-9"
      >
        <div className="grid gap-7 lg:grid-cols-[minmax(13rem,0.7fr)_minmax(0,1.3fr)] lg:gap-12">
          <div>
            <p className="label-mono text-accent">FROM THE FOUNDER</p>
            <h2
              id="about-founder-title"
              className="mt-4 font-cn-black text-2xl leading-snug md:text-3xl"
            >
              {t("aboutFounderTitle")}
            </h2>
            <div className="mt-6 flex items-center gap-4 border-t-2 border-foreground pt-5">
              <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-foreground bg-paper">
                <img
                  src="/avatars/michael.svg"
                  alt=""
                  aria-hidden="true"
                  className="size-full object-cover"
                />
              </span>
              <span>
                <span className="block font-cn-black text-lg">Michael · Founder</span>
                <span className="label-mono text-muted-foreground">{t("aboutFounderLabel")}</span>
              </span>
            </div>
          </div>
          <p className="whitespace-pre-line leading-8 text-muted-foreground">
            {t("aboutFounderStory")}
          </p>
        </div>
      </section>

      <section
        aria-labelledby="about-explore-title"
        className="paper mt-10 border-2 border-foreground p-6 md:p-9"
      >
        <p className="label-mono">WHAT YOU CAN EXPLORE</p>
        <h2 id="about-explore-title" className="mt-3 font-cn-black text-2xl md:text-3xl">
          {t("aboutExploreTitle")}
        </h2>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {topics.map(([title, body], index) => (
            <article
              key={title}
              className="min-w-0 border-2 border-paper-foreground bg-background p-5 text-foreground"
            >
              <p className="label-mono text-accent">0{index + 1}</p>
              <h3 className="mt-3 font-cn-black text-lg leading-snug">{t(title)}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{t(body)}</p>
            </article>
          ))}
        </div>
        <p className="mt-5 border-l-4 border-primary pl-4 text-sm leading-relaxed text-paper-foreground">
          {t("aboutExploreNote")}
        </p>
      </section>

      <section aria-labelledby="about-humans-title" className="mt-10">
        <p className="label-mono text-accent">MEET THE HUMANS</p>
        <h2 id="about-humans-title" className="mt-3 font-cn-black text-2xl md:text-3xl">
          {t("aboutHumansTitle")}
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {members.map((member) => (
            <article key={member.name} className="border-2 border-foreground bg-background p-5">
              <div className="flex items-center gap-4">
                <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-paper-foreground bg-paper">
                  <img
                    src={member.avatar}
                    alt=""
                    aria-hidden="true"
                    className="size-full object-cover"
                  />
                </span>
                <div className="min-w-0">
                  <h3 className="font-cn-black text-xl">{member.name}</h3>
                  <p className="label-mono text-accent">{member.role}</p>
                </div>
              </div>
              <p className="mt-5 leading-relaxed text-muted-foreground">{t(member.bio)}</p>
              <p className="mt-4 border-l-4 border-primary pl-3 text-sm leading-relaxed">
                {t(member.sharing)}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="about-unconventional-title"
        className="paper mt-10 border-2 border-foreground p-6 md:p-9"
      >
        <p className="label-mono">WHY UNCONVENTIONAL</p>
        <h2 id="about-unconventional-title" className="mt-3 font-cn-black text-2xl md:text-3xl">
          {t("aboutUnconventionalTitle")}
        </h2>
        <p className="mt-5 max-w-4xl whitespace-pre-line leading-relaxed">
          {t("aboutUnconventionalBody")}
        </p>
        <p className="mt-5 border-l-4 border-primary pl-4 font-cn-black leading-relaxed">
          {t("aboutUnconventionalEmphasis")}
        </p>
      </section>

      <section
        aria-labelledby="about-participate-title"
        className="mt-10 border-2 border-foreground p-6 md:p-9"
      >
        <p className="label-mono text-accent">COME AS YOU ARE</p>
        <h2 id="about-participate-title" className="mt-3 font-cn-black text-2xl md:text-3xl">
          {t("aboutParticipationTitle")}
        </h2>
        <p className="mt-4 max-w-4xl leading-relaxed text-muted-foreground">
          {t("aboutParticipationIntro")}
        </p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {participationPoints.map((point) => (
            <li key={point} className="border-l-4 border-primary pl-4 leading-relaxed">
              {t(point)}
            </li>
          ))}
        </ul>
        <div className="mt-7 flex flex-wrap gap-3">
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
          <Link
            to="/discussions"
            className="border-2 border-foreground px-4 py-3 font-bold hover:bg-secondary"
          >
            {t("navDiscussions")} ↗
          </Link>
          <Link
            to="/community-rules"
            className="border-2 border-foreground px-4 py-3 font-bold hover:bg-secondary"
          >
            {t("navRules")} ↗
          </Link>
        </div>
        <p className="mt-7 border-t-2 border-foreground pt-5 text-sm text-muted-foreground">
          {t("aboutCommunityNote")}
        </p>
      </section>
    </main>
  );
}
