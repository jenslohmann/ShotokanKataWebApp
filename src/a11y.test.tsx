import { render, screen } from '@testing-library/react';
import { App } from './App';

const ROUTES = [
  '#/kata',
  '#/kata/1?tab=moves',
  '#/kata/10?tab=overview',
  '#/kata/1?tab=history',
  '#/quiz',
  '#/vocabulary',
  '#/vocabulary/1',
  '#/about',
];

describe('accessibility basics', () => {
  it('detects an icon-only button without a label (sanity check)', () => {
    render(
      <button type="button">
        <svg aria-hidden="true" />
      </button>,
    );
    expect(screen.queryAllByRole('button', { name: '' })).toHaveLength(1);
  });

  it.each(ROUTES)('every button and link on %s has an accessible name', (hash) => {
    window.location.hash = hash;
    const { container, unmount } = render(<App />);
    expect(screen.queryAllByRole('button').length + screen.queryAllByRole('link').length).toBeGreaterThan(0);
    // `name: ''` matches elements whose accessible name is empty (aria-hidden elements are skipped).
    const unnamed = [...screen.queryAllByRole('button', { name: '' }), ...screen.queryAllByRole('link', { name: '' })];
    expect(unnamed.map((element) => element.outerHTML.slice(0, 120))).toEqual([]);
    expect(container.querySelectorAll('[tabindex]:not([tabindex="-1"]):not([tabindex="0"])')).toHaveLength(0);
    unmount();
  });
});
