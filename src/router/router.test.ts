import { parseHash, routeToHash, sectionOf, type Route } from './router';

const ROUTES: Route[] = [
  { name: 'kataList' },
  { name: 'kataDetail', kataNumber: 4, tab: 'overview' },
  { name: 'kataDetail', kataNumber: 15, tab: 'moves' },
  { name: 'kataDetail', kataNumber: 1, tab: 'history' },
  { name: 'quizMenu' },
  { name: 'quizPlay' },
  { name: 'vocabList' },
  { name: 'vocabDetail', id: 42 },
  { name: 'about' },
];

describe('router', () => {
  it.each(ROUTES)('round-trips %o', (route) => {
    expect(parseHash(routeToHash(route))).toEqual(route);
  });

  it('falls back to the kata list for empty or unknown hashes', () => {
    expect(parseHash('')).toEqual({ name: 'kataList' });
    expect(parseHash('#/')).toEqual({ name: 'kataList' });
    expect(parseHash('#/nope')).toEqual({ name: 'kataList' });
    expect(parseHash('#/kata/abc')).toEqual({ name: 'kataList' });
  });

  it('defaults the kata tab to moves', () => {
    expect(parseHash('#/kata/3')).toEqual({ name: 'kataDetail', kataNumber: 3, tab: 'moves' });
    expect(parseHash('#/kata/3?tab=bogus')).toEqual({ name: 'kataDetail', kataNumber: 3, tab: 'moves' });
  });

  it('maps routes to sections', () => {
    expect(sectionOf({ name: 'quizPlay' })).toBe('quiz');
    expect(sectionOf({ name: 'vocabDetail', id: 1 })).toBe('vocabulary');
    expect(sectionOf({ name: 'kataDetail', kataNumber: 1, tab: 'moves' })).toBe('kata');
  });
});
