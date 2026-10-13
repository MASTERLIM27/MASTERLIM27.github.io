"use client";

/*
  One language choice for the whole portfolio.

  The three project pages each ship their own `en` / `ko` dictionaries, so only the
  *choice* is shared here — each project's `lib/i18n` picks its own dictionary from it.
  Because this is a static export, every page is its own HTML document; the choice
  travels between them through localStorage under a single key.
*/

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Lang } from "@/lib/types";

const KEY = "andreas-portfolio-lang";

interface LangState {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const LangContext = createContext<LangState>({ lang: "en", setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // The static HTML is English; switch after mount to a saved choice or a Korean browser.
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(KEY);
    } catch {
      saved = null;
    }
    const preferred: Lang =
      saved === "en" || saved === "ko" ? saved : navigator.language?.toLowerCase().startsWith("ko") ? "ko" : "en";
    if (preferred !== "en") setLangState(preferred);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(KEY, l);
    } catch {
      /* storage unavailable: the choice lasts for this visit only */
    }
  }, []);

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

/** The shared language choice. Project pages wrap this with their own dictionary. */
export const useLangState = () => useContext(LangContext);
