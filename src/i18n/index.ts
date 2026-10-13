import { da } from './da';
import { en } from './en';

export type Lang = 'en' | 'da';
export type TKey = keyof typeof en;
export type TVars = Record<string, string | number>;

const STRINGS: Record<Lang, Record<TKey, string>> = { en, da };

export function detectLang(): Lang {
  const language = typeof navigator !== 'undefined' ? navigator.language : '';
  return language.toLowerCase().startsWith('da') ? 'da' : 'en';
}

export function translate(lang: Lang, key: TKey, vars?: TVars): string {
  const text = STRINGS[lang][key] ?? en[key];
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) => (name in vars ? String(vars[name]) : match));
}
