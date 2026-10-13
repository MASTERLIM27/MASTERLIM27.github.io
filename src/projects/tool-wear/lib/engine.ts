/**
 * A small, deterministic stand-in for the paper's real-time monitor (Figure 5).
 *
 * - One sample = 1 s of machining. One machining cycle is 94 samples, with the
 *   spindle-load pattern of Figure 2(b): a short spike, ten cutting passes at about
 *   17 %, and a final spike near 95 %.
 * - Wear follows the paper's augmentation (Section 3.2): spindle temperature builds
 *   up gradually and spindle load during cutting rises into the 101–120 % band.
 * - "Health" stands in for the network's sigmoid output. It is a smooth function of
 *   the two abnormal thresholds the paper uses (load > 100 %, temperature > 48 °C),
 *   not the trained model.
 */
import { RULES } from "@/projects/tool-wear/content/paper";

export const CYCLE = 94;
export const WEAR_PER_CYCLE = 0.2;
export const HEALTH_ALARM = 50;
export const TOOL_NUMBER = 5;

const BASE_TEMP = 45;
const WORN_TEMP = 50;
const PLATEAU_LOAD = 17;
// A worn tool cuts inside the paper's synthetic 101–120 % band, a little lower at the pass edges.
const WORN_LOAD = 110;
const WORN_EDGE_LOAD = 104;

/** Cutting passes as [start, end) sample ranges, from Figure 2(b). */
const PASSES: [number, number][] = [
  [4, 9],
  [13, 18],
  [22, 27],
  [31, 35],
  [40, 45],
  [49, 54],
  [58, 63],
  [67, 72],
  [76, 81],
  [85, 90],
];

export type Phase = "idle" | "approach" | "cut" | "spike";

export interface Sample {
  i: number;
  phase: Phase;
  load: number;
  temp: number;
  zCurrent: number;
  zAbs: number;
  inUse: boolean;
  health: number;
}

export interface MonitorState {
  i: number;
  cycle: number;
  wear: number;
  temp: number;
  usage: number;
  health: number;
  seed: number;
}

export function createState(wear = 0, seed = 7): MonitorState {
  return { i: 0, cycle: 0, wear, temp: BASE_TEMP + wear * (WORN_TEMP - BASE_TEMP), usage: 0, health: 100, seed };
}

/** mulberry32: small seeded PRNG so every visit plays the same signals. */
function rand(st: MonitorState): number {
  st.seed = (st.seed + 0x6d2b79f5) | 0;
  let t = st.seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const noise = (st: MonitorState, amp: number) => (rand(st) * 2 - 1) * amp;

function phaseAt(s: number): Phase {
  if (s >= 1 && s <= 2) return "spike";
  if (s >= 91 && s <= 92) return "spike";
  if (PASSES.some(([a, b]) => s >= a && s < b)) return "cut";
  if (s < 4 || s > 92) return "idle";
  return "approach";
}

/** Probability that the tool is worn: both abnormal thresholds must be exceeded. */
export function wornProbability(load: number, temp: number): number {
  const margin = Math.min((load - RULES.loadAbnormal) / 10, (temp - RULES.tempAbnormal) / 1);
  return 1 / (1 + Math.exp(-4 * margin));
}

export function step(st: MonitorState, autoWear: boolean): Sample {
  const s = st.i % CYCLE;
  if (s === 0 && st.i > 0) {
    st.cycle += 1;
    if (autoWear) st.wear = Math.min(1, st.wear + WEAR_PER_CYCLE);
  }
  const phase = phaseAt(s);
  const w = st.wear;

  let load = 0;
  if (phase === "cut") {
    const pass = PASSES.find(([a, b]) => s >= a && s < b) as [number, number];
    const isEdge = s === pass[0] || s === pass[1] - 1;
    const healthy = PLATEAU_LOAD * (isEdge ? 0.55 : 1) + noise(st, 0.6);
    const worn = (isEdge ? WORN_EDGE_LOAD : WORN_LOAD) + noise(st, isEdge ? 1.5 : 3);
    load = (1 - w) * healthy + w * worn;
  } else if (phase === "spike") {
    const peak = s <= 2 ? (s === 1 ? 64 : 22) : s === 91 ? 38 : 95;
    load = peak + w * (RULES.synthLoadMax - 2 - peak) + noise(st, 2);
  }
  load = Math.max(0, Math.min(RULES.synthLoadMax, load));

  // Heat builds up gradually as the tool wears.
  const targetTemp = BASE_TEMP + w * (WORN_TEMP - BASE_TEMP);
  st.temp += (targetTemp - st.temp) * 0.08;
  const temp = Math.round((st.temp + noise(st, 0.04)) * 10) / 10;

  const zAbs = phase === "cut" || phase === "spike" ? -7 : phase === "approach" ? 70 : 134;
  const zCurrent =
    phase === "cut"
      ? -74 + noise(st, 3)
      : phase === "spike"
        ? -58 + noise(st, 4)
        : phase === "approach"
          ? 20 + noise(st, 2)
          : 5;

  // Section 3.2: a tool is in use when spindle load > 1 and the absolute Z position is below 0.
  const inUse = load > 1 && zAbs < 0;
  if (inUse) {
    st.usage += 1;
    st.health = Math.round(1000 * (1 - wornProbability(load, temp))) / 10;
  }

  const sample: Sample = { i: st.i, phase, load, temp, zCurrent, zAbs, inUse, health: st.health };
  st.i += 1;
  return sample;
}

/** Run the simulation forward without drawing, to fill the charts on first view. */
export function warmUp(st: MonitorState, n: number, autoWear = false): Sample[] {
  const out: Sample[] = [];
  for (let k = 0; k < n; k++) out.push(step(st, autoWear));
  return out;
}

export type Status = "good" | "critical";
export const statusOf = (health: number): Status => (health < HEALTH_ALARM ? "critical" : "good");
