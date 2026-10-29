import { describe, expect, it } from "vitest";
import { firstMeetupContent } from "@/lib/first-meetup-content";

describe("first meetup speaker profiles", () => {
  it.each(["zh", "zhTW", "en", "th", "ja", "ko"] as const)(
    "provides localized profiles for both confirmed speakers in %s",
    (language) => {
      const { speakers, speakersHeading } = firstMeetupContent[language];

      expect(speakersHeading).toBeTruthy();
      expect(speakers.map(({ name }) => name)).toEqual(["Michael", "Abby"]);
      for (const speaker of speakers) {
        expect(speaker.role).toBeTruthy();
        expect(speaker.title).toBeTruthy();
        expect(speaker.summary).toBeTruthy();
        expect(speaker.summary).not.toMatch(/张之昂|張之昂/);
      }
    },
  );
});
