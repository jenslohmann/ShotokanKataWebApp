import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { detectLang, isLang, translate, type Lang, type TKey, type TVars } from '../i18n';

export type LangSetting = 'auto' | Lang;

export interface SettingsValue {
  showJapanese: boolean;
  setShowJapanese(value: boolean): void;
  langSetting: LangSetting;
  setLangSetting(value: LangSetting): void;
  lang: Lang;
  t: (key: TKey, vars?: TVars) => string;
}

const SHOW_JAPANESE_KEY = 'sk.showJapanese';
const LANG_KEY = 'sk.lang';

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private mode or storage disabled: keep the value in memory only.
  }
}

function initialLangSetting(): LangSetting {
  const stored = readStorage(LANG_KEY);
  return isLang(stored) ? stored : 'auto';
}

const SettingsContext = createContext<SettingsValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [showJapanese, setShowJapaneseState] = useState(() => readStorage(SHOW_JAPANESE_KEY) !== 'false');
  const [langSetting, setLangSettingState] = useState<LangSetting>(initialLangSetting);
  const lang: Lang = langSetting === 'auto' ? detectLang() : langSetting;

  const setShowJapanese = useCallback((value: boolean) => {
    setShowJapaneseState(value);
    writeStorage(SHOW_JAPANESE_KEY, String(value));
  }, []);

  const setLangSetting = useCallback((value: LangSetting) => {
    setLangSettingState(value);
    writeStorage(LANG_KEY, value);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<SettingsValue>(
    () => ({
      showJapanese,
      setShowJapanese,
      langSetting,
      setLangSetting,
      lang,
      t: (key, vars) => translate(lang, key, vars),
    }),
    [showJapanese, setShowJapanese, langSetting, setLangSetting, lang],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsValue {
  const value = useContext(SettingsContext);
  if (!value) throw new Error('useSettings must be used inside SettingsProvider');
  return value;
}

/** Current UI language (for content that has translations, e.g. vocabulary). */
export function useLang(): Lang {
  return useSettings().lang;
}

export function useT(): SettingsValue['t'] {
  return useSettings().t;
}
