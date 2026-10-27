import { useI18n } from "@/lib/i18n";

export function FirstEventPoster({ className = "" }: { className?: string }) {
  const { t } = useI18n();

  return (
    <figure className={className}>
      <img
        src="/posters/first-ai-meetup.png"
        alt={t("firstEventPosterAlt")}
        width={1122}
        height={1832}
        loading="lazy"
        decoding="async"
        className="block h-auto w-full border-2 border-paper-foreground"
      />
    </figure>
  );
}
