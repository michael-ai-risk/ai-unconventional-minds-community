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
        <h2>{lang === "zh" ? "无需注册" : "No account required"}</h2>
        <p>
          {lang === "zh"
            ? "浏览、发帖、评论和举报都不需要会员注册、邮箱、密码、真实姓名或第三方账号。昵称为自愿填写。管理后台工作人员使用独立账号登录；该登录仅用于管理，不是社区参与条件。"
            : "Reading, posting, commenting, and reporting do not require a member account, email, password, real name, or third-party login. Nicknames are optional. Staff use a separate sign-in for moderation; it is not required to participate."}
        </p>
        <h2>{lang === "zh" ? "帖子与评论" : "Posts and comments"}</h2>
        <p>
          {lang === "zh"
            ? "提交内容时，网站会保存你自愿填写的昵称、帖子或评论内容、发布时间和审核状态。新访客提交的帖子和评论会先进入待审核状态，通过后才会公开。公开内容可被任何访客阅读和分享。网站不会公开管理凭证；发言时生成的私密编辑凭证保存在你的浏览器中，并只在发言成功时显示一次。持有凭证的人可以修改或删除对应内容，请妥善保存。"
            : "When you submit content, the site stores your optional nickname, post or comment, submission time, and moderation status. New visitor posts and comments are held for review before publication. Public content can be read and shared by anyone. The private edit key is never shown publicly; it is saved in this browser and shown once after posting. Anyone holding it can edit or delete that contribution, so keep it safe."}
        </p>
        <h2>{lang === "zh" ? "请求信息" : "Request data"}</h2>
        <p>
          {lang === "zh"
            ? "发帖、评论和举报不会要求 Turnstile 验证，应用也不会按来源或操作频率限制这些请求。Cloudflare 及托管服务可能按其服务条款处理网络请求和安全日志；新提交的内容仍会先进入审核队列。"
            : "Posting, commenting, and reporting do not require Turnstile verification, and the application does not rate-limit these requests by source or action. Cloudflare and the hosting provider may process network requests and security logs under their own terms. New submissions still enter the moderation queue before publication."}
        </p>
        <h2>{lang === "zh" ? "删除与举报" : "Deletion and reports"}</h2>
        <p>
          {lang === "zh"
            ? "如需修改或删除自己的发言，请使用发布时生成的私密管理凭证。凭证遗失时，可在下方填写内容 ID 并提交删除申请；管理员会在审核队列中处理。访客也可在内容旁提交举报，无需注册。管理员可审核、隐藏或删除不符合社区守则的内容。"
            : "Use the private edit key created when you posted to edit or delete your contribution. If you lose it, submit a deletion request below with the content ID; staff will review it in the moderation queue. Visitors can report content without an account. Moderators may review, hide, or remove content that violates the community guidelines."}
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
