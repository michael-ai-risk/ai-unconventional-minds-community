import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/join")({
  head: () => ({ meta: [{ title: "加入社区 · AI非正常人类情报站" }] }),
  component: JoinPage,
});

function JoinPage() {
  const { lang } = useI18n();
  const en = lang === "en";
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const result =
        mode === "signup"
          ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password })
          : await authClient.signIn.email({ email: email.trim(), password });
      if (result.error)
        throw new Error(result.error.message || (en ? "Sign-in failed" : "登录失败"));
      await navigate({ to: "/discussions" });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="mx-auto min-h-[65vh] max-w-3xl px-4 py-12 md:py-16">
      <p className="label-mono text-accent">4SEAS / COMMUNITY ACCOUNT</p>
      <h1 className="mt-3 font-cn-black text-4xl md:text-6xl">
        {en ? "Join the conversation" : "加入讨论"}
      </h1>
      <p className="mt-5 text-lg text-muted-foreground">
        {en
          ? "An account is only needed to post or reply. Your email is not shown publicly."
          : "只有发帖和回复时才需要账号。邮箱不会公开显示。"}
      </p>
      <form onSubmit={submit} className="paper mt-8 border-2 border-foreground p-6 md:p-9">
        <div className="mb-6 flex gap-4">
          <button
            type="button"
            onClick={() => setMode("signup")}
            aria-pressed={mode === "signup"}
            className={
              "border-b-2 pb-2 font-bold " +
              (mode === "signup" ? "border-primary" : "border-transparent")
            }
          >
            {en ? "Create account" : "注册账号"}
          </button>
          <button
            type="button"
            onClick={() => setMode("signin")}
            aria-pressed={mode === "signin"}
            className={
              "border-b-2 pb-2 font-bold " +
              (mode === "signin" ? "border-primary" : "border-transparent")
            }
          >
            {en ? "Sign in" : "登录"}
          </button>
        </div>
        {mode === "signup" && (
          <label className="mb-4 block font-bold">
            {en ? "Nickname" : "昵称"}
            <input
              required
              minLength={1}
              maxLength={60}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="nickname"
              className="mt-2 block w-full border-b-2 border-foreground bg-transparent px-1 py-2"
            />
          </label>
        )}
        <label className="mb-4 block font-bold">
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="mt-2 block w-full border-b-2 border-foreground bg-transparent px-1 py-2"
          />
        </label>
        <label className="block font-bold">
          {en ? "Password (12+ characters)" : "密码（至少12位）"}
          <input
            required
            minLength={12}
            maxLength={128}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            className="mt-2 block w-full border-b-2 border-foreground bg-transparent px-1 py-2"
          />
        </label>
        {message && (
          <p role="alert" className="mt-4 border-2 border-red-700 p-3 text-red-800">
            {message}
          </p>
        )}
        <button
          disabled={busy}
          className="mt-6 bg-primary px-5 py-3 font-bold text-primary-foreground disabled:opacity-50"
        >
          {busy
            ? en
              ? "Please wait…"
              : "请稍候…"
            : mode === "signup"
              ? en
                ? "Create account"
                : "创建账号"
              : en
                ? "Sign in"
                : "登录"}
        </button>
        <p className="mt-5 text-sm text-muted-foreground">
          {en
            ? "By continuing, you agree to our community guidelines."
            : "继续操作即表示你同意社区交流守则。"}{" "}
          <Link to="/community-rules" className="underline">
            {en ? "Read the guidelines" : "查看守则"}
          </Link>
        </p>
      </form>
    </main>
  );
}
