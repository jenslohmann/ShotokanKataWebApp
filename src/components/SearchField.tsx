import { useT } from '../state/SettingsContext';
import { Icon } from './Icon';
import './SearchField.css';

interface SearchFieldProps {
  value: string;
  placeholder: string;
  onChange(value: string): void;
  onClear(): void;
}

export function SearchField({ value, placeholder, onChange, onClear }: SearchFieldProps) {
  const t = useT();
  return (
    <div className="search-field">
      <Icon name="search" size={18} className="search-field__icon" />
      <input
        type="search"
        className="search-field__input"
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        onChange={(event) => onChange(event.target.value)}
      />
      {value && (
        <button type="button" className="search-field__clear" aria-label={t('common.clear')} onClick={onClear}>
          <Icon name="clear" size={18} />
        </button>
      )}
    </div>
  );
}
