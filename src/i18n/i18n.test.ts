import { da } from './da';
import { en } from './en';
import { detectLang, formatList, LANGUAGES, translate, type Messages, type TKey } from './index';

const MESSAGES: Record<string, Messages> = { en, da };
const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();

describe('i18n', () => {
  it('replaces placeholders', () => {
    expect(translate('en', 'quiz.questionProgress', { current: 1, total: 10 })).toBe('Question 1 of 10');
    expect(translate('da', 'quiz.questionProgress', { current: 2, total: 5 })).toBe('Spørgsmål 2 af 5');
  });

  it('has UI strings for every registered language', () => {
    expect(Object.keys(MESSAGES).sort()).toEqual(LANGUAGES.map((language) => language.code).sort());
  });

  for (const { code } of LANGUAGES) {
    it(`${code}: every key has a non-empty value with the same placeholders as English`, () => {
      for (const key of Object.keys(en) as TKey[]) {
        expect(MESSAGES[code][key], key).toBeTruthy();
        expect(placeholders(MESSAGES[code][key]), key).toEqual(placeholders(en[key]));
      }
    });
  }

  it('detects the first supported language in the browser preferences', () => {
    expect(detectLang(['de-DE', 'da-DK', 'en-US'])).toBe('da');
    expect(detectLang(['en-GB', 'da'])).toBe('en');
    expect(detectLang(['fr-FR'])).toBe('en');
    expect(detectLang([])).toBe('en');
  });

  it('joins lists with the translated "and"', () => {
    expect(formatList('en', ['9', '17'])).toBe('9 and 17');
    expect(formatList('da', ['9', '17'])).toBe('9 og 17');
    expect(formatList('da', ['9'])).toBe('9');
  });
});
