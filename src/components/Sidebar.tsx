import { sectionHref } from '../router/useRoute';
import { SECTIONS, type Section } from '../router/router';
import { useT } from '../state/SettingsContext';
import { Icon } from './Icon';
import { SECTION_ICONS, SECTION_LABELS } from './sections';
import './Sidebar.css';

export function Sidebar({ active }: { active: Section }) {
  const t = useT();
  return (
    <nav className="sidebar" aria-label={t('nav.sections')}>
      <p className="sidebar__header">{t('app.title')}</p>
      <ul className="sidebar__list">
        {SECTIONS.map((section) => (
          <li key={section}>
            <a
              href={sectionHref(section, active)}
              className={`sidebar__link${section === active ? ' sidebar__link--active' : ''}`}
              aria-current={section === active ? 'page' : undefined}
            >
              <Icon name={SECTION_ICONS[section]} size={22} />
              <span>{t(SECTION_LABELS[section])}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
