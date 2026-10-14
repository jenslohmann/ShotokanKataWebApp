import { sortedMoves } from '../../domain/kata';
import type { LocalizedKata } from '../../domain/kataTranslations';
import { KataMoveCard } from './KataMoveCard';
import './KataMovesTab.css';

export function KataMovesTab({ kata }: { kata: LocalizedKata }) {
  return (
    <ol className="kata-moves">
      {sortedMoves(kata).map((move) => (
        <li key={move.sequence}>
          <KataMoveCard move={move} contentLang={kata.contentLang} />
        </li>
      ))}
    </ol>
  );
}
