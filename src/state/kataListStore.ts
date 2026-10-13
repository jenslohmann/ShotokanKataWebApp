// Module-level store for the kata list filters, so they survive navigating to a detail page and back
// (the iOS app keeps KataListViewModel alive). Search is debounced by 300 ms like the iOS view model.
import { useSyncExternalStore } from 'react';
import type { BeltColor } from '../domain/ranks';

export interface KataListFilters {
  search: string; // what the user typed
  debouncedSearch: string; // what the list is filtered by
  rank: string | null;
  belt: BeltColor | null;
}

const INITIAL: KataListFilters = { search: '', debouncedSearch: '', rank: null, belt: null };
export const SEARCH_DEBOUNCE_MS = 300;

let state = INITIAL;
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function update(next: Partial<KataListFilters>): void {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

function cancelDebounce(): void {
  if (timer !== undefined) clearTimeout(timer);
  timer = undefined;
}

export function setSearch(search: string): void {
  cancelDebounce();
  update({ search });
  timer = setTimeout(() => {
    timer = undefined;
    update({ debouncedSearch: search });
  }, SEARCH_DEBOUNCE_MS);
}

export function clearSearch(): void {
  cancelDebounce();
  update({ search: '', debouncedSearch: '' });
}

/** Selecting a rank clears the belt filter (KataListViewModel.filterByRank). */
export function toggleRank(rank: string): void {
  update({ rank: state.rank === rank ? null : rank, belt: null });
}

/** Selecting a belt clears the rank filter (KataListViewModel.filterByBeltColor). */
export function toggleBelt(belt: BeltColor): void {
  update({ belt: state.belt === belt ? null : belt, rank: null });
}

export function clearFilters(): void {
  cancelDebounce();
  update(INITIAL);
}

export function hasFiltersApplied(filters: KataListFilters): boolean {
  return filters.search !== '' || filters.rank !== null || filters.belt !== null;
}

/** Test helper: reset to the initial state. */
export function resetKataListFilters(): void {
  cancelDebounce();
  state = INITIAL;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useKataListFilters(): KataListFilters {
  return useSyncExternalStore(subscribe, () => state, () => state);
}
