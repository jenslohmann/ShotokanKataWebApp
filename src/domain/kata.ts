// Kata data loading and pure helpers (replaces KataDataService.swift logic).
import config from '../data/kata.json';
import { SOURCE_LANG, type Lang } from '../i18n/languages';
import { beltOf, rankSortOrder, type BeltColor } from './ranks';
import type { Kata, KataConfiguration, KataMove } from './types';

const files = import.meta.glob('../data/kata/*.json', { eager: true, import: 'default' }) as Record<string, Kata>;

export function loadAllKata(cfg: KataConfiguration = config, fileMap: Record<string, Kata> = files): Kata[] {
  const result: Kata[] = [];
  for (const entry of cfg.availableKata) {
    if (!entry.enabled) continue;
    const kata = fileMap[`../data/kata/${entry.fileName}.json`];
    if (!kata) {
      console.warn(`Kata file missing: ${entry.fileName}.json`);
      continue;
    }
    result.push(kata);
  }
  return result.sort((a, b) => a.kataNumber - b.kataNumber);
}

export const ALL_KATA: Kata[] = loadAllKata();

/** Kata descriptions are not translated yet; they are always shown in the source language. */
export const KATA_CONTENT_LANG: Lang = SOURCE_LANG;

export function normalizeForSearch(s: string): string {
  return s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

export function filterKata(
  list: Kata[],
  opts: { search: string; rank?: string | null; belt?: BeltColor | null },
): Kata[] {
  const query = normalizeForSearch(opts.search.trim());
  return list
    .filter((kata) => {
      if (!query) return true;
      const fields = [kata.name, kata.japaneseName, kata.hiraganaName ?? '', ...kata.keyTechniques];
      return fields.some((field) => normalizeForSearch(field).includes(query));
    })
    .filter((kata) => !opts.rank || kata.beltRank === opts.rank)
    .filter((kata) => !opts.belt || beltOf(kata.beltRank) === opts.belt)
    .sort((a, b) => a.kataNumber - b.kataNumber);
}

export function sortedMoves(kata: Kata): KataMove[] {
  return [...kata.moves].sort((a, b) => a.sequence - b.sequence);
}

/** The single kiai rule used everywhere (header text, move badge, quiz). */
export function moveHasKiai(move: KataMove): boolean {
  return move.kiai === true || move.subMoves.some((sub) => sub.kiai === true);
}

export function kiaiMoveNumbers(kata: Kata): number[] {
  const numbers = new Set(kata.moves.filter(moveHasKiai).map((move) => move.sequence));
  return [...numbers].sort((a, b) => a - b);
}

/** From MoveMetadata.hasKiai in KataMoveRowView.swift. */
export function moveBadgeShowsKiai(move: KataMove): boolean {
  return move.kiai === true || (move.subMoves.length === 1 && move.subMoves[0].kiai === true);
}

/** From DirectionMapper in KataMoveRowView.swift. */
export function directionArrow(direction: string): string {
  switch (direction.toUpperCase()) {
    case 'N':
      return '↑';
    case 'NNE':
    case 'NE':
    case 'ENE':
      return '↗';
    case 'E':
      return '→';
    case 'ESE':
    case 'SE':
    case 'SSE':
      return '↘';
    case 'S':
      return '↓';
    case 'SSW':
    case 'SW':
    case 'WSW':
      return '↙';
    case 'W':
      return '←';
    case 'WNW':
    case 'NW':
    case 'NNW':
      return '↖';
    default:
      return '•';
  }
}

export type CompassPoint = 'N' | 'E' | 'S' | 'W';

/** Direction code ("NNE") with each compass letter replaced by its translation (Danish: "NNØ"). */
export function directionLabel(direction: string, letter: (point: CompassPoint) => string): string {
  return direction.toUpperCase().replace(/[NESW]/g, (point) => letter(point as CompassPoint));
}

export function moveLabel(move: KataMove): string {
  return move.sequenceName ?? String(move.sequence);
}

export function availableRanks(list: Kata[]): string[] {
  const ranks = new Set(list.map((kata) => kata.beltRank));
  return [...ranks].sort((a, b) => rankSortOrder(a) - rankSortOrder(b));
}

export function availableBelts(list: Kata[]): BeltColor[] {
  const lowest = new Map<BeltColor, number>();
  for (const kata of list) {
    const belt = beltOf(kata.beltRank);
    const order = rankSortOrder(kata.beltRank);
    if (!lowest.has(belt) || order < lowest.get(belt)!) lowest.set(belt, order);
  }
  return [...lowest.keys()].sort((a, b) => lowest.get(a)! - lowest.get(b)!);
}
