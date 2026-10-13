import { Icon } from '../../components/Icon';
import { SpeakButton } from '../../components/SpeakButton';
import type { VocabularyTerm } from '../../domain/types';
import { categoryOf } from '../../domain/vocabulary';
import { useT } from '../../state/SettingsContext';
import { categoryIcon } from './categoryIcon';
import './VocabularyDetailContent.css';

/** Shared by the vocabulary detail screen and the app-level vocabulary sheet. */
export function VocabularyDetailContent({ term }: { term: VocabularyTerm }) {
  const t = useT();
  const category = categoryOf(term);
  return (
    <div className="vocab-detail">
      <header className="vocab-detail__header">
        <div className="vocab-detail__header-row">
          <div className="vocab-detail__names">
            <h2 className="vocab-detail__term">{term.term}</h2>
            <p className="vocab-detail__japanese">
              <span className="vocab-detail__kanji" lang="ja">
                {term.japaneseName}
              </span>
              <span className="vocab-detail__muted" aria-hidden="true">
                •
              </span>
              <span className="vocab-detail__muted" lang="ja">
                {term.hiraganaName}
              </span>
            </p>
          </div>
          <div className="vocab-detail__actions">
            <SpeakButton text={term.hiraganaName} size={22} />
            <Icon name={categoryIcon(category)} size={22} className="vocab-detail__icon" />
          </div>
        </div>
        <p className="vocab-detail__short">{term.shortDescription}</p>
      </header>
      <div className="vocab-detail__body">
        <section className="vocab-detail__card">
          <h3 className="vocab-detail__heading">{t('vocabulary.definition')}</h3>
          <p className="vocab-detail__text">{term.definition}</p>
        </section>
        {term.componentBreakdown && (
          <section className="vocab-detail__card">
            <h3 className="vocab-detail__heading">{t('vocabulary.breakdown')}</h3>
            <p className="vocab-detail__text">{term.componentBreakdown}</p>
          </section>
        )}
        <section className="vocab-detail__card">
          <h3 className="vocab-detail__heading">{t('vocabulary.category')}</h3>
          <p className="vocab-detail__category">
            <Icon name={categoryIcon(category)} size={22} className="vocab-detail__icon" />
            {t(`vocabCategory.${category}`)}
          </p>
        </section>
      </div>
    </div>
  );
}
