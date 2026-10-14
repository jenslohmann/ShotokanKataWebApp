// Checks the content translations in src/data/i18n/<lang>/ against the English source data.
import { LANGUAGES, SOURCE_LANG } from '../i18n/languages';
import { ALL_KATA } from './kata';
import { kataTranslation, localizeKata, translatedKataNumbers, translationProblems, UNMATCHED_KATA_TRANSLATIONS } from './kataTranslations';
import { STATIC_QUESTIONS, staticQuestionTranslation } from './quiz/staticQuestions';
import { ALL_TERMS, findTerm, untranslatedTermIds } from './vocabulary';

const TRANSLATED = LANGUAGES.map((language) => language.code).filter((code) => code !== SOURCE_LANG);
const FIELDS = ['shortDescription', 'definition', 'componentBreakdown'] as const;

/** Kanji and kana, which must survive translation unchanged. */
const japaneseChars = (text: string) => [...text.matchAll(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]+/gu)].map((m) => m[0]).sort();
/** Problems when a translated text lost kanji/kana, a macron term or a KIAI marker of the English text. */
function preservationProblems(label: string, english: string, text: string): string[] {
  const problems: string[] = [];
  if (japaneseChars(text).join() !== japaneseChars(english).join()) problems.push(`${label}: kanji/kana differ`);
  // Substring, so Danish compounds like "chūdan-niveau" are fine.
  for (const word of macronWords(english)) if (!text.toLowerCase().includes(word)) problems.push(`${label}: "${word}" missing`);
  if ((english.match(/KIAI/g) ?? []).length !== (text.match(/KIAI/g) ?? []).length) problems.push(`${label}: KIAI count differs`);
  return problems;
}

/** Romanized Japanese words written with macrons (e.g. "Shōtōkan", "kōsa-dachi"). */
const macronWords = (text: string) => [...text.matchAll(/[\p{L}-]*[āēīōū][\p{L}-]*/giu)].map((m) => m[0].toLowerCase());

describe.each(TRANSLATED)('%s content translations', (lang) => {
  it('translate every vocabulary term', () => {
    expect(untranslatedTermIds(lang)).toEqual([]);
  });

  it('keep kanji, kana and macron terms exactly as in English', () => {
    const problems: string[] = [];
    for (const source of ALL_TERMS) {
      const translated = findTerm(source.id, lang)!;
      for (const field of FIELDS) {
        problems.push(...preservationProblems(`${source.id} ${field}`, source[field] ?? '', translated[field] ?? ''));
      }
    }
    expect(problems).toEqual([]);
  });

  it('translate every static quiz question with the same number of options', () => {
    for (const question of STATIC_QUESTIONS) {
      const text = staticQuestionTranslation(question.id, lang);
      expect(text?.question, question.id).toBeTruthy();
      expect(text?.options, question.id).toHaveLength(question.options.length);
    }
  });

  it('have kata translation files that match a kata file', () => {
    expect(UNMATCHED_KATA_TRANSLATIONS).toEqual([]);
  });

  it('translate every text of a translated kata, keeping Japanese terms and KIAI', () => {
    for (const kataNumber of translatedKataNumbers(lang)) {
      const source = ALL_KATA.find((kata) => kata.kataNumber === kataNumber)!;
      const translation = kataTranslation(kataNumber, lang)!;
      expect(translationProblems(source, translation), `kata ${kataNumber}`).toEqual({ missing: [], unknown: [] });

      const translated = localizeKata(source, lang);
      expect(translated.contentLang).toBe(lang);
      const problems = preservationProblems(`kata ${kataNumber} description`, source.description, translated.description);
      source.moves.forEach((move, m) =>
        move.subMoves.forEach((subMove, n) =>
          problems.push(
            ...preservationProblems(`kata ${kataNumber} move ${move.sequence}.${subMove.order}`, subMove.description, translated.moves[m].subMoves[n].description),
          ),
        ),
      );
      expect(problems).toEqual([]);
    }
  });

  it('translate every kata', () => {
    expect(translatedKataNumbers(lang)).toEqual(ALL_KATA.map((kata) => kata.kataNumber));
  });
});
