export type Lang = "en" | "ko";
export type L10n = { en: string; ko: string };

/** Ingredients that appear in the photo (and in the demo's kitchen). */
export type IngId = "garlic" | "chili" | "tofu" | "ginger" | "soy" | "scallion";
/** Ingredients a retrieved recipe may need but the kitchen does not have. */
export type ExtraId =
  | "beef"
  | "chicken"
  | "shrimp"
  | "noodles"
  | "kimchi"
  | "rice"
  | "egg"
  | "bokchoy"
  | "broccoli"
  | "beanpaste"
  | "butter";
export type AnyIng = IngId | ExtraId;

export type Taste = "spicy" | "mild";
export type Need = "lowSodium" | "diabetes" | "glutenFree" | "quick";
export type Level = "low" | "adaptable" | "high";

export interface Prefs {
  taste: Taste;
  needs: Need[];
}

export interface Recipe {
  id: string;
  title: L10n;
  /** w = importance weight used for ingredient overlap (main ingredient = 3). */
  core: { id: AnyIng; w: number; amount: L10n }[];
  /** Words a recipe site would index the recipe under. */
  tags: string[];
  taste: Taste;
  /** 0 = no heat, 1 = heat optional, 2 = spicy by design */
  spice: 0 | 1 | 2;
  sodium: Level;
  sugar: Level;
  gluten: "none" | "adaptable" | "contains";
  minutes: number;
  steps: { en: string[]; ko: string[] };
  tip: L10n;
  subs?: Partial<Record<AnyIng, L10n>>;
}
