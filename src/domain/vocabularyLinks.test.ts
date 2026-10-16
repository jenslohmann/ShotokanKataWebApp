import type { VocabularyTerm } from './types';
import { ALL_KATA } from './kata';
import { ALL_TERMS } from './vocabulary';
import { linkVocabulary } from './vocabularyLinks';

function term(id: number, termText: string, japaneseName: string, hiraganaName: string): VocabularyTerm {
  return { id, term: termText, japaneseName, hiraganaName, shortDescription: '', definition: '', category: 'general' };
}

const TERMS = [term(1, 'Kata', '型', 'かた'), term(7, 'Zenkutsu-dachi', '前屈立', 'ぜんくつだち')];

describe('linkVocabulary', () => {
  it('links the first occurrence of each term', () => {
    const text = 'This kata uses the zenkutsu-dachi stance and demonstrates basic kata principles.';
    const segments = linkVocabulary(text, TERMS);
    const links = segments.filter((s) => s.termId !== undefined);
    expect(links).toEqual([
      { text: 'kata', termId: 1 },
      { text: 'zenkutsu-dachi', termId: 7 },
    ]);
    expect(segments.map((s) => s.text).join('')).toBe(text);
  });

  it('only links whole words', () => {
    const segments = linkVocabulary('katana', TERMS);
    expect(segments).toEqual([{ text: 'katana' }]);
  });

  it('matches diacritic-insensitively', () => {
    const terms = [term(3, 'Kōkutsu-dachi', '後屈立', 'こうくつだち')];
    const text = 'Step back into Kokutsu-dachi.';
    const segments = linkVocabulary(text, terms);
    expect(segments).toContainEqual({ text: 'Kokutsu-dachi', termId: 3 });
    expect(segments.map((s) => s.text).join('')).toBe(text);
  });
});

describe('linkVocabulary with the real data', () => {
  it('links Te-ashi-dōji in Heian Yondan move 1', () => {
    const yondan = ALL_KATA.find((kata) => kata.kataNumber === 4)!;
    const text = yondan.moves.find((move) => move.sequence === 1)!.subMoves[0].description;
    const linked = linkVocabulary(text, ALL_TERMS).filter((segment) => segment.termId !== undefined);
    expect(linked.map((segment) => segment.text)).toContain('Te-ashi-dōji');
  });
});

describe('linkVocabulary: hitai-mae', () => {
  it('links hitai-mae in the Heian Nidan technique names', () => {
    const nidan = ALL_KATA.find((kata) => kata.kataNumber === 2)!;
    const technique = nidan.moves.find((move) => move.sequence === 1)!.subMoves[1].technique;
    const linked = linkVocabulary(technique, ALL_TERMS).filter((segment) => segment.termId !== undefined);
    expect(linked.map((segment) => segment.text)).toContain('hitai-mae');
  });
});

describe('linkVocabulary: kaishu', () => {
  it('links Kaishu in the Heian Yondan technique names', () => {
    const yondan = ALL_KATA.find((kata) => kata.kataNumber === 4)!;
    const technique = yondan.moves.find((move) => move.sequence === 1)!.subMoves[0].technique;
    const linked = linkVocabulary(technique, ALL_TERMS).filter((segment) => segment.termId !== undefined);
    expect(linked.map((segment) => segment.text)).toContain('Kaishu');
  });
});

describe('linkVocabulary: barai and mawashi-uchi', () => {
  it('links both in Heian Yondan 11.2 and keeps compound terms whole', () => {
    const yondan = ALL_KATA.find((kata) => kata.kataNumber === 4)!;
    const technique = yondan.moves.find((move) => move.sequence === 11)!.subMoves[1].technique;
    const linked = linkVocabulary(technique, ALL_TERMS).filter((segment) => segment.termId !== undefined);
    expect(linked.map((segment) => segment.text)).toEqual(expect.arrayContaining(['barai', 'Mawashi-uchi']));
    // "Soto-mawashi-uchi" still links to its own entry, not to Mawashi-uchi.
    const soto = linkVocabulary('Migi soto-mawashi-uchi', ALL_TERMS).find((segment) => segment.text.includes('mawashi'))!;
    expect(soto.termId).toBeDefined();
    expect(soto.text).toBe('soto-mawashi-uchi');
  });
});

describe('linkVocabulary: hiza age-ate and shihon-nukite', () => {
  const linkedTexts = (text: string) =>
    linkVocabulary(text, ALL_TERMS)
      .filter((segment) => segment.termId !== undefined)
      .map((segment) => segment.text);

  it('links them in the kata technique names', () => {
    expect(linkedTexts('Migi hiza age-ate')).toContain('hiza age-ate');
    expect(linkedTexts('Migi chūdan shihon-nukite')).toContain('shihon-nukite');
  });
});
