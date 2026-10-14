// Checks the content translations in src/data/i18n/<lang>/ against the English source data.
import { LANGUAGES, SOURCE_LANG } from '../i18n/languages';
import { STATIC_QUESTIONS, staticQuestionTranslation } from './quiz/staticQuestions';
import { ALL_TERMS, findTerm, untranslatedTermIds } from './vocabulary';

const TRANSLATED = LANGUAGES.map((language) => language.code).filter((code) => code !== SOURCE_LANG);
const FIELDS = ['shortDescription', 'definition', 'componentBreakdown'] as const;

/** Kanji and kana, which must survive translation unchanged. */
const japaneseChars = (text: string) => [...text.matchAll(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]+/gu)].map((m) => m[0]).sort();
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
        const english = source[field] ?? '';
        const text = translated[field] ?? '';
        if (japaneseChars(text).join() !== japaneseChars(english).join()) problems.push(`${source.id} ${field}: kanji/kana differ`);
        // Substring, so Danish compounds like "chūdan-niveau" are fine.
        for (const word of macronWords(english)) {
          if (!text.toLowerCase().includes(word)) problems.push(`${source.id} ${field}: "${word}" missing`);
        }
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
});
