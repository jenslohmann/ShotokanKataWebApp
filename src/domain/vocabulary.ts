// Vocabulary data and filtering (replaces VocabularyDataService.swift logic).
import data from '../data/vocabulary.json';
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

export function filterTerms(
  terms: VocabularyTerm[],
  search: string,
  category: VocabularyCategory | null,
): VocabularyTerm[] {
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

const TERM_BY_ID = new Map(ALL_TERMS.map((term) => [term.id, term]));

export function findTerm(id: number): VocabularyTerm | undefined {
  return TERM_BY_ID.get(id);
}
