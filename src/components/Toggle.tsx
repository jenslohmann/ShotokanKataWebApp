import './Toggle.css';

interface ToggleProps {
  checked: boolean;
  onChange(checked: boolean): void;
  labelledBy?: string;
  label?: string;
}

export function Toggle({ checked, onChange, labelledBy, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : label}
      className={`toggle${checked ? ' toggle--on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle__thumb" />
    </button>
  );
}
