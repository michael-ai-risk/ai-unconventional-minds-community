# Topic catalog localization

Scope: `/ai-topics` and its catalog detail routes. Source baseline:
`fe8f4968f60f36691013e8d98e64125eda6424d1`, Draft PR #2 (full-article update).

## Content boundaries

- The existing 150 IDs, slugs, Chinese source records and publication states are retained:
  144 candidates and six published Chinese articles.
- `src/lib/topic-locales/{zhTW,en,th,ja,ko}.txt` each contain 150 records.
  The UTF-8 format is `id|title|summary`, one record per line; fields must not contain `|`.
- These are AI-assisted editorial drafts, not native-speaker-approved translations.
  The catalog and translated detail pages disclose that review is pending.
- Traditional Chinese started with offline OpenCC `s2twp` conversion and terminology
  adjustments (for example 品質、職位、權限、數位、運算資源).
  Neither OpenCC nor any translation service is a runtime dependency.
- All six published articles now have full translations in
  `src/lib/article-locales/{zhTW,en,th,ja,ko}.json`: title, article summary, every
  section and paragraph, and reference dates/scopes. `article-localization.ts`
  rejects incomplete translations for reading. Source URLs and reference titles
  always come from the Chinese source records; original publication titles remain
  in their original language. No citations are invented by the translation layer.
- Translations open directly in the selected language. A button switches to the
  Chinese original and back without changing the interface language. Article
  `lang` attributes follow the actual text. Native-speaker review remains pending
  and is disclosed. This is community editorial translation, not an official
  translation or endorsement by the cited institutions.
- No candidate becomes published through localization. No user discussions or
  database records are translated or modified by this change.

## Rendering and search

`topic-localization.ts` supplies the same localized record to lists, candidate
details and related links. Editorial teasers use the article's own localized
title/summary. Missing or duplicate records are
checked in tests. Simplified Chinese uses the existing source record unchanged.

Search indexes the selected language's title, summary and category, with Chinese
source text also searchable. Unicode NFKC normalization supports full-width Latin
characters, and case differences are ignored. This is substring search, not a
new semantic search service. Category and wealth-subcategory filters are retained.

Translations preserve uncertainty and distinguish:

- task automation, job redesign and disappearance of an entire job;
- exposure to AI and forecasts of unemployment;
- model computation tokens and blockchain tokens;
- digital rights and ownership of underlying assets;
- funding enthusiasm, operating evidence and actual investment returns.

## Verification

Run `npm test`, `npm run build`, and ESLint/Prettier on the changed TypeScript and
TSX files. `src/test/topic-localization.test.ts` checks all 750 translated record
pairs, category/source-language search, Unicode normalization and retained article
publication boundaries. `article-localization.test.ts` checks all 30 complete
translations, section/paragraph counts, reference identity, the study's numerical
limits, token terminology, and missing-translation behavior.

Browser acceptance must separately check the actual language selector, all
rendered catalog titles and summaries, categories/subcategories, localized search,
empty results, detail links, refresh/back/forward, all six full articles per
language and original/translation toggles, desktop/mobile overflow, keyboard and touch navigation, and console
errors. Passing unit tests is not visual or native-language acceptance.

No main merge or production deployment is part of this change. Native-speaker
review remains pending; translation completeness does not certify native-language quality.
