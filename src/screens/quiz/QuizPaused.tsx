import { Icon } from '../../components/Icon';
import { useQuiz } from '../../state/QuizContext';
import { useT } from '../../state/SettingsContext';
import './QuizPaused.css';

export function QuizPaused() {
  const t = useT();
  const { dispatch } = useQuiz();
  return (
    <div className="quiz-paused">
      <Icon name="pause" size={64} className="quiz-paused__icon" />
      <h1 className="quiz-paused__title">{t('quiz.paused')}</h1>
      <p className="quiz-paused__text">{t('quiz.pausedMessage')}</p>
      <button type="button" className="quiz-paused__resume" onClick={() => dispatch({ type: 'RESUME' })}>
        <Icon name="play" size={20} />
        {t('quiz.resume')}
      </button>
    </div>
  );
}
