import { useMemo, useState } from 'react';
import { Icon } from '../../components/Icon';
import { NavBar } from '../../components/NavBar';
import { SearchField } from '../../components/SearchField';
import { Sheet } from '../../components/Sheet';
import { ALL_TERMS, categoriesWithTerms, filterTerms, termsFor, type VocabularyCategory } from '../../domain/vocabulary';
import { useLang, useT } from '../../state/SettingsContext';
import { vocabularyListStore } from '../../state/vocabularyListStore';
import { categoryIcon } from './categoryIcon';
import { VocabularyRow } from './VocabularyRow';
import './VocabularyListScreen.css';

const CATEGORIES = categoriesWithTerms(ALL_TERMS);

export function VocabularyListScreen() {
  const t = useT();
  const lang = useLang();
  const { search, category } = vocabularyListStore.use();
  const [pickerOpen, setPickerOpen] = useState(false);
  const terms = useMemo(() => filterTerms(termsFor(lang), search, category), [lang, search, category]);

  const choose = (next: VocabularyCategory | null) => {
    vocabularyListStore.set({ category: next });
    setPickerOpen(false);
  };

  return (
    <>
      <NavBar large title={t('nav.vocabulary')} />
      <div className="vocab-list__controls">
        <SearchField
          value={search}
          placeholder={t('vocabulary.searchPlaceholder')}
          onChange={(value) => vocabularyListStore.set({ search: value })}
          onClear={() => vocabularyListStore.set({ search: '' })}
        />
        <div className="vocab-list__filter-row">
          <button type="button" className="vocab-list__category" onClick={() => setPickerOpen(true)}>
            <Icon name="filter" size={16} />
            {category ? t(`vocabCategory.${category}`) : t('vocabulary.allCategories')}
          </button>
          {(category !== null || search !== '') && (
            <button type="button" className="vocab-list__clear" onClick={() => vocabularyListStore.reset()}>
              {t('vocabulary.clear')}
            </button>
          )}
        </div>
      </div>
      {terms.length > 0 ? (
        <ul className="vocab-list__rows">
          {terms.map((term) => (
            <li key={term.id}>
              <VocabularyRow term={term} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="vocab-list__empty">
          <Icon name="book" size={40} className="vocab-list__empty-icon" />
          <h2 className="vocab-list__empty-title">{t('vocabulary.emptyTitle')}</h2>
          <p className="vocab-list__empty-text">{t('vocabulary.emptySubtitle')}</p>
        </div>
      )}
      <Sheet
        open={pickerOpen}
        title={t('vocabulary.selectCategory')}
        onClose={() => setPickerOpen(false)}
        leftAction={{ label: t('common.cancel'), onClick: () => setPickerOpen(false) }}
      >
        <ul className="vocab-list__options">
          <li>
            <button
              type="button"
              className="vocab-list__option"
              aria-pressed={category === null}
              onClick={() => choose(null)}
            >
              <Icon name="list" />
              <span>{t('vocabulary.allCategories')}</span>
              {category === null && <Icon name="check" className="vocab-list__check" />}
            </button>
          </li>
          {CATEGORIES.map((item) => (
            <li key={item}>
              <button
                type="button"
                className="vocab-list__option"
                aria-pressed={category === item}
                onClick={() => choose(item)}
              >
                <Icon name={categoryIcon(item)} />
                <span>{t(`vocabCategory.${item}`)}</span>
                {category === item && <Icon name="check" className="vocab-list__check" />}
              </button>
            </li>
          ))}
        </ul>
      </Sheet>
    </>
  );
}
