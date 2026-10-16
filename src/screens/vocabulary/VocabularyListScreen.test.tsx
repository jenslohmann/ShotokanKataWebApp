import { fireEvent, render, screen, within } from '@testing-library/react';
import { ALL_TERMS, categoryOf } from '../../domain/vocabulary';
import { SettingsProvider } from '../../state/SettingsContext';
import { vocabularyListStore } from '../../state/vocabularyListStore';
import { VocabularyDetailScreen } from './VocabularyDetailScreen';
import { VocabularyListScreen } from './VocabularyListScreen';

function renderList() {
  return render(
    <SettingsProvider>
      <VocabularyListScreen />
    </SettingsProvider>,
  );
}

function termLinks() {
  return screen.getAllByRole('link').filter((link) => link.classList.contains('vocab-row__link'));
}

beforeEach(() => {
  localStorage.clear();
  vocabularyListStore.reset();
});

describe('VocabularyListScreen', () => {
  it('renders every term', () => {
    renderList();
    expect(termLinks()).toHaveLength(ALL_TERMS.length);
  });

  it('searches terms', () => {
    renderList();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zenkutsu' } });
    expect(termLinks().some((link) => link.textContent?.includes('Zenkutsu-dachi'))).toBe(true);
    // The search field clear button and the filter Clear button.
    expect(screen.getAllByRole('button', { name: 'Clear' })).toHaveLength(2);
  });

  it('filters by category', () => {
    renderList();
    fireEvent.click(screen.getByRole('button', { name: 'All Categories' }));
    const dialog = screen.getByRole('dialog', { hidden: true });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Kicks', hidden: true }));
    const kicks = ALL_TERMS.filter((term) => categoryOf(term) === 'kicks');
    expect(termLinks()).toHaveLength(kicks.length);
    expect(screen.getByRole('button', { name: 'Kicks' })).toBeInTheDocument();
  });

  it('shows the empty state', () => {
    renderList();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzzz' } });
    expect(screen.getByText('No terms found')).toBeInTheDocument();
  });
});

describe('VocabularyDetailScreen', () => {
  it('shows the definition card', () => {
    const term = ALL_TERMS[0];
    render(
      <SettingsProvider>
        <VocabularyDetailScreen id={term.id} />
      </SettingsProvider>,
    );
    expect(screen.getByRole('heading', { level: 1, name: term.term })).toBeInTheDocument();
    expect(screen.getByText('Definition')).toBeInTheDocument();
    expect(screen.getByText(term.definition)).toBeInTheDocument();
  });
});
