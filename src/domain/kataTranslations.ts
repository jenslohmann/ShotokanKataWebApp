// Kata content translations: src/data/i18n/<lang>/kata/<same file name as src/data/kata>.json.
// Only the English prose is translated (kata description and sub-move descriptions); names,
// techniques, stances and all Japanese fields come from the source data unchanged.
import { SOURCE_LANG, type Lang } from '../i18n/languages';
import type { Kata } from './types';

export interface KataTranslation {
  description: string;
  /** Sub-move descriptions keyed by move sequence, then sub-move order: moves["-1"]["1"]. */
  moves: Record<string, Record<string, string>>;
}

export interface LocalizedKata extends Kata {
  /** Language of the description texts. */
  contentLang: Lang;
}

const fileName = (path: string) => /([^/]+)\.json$/.exec(path)![1];

const sources = import.meta.glob('../data/kata/*.json', { eager: true, import: 'default' }) as Record<string, Kata>;
const NUMBER_BY_FILE = new Map(Object.entries(sources).map(([path, kata]) => [fileName(path), kata.kataNumber]));

const translationFiles = import.meta.glob('../data/i18n/*/kata/*.json', { eager: true, import: 'default' }) as Record<
  string,
  KataTranslation
>;

const TRANSLATIONS = new Map<string, KataTranslation>();
/** Translation files whose name matches no kata file (for tests). */
export const UNMATCHED_KATA_TRANSLATIONS: string[] = [];

for (const [path, translation] of Object.entries(translationFiles)) {
  const lang = /i18n\/([^/]+)\/kata\//.exec(path)![1];
  const kataNumber = NUMBER_BY_FILE.get(fileName(path));
  if (kataNumber === undefined) UNMATCHED_KATA_TRANSLATIONS.push(path);
  else TRANSLATIONS.set(`${lang}:${kataNumber}`, translation);
}

export function kataTranslation(kataNumber: number, lang: Lang): KataTranslation | undefined {
  return TRANSLATIONS.get(`${lang}:${kataNumber}`);
}

/** Kata numbers that have a translation file in `lang` (complete or not). */
export function translatedKataNumbers(lang: Lang): number[] {
  return [...TRANSLATIONS.keys()]
    .filter((key) => key.startsWith(`${lang}:`))
    .map((key) => Number(key.slice(lang.length + 1)))
    .sort((a, b) => a - b);
}

/** Texts missing from a translation ("description", "moves.3.1") and keys that match no sub-move. */
export function translationProblems(kata: Kata, translation: KataTranslation): { missing: string[]; unknown: string[] } {
  const missing: string[] = [];
  const known = new Set<string>();
  if (!translation.description) missing.push('description');
  for (const move of kata.moves) {
    for (const subMove of move.subMoves) {
      const key = `${move.sequence}.${subMove.order}`;
      known.add(key);
      if (!translation.moves?.[move.sequence]?.[subMove.order]) missing.push(`moves.${key}`);
    }
  }
  const unknown = Object.entries(translation.moves ?? {})
    .flatMap(([sequence, subMoves]) => Object.keys(subMoves).map((order) => `${sequence}.${order}`))
    .filter((key) => !known.has(key))
    .map((key) => `moves.${key}`);
  return { missing, unknown };
}

const cache = new Map<string, LocalizedKata>();

/** The kata with its descriptions in `lang` if a complete translation exists, else in English. */
export function localizeKata(kata: Kata, lang: Lang): LocalizedKata {
  const key = `${lang}:${kata.kataNumber}`;
  const cached = cache.get(key);
  if (cached?.name === kata.name) return cached;

  const translation = lang === SOURCE_LANG ? undefined : kataTranslation(kata.kataNumber, lang);
  let result: LocalizedKata = { ...kata, contentLang: SOURCE_LANG };
  if (translation && translationProblems(kata, translation).missing.length === 0) {
    result = {
      ...kata,
      description: translation.description,
      moves: kata.moves.map((move) => ({
        ...move,
        subMoves: move.subMoves.map((subMove) => ({
          ...subMove,
          description: translation.moves[move.sequence][subMove.order],
        })),
      })),
      contentLang: lang,
    };
  }
  cache.set(key, result);
  return result;
}
