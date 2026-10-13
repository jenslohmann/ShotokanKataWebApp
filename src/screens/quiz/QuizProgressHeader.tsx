import { Icon } from '../../components/Icon';
import { rankLabel } from '../../i18n/labels';
import { useQuiz } from '../../state/QuizContext';
import { useT } from '../../state/SettingsContext';
import './QuizProgressHeader.css';

export function formatClock(totalSec: number): string {
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function timeClass(remaining: number): string {
  if (remaining > 60) return '';
  return remaining > 30 ? ' quiz-progress__time--warning' : ' quiz-progress__time--danger';
}

export function QuizProgressHeader() {
  const t = useT();
  const { state } = useQuiz();
  const total = state.questions.length;
  const current = Math.min(state.index + 1, total);
  const remaining = state.timeRemainingSec;
  return (
    <div className="quiz-progress">
      <div className="quiz-progress__row">
        <span className="quiz-progress__count">{t('quiz.questionProgress', { current, total })}</span>
        {state.config.timed && remaining > 0 && (
          <span className={`quiz-progress__time${timeClass(remaining)}`} role="timer" aria-live="off">
            <Icon name="clock" size={14} />
            {formatClock(remaining)}
          </span>
        )}
      </div>
      <div
        className="quiz-progress__bar"
        role="progressbar"
        aria-label={t('quiz.questionProgress', { current, total })}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current}
      >
        <div className="quiz-progress__fill" style={{ width: `${total ? (current / total) * 100 : 0}%` }} />
      </div>
      <div className="quiz-progress__chips">
        <span className="quiz-progress__chip">
          <span className="quiz-progress__chip-title">{t('quiz.rank')}</span>
          <span className="quiz-progress__chip-value">{rankLabel(t, state.config.rank)}</span>
        </span>
        {state.config.category && (
          <span className="quiz-progress__chip quiz-progress__chip--green">
            <span className="quiz-progress__chip-title">{t('quiz.categoryChip')}</span>
            <span className="quiz-progress__chip-value">{t(`quizCategory.${state.config.category}`)}</span>
          </span>
        )}
      </div>
    </div>
  );
}
