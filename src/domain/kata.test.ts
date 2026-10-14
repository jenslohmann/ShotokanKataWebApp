import {
  ALL_KATA,
  availableBelts,
  directionArrow,
  directionLabel,
  filterKata,
  kiaiMoveNumbers,
  loadAllKata,
  moveLabel,
  sortedMoves,
} from './kata';
import { beltOf } from './ranks';

describe('kata', () => {
  it('loads the enabled kata sorted by kataNumber', () => {
    expect(ALL_KATA).toHaveLength(10);
    // kataNumber comes from the kata files themselves (as in the iOS app):
    // 09_bassai_dai.json has kataNumber 7 and 10_kanku_dai.json has kataNumber 9.
    expect(ALL_KATA.map((k) => k.kataNumber)).toEqual([1, 2, 3, 4, 5, 6, 7, 9, 11, 15]);
  });

  it('skips enabled entries whose file is missing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const list = loadAllKata({ availableKata: [{ fileName: 'missing', kataNumber: 99, name: 'X', enabled: true }] }, {});
    expect(list).toEqual([]);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('searches case- and diacritic-insensitively', () => {
    const result = filterKata(ALL_KATA, { search: 'kanku' });
    expect(result.map((k) => k.name)).toContain('Kankū Dai');
  });

  it('filters by belt', () => {
    const result = filterKata(ALL_KATA, { search: '', belt: 'black' });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((k) => k.beltRank === '1_dan')).toBe(true);
  });

  it('maps directions to arrows', () => {
    expect(directionArrow('ne')).toBe('↗');
    expect(directionArrow('x')).toBe('•');
  });

  it('finds sub-move kiai in Heian Yondan', () => {
    const yondan = ALL_KATA.find((k) => k.kataNumber === 4)!;
    expect(kiaiMoveNumbers(yondan).length).toBeGreaterThan(0);
  });

  it('starts every kata with Rei/Yōi or move 1', () => {
    for (const kata of ALL_KATA) {
      expect(sortedMoves(kata)[0].sequence).toBeLessThanOrEqual(1);
    }
  });

  it('labels moves by sequence name when present', () => {
    const first = sortedMoves(ALL_KATA[0])[0];
    expect(moveLabel(first)).toBe(first.sequenceName ?? String(first.sequence));
  });

  it('lists belts in rank order', () => {
    const belts = availableBelts(ALL_KATA);
    expect(belts[0]).toBe(beltOf(ALL_KATA[0].beltRank));
    expect(belts[belts.length - 1]).toBe('black');
  });
});

describe('directionLabel', () => {
  it('translates each compass letter', () => {
    const danish = { N: 'N', E: 'Ø', S: 'S', W: 'V' } as const;
    expect(directionLabel('nne', (point) => danish[point])).toBe('NNØ');
    expect(directionLabel('WSW', (point) => danish[point])).toBe('VSV');
    expect(directionLabel('', (point) => danish[point])).toBe('');
  });
});
