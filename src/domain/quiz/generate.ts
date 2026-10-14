// Quiz question generation (generate*Questions in Services/QuizDataService.swift).
import { formatList, translate, type TKey } from '../../i18n';
import { SOURCE_LANG, type Lang } from '../../i18n/languages';
import { kiaiMoveNumbers, moveLabel } from '../kata';
import { rankSortOrder } from '../ranks';
import type { Kata, KataMove, KataSubMove } from '../types';
import { pick, randInt, shuffle, type Rng } from './random';
import { localizeStaticQuestion, STATIC_QUESTIONS } from './staticQuestions';
import type { QuestionCategory, QuestionType, QuizConfig, QuizQuestion } from './types';

function movesCountQuestion(kata: Kata, katas: Kata[], rng: Rng, lang: Lang): QuizQuestion {
  const correct = kata.numberOfMoves;
  const wrong = new Set<number>();
  const add = (value: number | undefined) => {
    if (value !== undefined && value >= 1 && value !== correct && wrong.size < 3) wrong.add(value);
  };
  add(Math.max(1, correct + (pick([-3, -2, -1, 1, 2, 3], rng) ?? 1)));
  add(pick(katas.filter((other) => other !== kata), rng)?.numberOfMoves);
  add(randInt(15, 30, rng));
  while (wrong.size < 3) add(randInt(Math.max(1, correct - 5), correct + 5, rng));

  const options = shuffle([correct, ...wrong].map(String), rng);
  return {
    id: `kata_moves_count-${kata.kataNumber}`,
    question: translate(lang, 'quizGen.movesCount.question', { kata: kata.name }),
    options,
    correctAnswerIndex: options.indexOf(String(correct)),
    category: 'sequences',
    type: 'kata_moves_count',
    requiredRank: kata.beltRank,
    explanation: translate(lang, 'quizGen.movesCount.explanation', { kata: kata.name, count: correct }),
    relatedKataNames: [kata.name],
  };
}

function kiaiQuestion(kata: Kata, lang: Lang): QuizQuestion | null {
  const moves = kiaiMoveNumbers(kata);
  if (moves.length === 0) return null;
  const parts = formatList(
    lang,
    moves.map((move) => translate(lang, 'quizGen.kiai.move', { move })),
  );
  return {
    id: `kata_kiai_selection-${kata.kataNumber}`,
    question: translate(lang, 'quizGen.kiai.question', { kata: kata.name }),
    options: [],
    correctAnswerIndex: 0,
    category: 'sequences',
    type: 'kata_kiai_selection',
    requiredRank: kata.beltRank,
    explanation: translate(lang, 'quizGen.kiai.explanation', { kata: kata.name, moves: parts }),
    relatedKataNames: [kata.name],
    kataNumber: kata.kataNumber,
    correctMoves: moves,
  };
}

const isRei = (move: KataMove) => move.sequenceName === 'Rei';

interface SubMoveQuestionSpec {
  type: QuestionType;
  field: (subMove: KataSubMove) => string;
  question: TKey;
  explanation: TKey;
}

function subMoveQuestions(katas: Kata[], spec: SubMoveQuestionSpec, rng: Rng, lang: Lang): QuizQuestion[] {
  const all = new Set<string>();
  for (const kata of katas) {
    for (const move of kata.moves) {
      if (isRei(move)) continue;
      for (const subMove of move.subMoves) all.add(spec.field(subMove));
    }
  }
  const pool = [...all];
  if (pool.length < 5) return [];

  const questions: QuizQuestion[] = [];
  for (const kata of katas) {
    const eligible = kata.moves.filter((move) => move.subMoves.length > 0 && !isRei(move));
    shuffle(eligible, rng)
      .slice(0, 2)
      .forEach((move, n) => {
        const correct = spec.field(move.subMoves[0]);
        const wrong = shuffle(pool.filter((value) => value !== correct), rng).slice(0, 4);
        const options = shuffle([correct, ...wrong], rng);
        const label = moveLabel(move);
        questions.push({
          id: `${spec.type}-${kata.kataNumber}-${n}`,
          question: translate(lang, spec.question, { kata: kata.name, step: label }),
          options,
          correctAnswerIndex: options.indexOf(correct),
          category: 'techniques',
          type: spec.type,
          requiredRank: kata.beltRank,
          explanation: translate(lang, spec.explanation, { kata: kata.name, step: label, answer: correct }),
          relatedKataNames: [kata.name],
        });
      });
  }
  return questions;
}

/** All questions, with text in `lang` (Japanese terms and kata names stay as in the data). */
export function generateAllQuestions(katas: Kata[], rng: Rng = Math.random, lang: Lang = SOURCE_LANG): QuizQuestion[] {
  const movesCount = katas.map((kata) => movesCountQuestion(kata, katas, rng, lang));
  const kiai = katas.map((kata) => kiaiQuestion(kata, lang)).filter((question): question is QuizQuestion => question !== null);
  const techniques = subMoveQuestions(
    katas,
    {
      type: 'kata_techniques',
      field: (subMove) => subMove.technique,
      question: 'quizGen.technique.question',
      explanation: 'quizGen.technique.explanation',
    },
    rng,
    lang,
  );
  const stances = subMoveQuestions(
    katas,
    {
      type: 'kata_stances',
      field: (subMove) => subMove.stance,
      question: 'quizGen.stance.question',
      explanation: 'quizGen.stance.explanation',
    },
    rng,
    lang,
  );
  const statics = STATIC_QUESTIONS.map((question) => localizeStaticQuestion(question, lang));
  return [...statics, ...movesCount, ...kiai, ...techniques, ...stances];
}

export function questionsFor(all: QuizQuestion[], rank: string, category: QuestionCategory | null): QuizQuestion[] {
  const limit = rankSortOrder(rank);
  return all
    .filter((question) => {
      const order = rankSortOrder(question.requiredRank);
      return order !== Number.MAX_SAFE_INTEGER && order <= limit;
    })
    .filter((question) => category === null || question.category === category);
}

export function pickQuizQuestions(all: QuizQuestion[], config: QuizConfig, rng: Rng = Math.random): QuizQuestion[] {
  return shuffle(questionsFor(all, config.rank, config.category), rng).slice(0, config.numberOfQuestions);
}
