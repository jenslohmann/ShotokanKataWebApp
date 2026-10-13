import { sortedMoves } from '../../domain/kata';
import type { Kata } from '../../domain/types';
import { KataMoveCard } from './KataMoveCard';
import './KataMovesTab.css';

export function KataMovesTab({ kata }: { kata: Kata }) {
  return (
    <ol className="kata-moves">
      {sortedMoves(kata).map((move) => (
        <li key={move.sequence}>
          <KataMoveCard move={move} />
        </li>
      ))}
    </ol>
  );
}
