// App-level vocabulary sheet: any VocabText link can open a term in ONE shared Sheet.
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { findTerm } from '../domain/vocabulary';
import { useT } from '../state/SettingsContext';
import { Sheet } from './Sheet';
import { VocabularyDetailContent } from '../screens/vocabulary/VocabularyDetailContent';

export interface VocabularySheetValue {
  openTerm(id: number): void;
}

export const VocabularySheetContext = createContext<VocabularySheetValue>({ openTerm: () => {} });

export function VocabularySheetProvider({ children }: { children: ReactNode }) {
  const t = useT();
  const [termId, setTermId] = useState<number | null>(null);
  const term = termId === null ? undefined : findTerm(termId);
  const close = useCallback(() => setTermId(null), []);
  const value = useMemo<VocabularySheetValue>(() => ({ openTerm: setTermId }), []);

  return (
    <VocabularySheetContext.Provider value={value}>
      {children}
      <Sheet
        open={term !== undefined}
        title={term?.term ?? ''}
        onClose={close}
        rightAction={{ label: t('common.done'), onClick: close }}
        flush
      >
        {term && <VocabularyDetailContent term={term} />}
      </Sheet>
    </VocabularySheetContext.Provider>
  );
}

export function useVocabularySheet(): VocabularySheetValue {
  return useContext(VocabularySheetContext);
}
