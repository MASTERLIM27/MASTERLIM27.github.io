import motion from "./motion.json";

/**
 * 218 frames built from the two generated clips (scripts/build_film.py):
 * frames 1–113 clip 1 (machining, then the data layer dissolves in over frames 2–17),
 * 114–121 crossfade, 122–218 clip 2 (red trace, alarm light 152–168, output turns red 186–198).
 */
export const FRAME_COUNT = 218;
export const FRAME_W = 1728;
export const FRAME_H = 1152;
export const FRAME_ASPECT = FRAME_W / FRAME_H;

/**
 * Cumulative on-screen motion per frame (measured from frame differences), normalized 0–1.
 * Mapping scroll through this curve gives an even visual speed.
 */
const CUM: number[] = motion as number[];

type Segment = { p0: number; p1: number; hold: number } | { p0: number; p1: number; f0: number; f1: number };

/** Scroll progress (0–1) → frames. */
const SEGMENTS: Segment[] = [
  { p0: 0, p1: 0.17, hold: 1 },
  { p0: 0.17, p1: 0.3, f0: 1, f1: 48 },
  { p0: 0.3, p1: 0.42, f0: 48, f1: 82 },
  { p0: 0.42, p1: 0.54, f0: 82, f1: 113 },
  { p0: 0.54, p1: 0.66, f0: 113, f1: 152 },
  { p0: 0.66, p1: 0.82, f0: 152, f1: 200 },
  { p0: 0.82, p1: 1, f0: 200, f1: FRAME_COUNT },
];

export function frameAt(p: number): number {
  const s = SEGMENTS.find((seg) => p <= seg.p1) ?? SEGMENTS[SEGMENTS.length - 1];
  if ("hold" in s) return s.hold;
  const t = Math.min(1, Math.max(0, (p - s.p0) / (s.p1 - s.p0)));
  const target = CUM[s.f0 - 1] + t * (CUM[s.f1 - 1] - CUM[s.f0 - 1]);
  let lo = s.f0 - 1;
  let hi = s.f1 - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (CUM[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo + 1;
}

export type BeatId = "title" | "problem" | "collect" | "signals" | "dataset" | "model" | "alert" | "result";

export const BEATS: { id: BeatId; start: number; end: number; open?: "start" | "end" }[] = [
  { id: "title", start: 0, end: 0.055, open: "start" },
  { id: "problem", start: 0.065, end: 0.165 },
  { id: "collect", start: 0.18, end: 0.29 },
  { id: "signals", start: 0.305, end: 0.415 },
  { id: "dataset", start: 0.43, end: 0.535 },
  { id: "model", start: 0.55, end: 0.655 },
  { id: "alert", start: 0.67, end: 0.82 },
  { id: "result", start: 0.835, end: 1, open: "end" },
];

const FADE = 0.02;
export const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function beatOpacity(b: (typeof BEATS)[number], p: number): number {
  if (p < b.start - 1e-6 || p > b.end + 1e-6) return 0;
  const fin = b.open === "start" ? 1 : smoothstep(0, 1, (p - b.start) / FADE);
  const fout = b.open === "end" ? 1 : smoothstep(0, 1, (b.end - p) / FADE);
  return Math.min(fin, fout);
}

/** A slow push-in on the machine while the title and the problem are on screen, eased back out as the data appears. */
export function zoomAt(p: number): number {
  const bump = p <= 0.17 ? smoothstep(0, 0.17, p) : 1 - smoothstep(0.17, 0.27, p);
  return 1 + 0.045 * bump;
}
export const ZOOM_FOCUS = { x: 0.5, y: 0.46 };

/** Reduced motion: one still per beat, nothing scrubs or zooms. */
export const STILLS: Record<BeatId, number> = {
  title: 1,
  problem: 1,
  collect: 40,
  signals: 70,
  dataset: 100,
  model: 140,
  alert: 200,
  result: FRAME_COUNT,
};

export function reducedFrameAt(p: number): number {
  let id: BeatId = "title";
  for (const b of BEATS) if (p >= b.start) id = b.id;
  return STILLS[id];
}

/** The four ribbon bundles enter the network at these points (fractions of the picture). */
export const SIGNAL_TAGS: { id: "load" | "temp" | "zcur" | "zpos"; x: number; y: number }[] = [
  { id: "load", x: 0.247, y: 0.236 },
  { id: "temp", x: 0.247, y: 0.326 },
  { id: "zcur", x: 0.247, y: 0.358 },
  { id: "zpos", x: 0.247, y: 0.413 },
];

/** Under the network's columns. */
export const NET_TAG = { x: 0.039, y: 0.455 };

/** Readout panel in the dark space right of the spindle, where the red alarm light falls. */
export const HUD_POS = { x: 0.64, y: 0.15 };
/** The output point turns red over frames 186–198. */
export const HUD_FRAMES = { from: 188, to: 198 };
