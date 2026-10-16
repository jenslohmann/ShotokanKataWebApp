import { ALL_TERMS, categoriesWithTerms, categoryOf, filterTerms, findTerm } from './vocabulary';

describe('vocabulary', () => {
  it('loads all terms sorted by term', () => {
    expect(ALL_TERMS).toHaveLength(121);
    const sorted = [...ALL_TERMS].sort((a, b) => a.term.localeCompare(b.term));
    expect(ALL_TERMS).toEqual(sorted);
  });

  it('maps unknown categories to general', () => {
    const strike = ALL_TERMS.find((t) => t.category === 'strikes')!;
    expect(strike).toBeDefined();
    expect(categoryOf(strike)).toBe('general');
  });

  it('searches diacritic-insensitively', () => {
    expect(filterTerms(ALL_TERMS, 'dojo', null).map((t) => t.term)).toContain('Dōjō');
  });

  it('filters by category', () => {
    const stances = filterTerms(ALL_TERMS, '', 'stances');
    expect(stances.length).toBeGreaterThan(0);
    expect(stances.every((t) => categoryOf(t) === 'stances')).toBe(true);
    expect(categoriesWithTerms(ALL_TERMS)).toContain('stances');
  });

  it('finds terms by id', () => {
    expect(findTerm(ALL_TERMS[0].id)).toEqual({ ...ALL_TERMS[0], contentLang: 'en' });
  });
});
