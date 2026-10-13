import type { VocabularyTerm } from '../../domain/types';

/** Temporary content; replaced by the full detail layout in Phase 7. */
export function VocabularyDetailContent({ term }: { term: VocabularyTerm }) {
  return (
    <div>
      <h3>{term.term}</h3>
      <p>{term.definition}</p>
    </div>
  );
}
