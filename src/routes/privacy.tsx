import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "隐私说明 · AI非正常人类情报站" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { lang } = useI18n();
  const en = lang === "en";
  const [targetType, setTargetType] = useState<"post" | "comment">("post");
  const [targetId, setTargetId] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const requestDeletion = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const response = await fetch(
        `/api/community/reports/${targetType}/${encodeURIComponent(targetId.trim())}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reason: (en ? "Deletion request: " : "删除申请：") + reason.trim(),
          }),
        },
      );
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Request failed");
      setTargetId("");
      setReason("");
      setMessage(
        en ? "Your request has been sent to the moderation queue." : "删除申请已提交给管理员审核。",
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  };
  return (
    <main className="mx-auto min-h-[65vh] max-w-4xl px-4 py-12 md:py-16">
      <p className="label-mono text-accent">4SEAS / PRIVACY</p>
      <h1 className="mt-3 font-cn-black text-4xl md:text-5xl">
        {lang === "zh" ? "隐私说明" : "Privacy"}
      </h1>
      <div className="prose-zine mt-8">
        <h2>{lang === "zh" ? "Google 登录" : "Google sign-in"}</h2>
        <p>
          {lang === "zh"
            ? "浏览无需登录。发帖和回复必须使用 Google 账号登录；网站会在 Better Auth 账户记录中保存账号邮箱和会话信息，但不会公开你的邮箱。昵称可以自愿填写，公开页面显示昵称或通用访客名称。"
            : "Browsing does not require sign-in. Posting and replying require a Google account. Better Auth stores account email and session information, but your email is not shown publicly. Nicknames are optional; public pages show your nickname or a generic member label."}
        </p>
        <h2>{lang === "zh" ? "帖子与评论" : "Posts and comments"}</h2>
        <p>
          {lang === "zh"
            ? "发帖或回复后会立即公开显示。网站会保存帖子或评论、可选昵称、作者账号关联和发布时间。你必须使用发布内容时的同一个 Google 账号才能编辑或删除自己的内容。公开内容可被任何访客阅读和分享。"
            : "Posts and replies appear publicly as soon as they are submitted. The site stores the content, optional nickname, linked account owner, and submission time. You must use the same Google account to edit or delete your contributions. Public content can be read and shared by anyone."}
        </p>
        <h2>{lang === "zh" ? "请求信息" : "Request data"}</h2>
        <p>
          {lang === "zh"
            ? "社区发帖、回复和举报不使用 Turnstile，应用也不按来源或操作频率限制请求。Google 登录由 Google OAuth 提供；Google、Cloudflare 及托管服务可能按各自条款处理登录、网络请求和安全日志。"
            : "Community posts, replies, and reports do not use Turnstile, and the application does not rate-limit requests by source or action. Google OAuth provides sign-in. Google, Cloudflare, and the hosting provider may process authentication, network requests, and security logs under their respective terms."}
        </p>
        <h2>{lang === "zh" ? "删除与举报" : "Deletion and reports"}</h2>
        <p>
          {lang === "zh"
            ? "使用发布内容时的 Google 账号可编辑或删除自己的发言。访客无需登录即可举报内容，也可在下方提交删除申请。工作人员会处理举报，并可隐藏或删除违反社区规则的内容；帖子和回复不再经过发布前审核。"
            : "Use the Google account that created a contribution to edit or delete it. Visitors may report content without signing in or submit a deletion request below. Staff can handle reports and hide or remove content that violates community rules; posts and replies are no longer reviewed before publication."}
        </p>
        <form
          onSubmit={(event) => void requestDeletion(event)}
          className="paper my-6 grid gap-3 border-2 border-foreground p-4"
        >
          <label className="font-bold">
            {en ? "Content type" : "内容类型"}
            <select
              value={targetType}
              onChange={(event) => setTargetType(event.target.value as "post" | "comment")}
              className="ml-3 border border-foreground bg-transparent p-2"
            >
              <option value="post">{en ? "Post" : "帖子"}</option>
              <option value="comment">{en ? "Comment" : "评论"}</option>
            </select>
          </label>
          <label className="font-bold">
            {en ? "Content ID" : "内容 ID"}
            <input
              required
              maxLength={80}
              value={targetId}
              onChange={(event) => setTargetId(event.target.value)}
              className="mt-1 block w-full border-2 border-foreground bg-transparent p-2"
            />
          </label>
          <label className="font-bold">
            {en ? "Request details" : "申请说明"}
            <textarea
              required
              minLength={3}
              maxLength={900}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              className="mt-1 block w-full border-2 border-foreground bg-transparent p-2"
            />
          </label>
          {error && (
            <p role="alert" className="text-red-800">
              {error}
            </p>
          )}
          {message && <p role="status">{message}</p>}
          <button className="w-fit border-2 border-foreground px-4 py-2 font-bold">
            {en ? "Submit deletion request" : "提交删除申请"}
          </button>
        </form>
        <h2>{lang === "zh" ? "活动小调查" : "Event survey"}</h2>
        <p>
          {lang === "zh"
            ? "活动小调查由 Tally 托管。点击后会前往 Tally；回答由该服务处理，不会自动同步到本网站。请查看 Tally 展示的隐私说明后再决定是否填写。"
            : "The event survey is hosted by Tally. It opens on Tally; responses are handled by that service and are not automatically synced to this site. Review the privacy information shown there before choosing whether to respond."}
        </p>
        <a
          href="https://tally.so/r/PRdaO5"
          target="_blank"
          rel="noreferrer"
          className="font-bold underline"
        >
          {en ? "Open the optional Tally survey" : "打开自愿填写的 Tally 小调查"}
        </a>
      </div>
    </main>
  );
}
