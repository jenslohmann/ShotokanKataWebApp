// Display-name helpers for ids that map to translation keys.
import { getRank } from '../domain/ranks';
import type { TKey, TVars } from './index';

type T = (key: TKey, vars?: TVars) => string;

export function rankLabel(t: T, rank: string): string {
  const known = getRank(rank);
  return known ? t(`rank.${known.id}`) : t('common.unknown');
}
