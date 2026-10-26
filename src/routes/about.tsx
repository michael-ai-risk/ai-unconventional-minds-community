import { Link, createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "关于我们 · AI非正常人类情报站" }] }),
  component: AboutPage,
});

function AboutPage() {
  const { lang, t } = useI18n();
  const points =
    lang === "zh"
      ? [
          "你可以只是好奇，也可以已经在工作或生活里使用AI。",
          "不需要编程背景、商业资源或明确计划。",
          "欢迎提问、分享不同看法，也欢迎先听听别人怎么说。",
          "不必强制自我介绍、加入群组或交换联系方式。",
        ]
      : [
          "You can simply be curious, or already use AI in work or daily life.",
          "No coding background, business resources, or defined plan is needed.",
          "Questions, different views, and simply listening are all welcome.",
          "There is no forced introduction, group sign-up, or exchange of contact details.",
        ];
  return (
    <main className="mx-auto min-h-[65vh] max-w-7xl px-4 py-12 md:py-16">
      <p className="label-mono text-accent">4SEAS / ABOUT</p>
      <h1 className="mt-3 font-cn-black text-4xl md:text-6xl">{t("navAbout")}</h1>
      <section className="paper mt-8 border-2 border-foreground p-6 md:p-9">
        <p className="label-mono">WHY WE MEET</p>
        <h2 className="mt-4 max-w-4xl font-cn-black text-2xl leading-snug md:text-4xl">
          {lang === "zh"
            ? "AI变化很快，很多有意思的对话，最好和真实的人一起聊。"
            : "AI is changing quickly. Some of the best conversations happen with real people."}
        </h2>
        <p className="mt-5 max-w-3xl leading-relaxed">
          {lang === "zh"
            ? "AI非正常人类情报站是一处清迈的免费、开放、轻松交流空间。我们想把关注AI的人聚在一起，分享真实经历、提出问题、听到不同视角，也自然地认识新朋友。"
            : "AI Unconventional Minds Station is a free, open, relaxed place to meet in Chiang Mai. We bring together people curious about AI to share real experiences, ask questions, hear different views, and naturally meet new friends."}
        </p>
      </section>
      <section className="mt-10 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="font-cn-black text-2xl">
            {lang === "zh" ? "欢迎你来" : "You are welcome"}
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
            {lang === "zh" ? "怎样参与" : "How to join in"}
          </h2>
          <p className="mt-4 leading-relaxed">
            {lang === "zh"
              ? "可以先看看活动信息，时间与地点确认后会在这里公布。也可以自愿填写活动小调查。没有必须完成的步骤，来听、来问、来聊都可以。"
              : "Check the event page; dates and venues will be posted here once confirmed. You can also fill in the optional event survey. There are no required steps; come to listen, ask, or chat."}
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
        {lang === "zh"
          ? "社区活动以中文为主，并尽量提供自然的英文内容。交流时请相互尊重；完整规则见"
          : "Gatherings are mainly in Chinese, with natural English content where possible. Please treat one another with respect; see the full"}{" "}
        <Link to="/community-rules" className="underline underline-offset-4">
          {t("navRules")}
        </Link>
        .
      </p>
    </main>
  );
}
