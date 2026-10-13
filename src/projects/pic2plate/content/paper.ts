// Every number on the site comes from the published paper:
// Soekamto et al., "Pic2Plate", Sensors 2025, 25(2), 449. doi:10.3390/s25020449

export const LINKS = {
  article: "https://www.mdpi.com/1424-8220/25/2/449",
  pdf: "https://www.mdpi.com/1424-8220/25/2/449/pdf",
  doi: "https://doi.org/10.3390/s25020449",
  code: "https://github.com/leonardcl/pic2plate",
} as const;

export type ModelKind = "vlm" | "seg";

/** Ingredient detection, Figure 5 (values as plotted; the text rounds to 2 decimals). */
export const DETECTION: {
  id: string;
  name: string;
  kind: ModelKind;
  precision: number;
  recall: number;
  f1: number;
  accuracy: number;
}[] = [
  { id: "gpt4o", name: "GPT-4o", kind: "vlm", precision: 0.8276, recall: 0.9119, f1: 0.8599, accuracy: 0.7731 },
  { id: "llama", name: "LLaMA 3.2 Vision", kind: "vlm", precision: 0.7883, recall: 0.8517, f1: 0.8042, accuracy: 0.6847 },
  { id: "foodsam", name: "FoodSAM", kind: "seg", precision: 0.5995, recall: 0.6532, f1: 0.6145, accuracy: 0.48 },
  { id: "swint", name: "Swin-T", kind: "seg", precision: 0.2536, recall: 0.553, f1: 0.3371, accuracy: 0.2178 },
];

export type SystemId = "a" | "b" | "c";

/** Bradley–Terry strengths normalized to 100% per test set, Figure 7.
 *  a = LLaMA 3.1 70B + RAG, b = LLaMA 3.1 70B only, c = GPT-4o + RAG. */
export const PREFERENCE: { set: number; a: number; b: number; c: number }[] = [
  { set: 1, a: 49.532, b: 24.996, c: 25.473 },
  { set: 2, a: 49.504, b: 24.631, c: 25.865 },
  { set: 3, a: 45.411, b: 29.797, c: 24.792 },
  { set: 4, a: 52.575, b: 22.865, c: 24.561 },
  { set: 5, a: 46.088, b: 25.756, c: 28.156 },
];

export type ReasonId = "relevant" | "ease" | "reliable" | "diverse";

/** Reasons ticked for the best-rated system, out of 120 participants per set
 *  (multiple answers allowed), Figure 8. Index 0 = Set 1. */
export const REASONS: Record<ReasonId, number[]> = {
  relevant: [72, 75, 57, 66, 63],
  ease: [57, 48, 64, 57, 56],
  reliable: [42, 49, 49, 48, 50],
  diverse: [22, 26, 29, 33, 35],
};

/** Survey participants, Figure 6. */
export const PARTICIPANTS = {
  total: 120,
  women: 59,
  men: 61,
  /** ≤20, 21–30, 31–40, 41–50, 51–60 */
  age: [9, 73, 26, 10, 2],
};

export const AUTHORS: { name: string; affil: number[]; corresponding?: boolean }[] = [
  { name: "Yosua Setyawan Soekamto", affil: [1, 2] },
  { name: "Andreas Lim", affil: [1] },
  { name: "Leonard Christopher Limanjaya", affil: [1] },
  { name: "Yoshua Kaleb Purwanto", affil: [1] },
  { name: "Suk-Ho Lee", affil: [1] },
  { name: "Dae-Ki Kang", affil: [1], corresponding: true },
];

export const CITATION =
  "Soekamto, Y.S.; Lim, A.; Limanjaya, L.C.; Purwanto, Y.K.; Lee, S.-H.; Kang, D.-K. " +
  "Pic2Plate: A Vision-Language and Retrieval-Augmented Framework for Personalized Recipe Recommendations. " +
  "Sensors 2025, 25, 449. https://doi.org/10.3390/s25020449";

export const BIBTEX = `@article{soekamto2025pic2plate,
  title   = {Pic2Plate: A Vision-Language and Retrieval-Augmented Framework for Personalized Recipe Recommendations},
  author  = {Soekamto, Yosua Setyawan and Lim, Andreas and Limanjaya, Leonard Christopher and Purwanto, Yoshua Kaleb and Lee, Suk-Ho and Kang, Dae-Ki},
  journal = {Sensors},
  volume  = {25},
  number  = {2},
  pages   = {449},
  year    = {2025},
  doi     = {10.3390/s25020449},
  url     = {https://www.mdpi.com/1424-8220/25/2/449}
}`;

/** Example ingredient JSON shown in the paper, Figure 2. */
export const PAPER_JSON_EXAMPLE = ["Beef", "Radish", "Garlic", "Egg", "Spring Onion", "Onion"];
