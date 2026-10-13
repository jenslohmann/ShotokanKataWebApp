import type { MouseEvent } from 'react';
import { ALL_TERMS } from '../domain/vocabulary';
import { linkVocabulary } from '../domain/vocabularyLinks';
import { useVocabularySheet } from './VocabularySheetContext';
import './VocabText.css';

interface VocabTextProps {
  text: string;
  /** Extra class on linked terms, e.g. to colour them differently from the accent colour. */
  highlightClass?: string;
  className?: string;
}

export function VocabText({ text, highlightClass, className }: VocabTextProps) {
  const { openTerm } = useVocabularySheet();
  const segments = linkVocabulary(text, ALL_TERMS);
  return (
    <span className={className}>
      {segments.map((segment, index) => {
        const termId = segment.termId;
        if (termId === undefined) return <span key={index}>{segment.text}</span>;
        const onClick = (event: MouseEvent) => {
          event.stopPropagation();
          openTerm(termId);
        };
        return (
          <button key={index} type="button" className={`vocab-link ${highlightClass ?? ''}`.trim()} onClick={onClick}>
            {segment.text}
          </button>
        );
      })}
    </span>
  );
}
