import { Icon } from '../../components/Icon';
import { ALL_KATA, directionLabel, moveHasKiai, moveLabel, sortedMoves } from '../../domain/kata';
import { answerOutcome } from '../../domain/quiz/reducer';
import type { QuizQuestion } from '../../domain/quiz/types';
import { useQuiz } from '../../state/QuizContext';
import { useT } from '../../state/SettingsContext';
import { KiaiBadge } from '../kata/KiaiBadge';
import './KiaiSelection.css';

/** Kiai move selection (KataKiaiSelectionView.swift). */
export function KiaiSelection({ question }: { question: QuizQuestion }) {
  const t = useT();
  const { state, dispatch } = useQuiz();
  const kata = ALL_KATA.find((item) => item.kataNumber === question.kataNumber);
  if (!kata) return null;
  const revealed = state.revealed;
  const correct = revealed && answerOutcome(question, state.answers[state.index]) === 'correct';

  return (
    <div className="kiai-selection">
      <section className="quiz-play__card">
        <h1 className="kiai-selection__question">{question.question}</h1>
        <p className="kiai-selection__instruction">{t('quiz.kiaiInstruction')}</p>
        <ul className="kiai-selection__moves">
          {sortedMoves(kata).map((move) => {
            const selected = state.selectedMoves.includes(move.sequence);
            const first = move.subMoves[0];
            return (
              <li key={move.sequence}>
                <button
                  type="button"
                  className={`kiai-move${selected ? ' kiai-move--selected' : ''}`}
                  aria-pressed={selected}
                  disabled={revealed}
                  onClick={() => dispatch({ type: 'TOGGLE_MOVE', sequence: move.sequence })}
                >
                  <span className="kiai-move__number">{moveLabel(move)}</span>
                  <span className="kiai-move__info">
                    <span className="kiai-move__name">{move.japaneseName}</span>
                    <span className="kiai-move__meta">
                      {first && (
                        <span className="kiai-move__stance">
                          {first.stance}
                          {first.stanceHiragana && ` (${first.stanceHiragana})`}
                        </span>
                      )}
                      <span className="kiai-move__direction">{directionLabel(move.direction, (point) => t(`compass.${point}`))}</span>
                      {revealed && moveHasKiai(move) && <KiaiBadge />}
                    </span>
                  </span>
                  <Icon
                    name={selected ? 'checkCircle' : 'circle'}
                    size={22}
                    className={selected ? 'kiai-move__check--on' : 'kiai-move__check'}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </section>
      {revealed && (
        <section className="kiai-selection__result" aria-live="polite">
          <p className={`kiai-selection__verdict ${correct ? 'kiai-selection__verdict--correct' : 'kiai-selection__verdict--wrong'}`}>
            <Icon name={correct ? 'checkCircle' : 'xCircle'} size={22} />
            {correct ? t('quiz.correct') : t('quiz.incorrect')}
          </p>
          {!correct && (
            <p className="kiai-selection__answer">
              {t('quiz.correctAnswer', { answer: (question.correctMoves ?? []).join(', ') })}
            </p>
          )}
          {question.explanation && <p className="kiai-selection__explanation">{question.explanation}</p>}
        </section>
      )}
    </div>
  );
}
