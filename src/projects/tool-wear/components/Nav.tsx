"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/projects/tool-wear/lib/i18n";
import type { Lang } from "@/projects/tool-wear/lib/types";
import { BACK } from "@/content/shared";
import s from "./Nav.module.css";

const LANGS: { id: Lang; label: string }[] = [
  { id: "en", label: "EN" },
  { id: "ko", label: "한국어" },
];

export default function Nav() {
  const { t, lang, setLang } = useLang();
  const [solid, setSolid] = useState(false);

  // Over the film the bar is a soft gradient; past it, a solid strip with a hairline.
  useEffect(() => {
    const onScroll = () => {
      const after = document.getElementById("overview");
      setSolid(after ? after.getBoundingClientRect().top <= 64 : false);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={s.bar} data-solid={solid} data-print="hide">
      {/* Added for the merged portfolio: a way back to the landing page. */}
      <a className={s.back} href="../" aria-label={BACK.aria[lang]}>
        <span className={s.backArrow} aria-hidden="true">←</span>
        <span className={s.backLabel}>{BACK.label[lang]}</span>
      </a>
      <a className={s.brand} href="#top" aria-label={t.nav.home}>
        <span className={s.mark} aria-hidden="true" />
        MCT Tool Wear
      </a>
      <nav className={s.links} aria-label={t.nav.sections}>
        <a href="#how">{t.nav.how}</a>
        <a href="#monitor">{t.nav.monitor}</a>
        <a href="#results">{t.nav.results}</a>
        <a href="#paper">{t.nav.paper}</a>
      </nav>
      <div className={s.lang} role="group" aria-label={t.nav.language}>
        {LANGS.map((l) => (
          <button
            key={l.id}
            type="button"
            lang={l.id}
            aria-pressed={lang === l.id}
            className={s.langButton}
            onClick={() => setLang(l.id)}
          >
            {l.label}
          </button>
        ))}
      </div>
    </header>
  );
}
