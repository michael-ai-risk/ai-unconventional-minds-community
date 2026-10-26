import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "隐私说明 · AI非正常人类情报站" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { lang } = useI18n();
  return (
    <main className="mx-auto min-h-[65vh] max-w-4xl px-4 py-12 md:py-16">
      <p className="label-mono text-accent">4SEAS / PRIVACY</p>
      <h1 className="mt-3 font-cn-black text-4xl md:text-5xl">
        {lang === "zh" ? "隐私说明" : "Privacy"}
      </h1>
      <p className="mt-5 text-lg text-muted-foreground">
        {lang === "zh"
          ? "当前网站的信息页面不会提供账号注册、发帖或评论。"
          : "The current informational site does not provide account registration, posting, or comments."}
      </p>
      <div className="prose-zine mt-8">
        <h2>{lang === "zh" ? "活动小调查" : "Event survey"}</h2>
        <p>
          {lang === "zh"
            ? "活动小调查由 Tally 托管。点击后会前往 Tally；回答由该服务处理，不会自动同步到本网站。请查看 Tally 展示的隐私说明后再决定是否填写。"
            : "The event survey is hosted by Tally. It opens on Tally; responses are handled by that service and are not automatically synced to this site. Review the privacy information shown there before choosing whether to respond."}
        </p>
        <h2>{lang === "zh" ? "网站数据" : "Website data"}</h2>
        <p>
          {lang === "zh"
            ? "目前没有连接讨论数据库，也不使用浏览器临时存储来模拟帖子。网站仍可能由托管服务处理常规请求日志。"
            : "No discussion database is connected, and browser storage is not used to simulate posts. The hosting provider may still process ordinary request logs."}
        </p>
        <h2>{lang === "zh" ? "之后的更新" : "Future changes"}</h2>
        <p>
          {lang === "zh"
            ? "如果以后加入账号或讨论功能，我们会在功能开放前更新这页，说明收集什么信息、用途、保留方式和用户可用的控制选项。"
            : "If accounts or discussions are added later, this page will be updated before launch to explain what information is collected, why, how long it is kept, and what controls users have."}
        </p>
      </div>
    </main>
  );
}
