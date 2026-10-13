import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { SettingsProvider } from '../../state/SettingsContext';
import { resetKataListFilters } from '../../state/kataListStore';
import { KataListScreen } from './KataListScreen';

function renderScreen() {
  return render(
    <SettingsProvider>
      <KataListScreen />
    </SettingsProvider>,
  );
}

function rows() {
  return within(screen.getByRole('list')).getAllByRole('link');
}

beforeEach(() => {
  localStorage.clear();
  resetKataListFilters();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('KataListScreen', () => {
  it('renders all kata', () => {
    renderScreen();
    expect(rows()).toHaveLength(10);
  });

  it('filters by search after the debounce', () => {
    vi.useFakeTimers();
    renderScreen();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'tekki' } });
    expect(rows()).toHaveLength(10);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(rows()).toHaveLength(1);
    expect(rows()[0]).toHaveTextContent('Tekki Shodan');
  });

  it('filters by belt chip', () => {
    renderScreen();
    fireEvent.click(screen.getByRole('button', { name: /Black Belt/ }));
    expect(rows()).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'All Kata' })).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(screen.getByRole('button', { name: 'All Kata' }));
    expect(rows()).toHaveLength(10);
  });

  it('hides Japanese names when the toggle is off', () => {
    renderScreen();
    expect(screen.getByText('平安初段')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('switch', { name: 'Japanese / Hiragana' }));
    expect(screen.queryByText('平安初段')).not.toBeInTheDocument();
  });

  it('shows the empty state with a clear button', () => {
    vi.useFakeTimers();
    renderScreen();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzz' } });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByText('No Kata Found')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear Filters' }));
    expect(rows()).toHaveLength(10);
  });
});
