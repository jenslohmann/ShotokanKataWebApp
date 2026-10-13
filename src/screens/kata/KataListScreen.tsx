import { useMemo, useState } from 'react';
import { Chip } from '../../components/Chip';
import { Icon } from '../../components/Icon';
import { NavBar } from '../../components/NavBar';
import { SearchField } from '../../components/SearchField';
import { Toggle } from '../../components/Toggle';
import { ALL_KATA, availableBelts, filterKata } from '../../domain/kata';
import { beltOf } from '../../domain/ranks';
import { useSettings } from '../../state/SettingsContext';
import {
  clearFilters,
  clearSearch,
  hasFiltersApplied,
  setSearch,
  toggleBelt,
  useKataListFilters,
} from '../../state/kataListStore';
import { KataFilterSheet } from './KataFilterSheet';
import { KataRow } from './KataRow';
import './KataListScreen.css';

const BELTS = availableBelts(ALL_KATA);

export function KataListScreen() {
  const { t, showJapanese, setShowJapanese } = useSettings();
  const filters = useKataListFilters();
  const [sheetOpen, setSheetOpen] = useState(false);

  const searched = useMemo(() => filterKata(ALL_KATA, { search: filters.debouncedSearch }), [filters.debouncedSearch]);
  const visible = useMemo(
    () => filterKata(searched, { search: '', rank: filters.rank, belt: filters.belt }),
    [searched, filters.rank, filters.belt],
  );
  const filtered = hasFiltersApplied(filters);

  return (
    <>
      <NavBar large title={t('nav.kata')} />
      <div className="kata-list__japanese">
        <span id="kata-list-japanese-label" className="kata-list__japanese-label">
          <Icon name="language" size={18} />
          {t('kata.japaneseToggle')}
        </span>
        <Toggle checked={showJapanese} onChange={setShowJapanese} labelledBy="kata-list-japanese-label" />
      </div>
      <div className="kata-list__controls">
        <SearchField
          value={filters.search}
          placeholder={t('kata.searchPlaceholder')}
          onChange={setSearch}
          onClear={clearSearch}
        />
        <div className="kata-list__chips">
          <Chip label={t('kata.allKata')} selected={!filtered} onClick={clearFilters} />
          {BELTS.map((belt) => (
            <Chip
              key={belt}
              label={t(`belt.${belt}`)}
              belt={belt}
              count={searched.filter((kata) => beltOf(kata.beltRank) === belt).length}
              selected={filters.belt === belt}
              onClick={() => toggleBelt(belt)}
            />
          ))}
          <button type="button" className="kata-list__more" onClick={() => setSheetOpen(true)}>
            <Icon name="sliders" size={14} />
            {t('kata.more')}
          </button>
        </div>
      </div>
      {visible.length > 0 ? (
        <ul className="kata-list__rows">
          {visible.map((kata) => (
            <li key={kata.kataNumber}>
              <KataRow kata={kata} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="kata-list__empty">
          <Icon name="kata" size={64} className="kata-list__empty-icon" />
          <h2 className="kata-list__empty-title">{t('kata.noneFound')}</h2>
          <p className="kata-list__empty-text">{filtered ? t('kata.tryAdjusting') : t('kata.noData')}</p>
          {filtered && (
            <button type="button" className="kata-list__clear" onClick={clearFilters}>
              {t('kata.clearFilters')}
            </button>
          )}
        </div>
      )}
      <KataFilterSheet open={sheetOpen} onClose={() => setSheetOpen(false)} allKata={ALL_KATA} searched={searched} />
    </>
  );
}
