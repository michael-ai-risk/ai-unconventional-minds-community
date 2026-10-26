import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
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
  is_owner?: boolean;
};
type Comment = {
  id: string;
  body: string;
  author_name: string;
  created_at: string;
  parent_id: string | null;
  status?: string;
  is_owner?: boolean;
};
type ApiResult = Record<string, unknown> & { id?: string; status?: string };

export const Route = createFileRoute("/discussions")({
  head: () => ({ meta: [{ title: "社区讨论 · AI非正常人类情报站" }] }),
  component: DiscussionsPage,
});

async function api<T extends Record<string, unknown> = Record<string, unknown>>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch("/api/community/" + path, {
    credentials: "include",
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
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

function DiscussionsPage() {
  const { lang } = useI18n();
  const en = lang === "en";
  const { data: session, isPending: sessionPending } = authClient.useSession();
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
  const [authBusy, setAuthBusy] = useState(false);
  const [authStatusLoaded, setAuthStatusLoaded] = useState(false);
  const [googleConfigured, setGoogleConfigured] = useState(false);
  const [canPost, setCanPost] = useState(false);
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

  useEffect(() => void load(), [load]);

  useEffect(() => {
    let active = true;
    void api<{ googleConfigured?: boolean; canPost?: boolean }>("session")
      .then((result) => {
        if (!active) return;
        setGoogleConfigured(result.googleConfigured === true);
        setCanPost(result.canPost === true);
        setAuthStatusLoaded(true);
      })
      .catch((e) => {
        if (active) {
          setError(e instanceof Error ? e.message : String(e));
          setAuthStatusLoaded(true);
        }
      });
    return () => {
      active = false;
    };
  }, [session?.user?.id]);

  const signInWithGoogle = async () => {
    setError("");
    setAuthBusy(true);
    try {
      const result = await authClient.signIn.social({ provider: "google", callbackURL: "/discussions" });
      if (result.error) throw new Error(result.error.message || (en ? "Google sign-in failed" : "Google 登录失败"));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setAuthBusy(false);
    }
  };

  const signOut = async () => {
    setError("");
    const result = await authClient.signOut();
    if (result.error) setError(result.error.message || (en ? "Sign-out failed" : "退出登录失败"));
    setCanPost(false);
  };

  const openPost = async (id: string) => {
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    setExpanded(id);
    setError("");
    try {
      const result = await api<{ post?: Post; comments?: Comment[] }>("posts/" + id);
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
      await api<ApiResult>("posts", {
        method: "POST",
        body: JSON.stringify({
          title,
          body,
          category: category === "all" ? "general" : category,
          displayName,
        }),
      });
      setTitle("");
      setBody("");
      setMessage(en ? "Your post is now public." : "帖子已发布并公开显示。");
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
      await api<ApiResult>("posts/" + postId + "/comments", {
        method: "POST",
        body: JSON.stringify({
          body: commentDraft,
          parentId: replyTo,
          displayName,
        }),
      });
      setCommentDraft("");
      setReplyTo(null);
      setMessage(en ? "Your reply is now public." : "回复已发布并公开显示。");
      const resultAfter = await api<{ comments?: Comment[] }>("posts/" + postId);
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
      await api("posts/" + postId, { method: "DELETE" });
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
      );
      setEditCommentId(null);
      const result = await api<{ comments?: Comment[] }>(
        "posts/" + postId,
      );
      setComments((previous) => ({ ...previous, [postId]: result.comments ?? [] }));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };
  const deleteComment = async (commentId: string, postId: string) => {
    if (!window.confirm(en ? "Delete your reply?" : "删除这条回复？")) return;
    try {
      await api("comments/" + commentId, { method: "DELETE" });
      const result = await api<{ comments?: Comment[] }>("posts/" + postId);
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
          ? "Browse freely. Sign in with Google to post or reply; contributions appear immediately."
          : "浏览无需登录。使用 Google 登录后即可发帖和回复，内容会立即公开显示。"}
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
      <div className="paper mt-6 flex flex-wrap items-center justify-between gap-4 border-2 border-foreground p-4">
        <div>
          <p className="font-bold">
            {sessionPending || !authStatusLoaded
              ? en
                ? "Checking Google sign-in…"
                : "正在确认 Google 登录状态…"
              : canPost
                ? en
                  ? "Signed in with Google. You can post and reply."
                  : "已使用 Google 登录，可以发帖和回复。"
                : googleConfigured
                  ? en
                    ? "Sign in with Google to post and reply."
                    : "发帖和回复需要先使用 Google 登录。"
                  : en
                    ? "Google sign-in is not configured for this preview yet."
                    : "此预览环境尚未配置 Google 登录。"}
          </p>
          {canPost && session?.user?.email && (
            <p className="mt-1 text-sm text-muted-foreground">{session.user.email}</p>
          )}
        </div>
        {canPost ? (
          <button
            type="button"
            onClick={() => void signOut()}
            className="border-2 border-foreground px-4 py-2 font-bold"
          >
            {en ? "Sign out" : "退出登录"}
          </button>
        ) : googleConfigured ? (
          <button
            type="button"
            disabled={authBusy || sessionPending}
            onClick={() => void signInWithGoogle()}
            className="bg-primary px-4 py-2 font-bold text-primary-foreground disabled:opacity-50"
          >
            {authBusy
              ? en
                ? "Opening Google…"
                : "正在打开 Google…"
              : en
                ? "Sign in with Google"
                : "使用 Google 登录"}
          </button>
        ) : null}
      </div>
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
          <button
            disabled={posting || !canPost}
            className="bg-primary px-5 py-3 font-bold text-primary-foreground disabled:opacity-50"
          >
            {posting ? (en ? "Posting…" : "提交中…") : en ? "Publish post" : "发布帖子"}
          </button>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {en
            ? "Google sign-in is required to publish. Your email is not shown publicly."
            : "发布需要 Google 登录；你的邮箱不会公开显示。"}
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
                {post.is_owner && (
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
                          {comment.is_owner && editCommentId !== comment.id && (
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
                      <button
                        disabled={!canPost}
                        className="bg-primary px-4 py-2 font-bold text-primary-foreground disabled:opacity-50"
                      >
                        {en ? "Publish reply" : "发布回复"}
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
