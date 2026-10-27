import { useI18n } from "@/lib/i18n";
import { firstMeetupContent } from "@/lib/first-meetup-content";

export function FirstEventPoster({ className = "" }: { className?: string }) {
  const { lang } = useI18n();
  const copy = firstMeetupContent[lang];

  return (
    <figure className={className} aria-label={copy.posterHeading}>
      <div
        role="status"
        className="flex aspect-[1122/1832] w-full flex-col items-center justify-center border-2 border-paper-foreground bg-background p-6 text-center"
      >
        <span className="label-mono text-accent">{copy.posterHeading}</span>
        <h2 className="mt-5 font-cn-black text-2xl">{copy.posterPending}</h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {copy.posterNote}
        </p>
      </div>
    </figure>
  );
}
