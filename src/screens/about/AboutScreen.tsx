import pkg from '../../../package.json';
import { Icon, type IconName } from '../../components/Icon';
import { NavBar } from '../../components/NavBar';
import type { TKey } from '../../i18n';
import { useSettings } from '../../state/SettingsContext';
import { InstallHint } from './InstallHint';
import { LanguagePicker } from './LanguagePicker';
import './AboutScreen.css';

const GITHUB_URL = 'https://github.com/jenslohmann/ShotokanKata';

const FEATURES: { icon: IconName; title: TKey; desc: TKey }[] = [
  { icon: 'book', title: 'about.feature1.title', desc: 'about.feature1.desc' },
  { icon: 'language', title: 'about.feature2.title', desc: 'about.feature2.desc' },
  { icon: 'kataOrder', title: 'about.feature3.title', desc: 'about.feature3.desc' },
  { icon: 'ranks', title: 'about.feature4.title', desc: 'about.feature4.desc' },
  { icon: 'quiz', title: 'about.feature5.title', desc: 'about.feature5.desc' },
];

export function AboutScreen() {
  const { t } = useSettings();
  return (
    <>
      <NavBar large title={t('nav.about')} />
      <div className="about">
        <section className="about__hero">
          <span className="about__logo">
            <Icon name="kata" size={60} />
          </span>
          <h2 className="about__app-name">{t('app.title')}</h2>
          <p className="about__tagline">{t('about.tagline')}</p>
        </section>

        <section className="about__section">
          <h2 className="about__heading">{t('about.about')}</h2>
          <p className="about__text">{t('about.p1')}</p>
          <p className="about__text">{t('about.p2')}</p>
          <p className="about__text about__text--thanks">{t('about.thanks')}</p>
        </section>

        <section className="about__section">
          <h2 className="about__heading">{t('about.features')}</h2>
          <ul className="about__features">
            {FEATURES.map((feature) => (
              <li key={feature.title} className="about__feature">
                <Icon name={feature.icon} size={22} className="about__feature-icon" />
                <span>
                  <span className="about__feature-title">{t(feature.title)}</span>
                  <span className="about__feature-desc">{t(feature.desc)}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="about__section">
          <h2 className="about__heading">{t('about.traditionTitle')}</h2>
          <p className="about__text about__text--italic">{t('about.tradition')}</p>
        </section>

        <section className="about__section">
          <h2 className="about__heading">{t('about.openSourceTitle')}</h2>
          <p className="about__text">{t('about.openSource')}</p>
          <a className="about__button" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            <Icon name="github" size={18} />
            {t('about.viewOnGitHub')}
            <Icon name="external" size={16} />
          </a>
        </section>

        <section className="about__section">
          <h2 className="about__heading">{t('install.title')}</h2>
          <InstallHint />
        </section>

        <section className="about__section">
          <h2 className="about__heading">{t('about.language')}</h2>
          <LanguagePicker />
        </section>

        <p className="about__version">{t('about.version', { version: pkg.version })}</p>
      </div>
    </>
  );
}
