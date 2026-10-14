import { ALL_KATA } from './kata';
import { localizeKata, translatedKataNumbers, translationProblems } from './kataTranslations';

describe('kata translations', () => {
  const heian = ALL_KATA.find((kata) => kata.kataNumber === 1)!;

  it('has Heian Shodan in Danish', () => {
    expect(translatedKataNumbers('da')).toContain(1);
    const danish = localizeKata(heian, 'da');
    expect(danish.contentLang).toBe('da');
    expect(danish.description).toMatch(/^Heian Shodan er den første kata/);
    // Only descriptions change; names and Japanese fields are untouched.
    expect(danish.name).toBe(heian.name);
    expect(danish.moves.map((move) => move.subMoves.map((sub) => [sub.technique, sub.stance]))).toEqual(
      heian.moves.map((move) => move.subMoves.map((sub) => [sub.technique, sub.stance])),
    );
  });

  it('keeps English for the source language', () => {
    expect(localizeKata(heian, 'en')).toEqual({ ...heian, contentLang: 'en' });
  });

  it('falls back to English when a translation is incomplete', () => {
    const problems = translationProblems(heian, { description: 'x', moves: { '1': { '1': 'y' }, '99': { '1': 'z' } } });
    expect(problems.missing).toContain('moves.-1.1');
    expect(problems.unknown).toEqual(['moves.99.1']);
  });
});
