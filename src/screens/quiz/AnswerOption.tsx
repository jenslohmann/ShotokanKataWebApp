import { Icon } from '../../components/Icon';
import './AnswerOption.css';

interface AnswerOptionProps {
  letter: string;
  text: string;
  selected: boolean;
  correct: boolean;
  revealed: boolean;
  onSelect(): void;
}

function stateClass({ selected, correct, revealed }: AnswerOptionProps): string {
  if (revealed && correct) return 'answer-option--correct';
  if (revealed && selected) return 'answer-option--wrong';
  if (!revealed && selected) return 'answer-option--selected';
  return '';
}

export function AnswerOption(props: AnswerOptionProps) {
  const { letter, text, selected, correct, revealed, onSelect } = props;
  return (
    <button
      type="button"
      className={`answer-option ${stateClass(props)}`.trim()}
      aria-pressed={selected}
      disabled={revealed}
      onClick={onSelect}
    >
      <span className="answer-option__letter" aria-hidden="true">
        {letter}
      </span>
      <span className="answer-option__text">{text}</span>
      {revealed && (
        <Icon
          name={correct ? 'checkCircle' : 'xCircle'}
          size={22}
          className={correct ? 'answer-option__mark--correct' : 'answer-option__mark--wrong'}
        />
      )}
    </button>
  );
}
