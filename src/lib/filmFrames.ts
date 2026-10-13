/*
  Frame loading shared by the three scroll films.

  Each film is a few hundred stills scrubbed by scroll. Fetching every one of them when the
  page opened cost 13–17 MB per project page, most of it for readers who never scroll the
  film. This loader fetches a film in the order it is watched instead:

    - on arrival: the title frame, each beat's still and a coarse pass (about 25 frames);
    - once the reader is scrolling through the film: the frames around the playhead,
      nearest first, with the frames ahead favoured over the ones behind;
    - nothing while the film is off screen.

  It also picks the frame set from the size the picture is actually drawn at, so a frame is
  never stretched noticeably past its own pixels, and a small window is never sent the
  largest files.
*/

/** The published frame sets, smallest first. `frames-md` is made by scripts/make-frames-md.sh. */
const SETS = [
  { dir: "frames-sm", width: 864 },
  { dir: "frames-md", width: 1296 },
  { dir: "frames", width: 1728 },
] as const;

/** Width of the largest published frame. */
export const FRAME_MAX_WIDTH = SETS[SETS.length - 1].width;

/** A frame may be drawn this much wider than its file before the next set up is used. */
const STRETCH = 1.1;

const PARALLEL = 6;
/** Stride of the coarse pass that is fetched before the reader touches the film. */
const COARSE = 16;
/** The opening frames get a finer pass too, since that is where every reader starts. */
const LEAD_IN = 33;
/** How far around the playhead, in frames, the dense pass reaches. */
const AHEAD = 96;
const BEHIND = 32;
/** Scrolling slower than this (film lengths per second) is watching, faster is passing by. */
const WATCHING_SPEED = 1.1;
const SETTLE_MS = 280;

export interface FrameLoaderOptions {
  count: number;
  /** Fetched as soon as the film is on screen: the title frame and each beat's still. */
  first: number[];
  /** Reduced motion shows only the stills, so nothing else is ever fetched. */
  stillsOnly?: boolean;
  /** A frame arrived; repaint if it is the one wanted. */
  onFrame: () => void;
  /** The frame under the playhead is, or is no longer, still on its way. */
  onWaiting?: (waiting: boolean, percent: number) => void;
}

export interface FrameLoader {
  /** Index of the loaded frame nearest to `i`, or -1 while nothing has arrived. */
  nearest(i: number): number;
  image(i: number): HTMLImageElement | undefined;
  /** The frame the scroll position wants; the loader fetches around it. */
  aim(i: number): void;
  /** Device pixels the picture is drawn across; picks the frame set. */
  resize(devicePx: number): void;
  /** Whether any of the film is on screen, and how far through it the reader is (0–1). */
  scrolled(onScreen: boolean, progress: number): void;
  dispose(): void;
}

export function createFrameLoader(opts: FrameLoaderOptions): FrameLoader {
  const { count } = opts;
  const imgs: (HTMLImageElement | undefined)[] = [];
  /** Rank (index into SETS) of the image held for each frame, and of the one on its way. */
  const have = new Int8Array(count + 1).fill(-1);
  const pending = new Int8Array(count + 1).fill(-1);
  const tries = new Uint8Array(count + 1);

  const eager = new Set<number>(opts.first.filter((i) => i >= 1 && i <= count));
  if (!opts.stillsOnly) {
    for (let i = 1; i <= count; i += COARSE) eager.add(i);
    for (let i = 1; i <= Math.min(count, LEAD_IN); i += 4) eager.add(i);
    eager.add(count);
  }

  let rank = 0;
  let target = 1;
  let dir = 1;
  let visible = false;
  let engaged = false;
  let inflight = 0;
  let loaded = 0;
  let waiting = false;
  let disposed = false;
  let progress = 0;
  let settle: ReturnType<typeof setTimeout> | undefined;

  /** Coarser grids count as nearer, so a stretch is roughly there before any of it is dense. */
  const grid = (i: number) => {
    const k = i - 1;
    return k % 16 === 0 ? 16 : k % 8 === 0 ? 8 : k % 4 === 0 ? 4 : k % 2 === 0 ? 2 : 1;
  };

  const pick = (): number => {
    let best = -1;
    let bestScore = Infinity;
    for (let i = 1; i <= count; i++) {
      if (have[i] >= rank || pending[i] >= rank || tries[i] >= 2) continue;
      const d = (i - target) * dir;
      let score: number;
      if (eager.has(i)) {
        score = Math.abs(d) / count - 1;
      } else {
        if (!engaged) continue;
        const g = grid(i);
        if (g < 8 && (d > AHEAD || d < -BEHIND)) continue;
        score = (d >= 0 ? d : -2 * d) / g;
      }
      if (score < bestScore) {
        bestScore = score;
        best = i;
      }
    }
    return best;
  };

  const report = () => {
    const now = visible && !imgs[target];
    if (now === waiting && !now) return;
    waiting = now;
    opts.onWaiting?.(now, Math.round((loaded / count) * 100));
  };

  const pump = () => {
    while (!disposed && visible && inflight < PARALLEL) {
      const i = pick();
      if (i < 0) break;
      const r = rank;
      pending[i] = r;
      inflight++;
      const img = new Image();
      img.decoding = "async";
      img.src = `${SETS[r].dir}/frame_${String(i).padStart(4, "0")}.webp`;
      img
        .decode()
        .then(() => {
          if (disposed) return;
          if (have[i] < 0) loaded++;
          if (r >= have[i]) {
            imgs[i] = img;
            have[i] = r;
          }
          opts.onFrame();
        })
        .catch(() => {
          // A missing frame falls back to its nearest loaded neighbour; it is tried twice.
          tries[i]++;
        })
        .finally(() => {
          inflight--;
          if (pending[i] === r) pending[i] = -1;
          if (disposed) return;
          report();
          pump();
        });
    }
  };

  const inside = (x: number) => x > 0.002 && x < 0.998;

  // A jump to a section below sweeps the whole film in about a second. So the dense pass
  // starts only once the reader has been inside the film for a moment and is moving slowly.
  const arm = () => {
    const from = progress;
    settle = setTimeout(() => {
      settle = undefined;
      if (disposed || engaged || !visible || !inside(progress)) return;
      if (Math.abs(progress - from) / (SETTLE_MS / 1000) > WATCHING_SPEED) {
        arm();
        return;
      }
      engaged = true;
      pump();
    }, SETTLE_MS);
  };

  return {
    nearest(i) {
      if (imgs[i]) return i;
      for (let d = 1; d < count; d++) {
        if (imgs[i - d]) return i - d;
        if (imgs[i + d]) return i + d;
      }
      return -1;
    },

    image: (i) => imgs[i],

    aim(i) {
      if (i !== target) {
        dir = i > target ? 1 : -1;
        target = i;
      }
      report();
      pump();
    },

    resize(devicePx) {
      const found = SETS.findIndex((s) => devicePx <= s.width * STRETCH);
      const next = found < 0 ? SETS.length - 1 : found;
      if (next === rank) return;
      rank = next;
      pump();
    },

    scrolled(onScreen, p) {
      progress = p;
      if (onScreen !== visible) {
        visible = onScreen;
        report();
        pump();
      }
      if (engaged || opts.stillsOnly || settle !== undefined) return;
      if (onScreen && inside(p)) arm();
    },

    dispose() {
      disposed = true;
      if (settle !== undefined) clearTimeout(settle);
    },
  };
}
