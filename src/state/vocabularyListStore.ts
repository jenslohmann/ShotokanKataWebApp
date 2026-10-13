// Vocabulary list search + category, kept across navigation (iOS keeps VocabularyViewModel alive).
import type { VocabularyCategory } from '../domain/vocabulary';
import { createStore } from './createStore';

export interface VocabularyListFilters {
  search: string;
  category: VocabularyCategory | null;
}

export const vocabularyListStore = createStore<VocabularyListFilters>({ search: '', category: null });
