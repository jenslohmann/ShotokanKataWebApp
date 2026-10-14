// Copied verbatim from generateStaticQuestions() in Services/QuizDataService.swift.
// Translations: src/data/i18n/<lang>/quiz.json, keyed by question id.
import { SOURCE_LANG, type Lang } from '../../i18n/languages';
import type { QuizQuestion } from './types';

export const STATIC_QUESTIONS: QuizQuestion[] = [
  {
    id: 'static-1',
    question: 'What is the first kata learned in Shōtōkan karate?',
    options: ['Heian Shodan', 'Heian Nidan', 'Tekki Shodan', 'Bassai Dai'],
    correctAnswerIndex: 0,
    category: 'kata_order',
    type: 'static_question',
    requiredRank: '9_kyu',
    explanation: 'Heian Shodan is traditionally the first kata taught to beginners in Shōtōkan karate.',
    relatedKataNames: ['Heian Shodan'],
  },
  {
    id: 'static-2',
    question: "What does 'Heian' mean in English?",
    options: ['Peace', 'Strength', 'Power', 'Balance'],
    correctAnswerIndex: 0,
    category: 'terminology',
    type: 'static_question',
    requiredRank: '9_kyu',
    explanation: "Heian means 'peaceful mind' or 'peace' in Japanese.",
    relatedKataNames: ['Heian Shodan', 'Heian Nidan', 'Heian Sandan', 'Heian Yondan', 'Heian Godan'],
  },
  {
    id: 'static-3',
    question: 'Which kata is typically learned at 5th Kyū level?',
    options: ['Heian Godan', 'Tekki Shodan', 'Bassai Dai', 'Kankū Dai'],
    correctAnswerIndex: 1,
    category: 'ranks',
    type: 'static_question',
    requiredRank: '5_kyu',
    explanation: 'Tekki Shodan is traditionally taught at 5th Kyū (Brown Belt) level.',
    relatedKataNames: ['Tekki Shodan'],
  },
  {
    id: 'static-4',
    question: 'What stance is predominantly used in Tekki Shodan?',
    options: ['Zenkutsu-dachi', 'Kōkutsu-dachi', 'Kiba-dachi', 'Shiko-dachi'],
    correctAnswerIndex: 2,
    category: 'techniques',
    type: 'static_question',
    requiredRank: '5_kyu',
    explanation: 'Tekki Shodan is performed entirely in Kiba-dachi (horse riding stance).',
    relatedKataNames: ['Tekki Shodan'],
  },
  {
    id: 'static-5',
    question: 'Which kata is often considered the flagship kata of Shōtōkan?',
    options: ['Heian Shodan', 'Tekki Shodan', 'Bassai Dai', 'Empi'],
    correctAnswerIndex: 2,
    category: 'philosophy',
    type: 'static_question',
    requiredRank: '1_dan',
    explanation: 'Bassai Dai is often considered the flagship kata of Shōtōkan, representing the essence of the style.',
    relatedKataNames: ['Bassai Dai'],
  },
  {
    id: 'static-6',
    question: "What does 'Bassai' mean?",
    options: ['To storm a fortress', 'Flying swallow', 'Peaceful mind', 'Iron horse'],
    correctAnswerIndex: 0,
    category: 'terminology',
    type: 'static_question',
    requiredRank: '1_dan',
    explanation:
      "Bassai means 'to storm a fortress' or 'to penetrate a fortress', reflecting the powerful nature of this kata.",
    relatedKataNames: ['Bassai Dai'],
  },
];

type QuestionText = Pick<QuizQuestion, 'question' | 'options' | 'explanation'>;

const translationFiles = import.meta.glob('../../data/i18n/*/quiz.json', { eager: true, import: 'default' }) as Record<
  string,
  Record<string, QuestionText>
>;
const TRANSLATIONS = new Map(
  Object.entries(translationFiles).map(([path, translations]) => [/i18n\/([^/]+)\//.exec(path)![1], translations]),
);

export function staticQuestionTranslation(id: string, lang: Lang): QuestionText | undefined {
  return TRANSLATIONS.get(lang)?.[id];
}

/** The question in `lang` if a complete translation exists (same number of options), else English. */
export function localizeStaticQuestion(question: QuizQuestion, lang: Lang): QuizQuestion {
  if (lang === SOURCE_LANG) return question;
  const text = staticQuestionTranslation(question.id, lang);
  if (!text?.question || text.options?.length !== question.options.length) return question;
  return { ...question, question: text.question, options: text.options, explanation: text.explanation ?? question.explanation };
}
