// Ranks and belts, copied from Models/DifficultyLevel.swift.
// Display names come from i18n keys `rank.<id>` and `belt.<color>`.

export type BeltColor = 'white' | 'yellow' | 'orange' | 'green' | 'purple' | 'brown' | 'black';

export type RankId =
  | '10_kyu' | '9_kyu' | '8_kyu' | '7_kyu' | '6_kyu' | '5_kyu' | '4_kyu' | '3_kyu' | '2_kyu' | '1_kyu'
  | '1_dan' | '2_dan' | '3_dan' | '4_dan' | '5_dan' | '6_dan' | '7_dan' | '8_dan' | '9_dan' | '10_dan';

export interface Rank {
  id: RankId;
  sortOrder: number;
  belt: BeltColor;
}

const RANK_BELTS: [RankId, BeltColor][] = [
  ['10_kyu', 'white'],
  ['9_kyu', 'yellow'],
  ['8_kyu', 'orange'],
  ['7_kyu', 'green'],
  ['6_kyu', 'green'],
  ['5_kyu', 'purple'],
  ['4_kyu', 'purple'],
  ['3_kyu', 'brown'],
  ['2_kyu', 'brown'],
  ['1_kyu', 'brown'],
  ['1_dan', 'black'],
  ['2_dan', 'black'],
  ['3_dan', 'black'],
  ['4_dan', 'black'],
  ['5_dan', 'black'],
  ['6_dan', 'black'],
  ['7_dan', 'black'],
  ['8_dan', 'black'],
  ['9_dan', 'black'],
  ['10_dan', 'black'],
];

export const RANKS: Rank[] = RANK_BELTS.map(([id, belt], index) => ({ id, sortOrder: index + 1, belt }));

const RANK_BY_ID = new Map<string, Rank>(RANKS.map((rank) => [rank.id, rank]));

export function getRank(id: string): Rank | undefined {
  return RANK_BY_ID.get(id);
}

export function rankSortOrder(id: string): number {
  return getRank(id)?.sortOrder ?? Number.MAX_SAFE_INTEGER;
}

export function beltOf(id: string): BeltColor {
  return getRank(id)?.belt ?? 'white';
}

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export const DIFFICULTY_LEVELS: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];

export const DIFFICULTY_RANKS: Record<DifficultyLevel, RankId[]> = {
  beginner: ['10_kyu', '9_kyu', '8_kyu'],
  intermediate: ['7_kyu', '6_kyu', '5_kyu', '4_kyu'],
  advanced: ['3_kyu', '2_kyu', '1_kyu', '1_dan', '2_dan'],
  expert: ['3_dan', '4_dan', '5_dan', '6_dan', '7_dan', '8_dan', '9_dan', '10_dan'],
};

export function highestRankOf(level: DifficultyLevel): RankId {
  return DIFFICULTY_RANKS[level].reduce((best, id) => (rankSortOrder(id) > rankSortOrder(best) ? id : best));
}
