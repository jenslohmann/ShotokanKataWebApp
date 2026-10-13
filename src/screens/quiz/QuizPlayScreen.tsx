import { useEffect, useRef, useState } from 'react';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Icon } from '../../components/Icon';
import { currentQuestion } from '../../domain/quiz/reducer';
import { parseHash } from '../../router/router';
import { goBack, navigate } from '../../router/useRoute';
import { useQuiz } from '../../state/QuizContext';
import { useT } from '../../state/SettingsContext';
import { KiaiSelection } from './KiaiSelection';
import { QuestionCard } from './QuestionCard';
import { QuizNavButtons } from './QuizNavButtons';
import { QuizPaused } from './QuizPaused';
import { QuizProgressHeader } from './QuizProgressHeader';
import { QuizResults } from './QuizResults';
import './QuizPlayScreen.css';

/** Keeps the timer in sync with a wall-clock deadline (robust against throttled background tabs). */
function useQuizTimer() {
  const { state, dispatch } = useQuiz();
  const running = state.status === 'inProgress' && state.config.timed;
  const remainingRef = useRef(state.timeRemainingSec);
  remainingRef.current = state.timeRemainingSec;

  useEffect(() => {
    if (!running) return;
    const deadline = Date.now() + remainingRef.current * 1000;
    const id = setInterval(() => {
      const now = Date.now();
      dispatch({ type: 'SYNC_TIME', remaining: Math.max(0, Math.ceil((deadline - now) / 1000)), now });
    }, 1000);
    return () => clearInterval(id);
  }, [running, dispatch]);
}

export function QuizPlayScreen() {
  const t = useT();
  const { state, dispatch } = useQuiz();
  const [confirmExit, setConfirmExit] = useState(false);
  useQuizTimer();

  useEffect(() => {
    // E.g. a page reload on #/quiz/play. Only redirect while we are still on the quiz route.
    if (state.status === 'notStarted' && parseHash(window.location.hash).name === 'quizPlay') {
      navigate({ name: 'quizMenu' }, { replace: true });
    }
  }, [state.status]);

  // QuizProvider resets the quiz once the route leaves #/quiz/play.
  const leave = () => {
    setConfirmExit(false);
    goBack({ name: 'quizMenu' });
  };

  const question = currentQuestion(state);
  const active = state.status === 'inProgress' || state.status === 'paused';

  return (
    <div className="quiz-play">
      <header className="quiz-play__bar">
        <div>
          {active && (
            <button type="button" className="quiz-play__bar-button quiz-play__bar-button--exit" onClick={() => setConfirmExit(true)}>
              {t('quiz.exit')}
            </button>
          )}
        </div>
        <div>
          {state.status === 'inProgress' && state.config.timed && (
            <button
              type="button"
              className="quiz-play__bar-button"
              aria-label={t('quiz.pause')}
              onClick={() => dispatch({ type: 'PAUSE' })}
            >
              <Icon name="pause" size={22} />
            </button>
          )}
          {state.status === 'completed' && (
            <button type="button" className="quiz-play__bar-button quiz-play__bar-button--done" onClick={leave}>
              {t('common.done')}
            </button>
          )}
        </div>
      </header>

      {state.status === 'inProgress' && question && (
        <>
          <QuizProgressHeader />
          <div className="quiz-play__body">
            {question.type === 'kata_kiai_selection' ? (
              <KiaiSelection key={question.id} question={question} />
            ) : (
              <QuestionCard key={question.id} question={question} />
            )}
          </div>
          <QuizNavButtons />
        </>
      )}
      {state.status === 'paused' && <QuizPaused />}
      {state.status === 'completed' && (
        <>
          <QuizProgressHeader />
          <QuizResults />
        </>
      )}

      <ConfirmDialog
        open={confirmExit}
        title={t('quiz.exitTitle')}
        message={t('quiz.exitMessage')}
        cancelLabel={t('quiz.continue')}
        confirmLabel={t('quiz.exit')}
        onCancel={() => setConfirmExit(false)}
        onConfirm={leave}
      />
    </div>
  );
}
