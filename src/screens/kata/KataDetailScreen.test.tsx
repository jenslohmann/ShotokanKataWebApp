import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { App } from '../../App';

function openHash(hash: string) {
  window.location.hash = hash;
  return render(<App />);
}

beforeEach(() => {
  localStorage.clear();
});

describe('KataDetailScreen', () => {
  it('shows the header and the Moves tab by default', () => {
    const { container } = openHash('#/kata/1');
    expect(screen.getByRole('heading', { level: 1, name: 'Heian Shodan' })).toBeInTheDocument();
    expect(screen.getByText('Moves: 21')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Moves' })).toHaveAttribute('aria-selected', 'true');
    expect(container.querySelector('.kata-move__badge')).toHaveTextContent('Rei');
  });

  it('switches to the Overview tab', async () => {
    openHash('#/kata/1');
    await act(async () => {
      fireEvent.click(screen.getByRole('tab', { name: 'Overview' }));
    });
    expect(screen.getByRole('heading', { name: 'Description' })).toBeInTheDocument();
    expect(window.location.hash).toBe('#/kata/1?tab=overview');
  });

  it('shows a kiai sentence for Heian Yondan (sub-move kiai)', () => {
    openHash('#/kata/4');
    expect(screen.getByText(/^Kiai on move/)).toBeInTheDocument();
    expect(screen.queryByText('No kiai in this kata.')).not.toBeInTheDocument();
  });

  it('shows the History tab statistics', () => {
    openHash('#/kata/1?tab=history');
    expect(screen.getByText('Kata Statistics')).toBeInTheDocument();
    const stat = screen.getByText('Kata Number').parentElement!;
    expect(within(stat).getByText('#1')).toBeInTheDocument();
  });

  it('shows not found for an unknown kata', () => {
    openHash('#/kata/99');
    expect(screen.getByRole('heading', { level: 1, name: 'Not found' })).toBeInTheDocument();
  });
});
