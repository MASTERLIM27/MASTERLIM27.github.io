"use client";

import { useEffect, useRef } from "react";
import { useLang } from "@/projects/tool-wear/lib/i18n";
import {
  BEATS,
  FRAME_ASPECT,
  FRAME_COUNT,
  FRAME_H,
  FRAME_W,
  HUD_FRAMES,
  HUD_POS,
  NET_TAG,
  SIGNAL_TAGS,
  STILLS,
  ZOOM_FOCUS,
  beatOpacity,
  frameAt,
  reducedFrameAt,
  smoothstep,
  zoomAt,
} from "@/projects/tool-wear/lib/film";
import { createFrameLoader } from "@/lib/filmFrames";
import PrintStill from "@/lib/PrintStill";
import { FIELDS, FIG5 } from "@/projects/tool-wear/content/paper";
import { FieldList, RuleCard } from "./ui";
import styles from "./ScrollFilm.module.css";

const NAV_H = 64;

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

    const paint = (force = false) => {
      const idx = frames.nearest(target);
      const img = idx < 0 ? undefined : frames.image(idx);
      if (!img || (!force && img === drawn && Math.abs(zoom - drawnZoom) < 0.0005)) return;
      // Zoom about the spindle; the overlays only appear once the zoom is back to 1.
      const w = rect.w * zoom;
      const h = rect.h * zoom;
      const x = rect.x - (w - rect.w) * ZOOM_FOCUS.x;
      const y = rect.y - (h - rect.h) * ZOOM_FOCUS.y;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, x * dpr, y * dpr, w * dpr, h * dpr);
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
      // Overlays need a wide picture and room around the beat text (not on phones turned sideways).
      r.dataset.labels = rect.w >= 720 && vh >= 500 ? "show" : "hide";
      // The beat text repeats the network sizes and the alarm only when the picture can't show them.
      sticky.dataset.labels = r.dataset.labels;
      // Wide screens crop the top of the picture: keep every overlay below the nav bar.
      const minTop = NAV_H + 14 - rect.y;
      r.querySelectorAll<HTMLElement>("[data-tag]").forEach((el) => {
        const y = Number(el.dataset.y) * rect.h;
        el.style.top = `${Math.max(y, minTop)}px`;
      });
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
        const s = Math.max(vw / FRAME_W, vh / FRAME_H);
        const w = FRAME_W * s;
        const h = FRAME_H * s;
        rect = { x: (vw - w) / 2, y: (vh - h) / 2, w, h };
      }
      frames.resize(rect.w * dpr);
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
        if (b.id === "signals") rectEl?.setAttribute("data-signals", o > 0.35 ? "on" : "off");
        if (b.id === "model") rectEl?.setAttribute("data-net", o > 0.35 ? "on" : "off");
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

  const hud = f.alert.hud;

  return (
    <section ref={sectionRef} className={styles.film} aria-label={f.aria} id="top">
      <div ref={stickyRef} className={styles.sticky} style={{ backgroundImage: "url(images/poster.webp)" }}>
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />

        <div
          ref={rectRef}
          className={styles.imageRect}
          data-signals="off"
          data-net="off"
          data-labels="hide"
          aria-hidden="true"
        >
          {SIGNAL_TAGS.map((tag, i) => (
            <span
              key={tag.id}
              data-tag="signal"
              data-y={tag.y}
              className={styles.signalTag}
              style={{ left: `${tag.x * 100}%`, top: `${tag.y * 100}%`, transitionDelay: `${i * 80}ms` }}
            >
              {f.signals.labels[tag.id]}
            </span>
          ))}
          <span
            data-tag="net"
            data-y={NET_TAG.y}
            className={styles.netTag}
            style={{ left: `${NET_TAG.x * 100}%`, top: `${NET_TAG.y * 100}%` }}
          >
            <span className={styles.netLabel}>{f.model.netLabel}</span>
            <code>{f.model.net}</code>
          </span>
          <div ref={hudRef} className={styles.hud} style={{ left: `${HUD_POS.x * 100}%`, top: `${HUD_POS.y * 100}%` }}>
            <p className={styles.hudTop}>
              <span className={styles.hudDot} />
              <span>{hud.tool(FIG5.tool)}</span>
              <span className={styles.hudStatus}>{hud.status}</span>
            </p>
            <p className={styles.hudHealth}>{hud.health(FIG5.health.toFixed(1))}</p>
            <p className={styles.hudLine}>{hud.load(FIG5.load)}</p>
            <p className={styles.hudLine}>{hud.temp(FIG5.temp)}</p>
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
          <div ref={setBeat(1)} className={styles.beat}>
            <h2 className={styles.beatH}>{f.problem.h}</h2>
            <p className={styles.beatP}>{f.problem.p}</p>
          </div>
          <div ref={setBeat(2)} className={styles.beat}>
            <PrintStill frame={STILLS.collect} className={styles.printStill} />
            <p className={styles.stage}>{f.collect.stage}</p>
            <h2 className={styles.beatH}>{f.collect.h}</h2>
            <p className={styles.beatP}>{f.collect.p}</p>
            <FieldList label={f.collect.fieldsLabel} fields={FIELDS.slice(0, 8)} className={styles.fields} />
          </div>
          <div ref={setBeat(3)} className={styles.beat}>
            <h2 className={styles.beatH}>{f.signals.h}</h2>
            <p className={styles.beatP}>{f.signals.p}</p>
          </div>
          <div ref={setBeat(4)} className={styles.beat}>
            <h2 className={styles.beatH}>{f.dataset.h}</h2>
            <p className={styles.beatP}>{f.dataset.p}</p>
            <RuleCard label={f.dataset.ruleLabel} className={styles.rule} />
          </div>
          <div ref={setBeat(5)} className={styles.beat}>
            <PrintStill frame={STILLS.model} className={styles.printStill} />
            <p className={styles.stage}>{f.model.stage}</p>
            <h2 className={styles.beatH}>{f.model.h}</h2>
            <p className={styles.beatP}>{f.model.p}</p>
            <p className={styles.inlineNet}>
              <code>{f.model.net}</code>
            </p>
          </div>
          <div ref={setBeat(6)} className={styles.beat}>
            <PrintStill frame={STILLS.alert} className={styles.printStill} />
            <h2 className={styles.beatH}>{f.alert.h}</h2>
            <p className={styles.beatP}>{f.alert.p}</p>
            <p className={styles.inlineHud}>
              <span className={styles.hudDot} />
              {hud.tool(FIG5.tool)} · {hud.health(FIG5.health.toFixed(1))} · {hud.status}
            </p>
          </div>
          <div ref={setBeat(7)} className={styles.beat}>
            <h2 className={styles.beatH}>{f.result.h}</h2>
            <p className={styles.beatP}>{f.result.p}</p>
          </div>
        </div>

        <p ref={loadingRef} className={styles.loading} aria-hidden="true" />
        <p className={styles.caption}>{f.caption}</p>
      </div>
    </section>
  );
}
