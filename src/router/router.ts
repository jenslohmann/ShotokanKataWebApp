// Tiny hash router: pure parsing/formatting of routes.

export type KataTab = 'overview' | 'moves' | 'history';

export type Route =
  | { name: 'kataList' }
  | { name: 'kataDetail'; kataNumber: number; tab: KataTab }
  | { name: 'quizMenu' }
  | { name: 'quizPlay' }
  | { name: 'vocabList' }
  | { name: 'vocabDetail'; id: number }
  | { name: 'about' };

export type Section = 'kata' | 'quiz' | 'vocabulary' | 'about';

export const SECTIONS: Section[] = ['kata', 'quiz', 'vocabulary', 'about'];

const KATA_TABS: KataTab[] = ['overview', 'moves', 'history'];

function parseId(segment: string | undefined): number | null {
  if (!segment || !/^\d+$/.test(segment)) return null;
  return Number(segment);
}

export function parseHash(hash: string): Route {
  const raw = hash.replace(/^#/, '');
  const [path, query = ''] = raw.split('?');
  const parts = path.split('/').filter(Boolean);
  const params = new URLSearchParams(query);

  switch (parts[0]) {
    case 'kata': {
      if (parts.length === 1) return { name: 'kataList' };
      const kataNumber = parseId(parts[1]);
      if (kataNumber === null || parts.length > 2) break;
      const tabParam = params.get('tab') as KataTab | null;
      const tab = tabParam && KATA_TABS.includes(tabParam) ? tabParam : 'moves';
      return { name: 'kataDetail', kataNumber, tab };
    }
    case 'quiz':
      if (parts.length === 1) return { name: 'quizMenu' };
      if (parts.length === 2 && parts[1] === 'play') return { name: 'quizPlay' };
      break;
    case 'vocabulary': {
      if (parts.length === 1) return { name: 'vocabList' };
      const id = parseId(parts[1]);
      if (id !== null && parts.length === 2) return { name: 'vocabDetail', id };
      break;
    }
    case 'about':
      if (parts.length === 1) return { name: 'about' };
      break;
  }
  return { name: 'kataList' };
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case 'kataList':
      return '#/kata';
    case 'kataDetail':
      return `#/kata/${route.kataNumber}?tab=${route.tab}`;
    case 'quizMenu':
      return '#/quiz';
    case 'quizPlay':
      return '#/quiz/play';
    case 'vocabList':
      return '#/vocabulary';
    case 'vocabDetail':
      return `#/vocabulary/${route.id}`;
    case 'about':
      return '#/about';
  }
}

export function sectionOf(route: Route): Section {
  switch (route.name) {
    case 'kataList':
    case 'kataDetail':
      return 'kata';
    case 'quizMenu':
    case 'quizPlay':
      return 'quiz';
    case 'vocabList':
    case 'vocabDetail':
      return 'vocabulary';
    case 'about':
      return 'about';
  }
}

export function sectionRoot(section: Section): Route {
  switch (section) {
    case 'kata':
      return { name: 'kataList' };
    case 'quiz':
      return { name: 'quizMenu' };
    case 'vocabulary':
      return { name: 'vocabList' };
    case 'about':
      return { name: 'about' };
  }
}
