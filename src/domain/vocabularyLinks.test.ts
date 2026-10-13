import type { VocabularyTerm } from './types';
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
