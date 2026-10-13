import { useEffect, useRef } from 'react';
import { RANKS } from '../../domain/ranks';
import { rankLabel } from '../../i18n/labels';
import { useT } from '../../state/SettingsContext';

export function RankPicker({ value, onChange }: { value: string; onChange(rank: string): void }) {
  const t = useT();
  const selectedRef = useRef<HTMLButtonElement>(null);

  // Scroll the selected rank into view on mount.
  useEffect(() => {
    selectedRef.current?.scrollIntoView?.({ block: 'nearest', inline: 'center' });
  }, []);

  return (
    <div className="quiz-menu__ranks">
      {RANKS.map((rank) => {
        const selected = rank.id === value;
        return (
          <button
            key={rank.id}
            ref={selected ? selectedRef : undefined}
            type="button"
            className={`quiz-menu__rank${selected ? ' quiz-menu__rank--selected' : ''}`}
            aria-pressed={selected}
            onClick={() => onChange(rank.id)}
          >
            <span className={`belt-dot belt-dot--${rank.belt} quiz-menu__rank-dot`} aria-hidden="true" />
            <span className="quiz-menu__rank-name">{rankLabel(t, rank.id)}</span>
          </button>
        );
      })}
    </div>
  );
}
