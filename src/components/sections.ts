// Icon and label key for each app section (shared by TabBar and Sidebar).
import type { TKey } from '../i18n';
import type { Section } from '../router/router';
import type { IconName } from './Icon';

export const SECTION_ICONS: Record<Section, IconName> = {
  kata: 'kata',
  quiz: 'quiz',
  vocabulary: 'vocabulary',
  about: 'about',
};

export const SECTION_LABELS: Record<Section, TKey> = {
  kata: 'nav.kata',
  quiz: 'nav.quiz',
  vocabulary: 'nav.vocabulary',
  about: 'nav.about',
};
