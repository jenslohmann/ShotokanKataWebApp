import { Icon, type IconName } from '../../components/Icon';
import { DIFFICULTY_LEVELS, highestRankOf, type DifficultyLevel, type RankId } from '../../domain/ranks';
import { useT } from '../../state/SettingsContext';

const ICONS: Record<DifficultyLevel, IconName> = {
  beginner: 'star',
  intermediate: 'starHalf',
  advanced: 'award',
  expert: 'crown',
};

interface DifficultyPickerProps {
  value: DifficultyLevel | null;
  onChange(level: DifficultyLevel, rank: RankId): void;
}

export function DifficultyPicker({ value, onChange }: DifficultyPickerProps) {
  const t = useT();
  return (
    <div className="quiz-menu__difficulties">
      {DIFFICULTY_LEVELS.map((level) => {
        const selected = level === value;
        return (
          <button
            key={level}
            type="button"
            className={`quiz-menu__difficulty quiz-menu__difficulty--${level}${selected ? ' quiz-menu__difficulty--selected' : ''}`}
            aria-pressed={selected}
            onClick={() => onChange(level, highestRankOf(level))}
          >
            <Icon name={ICONS[level]} size={22} />
            <span>{t(`difficulty.${level}`)}</span>
          </button>
        );
      })}
    </div>
  );
}
