import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { useI18n } from "@/lib/i18n";

type Category = { slug: string; title_zh: string; title_en: string };
type Post = {
  id: string;
  category_slug: string;
  title: string;
  body: string;
  created_at: string;
  author_name: string;
  comment_count: number;
  status?: string;
};
type Comment = {
  id: string;
  body: string;
  author_name: string;
  created_at: string;
  parent_id: string | null;
  status?: string;
};
type ContentKeys = Record<string, string>;
type ApiResult = Record<string, unknown> & { id?: string; editToken?: string; status?: string };

const contentKeysStorage = "ai-station-content-keys";
const siteKey = import.meta.env["VITE_TURNSTILE_SITE_KEY"] || "";

export const Route = createFileRoute("/discussions")({
  head: () => ({ meta: [{ title: "社区讨论 · AI非正常人类情报站" }] }),
  component: DiscussionsPage,
});

async function api<T extends Record<string, unknown> = Record<string, unknown>>(
  path: string,
  init?: RequestInit,
  token?: string,
): Promise<T> {
  const response = await fetch("/api/community/" + path, {
    credentials: "omit",
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { "X-Content-Token": token } : {}),
      ...init?.headers,
    },
  });
  const raw: unknown = await response.json().catch(() => ({}));
  const data = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  if (!response.ok)
    throw new Error(
      typeof data["error"] === "string"
        ? data["error"]
        : "Request failed (" + response.status + ")",
    );
  return data as T;
}

function readContentKeys(): ContentKeys {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(contentKeysStorage) || "{}");
    return value && typeof value === "object" ? (value as ContentKeys) : {};
  } catch {
    return {};
  }
}

function DiscussionsPage() {
  const { lang } = useI18n();
  const en = lang === "en";
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [posting, setPosting] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentDraft, setCommentDraft] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [reportTarget, setReportTarget] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [editCommentId, setEditCommentId] = useState<string | null>(null);
  const [editCommentBody, setEditCommentBody] = useState("");
  const [keys, setKeys] = useState<ContentKeys>({});
  const [lastKey, setLastKey] = useState("");
  const [lastContentId, setLastContentId] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [captchaCycle, setCaptchaCycle] = useState(0);
  const [commentTurnstileToken, setCommentTurnstileToken] = useState("");
  const [commentCaptchaCycle, setCommentCaptchaCycle] = useState(0);

  const persistKeys = (next: ContentKeys) => {
    try {
      localStorage.setItem(contentKeysStorage, JSON.stringify(next));
      return true;
    } catch {
      return false;
    }
  };
  const saveKey = (kind: "post" | "comment", id: string, token: string) => {
    const next = { ...keys, [`${kind}:${id}`]: token };
    setKeys(next);
    if (!persistKeys(next)) {
      setMessage(
        en
          ? "Browser storage is unavailable. Save the private edit key shown below; it will not survive closing this page."
          : "浏览器存储不可用。请保存下方私密管理凭证；关闭页面后它不会保留。",
      );
    }
    setLastKey(token);
    setLastContentId(kind + ":" + id);
  };
  const tokenFor = (kind: "post" | "comment", id: string) => keys[`${kind}:${id}`];
  const consumeTurnstile = () => {
    setTurnstileToken("");
    setCaptchaCycle((value) => value + 1);
  };
  const consumeCommentTurnstile = () => {
    setCommentTurnstileToken("");
    setCommentCaptchaCycle((value) => value + 1);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (category !== "all") params.set("category", category);
      if (query.trim()) params.set("q", query.trim());
      const [postResult, categoryResult] = await Promise.all([
        api<{ posts?: Post[] }>("posts?" + params),
        api<{ categories?: Category[] }>("categories"),
      ]);
      setPosts(postResult.posts ?? []);
      setCategories(categoryResult.categories ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [category, query]);

  useEffect(() => setKeys(readContentKeys()), []);
  useEffect(() => void load(), [load]);

  const openPost = async (id: string) => {
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    setExpanded(id);
    setError("");
    try {
      const result = await api<{ post?: Post; comments?: Comment[] }>(
        "posts/" + id,
        undefined,
        tokenFor("post", id),
      );
      if (result.post?.status === "pending")
        setMessage(
          en
            ? "Your post is awaiting review."
            : "你的讨论正在等待审核。帖子内容只对持有管理凭证的你可见。 ",
        );
      setComments((previous) => ({ ...previous, [id]: result.comments ?? [] }));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const createPost = async (event: React.FormEvent) => {
    event.preventDefault();
    setPosting(true);
    setError("");
    setMessage("");
    try {
      const result = await api<ApiResult>("posts", {
        method: "POST",
        body: JSON.stringify({
          title,
          body,
          category: category === "all" ? "general" : category,
          displayName,
          turnstileToken,
        }),
      });
      if (result.id && result.editToken) saveKey("post", result.id, result.editToken);
      setTitle("");
      setBody("");
      setMessage(
        en
          ? "Submitted for review. Your private edit key is shown below."
          : "已提交审核。你的私密管理凭证显示在下方。",
      );
      consumeTurnstile();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setPosting(false);
    }
  };

  const createComment = async (event: React.FormEvent, postId: string) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const result = await api<ApiResult>("posts/" + postId + "/comments", {
        method: "POST",
        body: JSON.stringify({
          body: commentDraft,
          parentId: replyTo,
          displayName,
          turnstileToken: commentTurnstileToken,
        }),
      });
      if (result.id && result.editToken) saveKey("comment", result.id, result.editToken);
      setCommentDraft("");
      setReplyTo(null);
      setMessage(en ? "Reply submitted for review." : "回复已提交审核。");
      consumeCommentTurnstile();
      const resultAfter = await api<{ comments?: Comment[] }>(
        "posts/" + postId,
        undefined,
        result.editToken,
      );
      setComments((previous) => ({ ...previous, [postId]: resultAfter.comments ?? [] }));
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const updatePost = async (event: React.FormEvent, postId: string) => {
    event.preventDefault();
    setError("");
    try {
      await api(
        "posts/" + postId,
        {
          method: "PATCH",
          body: JSON.stringify({ title: editTitle, body: editBody }),
        },
        tokenFor("post", postId),
      );
      setEditId(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };
  const deletePost = async (postId: string) => {
    if (!window.confirm(en ? "Delete this post and its replies?" : "删除这条帖子及其回复？"))
      return;
    try {
      await api("posts/" + postId, { method: "DELETE" }, tokenFor("post", postId));
      const next = { ...keys };
      delete next[`post:${postId}`];
      setKeys(next);
      persistKeys(next);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };
  const updateComment = async (event: React.FormEvent, commentId: string, postId: string) => {
    event.preventDefault();
    try {
      await api(
        "comments/" + commentId,
        {
          method: "PATCH",
          body: JSON.stringify({ body: editCommentBody }),
        },
        tokenFor("comment", commentId),
      );
      setEditCommentId(null);
      const result = await api<{ comments?: Comment[] }>(
        "posts/" + postId,
        undefined,
        tokenFor("post", postId),
      );
      setComments((previous) => ({ ...previous, [postId]: result.comments ?? [] }));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };
  const deleteComment = async (commentId: string, postId: string) => {
    if (!window.confirm(en ? "Delete your reply?" : "删除这条回复？")) return;
    try {
      await api("comments/" + commentId, { method: "DELETE" }, tokenFor("comment", commentId));
      const next = { ...keys };
      delete next[`comment:${commentId}`];
      setKeys(next);
      persistKeys(next);
      const result = await api<{ comments?: Comment[] }>(
        "posts/" + postId,
        undefined,
        tokenFor("post", postId),
      );
      setComments((previous) => ({ ...previous, [postId]: result.comments ?? [] }));
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };
  const submitReport = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!reportTarget) return;
    const [type, targetId] = reportTarget.split(":");
    try {
      await api("reports/" + type + "/" + targetId, {
        method: "POST",
        body: JSON.stringify({ reason: reportReason }),
      });
      setReportTarget(null);
      setReportReason("");
      setMessage(en ? "Report sent to the moderation queue." : "举报已提交给管理人员。");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <main className="mx-auto min-h-[65vh] max-w-7xl px-4 py-12 md:py-16">
      <p className="label-mono text-accent">4SEAS / DISCUSSIONS</p>
      <h1 className="mt-3 font-cn-black text-4xl md:text-6xl">{en ? "Discussions" : "社区讨论"}</h1>
      <p className="mt-5 max-w-3xl text-lg text-muted-foreground">
        {en
          ? "Read and join in without an account. A nickname is optional; new contributions are reviewed before they appear publicly."
          : "无需注册即可浏览、发帖和回复。昵称自愿填写；新内容会先审核，再公开显示。"}
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        <input
          aria-label={en ? "Search discussions" : "搜索讨论"}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={en ? "Search discussions" : "搜索帖子"}
          className="min-w-48 flex-1 border-2 border-foreground bg-background px-3 py-2"
        />
        <select
          aria-label={en ? "Category" : "分类"}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border-2 border-foreground bg-background px-3 py-2"
        >
          <option value="all">{en ? "All topics" : "全部分类"}</option>
          {categories.map((item) => (
            <option key={item.slug} value={item.slug}>
              {en ? item.title_en : item.title_zh}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p role="alert" className="mt-4 border-2 border-red-700 p-3 text-red-800">
          {en ? "Service message: " + error : "服务提示：" + error}
        </p>
      )}
      {message && (
        <p role="status" className="mt-4 border-2 border-primary p-3">
          {message}
        </p>
      )}
      {lastKey && (
        <div className="paper mt-4 border-2 border-foreground p-4" role="status">
          <p className="font-bold">
            {en ? "Private edit key — save it somewhere safe" : "私密管理凭证——请妥善保存"}
          </p>
          <p className="mt-1 font-mono text-xs">
            {en ? "Reference: " : "内容编号："}
            {lastContentId}
          </p>
          <p className="mt-1 text-sm">
            {en
              ? "It is stored in this browser for convenience. Anyone with this key can edit or delete this contribution."
              : "为方便起见，本浏览器也会保存一份。持有此凭证的人可以修改或删除对应内容。"}
          </p>
          <div className="mt-2 flex gap-2">
            <input
              readOnly
              value={lastKey}
              aria-label={en ? "Private edit key" : "私密管理凭证"}
              className="min-w-0 flex-1 border border-foreground bg-transparent p-2 font-mono text-xs"
            />
            <button
              type="button"
              onClick={() => void navigator.clipboard?.writeText(lastKey)}
              className="border-2 border-foreground px-3 py-2 font-bold"
            >
              {en ? "Copy" : "复制"}
            </button>
            <button
              type="button"
              onClick={() => setLastKey("")}
              aria-label={en ? "Hide private key" : "隐藏管理凭证"}
              className="px-2"
            >
              ×
            </button>
          </div>
        </div>
      )}
      <form
        onSubmit={(event) => void createPost(event)}
        className="paper mt-8 border-2 border-foreground p-5 md:p-7"
      >
        <h2 className="font-cn-black text-2xl">{en ? "Start a conversation" : "发起一个话题"}</h2>
        <label className="mt-5 block font-bold">
          {en ? "Nickname (optional)" : "昵称（自愿填写）"}
          <input
            maxLength={60}
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder={en ? "Guest" : "访客"}
            className="mt-2 block w-full border-b-2 border-foreground bg-transparent px-1 py-2"
          />
        </label>
        <label className="mt-4 block font-bold">
          {en ? "Title" : "标题"}
          <input
            required
            minLength={3}
            maxLength={160}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-2 block w-full border-b-2 border-foreground bg-transparent px-1 py-2"
          />
        </label>
        <label className="mt-4 block font-bold">
          {en ? "Your thoughts" : "想聊什么"}
          <textarea
            required
            maxLength={8000}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={4}
            className="mt-2 block w-full border-2 border-foreground bg-transparent p-3"
          />
        </label>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">{body.length}/8000</span>
          {siteKey ? (
            <TurnstileWidget key={captchaCycle} siteKey={siteKey} onToken={setTurnstileToken} />
          ) : (
            <span className="text-sm text-muted-foreground">
              {en
                ? "Posting is temporarily unavailable: anti-spam verification is not configured."
                : "发帖暂不可用：网站尚未配置反垃圾验证。"}
            </span>
          )}
          <button
            disabled={posting || !siteKey || !turnstileToken}
            className="bg-primary px-5 py-3 font-bold text-primary-foreground disabled:opacity-50"
          >
            {posting ? (en ? "Posting…" : "提交中…") : en ? "Post for review" : "提交审核"}
          </button>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {en
            ? "No email, password, or real name. Keep your private edit key if you may want to change your post."
            : "不需要邮箱、密码或真实姓名。如果以后想修改内容，请保存私密管理凭证。"}
        </p>
      </form>
      <section className="mt-10 space-y-5" aria-live="polite">
        {loading ? (
          <p role="status">{en ? "Loading discussions…" : "正在读取讨论…"}</p>
        ) : posts.length === 0 ? (
          <div className="border-2 border-foreground p-6">
            <h2 className="font-cn-black text-xl">{en ? "No conversations yet" : "还没有讨论"}</h2>
            <p className="mt-2 text-muted-foreground">
              {en ? "Be the first to start a conversation." : "你可以开启第一个话题。"}
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="paper border-2 border-foreground p-5 md:p-7">
              <div className="flex flex-wrap items-center justify-between gap-2 label-mono text-paper-muted">
                <span>
                  {categories.find((item) => item.slug === post.category_slug)?.[
                    en ? "title_en" : "title_zh"
                  ] ?? post.category_slug}
                </span>
                <time>
                  {new Date(
                    post.created_at + (post.created_at.endsWith("Z") ? "" : "Z"),
                  ).toLocaleDateString(en ? "en-GB" : "zh-CN")}
                </time>
              </div>
              {editId === post.id ? (
                <form
                  onSubmit={(event) => void updatePost(event, post.id)}
                  className="mt-4 grid gap-3"
                >
                  <input
                    required
                    minLength={3}
                    maxLength={160}
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                    className="border-2 border-paper-foreground bg-transparent p-2 font-bold"
                  />
                  <textarea
                    required
                    maxLength={8000}
                    value={editBody}
                    onChange={(event) => setEditBody(event.target.value)}
                    rows={4}
                    className="border-2 border-paper-foreground bg-transparent p-2"
                  />
                  <div className="flex gap-3">
                    <button className="bg-primary px-4 py-2 font-bold text-primary-foreground">
                      {en ? "Save" : "保存修改"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditId(null)}
                      className="border border-foreground px-4 py-2"
                    >
                      {en ? "Cancel" : "取消"}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h2 className="mt-3 font-cn-black text-2xl md:text-3xl">{post.title}</h2>
                  <p className="mt-3 whitespace-pre-wrap leading-relaxed">{post.body}</p>
                </>
              )}
              <p className="mt-4 text-sm text-paper-muted">
                {post.author_name || (en ? "Guest" : "访客")} · {post.comment_count}{" "}
                {en ? "replies" : "条回复"}
              </p>
              <div className="mt-4 flex flex-wrap gap-4">
                <button
                  className="border-b-2 border-foreground pb-1 font-bold"
                  onClick={() => void openPost(post.id)}
                >
                  {expanded === post.id
                    ? en
                      ? "Hide replies"
                      : "收起回复"
                    : en
                      ? "Read / reply"
                      : "查看 / 回复"}{" "}
                  ↗
                </button>
                {tokenFor("post", post.id) && (
                  <>
                    <button
                      onClick={() => {
                        setEditId(post.id);
                        setEditTitle(post.title);
                        setEditBody(post.body);
                      }}
                      className="border-b-2 border-foreground pb-1"
                    >
                      {en ? "Edit" : "编辑"}
                    </button>
                    <button
                      onClick={() => void deletePost(post.id)}
                      className="border-b-2 border-foreground pb-1"
                    >
                      {en ? "Delete" : "删除"}
                    </button>
                  </>
                )}
                <button
                  onClick={() => setReportTarget(`post:${post.id}`)}
                  className="border-b-2 border-foreground pb-1"
                >
                  {en ? "Report" : "举报"}
                </button>
              </div>
              {expanded === post.id && (
                <div className="mt-5 border-t border-paper-foreground/30 pt-4">
                  <div className="space-y-3">
                    {(comments[post.id] ?? []).map((comment) => (
                      <div key={comment.id} className="border-l-2 border-primary pl-3">
                        {editCommentId === comment.id ? (
                          <form
                            onSubmit={(event) => void updateComment(event, comment.id, post.id)}
                            className="flex flex-col gap-2"
                          >
                            <textarea
                              required
                              maxLength={4000}
                              value={editCommentBody}
                              onChange={(event) => setEditCommentBody(event.target.value)}
                              rows={3}
                              className="border-2 border-paper-foreground bg-transparent p-2"
                            />
                            <div className="flex gap-3">
                              <button className="font-bold underline">
                                {en ? "Save" : "保存"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditCommentId(null)}
                                className="underline"
                              >
                                {en ? "Cancel" : "取消"}
                              </button>
                            </div>
                          </form>
                        ) : (
                          <p className="whitespace-pre-wrap">{comment.body}</p>
                        )}
                        <p className="mt-1 text-xs text-paper-muted">
                          {comment.author_name || (en ? "Guest" : "访客")}{" "}
                          {comment.parent_id ? (en ? " · reply" : " · 回复") : ""} ·{" "}
                          <button
                            onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                            className="underline"
                          >
                            {en ? "Reply" : "回复"}
                          </button>{" "}
                          ·{" "}
                          <button
                            onClick={() => setReportTarget(`comment:${comment.id}`)}
                            className="underline"
                          >
                            {en ? "Report" : "举报"}
                          </button>{" "}
                          {tokenFor("comment", comment.id) && editCommentId !== comment.id && (
                            <>
                              <button
                                onClick={() => {
                                  setEditCommentId(comment.id);
                                  setEditCommentBody(comment.body);
                                }}
                                className="underline"
                              >
                                {en ? "Edit" : "编辑"}
                              </button>
                              <button
                                onClick={() => void deleteComment(comment.id, post.id)}
                                className="underline"
                              >
                                {en ? "Delete" : "删除"}
                              </button>
                            </>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                  <form
                    onSubmit={(event) => void createComment(event, post.id)}
                    className="mt-4 flex flex-col gap-2"
                  >
                    {replyTo && (
                      <p className="text-sm">
                        {en ? "Replying to a comment" : "正在回复一条评论"}{" "}
                        <button
                          type="button"
                          onClick={() => setReplyTo(null)}
                          className="underline"
                        >
                          {en ? "Cancel" : "取消"}
                        </button>
                      </p>
                    )}
                    <textarea
                      required
                      maxLength={4000}
                      value={commentDraft}
                      onChange={(event) => setCommentDraft(event.target.value)}
                      rows={3}
                      placeholder={en ? "Write a reply" : "写下回复"}
                      className="min-w-0 border-2 border-paper-foreground bg-transparent px-3 py-2"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs">{commentDraft.length}/4000</span>
                      {siteKey ? (
                        <TurnstileWidget
                          key={`${post.id}-${commentCaptchaCycle}`}
                          siteKey={siteKey}
                          onToken={setCommentTurnstileToken}
                        />
                      ) : (
                        <span className="text-xs">
                          {en ? "Anti-spam verification unavailable." : "反垃圾验证暂不可用。"}
                        </span>
                      )}
                      <button
                        disabled={!siteKey || !commentTurnstileToken}
                        className="bg-primary px-4 py-2 font-bold text-primary-foreground disabled:opacity-50"
                      >
                        {en ? "Submit reply for review" : "提交回复审核"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
              {reportTarget &&
                (reportTarget === `post:${post.id}` ||
                  (comments[post.id] ?? []).some(
                    (comment) => reportTarget === `comment:${comment.id}`,
                  )) && (
                  <form
                    onSubmit={(event) => void submitReport(event)}
                    className="mt-4 flex flex-col gap-2 sm:flex-row"
                  >
                    <input
                      required
                      minLength={3}
                      maxLength={1000}
                      value={reportReason}
                      onChange={(event) => setReportReason(event.target.value)}
                      placeholder={en ? "Why are you reporting this?" : "请简要说明举报原因"}
                      className="min-w-0 flex-1 border-2 border-paper-foreground bg-transparent px-3 py-2"
                    />
                    <button className="border-2 border-paper-foreground px-4 py-2 font-bold">
                      {en ? "Send report" : "提交举报"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportTarget(null)}
                      className="px-3 py-2"
                    >
                      {en ? "Cancel" : "取消"}
                    </button>
                  </form>
                )}
            </article>
          ))
        )}
      </section>
    </main>
  );
}
