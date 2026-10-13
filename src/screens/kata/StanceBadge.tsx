import { VocabText } from '../../components/VocabText';
import { useSettings } from '../../state/SettingsContext';
import './StanceBadge.css';

export function StanceBadge({ stance, stanceHiragana }: { stance: string; stanceHiragana?: string }) {
  const { showJapanese } = useSettings();
  return (
    <span className="stance-badge">
      <VocabText text={stance} highlightClass="stance-badge__link" className="stance-badge__stance" />
      {showJapanese && stanceHiragana && (
        <span className="stance-badge__hiragana" lang="ja">
          {' '}({stanceHiragana})
        </span>
      )}
    </span>
  );
}
