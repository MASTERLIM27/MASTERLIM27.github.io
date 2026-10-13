import motion from "./motion.json";

/** 221 frames rendered from the two Veo clips, 1728×1152. The smaller sets are picked in src/lib/filmFrames.ts. */
export const FRAME_COUNT = 221;
export const FRAME_ASPECT = 1728 / 1152;
/**
 * Cumulative on-screen motion per frame (measured from frame differences), normalized 0–1.
 * Mapping scroll through this curve makes the film move at an even visual speed:
 * fast-moving stretches get more scroll distance, still stretches less.
 */
const CUM: number[] = motion as number[];

type Segment = { p0: number; p1: number; hold: number } | { p0: number; p1: number; f0: number; f1: number };

/** Scroll progress (0–1) → frames. Holds give the text time to be read. */
const SEGMENTS: Segment[] = [
  { p0: 0, p1: 0.06, hold: 1 },
  { p0: 0.06, p1: 0.37, f0: 1, f1: 112 },
  { p0: 0.37, p1: 0.5, hold: 112 },
  { p0: 0.5, p1: 0.86, f0: 112, f1: 200 },
  { p0: 0.86, p1: 1, f0: 200, f1: 221 },
];

export function frameAt(p: number): number {
  const s = SEGMENTS.find((seg) => p <= seg.p1) ?? SEGMENTS[SEGMENTS.length - 1];
  if ("hold" in s) return s.hold;
  const t = Math.min(1, Math.max(0, (p - s.p0) / (s.p1 - s.p0)));
  const c0 = CUM[s.f0 - 1];
  const c1 = CUM[s.f1 - 1];
  const target = c0 + t * (c1 - c0);
  // binary search for the frame whose cumulative motion is closest to target
  let lo = s.f0 - 1;
  let hi = s.f1 - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (CUM[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo + 1;
}

export type BeatId = "title" | "problem" | "see" | "detect" | "search" | "adapt" | "plate";

export const BEATS: { id: BeatId; start: number; end: number; open?: "start" | "end" }[] = [
  { id: "title", start: 0, end: 0.065, open: "start" },
  { id: "problem", start: 0.075, end: 0.205 },
  { id: "see", start: 0.215, end: 0.355 },
  { id: "detect", start: 0.37, end: 0.495 },
  { id: "search", start: 0.51, end: 0.69 },
  { id: "adapt", start: 0.7, end: 0.85 },
  { id: "plate", start: 0.865, end: 1, open: "end" },
];

const FADE = 0.022;
const smooth = (x: number) => {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
};

export function beatOpacity(b: (typeof BEATS)[number], p: number): number {
  if (p < b.start - 1e-6 || p > b.end + 1e-6) return 0;
  const fin = b.open === "start" ? 1 : smooth((p - b.start) / FADE);
  const fout = b.open === "end" ? 1 : smooth((b.end - p) / FADE);
  return Math.min(fin, fout);
}

/** With reduced motion, each beat shows one still frame and nothing scrubs. */
export const REDUCED_FRAME: Record<BeatId, number> = {
  title: 1,
  problem: 1,
  see: 60,
  detect: 112,
  search: 160,
  adapt: 196,
  plate: 221,
};

export function reducedFrameAt(p: number): number {
  let id: BeatId = "title";
  for (const b of BEATS) if (p >= b.start) id = b.id;
  return REDUCED_FRAME[id];
}

/**
 * Where each ingredient floats in the held "detection" frame (112), as a fraction of
 * the image. Labels sit just outside each item.
 */
export const LABELS: { id: "garlic" | "chili" | "tofu" | "soy" | "ginger" | "scallion"; x: number; y: number }[] = [
  { id: "garlic", x: 0.1, y: 0.235 },
  { id: "chili", x: 0.3, y: 0.48 },
  { id: "tofu", x: 0.465, y: 0.075 },
  { id: "soy", x: 0.69, y: 0.18 },
  { id: "ginger", x: 0.575, y: 0.715 },
  { id: "scallion", x: 0.86, y: 0.11 },
];
