// Hash router runtime: current route hook, navigation, back stack, per-section memory, scroll.
import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { parseHash, routeToHash, sectionOf, sectionRoot, type Route, type Section } from './router';

const stack: string[] = [];
const lastHashBySection = new Map<Section, string>();
const scrollByHash = new Map<string, number>();
let lastChangeWasBack = false;

function currentHash(): string {
  return routeToHash(parseHash(window.location.hash));
}

function remember(hash: string): void {
  lastHashBySection.set(sectionOf(parseHash(hash)), hash);
}

function saveScroll(): void {
  scrollByHash.set(currentHash(), window.scrollY);
}

function onHashChange(): void {
  const hash = currentHash();
  if (stack.length >= 2 && stack[stack.length - 2] === hash) {
    stack.pop();
    lastChangeWasBack = true;
  } else if (stack[stack.length - 1] !== hash) {
    stack.push(hash);
    lastChangeWasBack = false;
  }
  remember(hash);
}

if (typeof window !== 'undefined') {
  stack.push(currentHash());
  remember(currentHash());
  window.addEventListener('hashchange', onHashChange);
}

export function navigate(route: Route, options: { replace?: boolean } = {}): void {
  const hash = routeToHash(route);
  if (hash === currentHash() && window.location.hash) return;
  saveScroll();
  if (options.replace) {
    history.replaceState(history.state, '', hash);
    stack[stack.length - 1] = hash;
    lastChangeWasBack = false;
    remember(hash);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    window.location.hash = hash;
  }
}

export function goBack(fallback: Route): void {
  saveScroll();
  if (stack.length >= 2) {
    history.back();
  } else {
    navigate(fallback, { replace: true });
  }
}

/** Href for a tab: the section root if it is active, otherwise the last route visited there. */
export function sectionHref(section: Section, activeSection: Section): string {
  if (section === activeSection) return routeToHash(sectionRoot(section));
  return lastHashBySection.get(section) ?? routeToHash(sectionRoot(section));
}

function subscribe(callback: () => void): () => void {
  window.addEventListener('hashchange', callback);
  return () => window.removeEventListener('hashchange', callback);
}

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash, () => '');
  const route = useMemo(() => parseHash(hash), [hash]);

  useEffect(() => {
    const target = lastChangeWasBack ? (scrollByHash.get(routeToHash(route)) ?? 0) : 0;
    window.scrollTo(0, target);
  }, [route]);

  return route;
}
