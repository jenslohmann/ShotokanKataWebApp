import { da } from './da';
import { en } from './en';
import { translate } from './index';

describe('i18n', () => {
  it('replaces placeholders', () => {
    expect(translate('en', 'quiz.questionProgress', { current: 1, total: 10 })).toBe('Question 1 of 10');
    expect(translate('da', 'quiz.questionProgress', { current: 2, total: 5 })).toBe('Spørgsmål 2 af 5');
  });

  it('has a non-empty Danish value for every key', () => {
    for (const key of Object.keys(en) as (keyof typeof en)[]) {
      expect(typeof da[key]).toBe('string');
      expect(da[key].length).toBeGreaterThan(0);
    }
  });
});
