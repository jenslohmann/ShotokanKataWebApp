// Quiz question generation (generate*Questions in Services/QuizDataService.swift).
import { kiaiMoveNumbers, moveLabel } from '../kata';
import { rankSortOrder } from '../ranks';
import type { Kata, KataMove, KataSubMove } from '../types';
import { pick, randInt, shuffle, type Rng } from './random';
import { STATIC_QUESTIONS } from './staticQuestions';
import type { QuestionCategory, QuestionType, QuizConfig, QuizQuestion } from './types';

function movesCountQuestion(kata: Kata, katas: Kata[], rng: Rng): QuizQuestion {
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
    question: `How many moves are in ${kata.name}?`,
    options,
    correctAnswerIndex: options.indexOf(String(correct)),
    category: 'sequences',
    type: 'kata_moves_count',
    requiredRank: kata.beltRank,
    explanation: `${kata.name} contains ${correct} moves in total.`,
    relatedKataNames: [kata.name],
  };
}

function kiaiQuestion(kata: Kata): QuizQuestion | null {
  const moves = kiaiMoveNumbers(kata);
  if (moves.length === 0) return null;
  const parts = moves.map((move) => `move ${move}`).join(' and ');
  return {
    id: `kata_kiai_selection-${kata.kataNumber}`,
    question: `Select the moves where the karateka should say kiai in ${kata.name}:`,
    options: [],
    correctAnswerIndex: 0,
    category: 'sequences',
    type: 'kata_kiai_selection',
    requiredRank: kata.beltRank,
    explanation: `In ${kata.name}, kiai is performed on ${parts}.`,
    relatedKataNames: [kata.name],
    kataNumber: kata.kataNumber,
    correctMoves: moves,
  };
}

const isRei = (move: KataMove) => move.sequenceName === 'Rei';

interface SubMoveQuestionSpec {
  type: QuestionType;
  field: (subMove: KataSubMove) => string;
  question: (kataName: string, label: string) => string;
  explanation: (kataName: string, label: string, correct: string) => string;
}

function subMoveQuestions(katas: Kata[], spec: SubMoveQuestionSpec, rng: Rng): QuizQuestion[] {
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
          question: spec.question(kata.name, label),
          options,
          correctAnswerIndex: options.indexOf(correct),
          category: 'techniques',
          type: spec.type,
          requiredRank: kata.beltRank,
          explanation: spec.explanation(kata.name, label, correct),
          relatedKataNames: [kata.name],
        });
      });
  }
  return questions;
}

export function generateAllQuestions(katas: Kata[], rng: Rng = Math.random): QuizQuestion[] {
  const movesCount = katas.map((kata) => movesCountQuestion(kata, katas, rng));
  const kiai = katas.map(kiaiQuestion).filter((question): question is QuizQuestion => question !== null);
  const techniques = subMoveQuestions(
    katas,
    {
      type: 'kata_techniques',
      field: (subMove) => subMove.technique,
      question: (name, label) => `What technique is used in ${name} in step ${label}?`,
      explanation: (name, label, correct) => `The technique used in ${name} step ${label} is ${correct}.`,
    },
    rng,
  );
  const stances = subMoveQuestions(
    katas,
    {
      type: 'kata_stances',
      field: (subMove) => subMove.stance,
      question: (name, label) => `What stance is used in ${name} in step ${label}?`,
      explanation: (name, label, correct) => `The stance used in ${name} step ${label} is ${correct}.`,
    },
    rng,
  );
  return [...STATIC_QUESTIONS, ...movesCount, ...kiai, ...techniques, ...stances];
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
