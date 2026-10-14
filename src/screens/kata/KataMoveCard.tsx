import { ExpandableText } from '../../components/ExpandableText';
import { VocabText } from '../../components/VocabText';
import { directionArrow, directionLabel, moveBadgeShowsKiai, moveLabel } from '../../domain/kata';
import type { KataMove } from '../../domain/types';
import type { Lang } from '../../i18n';
import { useSettings } from '../../state/SettingsContext';
import { KataSubMoveCard } from './KataSubMoveCard';
import { KiaiBadge } from './KiaiBadge';
import { StanceBadge } from './StanceBadge';
import './KataMoveCard.css';

/** `contentLang`: language of the move descriptions. */
export function KataMoveCard({ move, contentLang }: { move: KataMove; contentLang: Lang }) {
  const { showJapanese, t } = useSettings();
  const [first, ...rest] = move.subMoves;
  return (
    <article className="kata-move">
      <div className="kata-move__header">
        <span className={`kata-move__badge${move.sequenceName ? ' kata-move__badge--named' : ''}`}>{moveLabel(move)}</span>
        <div className="kata-move__main">
          {first ? (
            <>
              <VocabText text={first.technique} className="kata-move__technique" />
              {showJapanese && first.hiragana && (
                <span className="kata-move__hiragana" lang="ja">
                  {first.hiragana}
                </span>
              )}
              <StanceBadge stance={first.stance} stanceHiragana={first.stanceHiragana} />
            </>
          ) : (
            <VocabText text={move.japaneseName} className="kata-move__technique" />
          )}
        </div>
        <div className="kata-move__meta">
          {moveBadgeShowsKiai(move) && <KiaiBadge />}
          <span className="kata-move__direction">
            {directionLabel(move.direction, (point) => t(`compass.${point}`))} ({directionArrow(move.direction)})
          </span>
        </div>
      </div>
      {first && <ExpandableText text={first.description} lang={contentLang} />}
      {rest.length > 0 && (
        <div className="kata-move__subs">
          {rest.map((subMove) => (
            <KataSubMoveCard key={subMove.order} subMove={subMove} contentLang={contentLang} />
          ))}
        </div>
      )}
    </article>
  );
}
