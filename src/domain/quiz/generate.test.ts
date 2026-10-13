import { ALL_KATA } from '../kata';
import { rankSortOrder } from '../ranks';
import { generateAllQuestions, pickQuizQuestions, questionsFor } from './generate';
import { mulberry32 } from './random';
import { DEFAULT_QUIZ_CONFIG } from './types';

describe('generateAllQuestions', () => {
  const all = generateAllQuestions(ALL_KATA, mulberry32(42));

  it('includes the static and moves-count questions', () => {
    expect(all.filter((q) => q.type === 'static_question')).toHaveLength(6);
    expect(all.filter((q) => q.type === 'kata_moves_count')).toHaveLength(ALL_KATA.length);
  });

  it('builds valid multiple-choice options', () => {
    for (const question of all.filter((q) => q.type !== 'kata_kiai_selection')) {
      expect(new Set(question.options).size).toBe(question.options.length);
      expect(question.correctAnswerIndex).toBeGreaterThanOrEqual(0);
      expect(question.correctAnswerIndex).toBeLessThan(question.options.length);
      if (question.type === 'kata_techniques' || question.type === 'kata_stances') {
        expect(question.options).toHaveLength(5);
      }
      if (question.type === 'kata_moves_count') {
        expect(question.options).toHaveLength(4);
        expect(question.options.every((option) => Number(option) >= 1)).toBe(true);
      }
    }
  });

  it('never asks about Rei', () => {
    expect(all.some((q) => q.question.includes('step Rei'))).toBe(false);
  });

  it('has unique ids', () => {
    expect(new Set(all.map((q) => q.id)).size).toBe(all.length);
  });

  it('creates a kiai question for Heian Yondan', () => {
    const kiai = all.find((q) => q.type === 'kata_kiai_selection' && q.kataNumber === 4);
    expect(kiai?.correctMoves?.length).toBeGreaterThan(0);
  });

  it('filters by rank and category', () => {
    const beginner = questionsFor(all, '9_kyu', null);
    expect(beginner).toHaveLength(2);
    expect(beginner.every((q) => rankSortOrder(q.requiredRank) <= rankSortOrder('9_kyu'))).toBe(true);
    expect(questionsFor(all, '1_dan', 'terminology')).toHaveLength(2);
  });

  it('picks at most numberOfQuestions', () => {
    const picked = pickQuizQuestions(all, { ...DEFAULT_QUIZ_CONFIG, rank: '1_dan', numberOfQuestions: 5 }, mulberry32(1));
    expect(picked).toHaveLength(5);
  });
});
