"use client";

import { useEffect, useState } from "react";
import { useLangState } from "@/lib/lang";
import { landing } from "@/content/landing";
import type { Lang } from "@/lib/types";
import s from "./Nav.module.css";

const LANGS: { id: Lang; label: string }[] = [
  { id: "en", label: "EN" },
  { id: "ko", label: "한국어" },
];

export default function Nav() {
  const { lang, setLang } = useLangState();
  const t = landing[lang];
  const [solid, setSolid] = useState(false);

  // Over the hero the bar is transparent; past it, a solid strip with a hairline.
  useEffect(() => {
    const onScroll = () => {
      const after = document.getElementById("gallery");
      setSolid(after ? after.getBoundingClientRect().top <= 64 : false);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={s.bar} data-solid={solid}>
      <a className={s.brand} href="#top">
        <span className={s.mark} aria-hidden="true" />
        {t.brand}
      </a>
      <nav className={s.links} aria-label={t.nav.sections}>
        <a href="#gallery">{t.nav.gallery}</a>
        <a href="#papers">{t.nav.papers}</a>
        <a href="#contact">{t.nav.contact}</a>
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
