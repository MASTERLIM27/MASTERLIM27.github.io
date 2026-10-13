"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { useLang } from "@/projects/tool-wear/lib/i18n";
import { RULES } from "@/projects/tool-wear/content/paper";
import {
  HEALTH_ALARM,
  TOOL_NUMBER,
  createState,
  statusOf,
  step,
  warmUp,
  type MonitorState,
  type Sample,
} from "@/projects/tool-wear/lib/engine";
import { Section, SectionHead } from "./ui";
import s from "./Monitor.module.css";

const WINDOW = 120;
const TICK_MS = 70;

type Series = "load" | "temp" | "zCurrent" | "zAbs";

const SCALES: Record<
  Series,
  {
    min: number;
    max: number;
    ticks: number[];
    limit?: number;
    unit: string;
    digits: number;
  }
> = {
  load: {
    min: 0,
    max: 125,
    ticks: [0, 50, 100],
    limit: RULES.loadAbnormal,
    unit: "%",
    digits: 0,
  },
  temp: {
    min: 44,
    max: 51,
    ticks: [45, 48, 50],
    limit: RULES.tempAbnormal,
    unit: " °C",
    digits: 1,
  },
  zCurrent: { min: -95, max: 65, ticks: [-75, 0, 50], unit: "", digits: 0 },
  zAbs: { min: -30, max: 150, ticks: [0, 70, 134], unit: "", digits: 0 },
};

interface LogEntry {
  id: number;
  kind: "alarm" | "replaced" | "loaded";
  cycle: number;
  health?: string;
}

interface Palette {
  ink: string;
  ink3: string;
  line: string;
  accent: string;
  alert: string;
  surface: string;
}

function readPalette(el: HTMLElement): Palette {
  const cs = getComputedStyle(el);
  const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  return {
    ink: v("--ink", "#edf2f5"),
    ink3: v("--ink-3", "#7a8791"),
    line: v("--line", "#222a31"),
    accent: v("--accent", "#43bdf0"),
    alert: v("--alert", "#ff5a52"),
    surface: v("--char-1", "#0a0d10"),
  };
}

function drawChart(canvas: HTMLCanvasElement, values: number[], series: Series, pal: Palette, hover: number | null) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (!w || !h) return;
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const sc = SCALES[series];
  const padL = 34;
  const padR = 8;
  const padT = 8;
  const padB = 6;
  const pw = w - padL - padR;
  const ph = h - padT - padB;
  const x = (i: number) => padL + (i / (WINDOW - 1)) * pw;
  const y = (v: number) => padT + (1 - (v - sc.min) / (sc.max - sc.min)) * ph;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.font = "10px 'JetBrains Mono Variable', ui-monospace, monospace";
  ctx.textBaseline = "middle";

  // Gridlines: solid hairlines one step off the surface, with tick labels.
  for (const tk of sc.ticks) {
    const yy = Math.round(y(tk)) + 0.5;
    ctx.strokeStyle = pal.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, yy);
    ctx.lineTo(w - padR, yy);
    ctx.stroke();
    ctx.fillStyle = pal.ink3;
    ctx.textAlign = "right";
    ctx.fillText(String(tk), padL - 6, yy);
  }

  // Abnormal threshold from Section 3.2 (its label is in the chart header, clear of the data).
  if (sc.limit !== undefined) {
    const yl = Math.round(y(sc.limit)) + 0.5;
    ctx.strokeStyle = pal.alert;
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.moveTo(padL, yl);
    ctx.lineTo(w - padR, yl);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  if (values.length < 2) return;
  const off = WINDOW - values.length;
  const path = () => {
    ctx.beginPath();
    values.forEach((v, i) => {
      const xx = x(i + off);
      const yy = y(Math.max(sc.min, Math.min(sc.max, v)));
      if (i === 0) ctx.moveTo(xx, yy);
      else ctx.lineTo(xx, yy);
    });
  };
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.lineWidth = 2;
  ctx.strokeStyle = pal.accent;
  path();
  ctx.stroke();
  if (sc.limit !== undefined) {
    // Redraw the part above the threshold in the alarm color.
    ctx.save();
    ctx.beginPath();
    ctx.rect(padL, 0, pw, y(sc.limit));
    ctx.clip();
    ctx.strokeStyle = pal.alert;
    path();
    ctx.stroke();
    ctx.restore();
  }

  // Latest value: a dot with a surface-colored ring.
  const last = values[values.length - 1];
  const lx = x(WINDOW - 1);
  const ly = y(Math.max(sc.min, Math.min(sc.max, last)));
  const over = sc.limit !== undefined && last > sc.limit;
  ctx.fillStyle = pal.surface;
  ctx.beginPath();
  ctx.arc(lx, ly, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = over ? pal.alert : pal.accent;
  ctx.beginPath();
  ctx.arc(lx, ly, 4, 0, Math.PI * 2);
  ctx.fill();

  // Hover crosshair with the value at that sample.
  if (hover !== null) {
    const i = Math.round(((hover - padL) / pw) * (WINDOW - 1)) - off;
    if (i >= 0 && i < values.length) {
      const hx = Math.round(x(i + off)) + 0.5;
      ctx.strokeStyle = pal.ink3;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(hx, padT);
      ctx.lineTo(hx, h - padB);
      ctx.stroke();
      const label = `${values[i].toFixed(sc.digits)}${sc.unit}`;
      ctx.font = "600 11px 'JetBrains Mono Variable', ui-monospace, monospace";
      const tw = ctx.measureText(label).width + 10;
      const bx = Math.min(Math.max(hx - tw / 2, padL), w - padR - tw);
      ctx.fillStyle = pal.surface;
      ctx.fillRect(bx, padT, tw, 18);
      ctx.strokeStyle = pal.line;
      ctx.strokeRect(bx + 0.5, padT + 0.5, tw - 1, 17);
      ctx.fillStyle = pal.ink;
      ctx.textAlign = "left";
      ctx.fillText(label, bx + 5, padT + 9.5);
    }
  }
}

function Chart({
  series,
  title,
  values,
  pal,
  limitLabel,
  big,
  ariaLabel,
}: {
  series: Series;
  title: string;
  values: number[];
  pal: Palette | null;
  limitLabel?: string;
  big?: boolean;
  ariaLabel: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const sc = SCALES[series];
  const last = values[values.length - 1] ?? 0;
  const over = sc.limit !== undefined && last > sc.limit;

  const latest = useRef({ values, pal, hover });
  latest.current = { values, pal, hover };

  useEffect(() => {
    if (ref.current && pal) drawChart(ref.current, values, series, pal, hover);
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const l = latest.current;
      if (l.pal) drawChart(el, l.values, series, l.pal, l.hover);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [series]);

  const onMove = useCallback((e: PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setHover(e.clientX - r.left);
  }, []);

  return (
    <figure className={big ? `${s.chart} ${s.big}` : s.chart}>
      <figcaption className={s.chartHead}>
        <span>{title}</span>
        {limitLabel && (
          <span className={s.limitKey}>
            <span className={s.limitSwatch} aria-hidden="true" />
            {limitLabel}
          </span>
        )}
        <strong className={over ? s.over : undefined}>
          {last.toFixed(sc.digits)}
          {sc.unit}
        </strong>
      </figcaption>
      <canvas
        ref={ref}
        className={s.canvas}
        role="img"
        aria-label={ariaLabel}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      />
    </figure>
  );
}

export default function Monitor() {
  const { t } = useLang();
  const m = t.monitor;

  const rootRef = useRef<HTMLDivElement>(null);
  const simRef = useRef<MonitorState>(createState(0));
  const histRef = useRef<Sample[]>([]);
  const latchedRef = useRef(false);
  const logId = useRef(0);

  const [, setTick] = useState(0);
  const [running, setRunning] = useState(false);
  const [autoWear, setAutoWear] = useState(true);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [announce, setAnnounce] = useState("");
  const [pal, setPal] = useState<Palette | null>(null);
  const userPaused = useRef(false);
  const autoWearRef = useRef(autoWear);
  autoWearRef.current = autoWear;

  // Fill the charts with a healthy tool before the first paint.
  if (histRef.current.length === 0) histRef.current = warmUp(simRef.current, WINDOW);

  useEffect(() => {
    if (rootRef.current) setPal(readPalette(rootRef.current));
  }, []);

  const pushLog = (e: Omit<LogEntry, "id">) => setLog((cur) => [{ ...e, id: ++logId.current }, ...cur].slice(0, 6));

  const advance = useCallback(() => {
    const sample = step(simRef.current, autoWearRef.current);
    const h = histRef.current;
    h.push(sample);
    if (h.length > WINDOW) h.shift();
    if (sample.inUse && sample.health < HEALTH_ALARM && !latchedRef.current) {
      latchedRef.current = true;
      pushLog({
        kind: "alarm",
        cycle: simRef.current.cycle + 1,
        health: sample.health.toFixed(1),
      });
      setAnnounce("alarm");
    }
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(advance, TICK_MS);
    return () => window.clearInterval(id);
  }, [running, advance]);

  // Start when the monitor scrolls into view, pause when it leaves (unless reduced motion).
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!reduce && !userPaused.current) setRunning(true);
        } else setRunning(false);
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const toggle = () => {
    userPaused.current = running;
    setRunning(!running);
  };

  const replace = () => {
    const st = simRef.current;
    st.wear = 0;
    st.usage = 0;
    st.health = 100;
    latchedRef.current = false;
    pushLog({ kind: "replaced", cycle: st.cycle + 1 });
    setAnnounce("replaced");
    setTick((n) => n + 1);
  };

  const loadWorn = () => {
    const st = simRef.current;
    st.wear = 1;
    st.temp = Math.max(st.temp, RULES.tempAbnormal);
    pushLog({ kind: "loaded", cycle: st.cycle + 1 });
    setTick((n) => n + 1);
  };

  const setWear = (v: number) => {
    simRef.current.wear = v / 100;
    setTick((n) => n + 1);
  };

  const st = simRef.current;
  const hist = histRef.current;
  const last = hist[hist.length - 1];
  // The alarm latches: the status stays critical until the tool is replaced.
  const status = latchedRef.current ? "critical" : statusOf(st.health);
  const alarmOn = latchedRef.current;
  const wearPct = Math.round(st.wear * 100);
  const vals = (k: Series) => hist.map((x) => x[k]);
  const fmt = (v: number, d = 1) => v.toFixed(d);

  const statusText = alarmOn ? m.alarm(TOOL_NUMBER) : m.ok(TOOL_NUMBER);
  const liveText = announce === "alarm" ? m.alarm(TOOL_NUMBER) : announce === "replaced" ? m.ok(TOOL_NUMBER) : "";

  return (
    <Section id="monitor">
      <SectionHead title={m.h}>
        <p className={s.intro}>{m.intro}</p>
        <p className={s.disclaimer}>{m.disclaimer}</p>
      </SectionHead>

      <div ref={rootRef} className={s.console} data-alarm={alarmOn}>
        <p className="visually-hidden" aria-live="polite">
          {liveText}
        </p>

        <div className={s.side}>
          <div className={s.statusCard} data-status={status}>
            <div className={s.statusTop}>
              <span className={s.lamp} data-status={status} aria-hidden="true" />
              <span className={s.toolName}>{t.film.alert.hud.tool(TOOL_NUMBER)}</span>
              <span className={s.statusPill} data-status={status}>
                {m.status[status]}
              </span>
            </div>
            <p className={s.healthLabel}>{m.health}</p>
            <p className={s.healthValue}>{fmt(st.health)}%</p>
            <div
              className={s.meter}
              role="meter"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={st.health}
              aria-label={m.health}
              data-status={status}
            >
              <span style={{ width: `${Math.max(0.5, st.health)}%` }} />
            </div>
            <p className={s.statusText} data-alarm={alarmOn}>
              {statusText}
            </p>
            <p className={s.note}>{m.healthAlarmNote(HEALTH_ALARM)}</p>
          </div>

          <div className={s.controls} role="group" aria-label={m.controls}>
            <div className={s.buttons}>
              <button type="button" className={s.primary} onClick={toggle} aria-pressed={running}>
                {running ? m.pause : m.start}
              </button>
              <button type="button" className={s.secondary} onClick={replace}>
                {m.replace}
              </button>
              <button type="button" className={s.secondary} onClick={loadWorn}>
                {m.worn}
              </button>
            </div>
            <label className={s.slider} htmlFor="monitor-wear">
              <span className={s.sliderHead}>
                <span>{m.wearLabel}</span>
                <output htmlFor="monitor-wear">{wearPct}%</output>
              </span>
              <input
                id="monitor-wear"
                type="range"
                min={0}
                max={100}
                step={1}
                value={wearPct}
                onChange={(e) => setWear(Number(e.target.value))}
              />
            </label>
            <label className={s.check} htmlFor="monitor-autowear">
              <input
                id="monitor-autowear"
                type="checkbox"
                checked={autoWear}
                onChange={(e) => setAutoWear(e.target.checked)}
              />
              <span>{m.wearAuto}</span>
            </label>
            <p className={s.runState} data-running={running}>
              <span aria-hidden="true" />
              {running ? m.running : m.paused}
            </p>
          </div>
          <div className={s.log}>
            <h3 className={s.logH}>{m.log.h}</h3>
            {log.length === 0 ? (
              <p className={s.logEmpty}>{m.log.empty}</p>
            ) : (
              <ol>
                {log.map((e) => (
                  <li key={e.id} data-kind={e.kind}>
                    {e.kind === "alarm"
                      ? m.log.alarm(e.cycle, e.health ?? "")
                      : e.kind === "replaced"
                        ? m.log.replaced(e.cycle)
                        : m.log.loaded}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        <div className={s.main}>
          <div className={s.charts}>
            <Chart
              series="load"
              title={m.charts.load}
              values={vals("load")}
              pal={pal}
              limitLabel={m.charts.loadLimit}
              big
              ariaLabel={`${m.charts.load}: ${fmt(last.load, SCALES.load.digits)}%. ${m.charts.loadLimit}.`}
            />
            <Chart
              series="temp"
              title={m.charts.temp}
              values={vals("temp")}
              pal={pal}
              limitLabel={m.charts.tempLimit}
              big
              ariaLabel={`${m.charts.temp}: ${fmt(last.temp)} °C. ${m.charts.tempLimit}.`}
            />
            <div className={s.smallCharts}>
              <Chart
                series="zCurrent"
                title={m.charts.zCurrent}
                values={vals("zCurrent")}
                pal={pal}
                ariaLabel={`${m.charts.zCurrent}: ${fmt(last.zCurrent, 0)}`}
              />
              <Chart
                series="zAbs"
                title={m.charts.zAbs}
                values={vals("zAbs")}
                pal={pal}
                ariaLabel={`${m.charts.zAbs}: ${fmt(last.zAbs, 0)}`}
              />
            </div>
            <p className={s.xLabel}>{m.charts.xLabel}</p>
          </div>
          <dl className={s.readouts} aria-label={m.readouts}>
            <div>
              <dt>{m.fields.zCurrent}</dt>
              <dd>{fmt(last.zCurrent, 0)}</dd>
            </div>
            <div>
              <dt>{m.fields.cycle}</dt>
              <dd>{st.cycle + 1}</dd>
            </div>
            <div>
              <dt>{m.fields.load}</dt>
              <dd data-over={last.load > RULES.loadAbnormal}>{fmt(last.load, SCALES.load.digits)}%</dd>
            </div>
            <div>
              <dt>{m.fields.temp}</dt>
              <dd data-over={last.temp > RULES.tempAbnormal}>{fmt(last.temp)} °C</dd>
            </div>
            <div>
              <dt>{m.fields.zAbs}</dt>
              <dd>{fmt(last.zAbs, 0)}</dd>
            </div>
            <div>
              <dt>{m.fields.tool}</dt>
              <dd>{TOOL_NUMBER}</dd>
            </div>
            <div>
              <dt>{m.fields.usage}</dt>
              <dd>
                {st.usage}
                <span className={s.unit}>{m.usageUnit}</span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </Section>
  );
}
