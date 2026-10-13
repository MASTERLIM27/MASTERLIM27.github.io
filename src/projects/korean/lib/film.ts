import motion from "./motion.json";

/**
 * 241 frames built from the two generated clips (scripts/build_film.py, scripts/make_frames.py).
 * Frames 1–121, clip 1: the phone playing the café scene comes apart into an exploded view, and the
 *   video's contents float out with it (the woman's photo card, her voice as a sound wave, a microphone,
 *   speech bubbles and glass Hangul letters). The pieces settle from about frame 96.
 * Frames 122–241, clip 2: everything reassembles (to about frame 176, the phone glowing cyan with the
 *   woman paused), then the matched cyan and coral waveforms and the coral ring fade in (176–200).
 */
export const FRAME_COUNT = (motion as number[]).length;
export const FRAME_W = 1728;
export const FRAME_H = 1152;
export const FRAME_ASPECT = FRAME_W / FRAME_H;

/** Cumulative on-screen motion per frame, normalized 0–1: mapping scroll through it gives an even visual speed. */
const CUM: number[] = motion as number[];

export const KEY = {
  start: 1,
  settled: 96, // the exploded pieces have nearly stopped moving
  exploded: 121, // end of clip 1
  reassembled: 176, // the phone is whole again, glowing cyan, the woman paused
  result: 200, // waveforms and ring fully in
  end: FRAME_COUNT,
};

type Segment = { p0: number; p1: number; hold: number } | { p0: number; p1: number; f0: number; f1: number };

const SEGMENTS: Segment[] = [
  { p0: 0, p1: 0.15, hold: 1 },
  { p0: 0.15, p1: 0.27, f0: 1, f1: KEY.settled },
  { p0: 0.27, p1: 0.56, f0: KEY.settled, f1: KEY.exploded },
  { p0: 0.56, p1: 0.7, f0: KEY.exploded, f1: KEY.reassembled },
  { p0: 0.7, p1: 0.84, f0: KEY.reassembled, f1: KEY.result },
  { p0: 0.84, p1: 1, f0: KEY.result, f1: KEY.end },
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

export type BeatId = "title" | "problem" | "select" | "segments" | "transcribe" | "practice" | "align" | "score";

/** The problem stays up while the phone starts to come apart; the explosion then plays without text. */
export const BEATS: { id: BeatId; start: number; end: number; open?: "start" | "end"; stage?: "find" | "practice" }[] =
  [
    { id: "title", start: 0, end: 0.055, open: "start" },
    { id: "problem", start: 0.065, end: 0.19 },
    { id: "select", start: 0.28, end: 0.365, stage: "find" },
    { id: "segments", start: 0.375, end: 0.46 },
    { id: "transcribe", start: 0.47, end: 0.555 },
    { id: "practice", start: 0.57, end: 0.69, stage: "practice" },
    { id: "align", start: 0.7, end: 0.835 },
    { id: "score", start: 0.85, end: 1, open: "end" },
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

/** A slow push-in on the phone during the title and the problem, eased back out as it comes apart. */
export function zoomAt(p: number): number {
  const bump = p <= 0.15 ? smoothstep(0, 0.15, p) : 1 - smoothstep(0.15, 0.24, p);
  return 1 + 0.045 * bump;
}
export const ZOOM_FOCUS = { x: 0.6, y: 0.48 };

/** Reduced motion: one still per beat. */
export const STILLS: Record<BeatId, number> = {
  title: 1,
  problem: 1,
  select: 100,
  segments: 110,
  transcribe: KEY.exploded,
  practice: KEY.reassembled,
  align: KEY.result,
  score: KEY.end,
};

export function reducedFrameAt(p: number): number {
  let id: BeatId = "title";
  for (const b of BEATS) if (p >= b.start) id = b.id;
  return STILLS[id];
}

/**
 * Detection-style corner brackets around the piece each beat talks about, like the paper's face box.
 * Boxes are [x0, y0, x1, y1] measured on the frames at 864 × 576 and keyed by frame, because the
 * exploded pieces still drift a little while they settle.
 */
export type FocusId = "face" | "voice" | "text" | "wave" | "ring";
export const FOCUS: { id: FocusId; beat: BeatId; tone: "target" | "learner"; keys: [number, number[]][] }[] = [
  {
    id: "face",
    beat: "select",
    tone: "target",
    keys: [
      [90, [279, 127, 391, 280]],
      [105, [267, 124, 386, 280]],
      [121, [264, 125, 380, 280]],
    ],
  },
  {
    id: "voice",
    beat: "segments",
    tone: "target",
    keys: [
      [90, [380, 172, 488, 243]],
      [105, [380, 174, 483, 251]],
      [121, [380, 162, 478, 256]],
    ],
  },
  {
    id: "text",
    beat: "transcribe",
    tone: "target",
    keys: [
      [90, [288, 275, 453, 433]],
      [105, [272, 275, 443, 428]],
      [121, [262, 277, 440, 428]],
    ],
  },
  {
    id: "wave",
    beat: "align",
    tone: "learner",
    keys: [
      [176, [444, 326, 616, 422]],
      [241, [444, 326, 616, 422]],
    ],
  },
  {
    id: "ring",
    beat: "score",
    tone: "learner",
    keys: [
      [200, [559, 67, 611, 119]],
      [241, [559, 67, 611, 119]],
    ],
  },
];

const GRID = { w: 864, h: 576 };

/** The box at a frame, as fractions of the picture, or null outside its keyed frames. */
export function focusBox(f: (typeof FOCUS)[number], frame: number): [number, number, number, number] | null {
  const k = f.keys;
  if (frame < k[0][0] - 6 || frame > k[k.length - 1][0] + 2) return null;
  let a = k[0];
  let b = k[k.length - 1];
  for (let i = 0; i < k.length - 1; i++) {
    if (frame >= k[i][0] && frame <= k[i + 1][0]) {
      a = k[i];
      b = k[i + 1];
    }
  }
  const t = b[0] === a[0] ? 0 : Math.min(1, Math.max(0, (frame - a[0]) / (b[0] - a[0])));
  const v = a[1].map((x, i) => x + (b[1][i] - x) * t);
  return [v[0] / GRID.w, v[1] / GRID.h, v[2] / GRID.w, v[3] / GRID.h];
}

/** Result readout, anchored by its right edge in the dark space right of the reassembled phone (its right edge is at 0.73). */
export const HUD_POS = { right: 0.03, y: 0.2 };
export const HUD_FRAMES = { from: 204, to: 216 };
