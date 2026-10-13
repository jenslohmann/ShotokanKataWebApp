import type { QuizQuestion } from '../../domain/quiz/types';
import { useQuiz } from '../../state/QuizContext';
import { useT } from '../../state/SettingsContext';
import { AnswerOption } from './AnswerOption';
import { ExplanationCard } from './ExplanationCard';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function QuestionCard({ question }: { question: QuizQuestion }) {
  const t = useT();
  const { state, dispatch } = useQuiz();
  return (
    <div className="quiz-play__stack">
      <section className="quiz-play__card">
        <p className="quiz-play__caption">{t('quiz.questionLabel')}</p>
        <h1 className="quiz-play__question">{question.question}</h1>
        <ul className="quiz-play__options">
          {question.options.map((option, index) => (
            <li key={option}>
              <AnswerOption
                letter={LETTERS[index] ?? String(index + 1)}
                text={option}
                selected={state.selectedIndex === index}
                correct={index === question.correctAnswerIndex}
                revealed={state.revealed}
                onSelect={() => dispatch({ type: 'SELECT_OPTION', index })}
              />
            </li>
          ))}
        </ul>
      </section>
      {state.revealed && <ExplanationCard question={question} />}
    </div>
  );
}
