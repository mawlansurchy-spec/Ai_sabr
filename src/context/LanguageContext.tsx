import React, { createContext, useContext, useState, useEffect } from "react";
import { LanguageCode } from "../types";
import { translations, TranslationDictionary } from "../i18n/translations";

interface LanguageContextType {
  language: LanguageCode;
  direction: "rtl" | "ltr";
  setLanguage: (lang: LanguageCode) => void;
  t: (key: keyof TranslationDictionary | string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem("app_language") as LanguageCode;
      if (saved && (saved === "ku_so" || saved === "ku_ba" || saved === "ar" || saved === "en")) {
        return saved;
      }
    } catch {
      // ignore
    }
    return "ku_so"; // Default to Kurdish Sorani
  });

  const direction = language === "en" ? "ltr" : "rtl";

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = language === "ku_so" || language === "ku_ba" ? "ckb" : language;
    try {
      localStorage.setItem("app_language", language);
    } catch {
      // ignore
    }
  }, [language, direction]);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
  };

  const t = (key: keyof TranslationDictionary | string): string => {
    const dict = translations[language] || translations.en;
    const val = (dict as any)?.[key] || (translations.en as any)?.[key];
    if (val) return val;
    // Pretty formatting fallback
    return String(key)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
