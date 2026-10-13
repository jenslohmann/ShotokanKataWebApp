import { Sheet } from '../../components/Sheet';
import { availableBelts, availableRanks } from '../../domain/kata';
import { beltOf, type BeltColor } from '../../domain/ranks';
import type { Kata } from '../../domain/types';
import { rankLabel } from '../../i18n/labels';
import { useT } from '../../state/SettingsContext';
import { clearFilters, toggleBelt, toggleRank, useKataListFilters } from '../../state/kataListStore';
import './KataFilterSheet.css';

interface KataFilterSheetProps {
  open: boolean;
  onClose(): void;
  allKata: Kata[];
  /** The search-filtered list, used for counts. */
  searched: Kata[];
}

export function KataFilterSheet({ open, onClose, allKata, searched }: KataFilterSheetProps) {
  const t = useT();
  const filters = useKataListFilters();
  const rankCount = (rank: string) => searched.filter((kata) => kata.beltRank === rank).length;
  const beltCount = (belt: BeltColor) => searched.filter((kata) => beltOf(kata.beltRank) === belt).length;

  return (
    <Sheet
      open={open}
      title={t('filter.title')}
      onClose={onClose}
      leftAction={{ label: t('filter.clearAll'), onClick: clearFilters }}
      rightAction={{ label: t('common.done'), onClick: onClose }}
    >
      <section className="kata-filter__section">
        <h3 className="kata-filter__heading">{t('filter.byRank')}</h3>
        <div className="kata-filter__grid kata-filter__grid--ranks">
          {availableRanks(allKata).map((rank) => (
            <button
              key={rank}
              type="button"
              className={`kata-filter__option kata-filter__option--rank${filters.rank === rank ? ' kata-filter__option--selected' : ''}`}
              aria-pressed={filters.rank === rank}
              onClick={() => toggleRank(rank)}
            >
              <span className={`belt-dot belt-dot--${beltOf(rank)} kata-filter__dot--rank`} aria-hidden="true" />
              <span className="kata-filter__rank-name">{rankLabel(t, rank)}</span>
              <span className="kata-filter__count">({rankCount(rank)})</span>
            </button>
          ))}
        </div>
      </section>
      <section className="kata-filter__section">
        <h3 className="kata-filter__heading">{t('filter.byBelt')}</h3>
        <div className="kata-filter__grid kata-filter__grid--belts">
          {availableBelts(allKata).map((belt) => (
            <button
              key={belt}
              type="button"
              className={`kata-filter__option kata-filter__option--belt${filters.belt === belt ? ' kata-filter__option--selected' : ''}`}
              aria-pressed={filters.belt === belt}
              onClick={() => toggleBelt(belt)}
            >
              <span className={`belt-dot belt-dot--${belt} kata-filter__dot--belt`} aria-hidden="true" />
              <span className="kata-filter__belt-text">
                <span className="kata-filter__belt-name">{t(`belt.${belt}`)}</span>
                <span className="kata-filter__count">{t('filter.kataCount', { count: beltCount(belt) })}</span>
              </span>
            </button>
          ))}
        </div>
      </section>
    </Sheet>
  );
}
