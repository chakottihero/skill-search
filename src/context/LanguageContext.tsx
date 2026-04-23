"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Lang = "ja" | "en" | "zh";

const LS_KEY = "skillsearch_lang";

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "ja",
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ja");

  useEffect(() => {
    const v = localStorage.getItem(LS_KEY) as Lang | null;
    if (v === "ja" || v === "en" || v === "zh") setLangState(v);
  }, []);

  const setLang = (l: Lang) => {
    localStorage.setItem(LS_KEY, l);
    setLangState(l);
  };

  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export function useLanguage() {
  return useContext(Ctx);
}
