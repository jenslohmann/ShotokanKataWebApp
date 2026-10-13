import type { Kata } from '../../domain/types';
import { rankLabel } from '../../i18n/labels';
import { useT } from '../../state/SettingsContext';
import './KataHistoryTab.css';

export function KataHistoryTab({ kata }: { kata: Kata }) {
  const t = useT();
  const stats = [
    { label: t('kata.totalMoves'), value: String(kata.numberOfMoves) },
    { label: t('kata.requiredRank'), value: rankLabel(t, kata.beltRank) },
    { label: t('kata.kataNumber'), value: `#${kata.kataNumber}` },
    { label: t('kata.keyTechniquesCount'), value: String(kata.keyTechniques.length) },
  ];
  return (
    <div className="kata-tab">
      <section className="kata-tab__section">
        <h2 className="kata-tab__heading">{t('kata.historicalBackground')}</h2>
        <p className="kata-tab__text kata-history__placeholder">{t('kata.historyPlaceholder')}</p>
      </section>
      <section className="kata-tab__section">
        <h2 className="kata-tab__heading">{t('kata.statistics')}</h2>
        <dl className="kata-history__stats">
          {stats.map((stat) => (
            <div key={stat.label} className="kata-history__stat">
              <dt>{stat.label}</dt>
              <dd className="kata-history__value">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
