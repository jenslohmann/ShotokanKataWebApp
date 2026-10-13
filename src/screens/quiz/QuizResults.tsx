import { Icon } from '../../components/Icon';
import { rankLabel } from '../../i18n/labels';
import { navigate } from '../../router/useRoute';
import { useQuiz } from '../../state/QuizContext';
import { useT } from '../../state/SettingsContext';
import './QuizResults.css';

function scoreColor(score: number): string {
  if (score >= 90) return 'green';
  if (score >= 70) return 'accent';
  if (score >= 50) return 'orange';
  return 'red';
}

export function formatDuration(totalSec: number): string {
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

export function QuizResults() {
  const t = useT();
  const { state } = useQuiz();
  const result = state.result;
  if (!result) return null;
  const color = scoreColor(result.scorePercent);

  const rows: { label: string; value: string; color: string }[] = [
    { label: t('quiz.correctAnswers'), value: `${result.correct}/${result.total}`, color: 'green' },
    { label: t('quiz.incorrectAnswers'), value: String(result.incorrect), color: 'red' },
  ];
  if (result.skipped > 0) rows.push({ label: t('quiz.skippedQuestions'), value: String(result.skipped), color: 'orange' });
  rows.push({ label: t('quiz.timeSpent'), value: formatDuration(result.timeSpentSec), color: 'accent' });
  rows.push({ label: t('quiz.rankLevel'), value: rankLabel(t, result.rank), color: 'purple' });
  if (result.category) rows.push({ label: t('quiz.categoryChip'), value: t(`quizCategory.${result.category}`), color: 'indigo' });

  // iOS switches to the Kata tab; QuizProvider resets the quiz once the route leaves #/quiz/play.
  const backToMenu = () => navigate({ name: 'kataList' });

  return (
    <div className="quiz-results">
      <Icon name={result.passed ? 'checkCircle' : 'xCircle'} size={64} className={`quiz-results--${color}`} />
      <h1 className="quiz-results__title">{t('quiz.complete')}</h1>
      <p className={`quiz-results__score quiz-results--${color}`}>{t('quiz.score', { score: Math.floor(result.scorePercent) })}</p>
      <dl className="quiz-results__stats">
        {rows.map((row) => (
          <div key={row.label} className="quiz-results__row">
            <dt>{row.label}</dt>
            <dd className={`quiz-results__value quiz-results--${row.color}`}>{row.value}</dd>
          </div>
        ))}
      </dl>
      <button type="button" className="quiz-results__back" onClick={backToMenu}>
        <Icon name="home" size={20} />
        {t('quiz.backToMenu')}
      </button>
    </div>
  );
}
