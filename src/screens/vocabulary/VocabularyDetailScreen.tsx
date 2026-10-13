import { NotFound } from '../../components/NotFound';
import { NavBar } from '../../components/NavBar';
import { findTerm } from '../../domain/vocabulary';
import { routeToHash } from '../../router/router';
import { goBack } from '../../router/useRoute';
import { useT } from '../../state/SettingsContext';
import { VocabularyDetailContent } from './VocabularyDetailContent';

export function VocabularyDetailScreen({ id }: { id: number }) {
  const t = useT();
  const term = findTerm(id);
  const back = { label: t('nav.vocabulary'), onClick: () => goBack({ name: 'vocabList' }) };
  if (!term) {
    return (
      <>
        <NavBar title={t('common.notFound')} back={back} />
        <NotFound href={routeToHash({ name: 'vocabList' })} linkLabel={t('nav.vocabulary')} />
      </>
    );
  }
  return (
    <>
      <NavBar title={term.term} back={back} />
      <VocabularyDetailContent term={term} />
    </>
  );
}
