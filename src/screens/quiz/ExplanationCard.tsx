import { Icon } from '../../components/Icon';
import type { QuizQuestion } from '../../domain/quiz/types';
import { useT } from '../../state/SettingsContext';
import './ExplanationCard.css';

export function ExplanationCard({ question }: { question: QuizQuestion }) {
  const t = useT();
  if (!question.explanation) return null;
  const related = question.relatedKataNames ?? [];
  return (
    <section className="explanation-card" aria-live="polite">
      <h2 className="explanation-card__title">
        <Icon name="lightbulb" className="explanation-card__icon" />
        {t('quiz.explanation')}
      </h2>
      <p className="explanation-card__text">{question.explanation}</p>
      {related.length > 0 && (
        <>
          <h3 className="explanation-card__related">{t('quiz.relatedKata')}</h3>
          <ul className="explanation-card__kata">
            {related.map((name) => (
              <li key={name} className="explanation-card__chip">
                {name}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
