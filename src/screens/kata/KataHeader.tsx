import { RankBadge } from '../../components/RankBadge';
import { kiaiMoveNumbers } from '../../domain/kata';
import type { Kata } from '../../domain/types';
import { useSettings } from '../../state/SettingsContext';
import './KataHeader.css';

export function KataHeader({ kata }: { kata: Kata }) {
  const { t, showJapanese } = useSettings();
  const kiai = kiaiMoveNumbers(kata);
  let kiaiText: string;
  if (kiai.length === 0) kiaiText = t('kata.kiaiNone');
  else if (kiai.length === 1) kiaiText = t('kata.kiaiOne', { move: kiai[0] });
  else kiaiText = t('kata.kiaiMany', { moves: kiai.join(` ${t('common.and')} `) });

  return (
    <div className="kata-header">
      <div className="kata-header__row">
        <span className="kata-header__number">#{kata.kataNumber}</span>
        {showJapanese && (
          <span className="kata-header__japanese" lang="ja">
            {kata.hiraganaName && `${kata.hiraganaName} `}({kata.japaneseName})
          </span>
        )}
        <span className="kata-header__spacer" />
        <RankBadge rank={kata.beltRank} />
      </div>
      <div className="kata-header__row kata-header__row--meta">
        <span>{t('kata.movesCount', { count: kata.numberOfMoves })}</span>
        <span>{kiaiText}</span>
      </div>
    </div>
  );
}
