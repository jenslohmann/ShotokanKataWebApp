import type { IconName } from '../../components/Icon';
import type { VocabularyCategory } from '../../domain/vocabulary';

export function categoryIcon(category: VocabularyCategory): IconName {
  return `vocab.${category}`;
}
