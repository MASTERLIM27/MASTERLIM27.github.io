"use client";

/*
  This project's dictionary, driven by the portfolio's single shared language choice
  (see src/lib/lang.tsx, mounted once in the root layout). The original per-project
  provider and its own localStorage key were replaced by that shared state so the
  landing page and all three project pages stay in the same language.

  `LangProvider` is kept as a pass-through so the project's own components keep
  compiling unchanged.
*/

import type { ReactNode } from "react";
import { useLangState } from "@/lib/lang";
import { en, ko, type Dict } from "@/projects/tool-wear/content/dict";
import type { Lang } from "@/projects/tool-wear/lib/types";

interface LangState {
  lang: Lang;
  t: Dict;
  setLang: (l: Lang) => void;
}

/** The provider now lives in the root layout; this keeps the original tree shape. */
export function LangProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useLang(): LangState {
  const { lang, setLang } = useLangState();
  return { lang, t: lang === "ko" ? ko : en, setLang };
}
