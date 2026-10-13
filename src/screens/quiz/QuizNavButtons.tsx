import { Icon } from '../../components/Icon';
import { canGoBack, hasAnswerSelected, isLastQuestion } from '../../domain/quiz/reducer';
import { useQuiz } from '../../state/QuizContext';
import { useT } from '../../state/SettingsContext';
import './QuizNavButtons.css';

export function QuizNavButtons() {
  const t = useT();
  const { state, dispatch } = useQuiz();
  const { revealed } = state;
  const canSubmit = hasAnswerSelected(state);

  let main;
  if (!revealed) {
    main = (
      <button type="button" className="quiz-nav__main" disabled={!canSubmit} onClick={() => dispatch({ type: 'SUBMIT' })}>
        {t('quiz.submit')}
        <Icon name="check" size={18} />
      </button>
    );
  } else {
    const last = isLastQuestion(state);
    main = (
      <button type="button" className="quiz-nav__main" onClick={() => dispatch({ type: 'NEXT', now: Date.now() })}>
        {last ? t('quiz.finish') : t('quiz.next')}
        <Icon name={last ? 'flag' : 'chevronRight'} size={18} />
      </button>
    );
  }

  return (
    <div className="quiz-nav">
      <div className="quiz-nav__row">
        {canGoBack(state) && !revealed && (
          <button type="button" className="quiz-nav__previous" onClick={() => dispatch({ type: 'PREVIOUS' })}>
            <Icon name="chevronLeft" size={18} />
            {t('quiz.previous')}
          </button>
        )}
        {main}
      </div>
      {!revealed && (
        <button type="button" className="quiz-nav__skip" onClick={() => dispatch({ type: 'SKIP', now: Date.now() })}>
          {t('quiz.skip')}
        </button>
      )}
    </div>
  );
}
