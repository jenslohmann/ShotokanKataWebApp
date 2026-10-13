import { Icon } from '../../components/Icon';
import { SpeakButton } from '../../components/SpeakButton';
import type { VocabularyTerm } from '../../domain/types';
import { categoryOf } from '../../domain/vocabulary';
import { routeToHash } from '../../router/router';
import { categoryIcon } from './categoryIcon';
import './VocabularyRow.css';

export function VocabularyRow({ term }: { term: VocabularyTerm }) {
  const href = routeToHash({ name: 'vocabDetail', id: term.id });
  return (
    <div className="vocab-row">
      <a className="vocab-row__link" href={href}>
        <span className="vocab-row__title">
          <span className="vocab-row__term">{term.term}</span>
          <Icon name={categoryIcon(categoryOf(term))} size={12} className="vocab-row__category" />
        </span>
        <span className="vocab-row__japanese">
          <span className="vocab-row__kanji" lang="ja">
            {term.japaneseName}
          </span>
          <span className="vocab-row__dot" aria-hidden="true">
            •
          </span>
          <span className="vocab-row__hiragana" lang="ja">
            {term.hiraganaName}
          </span>
        </span>
        <span className="vocab-row__short">{term.shortDescription}</span>
      </a>
      <span className="vocab-row__speak">
        <SpeakButton text={term.hiraganaName} />
      </span>
      <a className="vocab-row__chevron" href={href} tabIndex={-1} aria-hidden="true">
        <Icon name="chevronRight" size={14} />
      </a>
    </div>
  );
}
