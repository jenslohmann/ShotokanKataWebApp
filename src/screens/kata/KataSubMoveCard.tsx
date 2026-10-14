import { ExpandableText } from '../../components/ExpandableText';
import { MoveIcon } from '../../components/Icon';
import { VocabText } from '../../components/VocabText';
import type { KataSubMove } from '../../domain/types';
import type { Lang } from '../../i18n';
import { useSettings } from '../../state/SettingsContext';
import { KiaiBadge } from './KiaiBadge';
import { StanceBadge } from './StanceBadge';
import './KataSubMoveCard.css';

export function KataSubMoveCard({ subMove, contentLang }: { subMove: KataSubMove; contentLang: Lang }) {
  const { showJapanese } = useSettings();
  return (
    <div className="kata-sub-move">
      <div className="kata-sub-move__header">
        <MoveIcon sfSymbol={subMove.icon} className="kata-sub-move__icon" />
        <div className="kata-sub-move__main">
          <VocabText text={subMove.technique} className="kata-sub-move__technique" />
          {showJapanese && subMove.hiragana && (
            <span className="kata-sub-move__hiragana" lang="ja">
              {subMove.hiragana}
            </span>
          )}
          <StanceBadge stance={subMove.stance} stanceHiragana={subMove.stanceHiragana} />
        </div>
        {subMove.kiai && <KiaiBadge />}
      </div>
      <ExpandableText text={subMove.description} lang={contentLang} />
    </div>
  );
}
