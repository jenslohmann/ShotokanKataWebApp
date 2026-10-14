import { Icon } from '../../components/Icon';
import { VocabText } from '../../components/VocabText';
import type { LocalizedKata } from '../../domain/kataTranslations';
import { useT } from '../../state/SettingsContext';
import './KataOverviewTab.css';

export function KataOverviewTab({ kata }: { kata: LocalizedKata }) {
  const t = useT();
  const videos = kata.videoURLs ?? [];
  return (
    <div className="kata-tab">
      <section className="kata-tab__section">
        <h2 className="kata-tab__heading">{t('kata.description')}</h2>
        <p className="kata-tab__text" lang={kata.contentLang}>
          <VocabText text={kata.description} />
        </p>
      </section>
      {kata.keyTechniques.length > 0 && (
        <section className="kata-tab__section">
          <h2 className="kata-tab__heading">{t('kata.keyTechniques')}</h2>
          <ul className="kata-overview__techniques">
            {kata.keyTechniques.map((technique) => (
              <li key={technique} className="kata-overview__technique">
                <VocabText text={technique} />
              </li>
            ))}
          </ul>
        </section>
      )}
      {kata.referenceURL && (
        <section className="kata-tab__section">
          <h2 className="kata-tab__heading">{t('kata.reference')}</h2>
          <a className="kata-overview__link" href={kata.referenceURL} target="_blank" rel="noopener noreferrer">
            <Icon name="link" />
            <span className="kata-overview__link-label">{t('kata.learnMore')}</span>
            <Icon name="external" />
          </a>
        </section>
      )}
      {videos.length > 0 && (
        <section className="kata-tab__section">
          <h2 className="kata-tab__heading">{videos.length === 1 ? t('kata.videoTutorial') : t('kata.videoTutorials')}</h2>
          {videos.map((url, index) => (
            <a
              key={url}
              className="kata-overview__link kata-overview__link--video"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="video" />
              <span className="kata-overview__link-label">
                {videos.length > 1 ? t('kata.watchOnYouTubeN', { n: index + 1 }) : t('kata.watchOnYouTube')}
              </span>
              <Icon name="external" />
            </a>
          ))}
        </section>
      )}
    </div>
  );
}
