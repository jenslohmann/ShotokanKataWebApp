import { beltOf } from '../domain/ranks';
import { rankLabel } from '../i18n/labels';
import { useT } from '../state/SettingsContext';
import './RankBadge.css';

export function RankBadge({ rank, size = 'default' }: { rank: string; size?: 'small' | 'default' }) {
  const t = useT();
  const belt = beltOf(rank);
  return (
    <span className={`rank-badge rank-badge--${belt} rank-badge--${size}`}>
      <span className={`belt-dot belt-dot--${belt} rank-badge__dot`} aria-hidden="true" />
      <span className="rank-badge__label">{rankLabel(t, rank)}</span>
    </span>
  );
}
