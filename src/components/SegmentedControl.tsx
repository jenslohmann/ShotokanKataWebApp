import { Icon, type IconName } from './Icon';
import './SegmentedControl.css';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: IconName;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange(value: T): void;
  label?: string;
}

export function SegmentedControl<T extends string>({ options, value, onChange, label }: SegmentedControlProps<T>) {
  return (
    <div className="segmented-control" role="tablist" aria-label={label}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            className={`segmented-control__segment${selected ? ' segmented-control__segment--selected' : ''}`}
            onClick={() => onChange(option.value)}
          >
            {option.icon && <Icon name={option.icon} size={16} />}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
