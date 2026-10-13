import { beltOf, getRank } from '../domain/ranks';
import { useT } from '../state/SettingsContext';
import './RankBadge.css';

export function RankBadge({ rank, size = 'default' }: { rank: string; size?: 'small' | 'default' }) {
  const t = useT();
  const known = getRank(rank);
  const belt = beltOf(rank);
  return (
    <span className={`rank-badge rank-badge--${belt} rank-badge--${size}`}>
      <span className={`belt-dot belt-dot--${belt} rank-badge__dot`} aria-hidden="true" />
      <span className="rank-badge__label">{known ? t(`rank.${known.id}`) : t('common.unknown')}</span>
    </span>
  );
}
