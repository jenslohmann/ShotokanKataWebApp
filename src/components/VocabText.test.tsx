import { fireEvent, render, screen } from '@testing-library/react';
import { ALL_TERMS } from '../domain/vocabulary';
import { SettingsProvider } from '../state/SettingsContext';
import { ExpandableText } from './ExpandableText';
import { VocabText } from './VocabText';
import { VocabularySheetContext } from './VocabularySheetContext';

describe('VocabText', () => {
  it('renders a link button for a vocabulary term and opens it', () => {
    const openTerm = vi.fn();
    const kata = ALL_TERMS.find((term) => term.term === 'Kata')!;
    render(
      <VocabularySheetContext.Provider value={{ openTerm }}>
        <VocabText text="Practise each kata slowly." />
      </VocabularySheetContext.Provider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'kata' }));
    expect(openTerm).toHaveBeenCalledWith(kata.id);
  });
});

describe('ExpandableText', () => {
  function renderText(text: string) {
    return render(
      <SettingsProvider>
        <ExpandableText text={text} />
      </SettingsProvider>,
    );
  }

  it('shows a chevron for long text', () => {
    renderText('x '.repeat(150));
    const toggle = screen.getByRole('button', { name: 'Show more' });
    fireEvent.click(toggle);
    expect(screen.getByRole('button', { name: 'Show less' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows no chevron for short text', () => {
    renderText('Short text.');
    expect(screen.queryByRole('button', { name: 'Show more' })).not.toBeInTheDocument();
  });
});
