import { detectLang, isLang, LANGUAGES } from '../../i18n';
import { useSettings } from '../../state/SettingsContext';
import './LanguagePicker.css';

/** Native select so the list scales to any number of languages. Names are shown in their own language. */
export function LanguagePicker() {
  const { t, langSetting, setLangSetting } = useSettings();
  const detected = LANGUAGES.find((language) => language.code === detectLang())!;
  return (
    <select
      className="language-picker"
      aria-label={t('about.language')}
      value={langSetting}
      onChange={(event) => setLangSetting(isLang(event.target.value) ? event.target.value : 'auto')}
    >
      <option value="auto">
        {t('about.languageAuto')} ({detected.nativeName})
      </option>
      {LANGUAGES.map((language) => (
        <option key={language.code} value={language.code} lang={language.code}>
          {language.nativeName}
        </option>
      ))}
    </select>
  );
}
