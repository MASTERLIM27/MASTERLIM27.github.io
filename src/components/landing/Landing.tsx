"use client";

import { Fragment, useEffect, useRef, useState, type CSSProperties } from "react";
import { useLangState } from "@/lib/lang";
import { CONTACT, PAPERS, PROJECT_NAME, TILES, landing, type Tile } from "@/content/landing";
import type { Lang } from "@/lib/types";
import Nav from "./Nav";
import s from "./Landing.module.css";

const FILTERS = ["all", "project", "demo", "film", "result"] as const;
type Filter = (typeof FILTERS)[number];

/** Projects alternate sides, so the wall does not read as the same row three times. */
const PROJECT_ORDER = Array.from(new Set(TILES.map((t) => t.project)));

/**
 * Reveals a block once as it comes into view: one short fade and rise, nothing that moves
 * while you read, and nothing at all when the reader has asked for reduced motion.
 * Every revealed element keeps a key that does not change with the language; an element
 * that remounted would come back hidden and never be observed.
 */
function useReveal() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const targets = Array.from(el.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!targets.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      targets.forEach((t) => (t.dataset.reveal = "shown"));
      return;
    }

    // Only now does the stylesheet start hiding anything.
    el.dataset.revealReady = "1";

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.reveal = "shown";
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  return root;
}

/** The hero picture leans a few pixels away from the pointer. Mouse only, never with reduced motion. */
function useLean() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let raf = 0;
    let x = 0;
    let y = 0;
    const apply = () => {
      raf = 0;
      el.style.setProperty("--px", x.toFixed(3));
      el.style.setProperty("--py", y.toFixed(3));
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x = (e.clientX - r.left) / r.width - 0.5;
      y = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    el.addEventListener("pointermove", onMove);
    return () => {
      el.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return ref;
}

function ContactLinks({ label }: { label: string }) {
  return (
    <ul className={s.contact} aria-label={label}>
      <li>
        <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
      </li>
      <li>
        <a href={CONTACT.github.href} target="_blank" rel="noopener noreferrer">
          {CONTACT.github.label}
        </a>
      </li>
    </ul>
  );
}

function TileCard({ tile, lang, kind, index }: { tile: Tile; lang: Lang; kind: string; index: number }) {
  const img = tile.image;
  const side = PROJECT_ORDER.indexOf(tile.project) % 2 === 1 ? "right" : "left";

  return (
    <li
      className={s.tile}
      data-kind={tile.kind}
      data-project={tile.project}
      data-side={side}
      data-reveal="hidden"
      style={{ "--d": `${(index % 3) * 70}ms` } as CSSProperties}
    >
      <a className={s.tileLink} href={tile.href}>
        {img && (
          // The caption names the tile; the picture itself is decoration.
          <img
            className={s.tileImg}
            src={img.perLang ? `${img.src}-${lang}.webp` : img.src}
            srcSet={img.small ? `${img.small} 720w, ${img.src} ${img.width}w` : undefined}
            sizes={img.small ? "(min-width: 760px) 66vw, 100vw" : undefined}
            alt=""
            width={img.width}
            height={img.height}
            loading="lazy"
            decoding="async"
            style={img.focus ? { objectPosition: img.focus } : undefined}
          />
        )}
        <span className={s.tileMeta}>
          <span className={s.kind}>{kind}</span>
          <span className={s.project}>{PROJECT_NAME[tile.project]}</span>
        </span>
        <span className={s.arrow} aria-hidden="true">
          ↗
        </span>
        <span className={s.tileText}>
          {tile.venue && <span className={s.venue}>{tile.venue[lang]}</span>}
          {tile.value && <strong className={s.value}>{tile.value}</strong>}
          <span className={s.tileTitle}>{tile.title[lang]}</span>
          {tile.line && <span className={s.tileLine}>{tile.line[lang]}</span>}
          {tile.note && <span className={s.tileNote}>{tile.note[lang]}</span>}
        </span>
      </a>
    </li>
  );
}

export default function Landing() {
  const { lang } = useLangState();
  const t = landing[lang];
  const root = useReveal();
  const hero = useLean();
  const [filter, setFilter] = useState<Filter>("all");

  const count = (f: Filter) => (f === "all" ? TILES.length : TILES.filter((x) => x.kind === f).length);

  return (
    <div ref={root} className={s.page}>
      <a className="skip-link" href="#gallery">
        {t.skip}
      </a>
      <Nav />

      <main>
        <section ref={hero} className={s.hero} id="top">
          {/* The same chip twice, unlit and lit: the lit one comes on over the other. */}
          <div className={s.heroArt} aria-hidden="true">
            <img
              className={s.chipOff}
              src="landing/chip-off.webp"
              srcSet="landing/chip-off-960.webp 960w, landing/chip-off.webp 1672w"
              sizes="(max-width: 760px) 250vw, 115vw"
              alt=""
              width={1672}
              height={941}
              fetchPriority="high"
            />
            <img
              className={s.chipOn}
              src="landing/chip-on.webp"
              srcSet="landing/chip-on-960.webp 960w, landing/chip-on.webp 1672w"
              sizes="(max-width: 760px) 250vw, 115vw"
              alt=""
              width={1672}
              height={941}
            />
          </div>
          <div className={s.heroShade} aria-hidden="true" />

          <div className={`${s.frame} ${s.heroInner}`}>
            <p className={s.eyebrow}>{t.hero.eyebrow}</p>
            <h1 className={s.name}>
              {t.hero.name.map((line, i) => (
                <Fragment key={i}>
                  {i > 0 && " "}
                  <span>{line}</span>
                </Fragment>
              ))}
            </h1>
            <p className={s.lead}>{t.hero.lead}</p>
            <ContactLinks label={t.contact} />
            <a className={s.cue} href="#gallery">
              <span>{t.hero.cue}</span>
              <span className={s.cueArrow} aria-hidden="true">
                ↓
              </span>
            </a>
          </div>
        </section>

        <section className={s.section} id="gallery">
          <div className={s.frame}>
            <header className={s.head} data-reveal="hidden">
              <h2 className={s.h2}>{t.gallery.h}</h2>
              <p className={s.body}>{t.gallery.p}</p>
            </header>

            <div className={s.filters} role="group" aria-label={t.gallery.filter} data-reveal="hidden">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={s.chip}
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                >
                  {t.gallery.filters[f]}
                  <span className={s.chipCount}>{count(f)}</span>
                </button>
              ))}
            </div>

            {/* A filter dims the other tiles instead of removing them, so the wall keeps its shape. */}
            <ul className={s.wall} data-filter={filter}>
              {TILES.map((tile, i) => (
                <TileCard key={tile.id} tile={tile} lang={lang} kind={t.gallery.kinds[tile.kind]} index={i} />
              ))}
            </ul>
          </div>
        </section>

        <section className={s.section} id="papers">
          <div className={s.frame}>
            <header className={s.head} data-reveal="hidden">
              <h2 className={s.h2}>{t.papers.h}</h2>
              <p className={s.body}>{t.papers.p}</p>
            </header>

            <ol className={s.papers}>
              {PAPERS.map((p) => (
                <li key={p.id} className={s.paper} data-project={p.id} data-reveal="hidden">
                  <p className={s.paperYear}>
                    <span>{p.year}</span>
                    <span className={s.role}>{p.first ? t.papers.first : t.papers.co}</span>
                  </p>
                  <div className={s.paperMain}>
                    <h3 className={s.paperTitle}>
                      <a href={p.href}>{p.title}</a>
                    </h3>
                    <p className={s.paperAuthors}>
                      {p.authors.map((a, i) => (
                        <Fragment key={a.name}>
                          {i > 0 && ", "}
                          {a.me ? <strong>{a.name}</strong> : a.name}
                        </Fragment>
                      ))}
                    </p>
                    <p className={s.paperVenue}>{p.venue[lang]}</p>
                    <ul className={s.tags}>
                      {p.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                  </div>
                  <p className={s.paperLinks}>
                    <a className={s.paperPage} href={p.href}>
                      {t.papers.page}
                      <span aria-hidden="true"> →</span>
                    </a>
                    {p.links.map((l) => (
                      <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
                        {l.label[lang]}
                        <span aria-hidden="true"> ↗</span>
                      </a>
                    ))}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer className={s.footer} id="contact">
        <div className={s.frame}>
          <div className={s.footerTop}>
            <p className={s.footerBrand}>{t.brand}</p>
            <ContactLinks label={t.contact} />
          </div>
          <p className={s.footNote}>{t.footer.note}</p>
          <p className={s.footNote}>{t.footer.papers}</p>
        </div>
      </footer>
    </div>
  );
}
