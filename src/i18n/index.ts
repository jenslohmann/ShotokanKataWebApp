import { da } from './da';
import { en } from './en';
import { SOURCE_LANG, type Lang } from './languages';

export { detectLang, isLang, LANGUAGES, SOURCE_LANG, type Lang } from './languages';

export type TKey = keyof typeof en;
export type TVars = Record<string, string | number>;
export type Messages = Record<TKey, string>;

const STRINGS: Record<Lang, Messages> = { en, da };

export function translate(lang: Lang, key: TKey, vars?: TVars): string {
  const text = STRINGS[lang][key] ?? STRINGS[SOURCE_LANG][key];
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) => (name in vars ? String(vars[name]) : match));
}

/** "a and b and c" in the given language (joined like the iOS app does). */
export function formatList(lang: Lang, items: string[]): string {
  return items.join(` ${translate(lang, 'common.and')} `);
}
