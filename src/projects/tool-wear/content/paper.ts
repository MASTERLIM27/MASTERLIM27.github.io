// Every number on the site comes from the published paper:
// Lim, A.; Lee, H.; Lee, S.-H. "AI-based Tool Wear Prediction for MCT Machines based on Multi-modal Data."
// International Journal of Internet, Broadcasting and Communication (IJIBC) 18(1), 361–369, 2026.
// doi:10.7236/IJIBC.2026.18.1.361

export const LINKS = {
  doi: "https://doi.org/10.7236/IJIBC.2026.18.1.361",
} as const;

/** Correlation of each signal with program cycle time, read from Figure 2(a).
 *  `circled` marks the six cells the authors circled in the figure.
 *  Five near-zero cells whose digits can't be read in the published figure are left out
 *  (xabs, xposition, yloadmeter, zcurr, zposition). */
export const CORRELATION: { id: string; r: number; circled?: boolean }[] = [
  { id: "zdistance", r: 0.36, circled: true },
  { id: "zabs", r: 0.21, circled: true },
  { id: "xcurr", r: 0.19, circled: true },
  { id: "toolnum", r: 0.07 },
  { id: "ycurr", r: 0.06 },
  { id: "xdistance", r: 0.05 },
  { id: "yabs", r: 0.05 },
  { id: "spindlespeed", r: 0.04 },
  { id: "zloadmeter", r: 0.02 },
  { id: "ydistance", r: 0.01 },
  { id: "yposition", r: -0.0 },
  { id: "xloadmeter", r: -0.03 },
  { id: "ytemp", r: -0.1 },
  { id: "spindletemp", r: -0.16, circled: true },
  { id: "ztemp", r: -0.16, circled: true },
  { id: "xtemp", r: -0.25, circled: true },
];

/** Columns of the collected-data table shown in Figure 1 (a selection). */
export const FIELDS = [
  "spindleload",
  "spindletemp",
  "spindlespeed",
  "xabs",
  "xcurr",
  "xdistance",
  "xloadmeter",
  "xposition",
  "xtemp",
  "yabs",
  "ycurr",
  "ydistance",
];

/** Dataset rules, Section 3.2. */
export const RULES = {
  loadAbnormal: 100, // spindle load > 100 is abnormal
  tempAbnormal: 48, // spindle temperature > 48 °C is abnormal
  synthLoadMin: 101,
  synthLoadMax: 120,
};

/** Table 1. Trainable parameters per layer exactly as printed. The text states 2,882 in total. */
export const LAYERS: {
  type: "Input" | "Dense" | "Dropout";
  units?: number;
  activation?: string;
  dropout?: number;
  shape: string;
  params: string;
  count: number;
}[] = [
  { type: "Input", units: 3, shape: "(batch, 3) → (batch, 3)", params: "0", count: 0 },
  {
    type: "Dense",
    units: 64,
    activation: "ReLU",
    shape: "(batch, 3) → (batch, 64)",
    params: "(3+1) × 64 = 256",
    count: 256,
  },
  { type: "Dropout", dropout: 0.3, shape: "(batch, 64) → (batch, 64)", params: "0", count: 0 },
  {
    type: "Dense",
    units: 32,
    activation: "ReLU",
    shape: "(batch, 64) → (batch, 32)",
    params: "(64+1) × 32 = 2080",
    count: 2080,
  },
  { type: "Dropout", dropout: 0.3, shape: "(batch, 32) → (batch, 32)", params: "0", count: 0 },
  {
    type: "Dense",
    units: 16,
    activation: "ReLU",
    shape: "(batch, 32) → (batch, 16)",
    params: "(32+1) × 16 = 528",
    count: 528,
  },
  { type: "Dropout", dropout: 0.2, shape: "(batch, 16) → (batch, 16)", params: "0", count: 0 },
  {
    type: "Dense",
    units: 1,
    activation: "Sigmoid",
    shape: "(batch, 16) → (batch, 1)",
    params: "(16+1) × 1 = 17",
    count: 17,
  },
];
export const TOTAL_PARAMS = 2882; // as stated in Section 3.3

/** Table 2: validation results. */
export type ClassId = "notWorn" | "worn";
export const TABLE2: {
  method: string;
  id: "ours" | "gnb" | "lr";
  rows: Record<ClassId, { p: number; r: number; f1: number }>;
}[] = [
  {
    method: "Ours",
    id: "ours",
    rows: { notWorn: { p: 0.99, r: 0.99, f1: 0.99 }, worn: { p: 0.99, r: 0.99, f1: 0.99 } },
  },
  {
    method: "GaussianNB",
    id: "gnb",
    rows: { notWorn: { p: 0.99, r: 0.99, f1: 0.99 }, worn: { p: 0.96, r: 0.99, f1: 0.98 } },
  },
  {
    method: "Logistic Regression",
    id: "lr",
    rows: { notWorn: { p: 0.99, r: 0.99, f1: 0.99 }, worn: { p: 0.98, r: 0.99, f1: 0.99 } },
  },
];
export const SUPPORT: Record<ClassId, number> = { notWorn: 42224, worn: 2992 };
export const VAL_ACCURACY = 99.9; // %, Section 4.1
export const EPOCHS = 25; // Figure 4, epochs 0–24

/** Figure 5, right panel: the example anomaly. */
export const FIG5 = { tool: 5, health: 0.2, load: 115, temp: 50, normalTool: 13, normalHealth: 100.0 };

export const AUTHORS: { name: string; affil: number; role: "candidate" | "professor"; corresponding?: boolean }[] = [
  { name: "Andreas Lim", affil: 1, role: "candidate" },
  { name: "HoonJae Lee", affil: 2, role: "professor" },
  { name: "Suk-Ho Lee", affil: 1, role: "professor", corresponding: true },
];

export const CITATION =
  "Lim, A.; Lee, H.; Lee, S.-H. AI-based Tool Wear Prediction for MCT Machines based on Multi-modal Data. " +
  "International Journal of Internet, Broadcasting and Communication 2026, 18(1), 361–369. " +
  "https://doi.org/10.7236/IJIBC.2026.18.1.361";

export const BIBTEX = `@article{lim2026toolwear,
  title   = {AI-based Tool Wear Prediction for MCT Machines based on Multi-modal Data},
  author  = {Lim, Andreas and Lee, HoonJae and Lee, Suk-Ho},
  journal = {International Journal of Internet, Broadcasting and Communication},
  volume  = {18},
  number  = {1},
  pages   = {361--369},
  year    = {2026},
  doi     = {10.7236/IJIBC.2026.18.1.361}
}`;
