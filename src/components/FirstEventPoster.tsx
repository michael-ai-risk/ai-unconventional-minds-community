import { useI18n } from "@/lib/i18n";
import { firstMeetupContent } from "@/lib/first-meetup-content";

export function FirstEventPoster({ className = "" }: { className?: string }) {
  const { lang } = useI18n();
  const copy = firstMeetupContent[lang];

  return (
    <figure className={className} aria-label={copy.posterHeading}>
      <img
        src="/posters/first-ai-meetup.png"
        alt={`${copy.posterHeading}: ${copy.title}`}
        className="block h-auto w-full border-2 border-paper-foreground object-contain"
        loading="lazy"
        decoding="async"
      />
    </figure>
  );
}
