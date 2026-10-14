// Vocabulary data and filtering (replaces VocabularyDataService.swift logic).
import data from '../data/vocabulary.json';
import { SOURCE_LANG, type Lang } from '../i18n/languages';
import { normalizeForSearch } from './kata';
import type { VocabularyTerm } from './types';

export type VocabularyCategory =
  | 'general'
  | 'etiquette'
  | 'titles'
  | 'techniques'
  | 'stances'
  | 'blocks'
  | 'punches'
  | 'kicks'
  | 'training'
  | 'ranks'
  | 'equipment';

export const VOCABULARY_CATEGORIES: VocabularyCategory[] = [
  'general',
  'etiquette',
  'titles',
  'techniques',
  'stances',
  'blocks',
  'punches',
  'kicks',
  'training',
  'ranks',
  'equipment',
];

const CATEGORY_SET = new Set<string>(VOCABULARY_CATEGORIES);

export function categoryOf(term: VocabularyTerm): VocabularyCategory {
  return CATEGORY_SET.has(term.category) ? (term.category as VocabularyCategory) : 'general';
}

export const ALL_TERMS: VocabularyTerm[] = [...(data.vocabularyTerms as VocabularyTerm[])].sort((a, b) =>
  a.term.localeCompare(b.term),
);

export function filterTerms<T extends VocabularyTerm>(terms: T[], search: string, category: VocabularyCategory | null): T[] {
  const query = normalizeForSearch(search.trim());
  return terms
    .filter((term) => !category || categoryOf(term) === category)
    .filter((term) => {
      if (!query) return true;
      const fields = [term.term, term.japaneseName, term.hiraganaName, term.definition];
      return fields.some((field) => normalizeForSearch(field).includes(query));
    });
}

export function categoriesWithTerms(terms: VocabularyTerm[]): VocabularyCategory[] {
  const used = new Set(terms.map(categoryOf));
  return VOCABULARY_CATEGORIES.filter((category) => used.has(category));
}

// Translations: src/data/i18n/<lang>/vocabulary.json, keyed by term id. Term names and Japanese
// fields are never translated. A term without a complete translation is shown in English.
type TermText = Pick<VocabularyTerm, 'shortDescription' | 'definition' | 'componentBreakdown'>;
type TermTranslations = Record<string, Partial<TermText>>;

const translationFiles = import.meta.glob('../data/i18n/*/vocabulary.json', { eager: true, import: 'default' }) as Record<
  string,
  TermTranslations
>;
const TRANSLATIONS = new Map<string, TermTranslations>(
  Object.entries(translationFiles).map(([path, translations]) => [/i18n\/([^/]+)\//.exec(path)![1], translations]),
);

export interface LocalizedTerm extends VocabularyTerm {
  /** Language of the text fields (shortDescription, definition, componentBreakdown). */
  contentLang: Lang;
}

function translationOf(term: VocabularyTerm, lang: Lang): TermText | null {
  const text = TRANSLATIONS.get(lang)?.[String(term.id)];
  if (!text?.shortDescription || !text.definition) return null;
  if (term.componentBreakdown && !text.componentBreakdown) return null;
  return text as TermText;
}

export function localizeTerm(term: VocabularyTerm, lang: Lang): LocalizedTerm {
  const text = lang === SOURCE_LANG ? null : translationOf(term, lang);
  if (!text) return { ...term, contentLang: SOURCE_LANG };
  return {
    ...term,
    shortDescription: text.shortDescription,
    definition: text.definition,
    componentBreakdown: term.componentBreakdown ? text.componentBreakdown : undefined,
    contentLang: lang,
  };
}

const termsCache = new Map<Lang, { list: LocalizedTerm[]; byId: Map<number, LocalizedTerm> }>();

function localized(lang: Lang) {
  let entry = termsCache.get(lang);
  if (!entry) {
    const list = ALL_TERMS.map((term) => localizeTerm(term, lang));
    entry = { list, byId: new Map(list.map((term) => [term.id, term])) };
    termsCache.set(lang, entry);
  }
  return entry;
}

/** All terms with text in `lang` where translated, sorted like ALL_TERMS. */
export function termsFor(lang: Lang): LocalizedTerm[] {
  return localized(lang).list;
}

export function findTerm(id: number, lang: Lang = SOURCE_LANG): LocalizedTerm | undefined {
  return localized(lang).byId.get(id);
}

/** Ids of terms that have no complete translation in `lang` (for tests and translators). */
export function untranslatedTermIds(lang: Lang): number[] {
  return termsFor(lang)
    .filter((term) => term.contentLang !== lang)
    .map((term) => term.id);
}
