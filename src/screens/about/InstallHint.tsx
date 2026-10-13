import { Icon } from '../../components/Icon';
import { isIOS, isStandalone, promptInstall, useInstallPrompt } from '../../state/installPrompt';
import { useT } from '../../state/SettingsContext';

export function InstallHint() {
  const t = useT();
  const installEvent = useInstallPrompt();

  if (isStandalone()) return <p className="about__text">{t('install.installed')}</p>;
  if (installEvent) {
    return (
      <button type="button" className="about__button" onClick={() => void promptInstall()}>
        <Icon name="download" size={18} />
        {t('install.button')}
      </button>
    );
  }
  if (isIOS()) {
    return (
      <p className="about__text about__install-ios">
        <Icon name="share" size={18} className="about__inline-icon" />
        {t('install.ios')}
      </p>
    );
  }
  return <p className="about__text">{t('install.other')}</p>;
}
