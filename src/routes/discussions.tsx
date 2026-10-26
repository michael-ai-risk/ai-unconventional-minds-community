import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/discussions")({
  head: () => ({ meta: [{ title: "社区讨论 · AI非正常人类情报站" }] }),
  component: DiscussionsPage,
});

function DiscussionsPage() {
  const { lang, t } = useI18n();
  const labels =
    lang === "zh"
      ? ["综合", "学习AI", "工具与流程", "职业探索", "清迈生活"]
      : ["General", "Learning AI", "Tools & workflows", "Career exploration", "Chiang Mai life"];
  return (
    <main className="mx-auto min-h-[65vh] max-w-7xl px-4 py-12 md:py-16">
      <p className="label-mono text-accent">4SEAS / DISCUSSIONS</p>
      <h1 className="mt-3 font-cn-black text-4xl md:text-6xl">{t("navDiscussions")}</h1>
      <p className="mt-5 max-w-3xl text-lg text-muted-foreground">
        {lang === "zh"
          ? "讨论区设计为公开浏览、按主题交流。任何人都可以阅读；发帖与评论将在可靠的账号和持久化服务接好后开放。"
          : "The discussion space is intended for public reading and topic-based conversation. Anyone can read; posting and comments will open once secure accounts and persistent storage are in place."}
      </p>
      <div className="mt-8 flex flex-wrap gap-2">
        {labels.map((label) => (
          <span key={label} className="border border-foreground px-3 py-2 label-mono">
            {label}
          </span>
        ))}
      </div>
      <section role="status" className="paper mt-8 border-2 border-foreground p-6 md:p-9">
        <p className="label-mono text-accent">{lang === "zh" ? "功能状态" : "Feature status"}</p>
        <h2 className="mt-3 font-cn-black text-2xl">
          {lang === "zh" ? "持久化讨论尚未启用" : "Persistent discussions are not enabled yet"}
        </h2>
        <p className="mt-4 max-w-3xl">{t("noDiscussions")}</p>
        <p className="mt-4 text-sm text-paper-muted">
          {lang === "zh"
            ? "因此当前没有发帖、评论、点赞或举报表单，也没有登录或临时浏览器存储。"
            : "There are no post, comment, upvote, or report forms, and no sign-in or temporary browser storage is used."}
        </p>
      </section>
    </main>
  );
}
