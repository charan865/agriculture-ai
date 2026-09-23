import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../locales/en';
import { te } from '../locales/te';

export type SupportedLanguage = 'en' | 'te';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' }
];

const STORAGE_KEY = 'agri_ai_lang_pref_v1';

const translations: Record<SupportedLanguage, typeof en> = {
  en,
  te
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getNestedValue(obj: any, path: string): string | undefined {
  const keys = path.split('.');
  let current: any = obj;
  for (const k of keys) {
    if (current === undefined || current === null) return undefined;
    current = current[k];
  }
  return typeof current === 'string' ? current : undefined;
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
      if (saved && (saved === 'en' || saved === 'te')) {
        return saved;
      }
    } catch {
      // Fallback
    }
    return 'en';
  });

  const setLanguage = (newLang: SupportedLanguage) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      document.documentElement.lang = newLang;
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (path: string, params?: Record<string, string | number>): string => {
    const activeDict = translations[language] || translations.en;
    let text = getNestedValue(activeDict, path);

    // Fallback behavior: if translation missing in current language, fall back to English
    if (!text && language !== 'en') {
      text = getNestedValue(translations.en, path);
      if (import.meta.env.DEV) {
        console.warn(`[i18n] Missing translation for key: "${path}" in "${language}", falling back to English.`);
      }
    }

    if (!text) {
      if (import.meta.env.DEV) {
        console.warn(`[i18n] Missing translation for key in all locales: "${path}"`);
      }
      // Safety net: Never display raw dot notation (e.g. 'settings.someKey') in production UI
      const lastSegment = path.split('.').pop() || path;
      text = lastSegment
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
    }

    // Parameter interpolation (e.g. {count}, {name})
    if (params) {
      return Object.entries(params).reduce((acc, [key, val]) => {
        return acc.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val));
      }, text);
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
