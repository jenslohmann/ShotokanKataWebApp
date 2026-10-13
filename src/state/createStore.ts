// Minimal module-level store with a React hook (for state that must survive navigation).
import { useSyncExternalStore } from 'react';

export interface Store<T> {
  get(): T;
  set(next: Partial<T>): void;
  reset(): void;
  use(): T;
}

export function createStore<T extends object>(initial: T): Store<T> {
  let state = initial;
  const listeners = new Set<() => void>();
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };
  const get = () => state;
  return {
    get,
    set(next) {
      state = { ...state, ...next };
      listeners.forEach((listener) => listener());
    },
    reset() {
      state = initial;
      listeners.forEach((listener) => listener());
    },
    use: () => useSyncExternalStore(subscribe, get, get),
  };
}
