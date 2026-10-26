import { createFileRoute, Link } from "@tanstack/react-router";
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
  is_author?: number;
};
type Comment = {
  id: string;
  body: string;
  author_name: string;
  created_at: string;
  parent_id: string | null;
  is_author?: number;
};

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
    headers: { ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers },
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
  const { data: session, isPending } = authClient.useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentDraft, setCommentDraft] = useState("");
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
  useEffect(() => {
    void load();
  }, [load]);
  const openPost = async (id: string) => {
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    setExpanded(id);
    setError("");
    try {
      const data = await api<{ comments?: Comment[] }>("posts/" + id);
      setComments((prev) => ({ ...prev, [id]: data.comments ?? [] }));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };
  const createPost = async (event: React.FormEvent) => {
    event.preventDefault();
    setPosting(true);
    setError("");
    try {
      await api("posts", {
        method: "POST",
        body: JSON.stringify({ title, body, category: category === "all" ? "general" : category }),
      });
      setTitle("");
      setBody("");
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
    try {
      await api("posts/" + postId + "/comments", {
        method: "POST",
        body: JSON.stringify({ body: commentDraft }),
      });
      setCommentDraft("");
      const data = await api<{ comments?: Comment[] }>("posts/" + postId);
      setComments((prev) => ({ ...prev, [postId]: data.comments ?? [] }));
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };
  const updatePost = async (event: React.FormEvent, postId: string) => {
    event.preventDefault();
    setError("");
    try {
      await api("posts/" + postId, {
        method: "PATCH",
        body: JSON.stringify({ title: editTitle, body: editBody }),
      });
      setEditId(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };
  const deletePost = async (postId: string) => {
    if (!window.confirm(en ? "Delete this post and its replies?" : "删除这条帖子及其回复？"))
      return;
    setError("");
    try {
      await api("posts/" + postId, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };
  const submitReport = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!reportTarget) return;
    const [type, targetId] = reportTarget.split(":");
    setError("");
    try {
      await api("reports/" + type + "/" + targetId, {
        method: "POST",
        body: JSON.stringify({ reason: reportReason }),
      });
      setReportTarget(null);
      setReportReason("");
      setError(en ? "Report sent to the moderation queue." : "举报已提交给管理人员。");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };
  const updateComment = async (event: React.FormEvent, commentId: string, postId: string) => {
    event.preventDefault();
    setError("");
    try {
      await api("comments/" + commentId, {
        method: "PATCH",
        body: JSON.stringify({ body: editCommentBody }),
      });
      setEditCommentId(null);
      const data = await api<{ comments?: Comment[] }>("posts/" + postId);
      setComments((prev) => ({ ...prev, [postId]: data.comments ?? [] }));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };
  const deleteComment = async (commentId: string, postId: string) => {
    if (!window.confirm(en ? "Delete your reply?" : "删除你的回复？")) return;
    setError("");
    try {
      await api("comments/" + commentId, { method: "DELETE" });
      const data = await api<{ comments?: Comment[] }>("posts/" + postId);
      setComments((prev) => ({ ...prev, [postId]: data.comments ?? [] }));
      await load();
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
          ? "Read openly, or join in when you feel like it. No introductions or professional bio required."
          : "公开浏览，也可以在想说的时候加入讨论。不需要自我介绍，也不用填写职业身份。"}
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
      {isPending ? (
        <p role="status" className="mt-6">
          {en ? "Checking sign-in…" : "正在确认登录状态…"}
        </p>
      ) : session?.user ? (
        <form onSubmit={createPost} className="paper mt-8 border-2 border-foreground p-5 md:p-7">
          <h2 className="font-cn-black text-2xl">{en ? "Start a conversation" : "发起一个话题"}</h2>
          <label className="mt-5 block font-bold">
            {en ? "Title" : "标题"}
            <input
              required
              minLength={3}
              maxLength={160}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 block w-full border-b-2 border-foreground bg-transparent px-1 py-2"
            />
          </label>
          <label className="mt-4 block font-bold">
            {en ? "Your thoughts" : "想聊什么"}
            <textarea
              required
              maxLength={8000}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              className="mt-2 block w-full border-2 border-foreground bg-transparent p-3"
            />
          </label>
          <div className="mt-4 flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">{body.length}/8000</span>
            <button
              disabled={posting}
              className="bg-primary px-5 py-3 font-bold text-primary-foreground disabled:opacity-50"
            >
              {posting ? (en ? "Posting…" : "提交中…") : en ? "Post" : "发布讨论"}
            </button>
          </div>
        </form>
      ) : (
        <aside className="paper mt-8 flex flex-wrap items-center justify-between gap-4 border-2 border-foreground p-5">
          <p>
            {en
              ? "You can read without an account. Sign in only when you want to post or reply."
              : "无需账号即可浏览。想发帖或回复时再登录即可。"}
          </p>
          <Link to="/join" className="bg-primary px-5 py-3 font-bold text-primary-foreground">
            {en ? "Join / Sign in" : "加入 / 登录"} ↗
          </Link>
        </aside>
      )}
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
                  {categories.find((c) => c.slug === post.category_slug)?.[
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
                <form onSubmit={(e) => void updatePost(e, post.id)} className="mt-4 grid gap-3">
                  <input
                    required
                    minLength={3}
                    maxLength={160}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="border-2 border-paper-foreground bg-transparent p-2 font-bold"
                  />
                  <textarea
                    required
                    maxLength={8000}
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
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
                {post.author_name} · {post.comment_count} {en ? "replies" : "条回复"}
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
                {session?.user && post.is_author === 1 && (
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
                {session?.user && (
                  <button
                    onClick={() => setReportTarget("post:" + post.id + ":" + post.id)}
                    className="border-b-2 border-foreground pb-1"
                  >
                    {en ? "Report" : "举报"}
                  </button>
                )}
              </div>
              {expanded === post.id && (
                <div className="mt-5 border-t border-paper-foreground/30 pt-4">
                  <div className="space-y-3">
                    {(comments[post.id] ?? []).map((comment) => (
                      <div key={comment.id} className="border-l-2 border-primary pl-3">
                        {editCommentId === comment.id ? (
                          <form
                            onSubmit={(e) => void updateComment(e, comment.id, post.id)}
                            className="flex flex-col gap-2"
                          >
                            <textarea
                              required
                              maxLength={4000}
                              value={editCommentBody}
                              onChange={(e) => setEditCommentBody(e.target.value)}
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
                          {comment.author_name}
                          {comment.parent_id ? (en ? " · reply" : " · 回复") : ""}{" "}
                          {session?.user && (
                            <button
                              onClick={() =>
                                setReportTarget("comment:" + comment.id + ":" + post.id)
                              }
                              className="underline"
                            >
                              {en ? "Report" : "举报"}
                            </button>
                          )}{" "}
                          {session?.user &&
                            comment.is_author === 1 &&
                            editCommentId !== comment.id && (
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
                  {session?.user ? (
                    <form
                      onSubmit={(e) => void createComment(e, post.id)}
                      className="mt-4 flex flex-col gap-2 sm:flex-row"
                    >
                      <input
                        required
                        maxLength={4000}
                        value={commentDraft}
                        onChange={(e) => setCommentDraft(e.target.value)}
                        placeholder={en ? "Write a reply" : "写下回复"}
                        className="min-w-0 flex-1 border-2 border-paper-foreground bg-transparent px-3 py-2"
                      />
                      <button className="bg-primary px-4 py-2 font-bold text-primary-foreground">
                        {en ? "Reply" : "回复"}
                      </button>
                    </form>
                  ) : (
                    <Link
                      to="/join"
                      className="mt-4 inline-block border-b-2 border-foreground pb-1 font-bold"
                    >
                      {en ? "Sign in to reply" : "登录后回复"} ↗
                    </Link>
                  )}
                </div>
              )}
              {reportTarget && reportTarget.endsWith(":" + post.id) && (
                <form
                  onSubmit={(e) => void submitReport(e)}
                  className="mt-4 flex flex-col gap-2 sm:flex-row"
                >
                  <input
                    required
                    minLength={3}
                    maxLength={1000}
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder={en ? "Why are you reporting this?" : "请简要说明举报原因"}
                    className="min-w-0 flex-1 border-2 border-paper-foreground bg-transparent px-3 py-2"
                  />
                  <button className="border-2 border-paper-foreground px-4 py-2 font-bold">
                    {en ? "Send report" : "提交举报"}
                  </button>
                  <button type="button" onClick={() => setReportTarget(null)} className="px-3 py-2">
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
