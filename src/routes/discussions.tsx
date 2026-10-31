import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useI18n } from "@/lib/i18n";

type Category = {
  slug: string;
  title_zh: string;
  title_en: string;
  title_zh_tw?: string | null;
  title_th?: string | null;
};
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
  const { t, pick, fmtDate } = useI18n();
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
  const [emailOtpConfigured, setEmailOtpConfigured] = useState(false);
  const [canPost, setCanPost] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
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
    void api<{ emailOtpConfigured?: boolean; canPost?: boolean }>("session")
      .then((result) => {
        if (!active) return;
        setEmailOtpConfigured(result.emailOtpConfigured === true);
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

  const requestEmailCode = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!emailOtpConfigured) return;
    setError("");
    setMessage("");
    setAuthBusy(true);
    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email: loginEmail.trim(),
        type: "sign-in",
      });
      if (result.error) throw new Error(result.error.message || t("emailCodeSendFailed"));
      setCodeSent(true);
      setMessage(t("emailCodeSent"));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setAuthBusy(false);
    }
  };

  const signInWithEmailCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setAuthBusy(true);
    try {
      const result = await authClient.signIn.emailOtp({
        email: loginEmail.trim(),
        otp: verificationCode.trim(),
      });
      if (result.error) throw new Error(result.error.message || t("emailCodeInvalid"));
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setAuthBusy(false);
    }
  };

  const signOut = async () => {
    setError("");
    const result = await authClient.signOut();
    if (result.error) setError(result.error.message || t("signOutFailed"));
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
      setMessage(t("postPublished"));
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
      setMessage(t("replyPublished"));
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
    if (!window.confirm(t("deletePostConfirm")))
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
    if (!window.confirm(t("deleteReplyConfirm"))) return;
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
      setMessage(t("reportSent"));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <main className="mx-auto min-h-[65vh] max-w-7xl px-4 py-12 md:py-16">
      <p className="label-mono text-accent">4SEAS / DISCUSSIONS</p>
      <h1 className="mt-3 font-cn-black text-4xl md:text-6xl">{t("discussionTitle")}</h1>
      <p className="mt-5 max-w-3xl text-lg text-muted-foreground">
        {t("discussionIntro")}
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        <input
          aria-label={t("searchDiscussions")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPosts")}
          className="min-w-48 flex-1 border-2 border-foreground bg-background px-3 py-2"
        />
        <select
          aria-label={t("category")}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border-2 border-foreground bg-background px-3 py-2"
        >
          <option value="all">{t("allTopics")}</option>
          {categories.map((item) => (
            <option key={item.slug} value={item.slug}>
              {pick(item, "title")}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p role="alert" className="mt-4 border-2 border-red-700 p-3 text-red-800">
          {t("serviceMessage") + error}
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
              ? t("checkingSignIn")
              : canPost
                ? t("signedInCanPost")
                : emailOtpConfigured
                  ? t("signInToPost")
                  : t("emailSignInNotConfigured")}
          </p>
          {canPost && session?.user?.email && (
            <p className="mt-1 text-sm text-muted-foreground">{session.user.email}</p>
          )}
          {!canPost && emailOtpConfigured && (
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              {t("emailLoginIntro")}
            </p>
          )}
        </div>
        {canPost ? (
          <button
            type="button"
            onClick={() => void signOut()}
            className="border-2 border-foreground px-4 py-2 font-bold"
          >
            {t("signOut")}
          </button>
        ) : emailOtpConfigured ? (
          <form
            onSubmit={(event) =>
              void (codeSent ? signInWithEmailCode(event) : requestEmailCode(event))
            }
            className="flex w-full flex-wrap items-end gap-3 lg:w-auto"
          >
            <label className="min-w-56 flex-1 font-bold lg:flex-none">
              {t("emailAddress")}
              <input
                type="email"
                required
                autoComplete="email"
                value={loginEmail}
                onChange={(event) => {
                  setLoginEmail(event.target.value);
                  setCodeSent(false);
                  setVerificationCode("");
                }}
                className="mt-1 block w-full border-b-2 border-foreground bg-transparent px-1 py-2"
              />
            </label>
            {codeSent && (
              <label className="min-w-36 flex-1 font-bold lg:flex-none">
                {t("emailVerificationCode")}
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(event) => setVerificationCode(event.target.value)}
                  className="mt-1 block w-full border-b-2 border-foreground bg-transparent px-1 py-2"
                />
              </label>
            )}
            <button
              disabled={authBusy || sessionPending}
              className="bg-primary px-4 py-2 font-bold text-primary-foreground disabled:opacity-50"
            >
              {authBusy
                ? codeSent
                  ? t("verifyingCode")
                  : t("sendingCode")
                : codeSent
                  ? t("verifyAndSignIn")
                  : t("sendVerificationCode")}
            </button>
            {codeSent && (
              <button
                type="button"
                disabled={authBusy}
                onClick={() => void requestEmailCode()}
                className="border-b-2 border-foreground px-2 py-2 font-bold disabled:opacity-50"
              >
                {t("resendCode")}
              </button>
            )}
          </form>
        ) : null}
      </div>
      <form
        onSubmit={(event) => void createPost(event)}
        className="paper mt-8 border-2 border-foreground p-5 md:p-7"
      >
        <h2 className="font-cn-black text-2xl">{t("startConversation")}</h2>
        <label className="mt-5 block font-bold">
          {t("nicknameOptional")}
          <input
            maxLength={60}
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder={t("guest")}
            className="mt-2 block w-full border-b-2 border-foreground bg-transparent px-1 py-2"
          />
        </label>
        <label className="mt-4 block font-bold">
          {t("title")}
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
          {t("yourThoughts")}
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
            {posting ? t("posting") : t("publish")}
          </button>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {t("publishNeedsSignIn")}
        </p>
      </form>
      <section className="mt-10 space-y-5" aria-live="polite">
        {loading ? (
          <p role="status">{t("loadingDiscussions")}</p>
        ) : posts.length === 0 ? (
          <div className="border-2 border-foreground p-6">
            <h2 className="font-cn-black text-xl">{t("noConversations")}</h2>
            <p className="mt-2 text-muted-foreground">
              {t("firstConversation")}
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="paper border-2 border-foreground p-5 md:p-7">
              <div className="flex flex-wrap items-center justify-between gap-2 label-mono text-paper-muted">
                <span>
                  {pick(
                    categories.find((item) => item.slug === post.category_slug) ?? {
                      title_zh: post.category_slug,
                      title_en: post.category_slug,
                    },
                    "title",
                  )}
                </span>
                <time>
                  {fmtDate(post.created_at + (post.created_at.endsWith("Z") ? "" : "Z"))}
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
                      {t("save")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditId(null)}
                      className="border border-foreground px-4 py-2"
                    >
                      {t("cancel")}
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
                {post.author_name || t("guest")} · {post.comment_count} {t("replies")}
              </p>
              <div className="mt-4 flex flex-wrap gap-4">
                <button
                  className="border-b-2 border-foreground pb-1 font-bold"
                  onClick={() => void openPost(post.id)}
                >
                  {expanded === post.id ? t("hideReplies") : t("readReply")} {" "}
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
                      {t("edit")}
                    </button>
                    <button
                      onClick={() => void deletePost(post.id)}
                      className="border-b-2 border-foreground pb-1"
                    >
                      {t("delete")}
                    </button>
                  </>
                )}
                <button
                  onClick={() => setReportTarget(`post:${post.id}`)}
                  className="border-b-2 border-foreground pb-1"
                >
                  {t("report")}
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
                                {t("save")}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditCommentId(null)}
                                className="underline"
                              >
                                {t("cancel")}
                              </button>
                            </div>
                          </form>
                        ) : (
                          <p className="whitespace-pre-wrap">{comment.body}</p>
                        )}
                        <p className="mt-1 text-xs text-paper-muted">
                          {comment.author_name || t("guest")} {" "}
                          {comment.parent_id ? t("replyLabel") : ""} ·{" "}
                          <button
                            onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                            className="underline"
                          >
                            {t("reply")}
                          </button>{" "}
                          ·{" "}
                          <button
                            onClick={() => setReportTarget(`comment:${comment.id}`)}
                            className="underline"
                          >
                            {t("report")}
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
                                {t("edit")}
                              </button>
                              <button
                                onClick={() => void deleteComment(comment.id, post.id)}
                                className="underline"
                              >
                                {t("delete")}
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
                        {t("isReplyingTo")}{" "}
                        <button
                          type="button"
                          onClick={() => setReplyTo(null)}
                          className="underline"
                        >
                          {t("cancel")}
                        </button>
                      </p>
                    )}
                    <textarea
                      required
                      maxLength={4000}
                      value={commentDraft}
                      onChange={(event) => setCommentDraft(event.target.value)}
                      rows={3}
                      placeholder={t("writeReply")}
                      className="min-w-0 border-2 border-paper-foreground bg-transparent px-3 py-2"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs">{commentDraft.length}/4000</span>
                      <button
                        disabled={!canPost}
                        className="bg-primary px-4 py-2 font-bold text-primary-foreground disabled:opacity-50"
                      >
                        {t("publishReply")}
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
                      placeholder={t("reportReason")}
                      className="min-w-0 flex-1 border-2 border-paper-foreground bg-transparent px-3 py-2"
                    />
                    <button className="border-2 border-paper-foreground px-4 py-2 font-bold">
                      {t("sendReport")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportTarget(null)}
                      className="px-3 py-2"
                    >
                      {t("cancel")}
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
