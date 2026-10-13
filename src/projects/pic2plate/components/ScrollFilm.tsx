"use client";

import { useEffect, useRef } from "react";
import { useLang } from "@/projects/pic2plate/lib/i18n";
import {
  BEATS,
  FRAME_ASPECT,
  FRAME_COUNT,
  LABELS,
  REDUCED_FRAME,
  beatOpacity,
  frameAt,
  reducedFrameAt,
} from "@/projects/pic2plate/lib/film";
import { createFrameLoader } from "@/lib/filmFrames";
import { JSON_NAME, KITCHEN } from "@/projects/pic2plate/lib/engine";
import { IngredientJson } from "./ui";
import styles from "./ScrollFilm.module.css";

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export default function ScrollFilm() {
  const { t } = useLang();
  const f = t.film;

  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<HTMLDivElement>(null);
  const traceRef = useRef<HTMLOListElement>(null);
  const loadingRef = useRef<HTMLParagraphElement>(null);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);
  const loadingText = useRef(f.loading);
  loadingText.current = f.loading;
  const percentRef = useRef(0);

  // Keep the loading label in the current language.
  useEffect(() => {
    const el = loadingRef.current;
    if (el && el.dataset.done !== "true") el.textContent = f.loading(percentRef.current);
  }, [f]);

  useEffect(() => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!section || !sticky || !canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let vw = 0;
    let vh = 0;
    let rect = { x: 0, y: 0, w: 0, h: 0 };
    let target = 1;
    let drawn: HTMLImageElement | undefined;
    let dimMax = 0.62;
    let raf = 0;

    const paint = (force = false) => {
      const idx = frames.nearest(target);
      const img = idx < 0 ? undefined : frames.image(idx);
      if (!img || (!force && img === drawn)) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, rect.x * dpr, rect.y * dpr, rect.w * dpr, rect.h * dpr);
      drawn = img;
    };

    const frames = createFrameLoader({
      count: FRAME_COUNT,
      first: [1, ...Object.values(REDUCED_FRAME)],
      stillsOnly: reduce,
      onFrame: () => paint(),
      onWaiting: (waiting, percent) => {
        percentRef.current = percent;
        const el = loadingRef.current;
        if (!el) return;
        el.dataset.done = waiting ? "false" : "true";
        if (waiting) el.textContent = loadingText.current(percent);
      },
    });

    const layout = () => {
      vw = sticky.clientWidth;
      vh = sticky.clientHeight;
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      const portrait = vw / vh < 1.2;
      if (portrait) {
        const w = vw;
        const h = w / FRAME_ASPECT;
        rect = { x: 0, y: Math.max(64, Math.round(vh * 0.1)), w, h };
      } else {
        const s = Math.max(vw / 1728, vh / 1152);
        const w = 1728 * s;
        const h = 1152 * s;
        rect = { x: (vw - w) / 2, y: (vh - h) / 2, w, h };
      }
      frames.resize(rect.w * dpr);
      sticky.dataset.layout = portrait ? "portrait" : "landscape";
      // In portrait the title sits below the picture, so the picture needs only a light dim.
      dimMax = portrait ? 0.28 : 0.62;
      sticky.style.setProperty("--text-top", `${Math.round(rect.y + rect.h + 24)}px`);
      const r = rectRef.current;
      if (r) {
        r.style.left = `${rect.x}px`;
        r.style.top = `${rect.y}px`;
        r.style.width = `${rect.w}px`;
        r.style.height = `${rect.h}px`;
        r.dataset.labels = rect.w >= 720 ? "show" : "hide";
        // Wide screens crop the top of the picture: keep every label below the nav bar.
        const minTop = 64 + 18 - rect.y;
        r.querySelectorAll<HTMLElement>("[data-label]").forEach((el, i) => {
          el.style.top = `${Math.max(LABELS[i].y * rect.h, minTop)}px`;
        });
      }
      paint(true);
    };

    const update = () => {
      raf = 0;
      const r = section.getBoundingClientRect();
      const span = r.height - vh;
      const p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
      target = reduce ? reducedFrameAt(p) : frameAt(p);
      const onScreen = r.bottom > 0 && r.top < vh;
      frames.scrolled(onScreen, p);
      frames.aim(target);
      if (onScreen) paint();

      BEATS.forEach((b, i) => {
        const el = beatRefs.current[i];
        if (!el) return;
        const o = beatOpacity(b, p);
        el.style.opacity = o.toFixed(3);
        el.style.transform = reduce || b.id === "title" ? "" : `translate3d(0, ${((1 - o) * 14).toFixed(1)}px, 0)`;
        if (b.id === "detect") rectRef.current?.setAttribute("data-on", o > 0.35 ? "true" : "false");
        if (b.id === "search" && traceRef.current) {
          const lp = (p - b.start) / (b.end - b.start);
          const step = Math.min(4, Math.max(1, 1 + Math.floor(lp * 4.4)));
          traceRef.current.querySelectorAll<HTMLElement>("[data-k]").forEach((node) => {
            node.dataset.on = Number(node.dataset.k) <= step ? "true" : "false";
          });
        }
      });
      if (dimRef.current) dimRef.current.style.opacity = (dimMax * (1 - smoothstep(0.012, 0.065, p))).toFixed(3);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const ro = new ResizeObserver(() => {
      layout();
      update();
    });
    ro.observe(sticky);
    layout();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      frames.dispose();
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const setBeat = (i: number) => (el: HTMLDivElement | null) => {
    beatRefs.current[i] = el;
  };

  return (
    <section ref={sectionRef} className={styles.film} aria-label={f.aria} id="top">
      <div ref={stickyRef} className={styles.sticky} style={{ backgroundImage: "url(images/poster.webp)" }}>
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />

        <div ref={rectRef} className={styles.imageRect} data-on="false" data-labels="hide" aria-hidden="true">
          {LABELS.map((l, i) => (
            <span
              key={l.id}
              data-label={l.id}
              className={styles.label}
              style={{ left: `${l.x * 100}%`, top: `${l.y * 100}%`, transitionDelay: `${i * 70}ms` }}
            >
              {t.ingredients[l.id]}
            </span>
          ))}
        </div>

        <div className={styles.scrim} aria-hidden="true" />
        <div ref={dimRef} className={styles.dim} aria-hidden="true" />

        <div ref={setBeat(0)} className={styles.titleCard}>
          <h1 className={styles.title}>{f.title}</h1>
          <p className={styles.subtitle}>{f.subtitle}</p>
          <p className={styles.paperLine}>
            {f.paper}
            <span className={styles.venue}>{f.venue}</span>
          </p>
          <p className={styles.scrollCue} aria-hidden="true">
            <span>{f.scroll}</span>
            <span className={styles.cueLine} />
          </p>
        </div>

        <div className={styles.beats}>
          <div ref={setBeat(1)} className={styles.beat}>
            <h2 className={styles.beatH}>{f.problem.h}</h2>
            <p className={styles.beatP}>{f.problem.p}</p>
          </div>
          <div ref={setBeat(2)} className={styles.beat}>
            <p className={styles.stage}>{f.see.stage}</p>
            <h2 className={styles.beatH}>{f.see.h}</h2>
            <p className={styles.beatP}>{f.see.p}</p>
          </div>
          <div ref={setBeat(3)} className={styles.beat}>
            <h2 className={styles.beatH}>{f.detect.h}</h2>
            <p className={styles.beatP}>{f.detect.p}</p>
            <IngredientJson items={KITCHEN.map((k) => JSON_NAME[k])} perLine={3} className={styles.json} />
          </div>
          <div ref={setBeat(4)} className={styles.beat}>
            <p className={styles.stage}>{f.search.stage}</p>
            <h2 className={styles.beatH}>{f.search.h}</h2>
            <p className={styles.beatP}>{f.search.p}</p>
            <ol ref={traceRef} className={styles.trace} aria-label={f.search.traceNote}>
              {f.search.trace.map((line, i) => (
                <li key={line.code}>
                  <code data-k={i * 2 + 1} data-on={i === 0 ? "true" : "false"}>
                    {line.code}
                  </code>
                  <span data-k={i * 2 + 2} data-on="false">
                    {line.note}
                  </span>
                </li>
              ))}
            </ol>
            <p className={styles.traceNote}>{f.search.traceNote}</p>
          </div>
          <div ref={setBeat(5)} className={styles.beat}>
            <h2 className={styles.beatH}>{f.adapt.h}</h2>
            <p className={styles.beatP}>{f.adapt.p}</p>
          </div>
          <div ref={setBeat(6)} className={styles.beat}>
            <h2 className={styles.beatH}>{f.plate.h}</h2>
            <p className={styles.beatP}>{f.plate.p}</p>
          </div>
        </div>

        <p ref={loadingRef} className={styles.loading} aria-hidden="true" />
        <p className={styles.caption}>{f.caption}</p>
      </div>
    </section>
  );
}
