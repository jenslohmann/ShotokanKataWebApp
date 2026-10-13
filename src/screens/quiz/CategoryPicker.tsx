import { Icon, type IconName } from '../../components/Icon';
import { QUESTION_CATEGORIES, type QuestionCategory } from '../../domain/quiz/types';
import { useT } from '../../state/SettingsContext';

export const QUIZ_CATEGORY_ICONS: Record<QuestionCategory, IconName> = {
  history: 'history',
  techniques: 'techniques',
  sequences: 'sequences',
  applications: 'applications',
  ranks: 'ranks',
  kata_order: 'kataOrder',
  terminology: 'terminology',
  philosophy: 'philosophy',
};

interface CategoryPickerProps {
  value: QuestionCategory | null;
  onChange(category: QuestionCategory | null): void;
}

export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  const t = useT();
  const options: { id: QuestionCategory | null; icon: IconName; label: string }[] = [
    { id: null, icon: 'quiz', label: t('quiz.allCategories') },
    ...QUESTION_CATEGORIES.map((id) => ({ id, icon: QUIZ_CATEGORY_ICONS[id], label: t(`quizCategory.${id}`) })),
  ];
  return (
    <div className="quiz-menu__categories">
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <button
            key={option.id ?? 'all'}
            type="button"
            className={`quiz-menu__category${selected ? ' quiz-menu__category--selected' : ''}`}
            aria-pressed={selected}
            onClick={() => onChange(option.id)}
          >
            <Icon name={option.icon} size={24} />
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
