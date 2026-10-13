import { RANKS, beltOf, highestRankOf, rankSortOrder } from './ranks';

describe('ranks', () => {
  it('has 20 ranks in sort order', () => {
    expect(RANKS).toHaveLength(20);
    expect(RANKS.map((r) => r.sortOrder)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
  });

  it('maps ranks to belts', () => {
    expect(beltOf('6_kyu')).toBe('green');
    expect(beltOf('5_kyu')).toBe('purple');
    expect(beltOf('unknown')).toBe('white');
    expect(rankSortOrder('unknown')).toBe(Number.MAX_SAFE_INTEGER);
  });

  it('finds the highest rank of a difficulty level', () => {
    expect(highestRankOf('beginner')).toBe('8_kyu');
    expect(highestRankOf('advanced')).toBe('2_dan');
  });
});
