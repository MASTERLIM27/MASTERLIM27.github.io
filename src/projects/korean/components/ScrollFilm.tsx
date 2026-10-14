"use client";

import { useEffect, useRef } from "react";
import { useLang } from "@/projects/korean/lib/i18n";
import {
  BEATS,
  type BeatId,
  FRAME_ASPECT,
  FRAME_COUNT,
  FRAME_H,
  FRAME_W,
  HUD_FRAMES,
  HUD_POS,
  FOCUS,
  focusBox,
  STILLS,
  ZOOM_FOCUS,
  beatOpacity,
  frameAt,
  reducedFrameAt,
  smoothstep,
  zoomAt,
} from "@/projects/korean/lib/film";
import { FRAME_MAX_WIDTH, createFrameLoader } from "@/lib/filmFrames";
import PrintStill from "@/lib/PrintStill";
import styles from "./ScrollFilm.module.css";

const NAV_H = 64;
/** Beats that get their still in the printed storyboard; the others look like their neighbour. */
const PRINT_STILLS = new Set<BeatId>(["select", "practice", "align", "score"]);
/** The title's push-in is the largest the picture is ever drawn. */
const ZOOM_MAX = 1.045;
/** The picture is never drawn more than this much wider than the largest frame's own pixels. */
const MAX_STRETCH = 1.15;

export default function ScrollFilm() {
  const { t } = useLang();
  const f = t.film;

  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
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
    let zoom = 1;
    let drawn: HTMLImageElement | undefined;
    let drawnZoom = 0;
    let dimMax = 0.62;
    let raf = 0;

    /** Erases a strip of the canvas along one edge of the picture, opaque at the edge. */
    const dissolve = (x: number, y: number, w: number, h: number, gx: number, gy: number) => {
      const g = ctx.createLinearGradient(gx < 0 ? x + w : x, gy < 0 ? y + h : y, gx > 0 ? x + w : x, gy > 0 ? y + h : y);
      // An eased ramp: a straight one leaves a visible line where the backdrop meets the page.
      for (const [at, a] of [[0, 1], [0.2, 0.9], [0.4, 0.65], [0.6, 0.35], [0.8, 0.1], [1, 0]]) {
        g.addColorStop(at, `rgba(0, 0, 0, ${a})`);
      }
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h);
    };

    const paint = (force = false) => {
      const idx = frames.nearest(target);
      const img = idx < 0 ? undefined : frames.image(idx);
      if (!img || (!force && img === drawn && Math.abs(zoom - drawnZoom) < 0.0005)) return;
      // Zoom about the phone; the overlays only appear once the zoom is back to 1.
      const w = rect.w * zoom;
      const h = rect.h * zoom;
      const x = rect.x - (w - rect.w) * ZOOM_FOCUS.x;
      const y = rect.y - (h - rect.h) * ZOOM_FOCUS.y;
      const [rx, ry, rw, rh] = [rect.x * dpr, rect.y * dpr, rect.w * dpr, rect.h * dpr];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.save();
      ctx.beginPath();
      ctx.rect(rx, ry, rw, rh);
      ctx.clip();
      ctx.drawImage(img, x * dpr, y * dpr, w * dpr, h * dpr);
      // Where the picture stops short of the window, its edge dissolves into the page.
      ctx.globalCompositeOperation = "destination-out";
      const side = Math.round(rw * 0.15);
      const cap = Math.round(rh * 0.12);
      if (rect.x > 1) {
        dissolve(rx, ry, side, rh, 1, 0);
        dissolve(rx + rw - side, ry, side, rh, -1, 0);
      }
      if (rect.y > 1 && sticky.dataset.layout === "landscape") {
        dissolve(rx, ry, rw, cap, 0, 1);
        dissolve(rx, ry + rh - cap, rw, cap, 0, -1);
      }
      ctx.restore();
      if (!drawn) sticky.dataset.painted = "true";
      drawn = img;
      drawnZoom = zoom;
    };

    const frames = createFrameLoader({
      count: FRAME_COUNT,
      first: [1, ...Object.values(STILLS)],
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

    const placeOverlays = () => {
      const r = rectRef.current;
      if (!r) return;
      r.style.left = `${rect.x}px`;
      r.style.top = `${rect.y}px`;
      r.style.width = `${rect.w}px`;
      r.style.height = `${rect.h}px`;
      // The readout needs a wide picture and room around the beat text (not on phones turned sideways).
      r.dataset.labels = rect.w >= 940 && vh >= 500 ? "show" : "hide";
      // The beat text repeats the result only when the picture can't show the readout.
      sticky.dataset.labels = r.dataset.labels;
      // Wide screens crop the top of the picture: keep the readout below the nav bar.
      const minTop = NAV_H + 14 - rect.y;
      const hud = hudRef.current;
      if (hud) hud.style.top = `${Math.max(HUD_POS.y * rect.h, minTop)}px`;
    };

    const layout = () => {
      vw = sticky.clientWidth;
      vh = sticky.clientHeight;
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      const portrait = vw / vh < 1.2;
      if (portrait) {
        const w = vw;
        const h = w / FRAME_ASPECT;
        rect = { x: 0, y: Math.max(NAV_H, Math.round(vh * 0.1)), w, h };
      } else {
        // Fit the whole picture instead of filling the window. Filling a wide window scaled
        // the frames up to its width: the phone ran off the top and the frames were drawn
        // past their own pixels, which is what made the picture soft.
        const sharpest = (FRAME_MAX_WIDTH * MAX_STRETCH) / (dpr * ZOOM_MAX);
        const s = Math.min(vw / FRAME_W, vh / FRAME_H, sharpest / FRAME_W);
        const w = FRAME_W * s;
        const h = FRAME_H * s;
        rect = { x: (vw - w) / 2, y: (vh - h) / 2, w, h };
      }
      frames.resize(rect.w * dpr);
      // Until the first frame is drawn, the poster sits exactly where the picture will.
      sticky.style.backgroundSize = `${rect.w}px ${rect.h}px`;
      sticky.style.backgroundPosition = `${rect.x}px ${rect.y}px`;
      sticky.dataset.layout = portrait ? "portrait" : "landscape";
      // In portrait the title sits below the picture, so the picture needs only a light dim.
      dimMax = portrait ? 0.28 : 0.62;
      sticky.style.setProperty("--text-top", `${Math.round(rect.y + rect.h + 24)}px`);
      placeOverlays();
      paint(true);
    };

    const update = () => {
      raf = 0;
      const r = section.getBoundingClientRect();
      const span = r.height - vh;
      const p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
      target = reduce ? reducedFrameAt(p) : frameAt(p);
      zoom = reduce ? 1 : zoomAt(p);
      const onScreen = r.bottom > 0 && r.top < vh;
      frames.scrolled(onScreen, p);
      frames.aim(target);
      if (onScreen) paint();

      const rectEl = rectRef.current;
      BEATS.forEach((b, i) => {
        const el = beatRefs.current[i];
        if (!el) return;
        const o = beatOpacity(b, p);
        el.style.opacity = o.toFixed(3);
        el.style.transform = reduce || b.id === "title" ? "" : `translate3d(0, ${((1 - o) * 14).toFixed(1)}px, 0)`;
      });
      // Corner brackets follow the piece each beat is about.
      rectEl?.querySelectorAll<HTMLElement>("[data-focus]").forEach((el) => {
        const f = FOCUS.find((x) => x.id === el.dataset.focus);
        const b = f && BEATS.find((x) => x.id === f.beat);
        const box = f ? focusBox(f, target) : null;
        // Skip a box that would sit under the nav bar (wide screens crop the top of the picture).
        // On phones turned sideways the beat text covers the picture, so the brackets stay off.
        const roomy = !(sticky.dataset.layout === "landscape" && vh < 500);
        const clear = box && roomy ? rect.y + box[1] * rect.h >= NAV_H + 6 : false;
        const o = b && box && clear ? beatOpacity(b, p) : 0;
        el.style.opacity = o.toFixed(3);
        if (box && o > 0) {
          el.style.left = `${(box[0] * 100).toFixed(3)}%`;
          el.style.top = `${(box[1] * 100).toFixed(3)}%`;
          el.style.width = `${((box[2] - box[0]) * 100).toFixed(3)}%`;
          el.style.height = `${((box[3] - box[1]) * 100).toFixed(3)}%`;
        }
      });
      const hud = hudRef.current;
      if (hud) {
        const o = reduce ? (target >= HUD_FRAMES.to ? 1 : 0) : smoothstep(HUD_FRAMES.from, HUD_FRAMES.to, target);
        hud.style.opacity = o.toFixed(3);
        hud.style.transform = reduce ? "" : `translate3d(0, ${((1 - o) * 10).toFixed(1)}px, 0)`;
      }
      if (dimRef.current) dimRef.current.style.opacity = (dimMax * (1 - smoothstep(0.012, 0.06, p))).toFixed(3);
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

  const hud = f.hud;
  const beats = BEATS.filter((b) => b.id !== "title");

  return (
    <section ref={sectionRef} className={styles.film} aria-label={f.aria} id="top">
      <div ref={stickyRef} className={styles.sticky} style={{ backgroundImage: "url(images/poster.webp)" }}>
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />

        <div ref={rectRef} className={styles.imageRect} data-labels="hide" aria-hidden="true">
          {FOCUS.map((f) => (
            <span key={f.id} data-focus={f.id} data-tone={f.tone} className={styles.focus} />
          ))}
          <div ref={hudRef} className={styles.hud} style={{ right: `${HUD_POS.right * 100}%`, top: `${HUD_POS.y * 100}%` }}>
            <p className={styles.hudTop}>{hud.label}</p>
            <p className={styles.hudValue}>{hud.value}</p>
            <p className={styles.hudNote}>{hud.note}</p>
          </div>
        </div>

        <div className={styles.scrim} aria-hidden="true" />
        <div ref={dimRef} className={styles.dim} aria-hidden="true" />

        <div ref={setBeat(0)} className={styles.titleCard}>
          <PrintStill frame={1} className={styles.printCover} />
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
          {beats.map((b, i) => {
            const c = f.beats[b.id as Exclude<typeof b.id, "title">];
            return (
              <div key={b.id} ref={setBeat(i + 1)} className={styles.beat} data-beat={b.id}>
                {PRINT_STILLS.has(b.id) && <PrintStill frame={STILLS[b.id]} className={styles.printStill} />}
                {b.stage && (
                  <p className={styles.stage} data-stage={b.stage}>
                    {f.stages[b.stage]}
                  </p>
                )}
                <h2 className={styles.beatH}>{c.h}</h2>
                <p className={styles.beatP}>{c.p}</p>
                {b.id === "score" && (
                  <p className={styles.inlineHud}>
                    {hud.label} <strong>{hud.value}</strong>
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <p ref={loadingRef} className={styles.loading} aria-hidden="true" />
        <p className={styles.caption}>{f.caption}</p>
      </div>
    </section>
  );
}
