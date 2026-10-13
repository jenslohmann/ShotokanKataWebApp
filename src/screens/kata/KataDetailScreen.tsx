import { NavBar } from '../../components/NavBar';
import { SegmentedControl, type SegmentOption } from '../../components/SegmentedControl';
import { ALL_KATA } from '../../domain/kata';
import type { KataTab } from '../../router/router';
import { routeToHash } from '../../router/router';
import { goBack, navigate } from '../../router/useRoute';
import { useT } from '../../state/SettingsContext';
import { KataHeader } from './KataHeader';
import { KataHistoryTab } from './KataHistoryTab';
import { KataMovesTab } from './KataMovesTab';
import { KataOverviewTab } from './KataOverviewTab';
import './KataDetailScreen.css';

export function KataDetailScreen({ kataNumber, tab }: { kataNumber: number; tab: KataTab }) {
  const t = useT();
  const kata = ALL_KATA.find((item) => item.kataNumber === kataNumber);
  const back = { label: t('nav.kata'), onClick: () => goBack({ name: 'kataList' }) };

  if (!kata) {
    return (
      <>
        <NavBar title={t('common.notFound')} back={back} />
        <p className="kata-detail__not-found">
          {t('common.notFound')} — <a href={routeToHash({ name: 'kataList' })}>{t('kata.allKata')}</a>
        </p>
      </>
    );
  }

  const options: SegmentOption<KataTab>[] = [
    { value: 'overview', label: t('kata.tab.overview'), icon: 'info' },
    { value: 'moves', label: t('kata.tab.moves'), icon: 'list' },
    { value: 'history', label: t('kata.tab.history'), icon: 'book' },
  ];
  const selectTab = (next: KataTab) => navigate({ name: 'kataDetail', kataNumber, tab: next }, { replace: true });

  return (
    <>
      <NavBar title={kata.name} back={back} />
      <KataHeader kata={kata} />
      <div className="kata-detail__picker">
        <SegmentedControl options={options} value={tab} onChange={selectTab} label={kata.name} />
      </div>
      <div role="tabpanel">
        {tab === 'overview' && <KataOverviewTab kata={kata} />}
        {tab === 'moves' && <KataMovesTab kata={kata} />}
        {tab === 'history' && <KataHistoryTab kata={kata} />}
      </div>
    </>
  );
}
