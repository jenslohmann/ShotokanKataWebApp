import { NavBar } from '../../components/NavBar';
import { useT } from '../../state/SettingsContext';

export function VocabularyListScreen() {
  const t = useT();
  return <NavBar large title={t('nav.vocabulary')} />;
}
