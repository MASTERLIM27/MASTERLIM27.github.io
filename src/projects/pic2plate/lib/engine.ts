/**
 * A small, deterministic stand-in for Pic2Plate's Stage 2 (Algorithm 2 in the paper):
 * search → fetch details → score 0–10 → refine the query until a recipe reaches τ
 * or K_max rounds pass → keep the top n → personalize.
 *
 * The real system calls an LLM for query writing, scoring and personalization and
 * searches live recipe sites. Here a fixed recipe pool replaces the web and a
 * transparent formula replaces the LLM's judgment, so the demo is honest about
 * being a simulation while following the same control flow.
 */
import { POOL } from "@/projects/pic2plate/content/recipes";
import type { AnyIng, IngId, Lang, Level, Need, Prefs, Recipe } from "@/projects/pic2plate/lib/types";

export const TAU = 7.5;
export const K_MAX = 3;
export const TOP_N = 2;

export const KITCHEN: IngId[] = ["garlic", "chili", "tofu", "ginger", "soy", "scallion"];

/** Names as the vision model writes them into the JSON list (cf. Figure 2). */
export const JSON_NAME: Record<IngId, string> = {
  garlic: "Garlic",
  chili: "Red Chili",
  tofu: "Tofu",
  ginger: "Ginger",
  soy: "Soy Sauce",
  scallion: "Spring Onion",
};

const SEARCH_WORD: Record<IngId, string> = {
  tofu: "tofu",
  garlic: "garlic",
  chili: "chili",
  ginger: "ginger",
  scallion: "spring onion",
  soy: "soy sauce",
};

const NEED_TERM: Record<Need, string> = {
  lowSodium: "low-sodium",
  diabetes: "diabetic-friendly",
  glutenFree: "gluten-free",
  quick: "quick",
};

const PRIORITY: Record<Prefs["taste"], IngId[]> = {
  spicy: ["tofu", "garlic", "chili", "ginger", "scallion", "soy"],
  mild: ["tofu", "garlic", "ginger", "scallion", "soy", "chili"],
};

export interface Scored {
  recipe: Recipe;
  score: number;
  overlap: number;
  fit: number;
  missing: AnyIng[];
}

export interface Round {
  k: number;
  query: string;
  results: Scored[];
  best: number;
  pass: boolean;
}

export interface RunResult {
  detected: IngId[];
  rounds: Round[];
  top: Scored[];
  /** true when no recipe reached τ and K_max stopped the loop */
  exhausted: boolean;
}

function indexTerms(r: Recipe): Set<string> {
  const s = new Set<string>(r.tags);
  s.add(r.taste);
  if (r.sodium === "low") s.add("low-sodium");
  if (r.sugar === "low") s.add("diabetic-friendly");
  if (r.gluten === "none") s.add("gluten-free");
  if (r.minutes <= 20) s.add("quick");
  for (const c of r.core) s.add(c.id);
  return s;
}

/** Keyword search over the pool: most matched terms first, then site popularity (pool order). */
export function search(terms: string[], k = 4): Recipe[] {
  return POOL.map((r, i) => {
    const idx = indexTerms(r);
    return { r, i, m: terms.filter((t) => idx.has(t)).length };
  })
    .filter((x) => x.m > 0)
    .sort((a, b) => b.m - a.m || a.i - b.i)
    .slice(0, k)
    .map((x) => x.r);
}

const level = (l: Level) => (l === "low" ? 1 : l === "adaptable" ? 0.85 : 0.5);

/** Stand-in for the LLM's 0–10 relevance score: 70% weighted ingredient overlap, 30% fit with the request. */
export function relevance(r: Recipe, have: Set<AnyIng>, prefs: Prefs): Scored {
  const total = r.core.reduce((s, c) => s + c.w, 0);
  const got = r.core.reduce((s, c) => s + (have.has(c.id) ? c.w : 0), 0);
  const overlap = got / total;
  const factors: number[] = [
    prefs.taste === "spicy" ? (r.spice === 2 ? 1 : r.spice === 1 ? 0.7 : 0.4) : r.spice === 2 ? 0.6 : 1,
  ];
  for (const n of prefs.needs) {
    if (n === "lowSodium") factors.push(level(r.sodium));
    if (n === "diabetes") factors.push(level(r.sugar));
    if (n === "glutenFree") factors.push(r.gluten === "none" ? 1 : r.gluten === "adaptable" ? 0.85 : 0.4);
    if (n === "quick") factors.push(r.minutes <= 20 ? 1 : r.minutes <= 35 ? 0.75 : 0.5);
  }
  const fit = factors.reduce((a, b) => a + b, 0) / factors.length;
  const score = Math.round(10 * (0.7 * overlap + 0.3 * fit) * 10) / 10;
  const missing = r.core.filter((c) => !have.has(c.id)).map((c) => c.id);
  return { recipe: r, score, overlap, fit, missing };
}

/** Round 0 uses the user's own request (Q₀ in Algorithm 2); later rounds rewrite it around the ingredients. */
export function queryFor(k: number, have: IngId[], prefs: Prefs): { text: string; terms: string[] } {
  if (k === 0) {
    const terms = [prefs.taste, ...prefs.needs.map((n) => NEED_TERM[n])];
    return { text: `${terms.join(" ")} recipe`, terms };
  }
  const ranked = PRIORITY[prefs.taste].filter((i) => have.includes(i));
  if (k === 1) {
    const ings = ranked.slice(0, 3);
    return { text: ings.map((i) => SEARCH_WORD[i]).join(" "), terms: ings };
  }
  const ings = ranked.slice(0, 2);
  return { text: [...ings.map((i) => SEARCH_WORD[i]), prefs.taste].join(" "), terms: [...ings, prefs.taste] };
}

export function run(have: IngId[], prefs: Prefs): RunResult {
  const detected = KITCHEN.filter((i) => have.includes(i));
  const set = new Set<AnyIng>(detected);
  const rounds: Round[] = [];
  for (let k = 0; k < K_MAX; k++) {
    const q = queryFor(k, detected, prefs);
    const results = search(q.terms)
      .map((r) => relevance(r, set, prefs))
      .sort((a, b) => b.score - a.score);
    const best = results[0]?.score ?? 0;
    const pass = best >= TAU;
    rounds.push({ k, query: q.text, results, best, pass });
    if (pass) break;
  }
  const last = rounds[rounds.length - 1];
  return { detected, rounds, top: last.results.slice(0, TOP_N), exhausted: !last.pass };
}

/* ---------- Personalization (the LLM's final rewrite, approximated with rules) ---------- */

export interface AdaptedLine {
  text: string;
  note?: string;
  missing?: boolean;
}

export interface Adapted {
  title: string;
  lines: AdaptedLine[];
  steps: string[];
  subs: string[];
  tips: string[];
}

/** Korean subject particle: 이 after a final consonant, 가 otherwise. */
export function iGa(word: string): string {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  if (code < 0 || code > 11171) return `${word}(이)가`;
  return code % 28 === 0 ? `${word}가` : `${word}이`;
}

const T = {
  en: {
    lowSodiumSoy: "1 tbsp low-sodium soy sauce",
    lowSodiumTamari: "1 tbsp low-sodium tamari",
    tamari: "Tamari, same amount",
    was: (s: string) => `was ${s}`,
    gfWas: (s: string) => `gluten-free; was ${s}`,
    mildChili: "½ red chili, seeds removed",
    milderWas: (s: string) => `milder; was ${s}`,
    riceNoodles: "200 g rice noodles",
    halfPaste: "½ tbsp chili bean paste",
    halvedSodium: "halved to cut sodium",
    rinsedKimchi: "½ cup kimchi, rinsed",
    rinsedNote: "rinsed and halved to cut sodium",
    mixedRice: "1 bowl brown rice + 1 bowl cauliflower rice",
    glycemicWas: (s: string) => `gentler on blood sugar; was ${s}`,
    addChili: "1 red chili, sliced",
    addedHeat: "added for heat",
    missingGeneric: (name: string) => `${name} is not in your kitchen; leave it out or use something similar.`,
    needSub: {
      lowSodium: "Season with rice vinegar, citrus or extra aromatics instead of more salt or soy sauce.",
      diabetes: "Keep sugar and sweet sauces out of the glaze, and serve with vegetables or brown rice.",
      glutenFree: "Check labels: soy sauce, bean pastes and noodles often contain wheat.",
    },
    quickSlow: "Short on time? Cut everything small and cook over higher heat to finish in about 20 minutes.",
    quickOk: (m: number) => `Ready in about ${m} minutes.`,
    tipSodium: "Taste before adding more soy sauce; sauces get saltier as they reduce.",
    prefix: { lowSodium: "Low-Sodium", diabetes: "Low-Sugar", glutenFree: "Gluten-Free", quick: "", mild: "Mild", spicy: "Spicy" },
  },
  ko: {
    lowSodiumSoy: "저염 간장 1큰술",
    lowSodiumTamari: "저염 타마리 간장 1큰술",
    tamari: "타마리 간장, 같은 양",
    was: (s: string) => `기존: ${s}`,
    gfWas: (s: string) => `글루텐 프리, 기존: ${s}`,
    mildChili: "홍고추 ½개, 씨 제거",
    milderWas: (s: string) => `덜 맵게, 기존: ${s}`,
    riceNoodles: "쌀국수 면 200g",
    halfPaste: "두반장 ½큰술",
    halvedSodium: "염분을 줄이려고 절반으로",
    rinsedKimchi: "김치 ½컵, 물에 헹군 것",
    rinsedNote: "염분을 줄이려고 헹구고 절반으로",
    mixedRice: "현미밥 1공기 + 콜리플라워 라이스 1공기",
    glycemicWas: (s: string) => `혈당 부담을 줄이려고, 기존: ${s}`,
    addChili: "홍고추 1개, 송송 썬 것",
    addedHeat: "매운맛을 더하려고 추가",
    missingGeneric: (name: string) => `${iGa(name)} 없다면 빼거나 비슷한 재료로 대신하세요.`,
    needSub: {
      lowSodium: "소금이나 간장을 더 넣는 대신 쌀식초, 시트러스, 향신 채소로 맛을 내세요.",
      diabetes: "양념에 설탕이나 단 소스는 넣지 말고, 채소나 현미밥과 함께 드세요.",
      glutenFree: "간장, 장류, 면에는 밀이 들어 있는 경우가 많으니 성분 표시를 확인하세요.",
    },
    quickSlow: "시간이 부족하다면 재료를 작게 썰고 센 불에서 조리해 20분 안팎에 끝내세요.",
    quickOk: (m: number) => `약 ${m}분이면 완성됩니다.`,
    tipSodium: "간장을 더 넣기 전에 맛을 보세요. 소스는 졸아들수록 짜집니다.",
    prefix: { lowSodium: "저염", diabetes: "저당", glutenFree: "글루텐 프리", quick: "", mild: "순한", spicy: "매콤" },
  },
};

export function adapt(
  s: Scored,
  have: IngId[],
  prefs: Prefs,
  lang: Lang,
  ingName: (id: AnyIng) => string,
): Adapted {
  const t = T[lang];
  const r = s.recipe;
  const owned = new Set<AnyIng>(have);
  const needs = new Set(prefs.needs);

  // Title: one health prefix plus a taste prefix, skipping words the title already has.
  let base = r.title[lang];
  const prefixes: string[] = [];
  const health = prefs.needs.find((n) => n !== "quick");
  if (health) prefixes.push(t.prefix[health]);
  if (prefs.taste === "mild" && r.spice === 2) {
    // "Spicy Garlic Tofu" becomes "Mild Garlic Tofu" rather than "Mild Spicy Garlic Tofu".
    if (base.includes(t.prefix.spicy)) base = base.replace(t.prefix.spicy, t.prefix.mild);
    else prefixes.push(t.prefix.mild);
  }
  if (prefs.taste === "spicy" && r.spice < 2 && owned.has("chili")) prefixes.push(t.prefix.spicy);
  const title = [...prefixes.filter((p) => p && !base.toLowerCase().includes(p.toLowerCase())), base].join(" ");

  const lines: AdaptedLine[] = r.core.map((c) => {
    const amount = c.amount[lang];
    const missing = !owned.has(c.id);
    if (c.id === "soy") {
      if (needs.has("lowSodium") && needs.has("glutenFree"))
        return { text: t.lowSodiumTamari, note: t.gfWas(amount), missing };
      if (needs.has("lowSodium")) return { text: t.lowSodiumSoy, note: t.was(amount), missing };
      if (needs.has("glutenFree")) return { text: t.tamari, note: t.gfWas(amount), missing };
    }
    if (c.id === "chili" && prefs.taste === "mild" && r.spice === 2)
      return { text: t.mildChili, note: t.milderWas(amount), missing };
    if (c.id === "noodles" && needs.has("glutenFree")) return { text: t.riceNoodles, note: t.gfWas(amount), missing };
    if (c.id === "beanpaste" && needs.has("lowSodium")) return { text: t.halfPaste, note: t.halvedSodium, missing };
    if (c.id === "kimchi" && needs.has("lowSodium")) return { text: t.rinsedKimchi, note: t.rinsedNote, missing };
    if (c.id === "rice" && needs.has("diabetes")) return { text: t.mixedRice, note: t.glycemicWas(amount), missing };
    return { text: amount, missing };
  });
  if (prefs.taste === "spicy" && r.spice < 2 && owned.has("chili") && !r.core.some((c) => c.id === "chili")) {
    lines.push({ text: t.addChili, note: t.addedHeat });
  }

  const subs: string[] = [];
  for (const id of s.missing) subs.push(r.subs?.[id]?.[lang] ?? t.missingGeneric(ingName(id)));
  for (const n of prefs.needs) {
    if (n === "quick") subs.push(r.minutes > 20 ? t.quickSlow : t.quickOk(r.minutes));
    else subs.push(t.needSub[n]);
  }

  const tips = [r.tip[lang]];
  if (needs.has("lowSodium") && r.core.some((c) => c.id === "soy")) tips.push(t.tipSodium);

  return { title, lines, steps: r.steps[lang], subs, tips };
}
