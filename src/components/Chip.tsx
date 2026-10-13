import type { ReactNode } from 'react';
import type { BeltColor } from '../domain/ranks';
import './Chip.css';

interface ChipProps {
  label: ReactNode;
  selected?: boolean;
  belt?: BeltColor;
  count?: number;
  onClick(): void;
}

export function Chip({ label, selected = false, belt, count, onClick }: ChipProps) {
  return (
    <button type="button" className={`chip${selected ? ' chip--selected' : ''}`} aria-pressed={selected} onClick={onClick}>
      {belt && <span className={`belt-dot belt-dot--${belt} chip__dot`} aria-hidden="true" />}
      <span>{label}</span>
      {count !== undefined && count > 0 && <span className="chip__count">({count})</span>}
    </button>
  );
}
