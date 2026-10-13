import { RankBadge } from '../../components/RankBadge';
import { Icon } from '../../components/Icon';
import type { Kata } from '../../domain/types';
import { routeToHash } from '../../router/router';
import { useSettings } from '../../state/SettingsContext';
import './KataRow.css';

export function KataRow({ kata }: { kata: Kata }) {
  const { showJapanese, t } = useSettings();
  return (
    <a className="kata-row" href={routeToHash({ name: 'kataDetail', kataNumber: kata.kataNumber, tab: 'moves' })}>
      <span className="kata-row__number" aria-hidden="true">
        {kata.kataNumber}
      </span>
      <span className="kata-row__info">
        <span className="kata-row__name">{kata.name}</span>
        {showJapanese && (
          <>
            <span className="kata-row__japanese" lang="ja">
              {kata.japaneseName}
            </span>
            {kata.hiraganaName && (
              <span className="kata-row__hiragana" lang="ja">
                {kata.hiraganaName}
              </span>
            )}
          </>
        )}
        <span className="kata-row__techniques">
          <span aria-hidden="true">🎯</span> {t('kata.techniquesCount', { count: kata.keyTechniques.length })}
        </span>
      </span>
      <span className="kata-row__trailing">
        <RankBadge rank={kata.beltRank} size="small" />
        <Icon name="chevronRight" size={16} className="kata-row__chevron" />
      </span>
    </a>
  );
}
