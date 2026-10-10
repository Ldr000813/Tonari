"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export type Lang = "ja" | "en";
const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: "ja", setLang: () => {} });

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ja");
  useEffect(() => {
    try {
      const s = localStorage.getItem("tonari_lang");
      if (s === "ja" || s === "en") setLangState(s);
    } catch { /* ignore */ }
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("tonari_lang", l); } catch { /* ignore */ }
    if (typeof document !== "undefined") document.documentElement.lang = l;
  };
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);

/** Render Japanese or English depending on the current language. */
export function Bi({ ja, en }: { ja: React.ReactNode; en: React.ReactNode }) {
  const { lang } = useLang();
  return <>{lang === "ja" ? ja : en}</>;
}

/** Pick a value by language (for attributes / strings). */
export function useT() {
  const { lang } = useLang();
  return (ja: string, en: string) => (lang === "ja" ? ja : en);
}
