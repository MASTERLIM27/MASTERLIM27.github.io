/**
 * A scripted stand-in for the paper's practice loop (Section 3, Table 1), used by the demo.
 *
 * - An original café scene (not a YouTube video) with two speakers and six lines.
 * - Picking a speaker marks that speaker's lines; playback pauses on each of them.
 * - Each attempt produces deterministic, illustrative numbers in the shape the paper reports:
 *   cosine similarity before and after voice conversion (Eq. 1), the increase in similarity
 *   (Section 4.2), a speech-to-text check with word error rate (Section 4.3) and a
 *   phoneme alignment with accuracy = 1 - PER (Section 4.4). Nothing is recorded.
 * - The alignment between the target's and the learner's loudness envelopes is a real
 *   dynamic time warping (DTW) run on those synthetic envelopes.
 */

export type SpeakerId = "sua" | "minjun";

export interface Line {
  id: number;
  speaker: SpeakerId;
  start: number; // seconds
  end: number;
  ko: string;
  roman: string;
  en: string;
  /** What a speech-to-text pass mishears on a weak attempt: [word index, heard as]. */
  misheard: [number, string];
}

export const SCENE_LENGTH = 24;

export const LINES: Line[] = [
  {
    id: 1,
    speaker: "minjun",
    start: 0.6,
    end: 3.4,
    ko: "여기 자주 와요?",
    roman: "yeogi jaju wayo?",
    en: "Do you come here often?",
    misheard: [1, "자주요"],
  },
  {
    id: 2,
    speaker: "sua",
    start: 4.0,
    end: 7.4,
    ko: "네, 커피가 정말 맛있거든요.",
    roman: "ne, keopiga jeongmal masitgeodeunyo.",
    en: "Yes, the coffee here is really good.",
    misheard: [2, "정마"],
  },
  {
    id: 3,
    speaker: "minjun",
    start: 8.0,
    end: 11.0,
    ko: "추천해 줄 메뉴 있어요?",
    roman: "chucheonhae jul menyu isseoyo?",
    en: "Anything you'd recommend?",
    misheard: [2, "메뉴는"],
  },
  {
    id: 4,
    speaker: "sua",
    start: 11.6,
    end: 15.2,
    ko: "바닐라 라테 한번 마셔 보세요.",
    roman: "banilla rate hanbeon masyeo boseyo.",
    en: "Try the vanilla latte.",
    misheard: [3, "마셔요"],
  },
  {
    id: 5,
    speaker: "minjun",
    start: 15.8,
    end: 19.0,
    ko: "좋아요, 같이 주문할까요?",
    roman: "joayo, gachi jumunhalkkayo?",
    en: "Great, shall we order together?",
    misheard: [1, "가치"],
  },
  {
    id: 6,
    speaker: "sua",
    start: 19.6,
    end: 22.6,
    ko: "그래요, 제가 살게요!",
    roman: "geuraeyo, jega salgeyo!",
    en: "Sure, it's my treat!",
    misheard: [2, "살게"],
  },
];

/* ---------------- Hangul → jamo ---------------- */

const L = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ".split("");
const V = "ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ".split("");
const T = ["", ..."ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ".split("")];

/** Split each Hangul syllable into its letters (initial, vowel, optional final). */
export function toJamo(text: string): string[] {
  const out: string[] = [];
  for (const ch of text) {
    const c = ch.codePointAt(0) ?? 0;
    if (c < 0xac00 || c > 0xd7a3) continue;
    const s = c - 0xac00;
    out.push(L[Math.floor(s / 588)], V[Math.floor((s % 588) / 28)]);
    const t = T[s % 28];
    if (t) out.push(t);
  }
  return out;
}

/** Letters a learner often swaps. */
const CONFUSABLE: Record<string, string> = {
  ㅓ: "ㅗ",
  ㅗ: "ㅓ",
  ㅐ: "ㅔ",
  ㅔ: "ㅐ",
  ㄹ: "ㄴ",
  ㅂ: "ㅍ",
  ㅅ: "ㅆ",
  ㅈ: "ㅉ",
  ㄱ: "ㅋ",
  ㅡ: "ㅜ",
  ㅕ: "ㅛ",
  ㄷ: "ㅌ",
};

/* ---------------- deterministic noise ---------------- */

function rng(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------------- envelopes and DTW ---------------- */

/** A loudness envelope: one bump per syllable, with per-syllable length and height. */
function envelope(syllables: number, lengths: number[], heights: number[], jitter: () => number, noise: number) {
  const out: number[] = [];
  for (let i = 0; i < syllables; i++) {
    const n = lengths[i];
    for (let k = 0; k < n; k++) {
      const x = (k + 0.5) / n;
      const bump = Math.sin(Math.PI * x) ** 0.8 * heights[i];
      out.push(Math.max(0, bump + (jitter() - 0.5) * noise));
    }
    out.push(0.04, 0.03);
  }
  return out;
}

/** Classic O(n·m) DTW on absolute difference; returns the warping path from start to end. */
export function dtw(a: number[], b: number[]): { cost: number; path: [number, number][] } {
  const n = a.length;
  const m = b.length;
  const D = new Float64Array((n + 1) * (m + 1)).fill(Infinity);
  const at = (i: number, j: number) => i * (m + 1) + j;
  D[at(0, 0)] = 0;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const c = Math.abs(a[i - 1] - b[j - 1]);
      D[at(i, j)] = c + Math.min(D[at(i - 1, j)], D[at(i, j - 1)], D[at(i - 1, j - 1)]);
    }
  }
  const path: [number, number][] = [];
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    path.push([i - 1, j - 1]);
    const diag = D[at(i - 1, j - 1)];
    const up = D[at(i - 1, j)];
    const left = D[at(i, j - 1)];
    if (diag <= up && diag <= left) {
      i--;
      j--;
    } else if (up < left) i--;
    else j--;
  }
  path.reverse();
  return { cost: D[at(n, m)] / path.length, path };
}

/* ---------------- one practice attempt ---------------- */

export interface Attempt {
  /** Cosine similarity of the learner's own voice vs the target (Eq. 1). */
  original: number;
  /** Cosine similarity after converting the learner's voice into the target's style. */
  converted: number;
  /** Section 4.2: (converted - original) / original × 100. */
  increase: number;
  /** 100-point similarity score shown to the learner. */
  score: number;
  /** Speech-to-text of the attempt, word by word, with mismatches flagged. */
  heard: { word: string; ok: boolean }[];
  wer: number;
  /** Phoneme alignment of target vs converted learner speech. */
  phonemes: { target: string; user: string }[];
  phonemeAccuracy: number;
  target: number[];
  user: number[];
  path: [number, number][];
}

export function practice(line: Line, attempt: number): Attempt {
  const r = rng(line.id * 7919 + attempt * 104729);
  // Each try gets a little closer; the first is the roughest.
  const q = Math.min(0.97, 0.52 + 0.16 * attempt + r() * 0.08);

  const syll = [...line.ko].filter((c) => /[가-힣]/.test(c)).length;
  const r0 = rng(line.id * 31);
  const baseLen = Array.from({ length: syll }, () => 4 + Math.floor(r0() * 4));
  const baseH = Array.from({ length: syll }, (_, i) => 0.45 + 0.5 * r0() * (i === syll - 1 ? 0.6 : 1));
  const target = envelope(syll, baseLen, baseH, rng(line.id * 97), 0.05);
  const userLen = baseLen.map((n) => Math.max(3, n + Math.round((r() - 0.4) * 4 * (1.2 - q))));
  const userH = baseH.map((h) => Math.min(1, Math.max(0.15, h + (r() - 0.5) * 0.7 * (1.1 - q))));
  const user = envelope(syll, userLen, userH, r, 0.12 * (1.2 - q));
  const { path } = dtw(target, user);

  const original = 0.08 + 0.07 * q + r() * 0.02;
  const converted = 0.42 + 0.45 * q + r() * 0.02;
  const increase = ((converted - original) / original) * 100;

  const words = line.ko.split(" ");
  const missWord = attempt === 0 || q < 0.68;
  const heard = words.map((w, i) => {
    const wrong = missWord && i === line.misheard[0];
    return { word: wrong ? line.misheard[1] : w, ok: !wrong };
  });
  const wer = (heard.filter((h) => !h.ok).length / words.length) * 100;

  const jamo = toJamo(line.ko);
  const misses = Math.max(0, Math.round((1 - q) * jamo.length * 0.35));
  const swap = new Set<number>();
  const rr = rng(line.id * 13 + attempt);
  let guard = 0;
  while (swap.size < misses && guard++ < 200) {
    const k = Math.floor(rr() * jamo.length);
    if (CONFUSABLE[jamo[k]]) swap.add(k);
  }
  const phonemes = jamo.map((j, k) => ({ target: j, user: swap.has(k) ? CONFUSABLE[j] : j }));
  const phonemeAccuracy = (phonemes.filter((p) => p.target === p.user).length / phonemes.length) * 100;

  return {
    original,
    converted,
    increase,
    score: Math.round(converted * 100),
    heard,
    wer,
    phonemes,
    phonemeAccuracy,
    target,
    user,
    path,
  };
}
