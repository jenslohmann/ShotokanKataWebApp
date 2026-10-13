import { sectionHref } from '../router/useRoute';
import { SECTIONS, type Section } from '../router/router';
import { useT } from '../state/SettingsContext';
import { Icon } from './Icon';
import { SECTION_ICONS, SECTION_LABELS } from './sections';
import './TabBar.css';

export function TabBar({ active }: { active: Section }) {
  const t = useT();
  return (
    <nav className="tab-bar" aria-label={t('nav.sections')}>
      <ul className="tab-bar__list">
        {SECTIONS.map((section) => (
          <li key={section} className="tab-bar__item">
            <a
              href={sectionHref(section, active)}
              className={`tab-bar__link${section === active ? ' tab-bar__link--active' : ''}`}
              aria-current={section === active ? 'page' : undefined}
            >
              <Icon name={SECTION_ICONS[section]} size={24} />
              <span className="tab-bar__label">{t(SECTION_LABELS[section])}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
