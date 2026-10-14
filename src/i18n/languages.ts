// Supported languages. To add a language: add it here, add `src/i18n/<code>.ts` (all keys of en.ts)
// and register it in STRINGS in index.ts. Content translations live in src/data/i18n/<code>/.

export const LANGUAGES = [
  { code: 'en', nativeName: 'English' },
  { code: 'da', nativeName: 'Dansk' },
] as const;

export type Lang = (typeof LANGUAGES)[number]['code'];

/** Language of the source texts (UI strings and synced data). Used as fallback. */
export const SOURCE_LANG: Lang = 'en';

export function isLang(value: unknown): value is Lang {
  return LANGUAGES.some((language) => language.code === value);
}

/** First supported language in the user's preference list (e.g. ['da-DK', 'en-US']), else English. */
export function detectLang(preferred: readonly string[] = browserLanguages()): Lang {
  for (const tag of preferred) {
    const primary = tag.toLowerCase().split('-')[0];
    if (isLang(primary)) return primary;
  }
  return SOURCE_LANG;
}

function browserLanguages(): readonly string[] {
  if (typeof navigator === 'undefined') return [];
  return navigator.languages?.length ? navigator.languages : [navigator.language];
}
