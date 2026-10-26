import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "隐私说明 · AI非正常人类情报站" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { t } = useI18n();
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
          body: JSON.stringify({ reason: t("deletionPrefix") + reason.trim() }),
        },
      );
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Request failed");
      setTargetId("");
      setReason("");
      setMessage(t("deletionSent"));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  };

  return (
    <main className="mx-auto min-h-[65vh] max-w-4xl px-4 py-12 md:py-16">
      <p className="label-mono text-accent">4SEAS / PRIVACY</p>
      <h1 className="mt-3 font-cn-black text-4xl md:text-5xl">{t("privacyTitle")}</h1>
      <div className="prose-zine mt-8">
        <h2>{t("privacyGoogleHeading")}</h2>
        <p>{t("privacyGoogleBody")}</p>
        <h2>{t("privacyPostsHeading")}</h2>
        <p>{t("privacyPostsBody")}</p>
        <h2>{t("privacyRequestHeading")}</h2>
        <p>{t("privacyRequestBody")}</p>
        <h2>{t("privacyReportsHeading")}</h2>
        <p>{t("privacyReportsBody")}</p>
        <form
          onSubmit={(event) => void requestDeletion(event)}
          className="paper my-6 grid gap-3 border-2 border-foreground p-4"
        >
          <label className="font-bold">
            {t("contentType")}
            <select
              value={targetType}
              onChange={(event) => setTargetType(event.target.value as "post" | "comment")}
              className="ml-3 border border-foreground bg-transparent p-2"
            >
              <option value="post">{t("post")}</option>
              <option value="comment">{t("comment")}</option>
            </select>
          </label>
          <label className="font-bold">
            {t("contentId")}
            <input
              required
              maxLength={80}
              value={targetId}
              onChange={(event) => setTargetId(event.target.value)}
              className="mt-1 block w-full border-2 border-foreground bg-transparent p-2"
            />
          </label>
          <label className="font-bold">
            {t("requestDetails")}
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
              {t("deletionError")}: {error}
            </p>
          )}
          {message && <p role="status">{message}</p>}
          <button className="w-fit border-2 border-foreground px-4 py-2 font-bold">
            {t("submitDeletion")}
          </button>
        </form>
        <h2>{t("privacySurveyHeading")}</h2>
        <p>{t("privacySurveyBody")}</p>
        <a
          href="https://tally.so/r/PRdaO5"
          target="_blank"
          rel="noreferrer"
          className="font-bold underline"
        >
          {t("openTally")}
        </a>
      </div>
    </main>
  );
}
