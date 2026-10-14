/*
  Landing page content: the gallery wall, the paper list and the page's own copy.

  Nothing here invents a fact. Titles, venues, one-line descriptions and tile captions are
  read straight out of each project's own dictionary, and every number comes from that
  project's `paper.ts`, so the gallery can never drift from the pages it links to. Only the
  page's own copy (the introduction and the labels) and a few result captions are written
  here, from what the papers state.

  To add a project: add six tiles to TILES (one "project" tile, a demo, two film stills and
  two results, in the order the existing projects use) and one entry to PAPERS.
*/

import type { L10n, Lang } from "@/lib/types";

import { en as koreanEn, ko as koreanKo } from "@/projects/korean/content/dict";
import { en as pic2plateEn, ko as pic2plateKo } from "@/projects/pic2plate/content/dict";
import { en as toolWearEn, ko as toolWearKo } from "@/projects/tool-wear/content/dict";

import * as korean from "@/projects/korean/content/paper";
import * as pic2plate from "@/projects/pic2plate/content/paper";
import * as toolWear from "@/projects/tool-wear/content/paper";

import pdfConfig from "./pdf.json";

/** The only ways to reach the author that this site publishes. */
export const CONTACT = {
  email: "andreaslim2002@gmail.com",
  github: { href: "https://github.com/MASTERLIM27", label: "MASTERLIM27" },
  linkedin: { href: "https://www.linkedin.com/in/andreaslimm/", label: "andreaslimm" },
};

const ME = "Andreas Lim";

/**
 * The whole site as one PDF per language. scripts/make-pdf.mjs writes them into out/pdf
 * after a build (`npm run pdf`, and the deploy workflow on every push); both read the file
 * names from pdf.json.
 */
export const PDF = {
  files: pdfConfig.files.map((f) => ({ lang: f.lang, name: f.name, href: `${pdfConfig.dir}/${f.name}` })),
};

export type ProjectId = "korean" | "pic2plate" | "tool-wear";
export type TileKind = "project" | "demo" | "film" | "result";

/** Short names, as each project's own nav bar shows them. */
export const PROJECT_NAME: Record<ProjectId, string> = {
  korean: koreanEn.brand,
  pic2plate: "Pic2Plate",
  "tool-wear": "MCT Tool Wear",
};

export interface TileImage {
  /** A file under public/, or for `perLang` a stem that gets `-en.webp` / `-ko.webp`. */
  src: string;
  small?: string;
  /** Screenshots of the demos, taken once in each language (see the README). */
  perLang?: boolean;
  width: number;
  height: number;
  /** `object-position` for the part of the picture that must stay in view when cropped. */
  focus?: string;
}

export interface Tile {
  id: string;
  project: ProjectId;
  kind: TileKind;
  href: string;
  title: L10n;
  image?: TileImage;
  /** "project" tiles: the one-line description and the venue. */
  line?: L10n;
  venue?: L10n;
  /** "result" tiles: the number, and where the paper reports it. */
  value?: string;
  note?: L10n;
}

const both = (en: string, ko: string): L10n => ({ en, ko });
const pct = (n: number) => `${n}%`;
const detection = (d: typeof koreanEn) => d.results.cards.find((c) => c.id === "detection")!;

/*
  Six tiles per project, in the order the wall lays them out:
  project, demo, then the four small tiles row by row.
*/
export const TILES: Tile[] = [
  // ------------------------------------------------------------ Korean shadowing
  {
    id: "korean-project",
    project: "korean",
    kind: "project",
    href: "korean-shadowing/",
    title: both(koreanEn.film.title, koreanKo.film.title),
    line: both(koreanEn.film.subtitle, koreanKo.film.subtitle),
    venue: both(koreanEn.film.venue, koreanKo.film.venue),
    image: { src: "landing/art-korean.webp", small: "landing/art-korean-720.webp", width: 1280, height: 720 },
  },
  {
    id: "korean-demo",
    project: "korean",
    kind: "demo",
    href: "korean-shadowing/#demo",
    title: both(koreanEn.demo.h, koreanKo.demo.h),
    image: { src: "landing/demo-korean", perLang: true, width: 1018, height: 626, focus: "50% 0%" },
  },
  {
    id: "korean-film-a",
    project: "korean",
    kind: "film",
    href: "korean-shadowing/",
    title: both(koreanEn.film.beats.select.h, koreanKo.film.beats.select.h),
    image: { src: "landing/still-korean-a.webp", width: 800, height: 533 },
  },
  {
    id: "korean-result-similarity",
    project: "korean",
    kind: "result",
    href: "korean-shadowing/#results",
    // RESULTS.similarityGain, Section 4.2 of the paper.
    value: `+${pct(korean.RESULTS.similarityGain.value)}`,
    title: both(koreanEn.film.hud.label, koreanKo.film.hud.label),
    note: both(koreanEn.film.hud.note, koreanKo.film.hud.note),
  },
  {
    id: "korean-result-detection",
    project: "korean",
    kind: "result",
    href: "korean-shadowing/#results",
    // RESULTS.detection, Section 4.1 of the paper.
    value: pct(korean.RESULTS.detection.value),
    title: both(detection(koreanEn).k, detection(koreanKo).k),
    note: both(
      `${detection(koreanEn).unit}, ${detection(koreanEn).n}`,
      `${detection(koreanKo).unit}, ${detection(koreanKo).n}`,
    ),
  },
  {
    id: "korean-film-b",
    project: "korean",
    kind: "film",
    href: "korean-shadowing/",
    title: both(koreanEn.film.beats.score.h, koreanKo.film.beats.score.h),
    image: { src: "landing/still-korean-b.webp", width: 800, height: 533, focus: "66% 50%" },
  },

  // ------------------------------------------------------------------ Pic2Plate
  {
    id: "pic2plate-project",
    project: "pic2plate",
    kind: "project",
    href: "pic2plate/",
    title: both(pic2plateEn.film.title, pic2plateKo.film.title),
    line: both(pic2plateEn.film.subtitle, pic2plateKo.film.subtitle),
    venue: both(pic2plateEn.film.venue, pic2plateKo.film.venue),
    image: { src: "landing/art-pic2plate.webp", small: "landing/art-pic2plate-720.webp", width: 1280, height: 720 },
  },
  {
    id: "pic2plate-demo",
    project: "pic2plate",
    kind: "demo",
    href: "pic2plate/#demo",
    title: both(pic2plateEn.demo.h, pic2plateKo.demo.h),
    image: { src: "landing/demo-pic2plate", perLang: true, width: 1040, height: 640, focus: "50% 0%" },
  },
  {
    id: "pic2plate-film-a",
    project: "pic2plate",
    kind: "film",
    href: "pic2plate/",
    title: both(pic2plateEn.film.detect.h, pic2plateKo.film.detect.h),
    image: { src: "landing/still-pic2plate-a.webp", width: 800, height: 533, focus: "50% 30%" },
  },
  {
    id: "pic2plate-film-b",
    project: "pic2plate",
    kind: "film",
    href: "pic2plate/",
    title: both(pic2plateEn.film.plate.h, pic2plateKo.film.plate.h),
    image: { src: "landing/still-pic2plate-b.webp", width: 800, height: 533, focus: "45% 60%" },
  },
  {
    id: "pic2plate-result-preference",
    project: "pic2plate",
    kind: "result",
    href: "pic2plate/#results",
    // Figure 7: retrieval-augmented LLaMA 3.1 70B leads every test set.
    value: `${pic2plate.PREFERENCE.length} / ${pic2plate.PREFERENCE.length}`,
    title: both(
      "Test sets won by retrieval-augmented LLaMA 3.1 70B",
      "검색 증강 LLaMA 3.1 70B가 1위를 차지한 테스트 세트",
    ),
    note: both(
      `Survey of ${pic2plate.PARTICIPANTS.total} people, Figure 7`,
      `${pic2plate.PARTICIPANTS.total}명 설문, 그림 7`,
    ),
  },
  {
    id: "pic2plate-result-f1",
    project: "pic2plate",
    kind: "result",
    href: "pic2plate/#results",
    // DETECTION[0], Figure 5: GPT-4o has the highest F1 of the models compared.
    value: pic2plate.DETECTION[0].f1.toFixed(2),
    title: both("F1 score of GPT-4o at recognizing ingredients", "GPT-4o의 재료 인식 F1 점수"),
    note: both(
      `Highest of ${pic2plate.DETECTION.length} models, Figure 5`,
      `비교한 ${pic2plate.DETECTION.length}개 모델 중 최고, 그림 5`,
    ),
  },

  // ------------------------------------------------------------------ Tool wear
  {
    id: "tool-wear-project",
    project: "tool-wear",
    kind: "project",
    href: "tool-wear/",
    title: both(toolWearEn.film.title, toolWearKo.film.title),
    line: both(toolWearEn.film.subtitle, toolWearKo.film.subtitle),
    venue: both(toolWearEn.film.venue, toolWearKo.film.venue),
    image: { src: "landing/art-tool-wear.webp", small: "landing/art-tool-wear-720.webp", width: 1280, height: 720 },
  },
  {
    id: "tool-wear-demo",
    project: "tool-wear",
    kind: "demo",
    href: "tool-wear/#monitor",
    title: both(toolWearEn.monitor.h, toolWearKo.monitor.h),
    image: { src: "landing/demo-tool-wear", perLang: true, width: 1040, height: 640, focus: "0% 0%" },
  },
  {
    id: "tool-wear-film-a",
    project: "tool-wear",
    kind: "film",
    href: "tool-wear/",
    title: both(toolWearEn.film.model.h, toolWearKo.film.model.h),
    image: { src: "landing/still-tool-wear-a.webp", width: 800, height: 533, focus: "42% 45%" },
  },
  {
    id: "tool-wear-result-accuracy",
    project: "tool-wear",
    kind: "result",
    href: "tool-wear/#results",
    // VAL_ACCURACY, Section 4.1 of the paper.
    value: pct(toolWear.VAL_ACCURACY),
    title: both("Validation accuracy, on simulated wear", "검증 정확도, 시뮬레이션한 마모 데이터 기준"),
    note: both("Section 4.1", "4.1절"),
  },
  {
    id: "tool-wear-result-params",
    project: "tool-wear",
    kind: "result",
    href: "tool-wear/#how",
    // TOTAL_PARAMS, Section 3.3 of the paper.
    value: toolWear.TOTAL_PARAMS.toLocaleString("en-US"),
    title: both("Trainable parameters in the whole network", "신경망 전체의 학습 파라미터 수"),
    note: both("Section 3.3", "3.3절"),
  },
  {
    id: "tool-wear-film-b",
    project: "tool-wear",
    kind: "film",
    href: "tool-wear/",
    title: both(toolWearEn.film.alert.h, toolWearKo.film.alert.h),
    image: { src: "landing/still-tool-wear-b.webp", width: 800, height: 533, focus: "45% 45%" },
  },
];

export interface Paper {
  id: ProjectId;
  href: string;
  year: string;
  title: string;
  authors: { name: string; me: boolean }[];
  first: boolean;
  venue: L10n;
  links: { label: L10n; href: string }[];
  /** Methods and tools the paper reports using. */
  tags: string[];
}

/** The title and year, as each project's own BibTeX entry gives them. */
const bib = (entry: string, field: string) => new RegExp(`${field}\\s*=\\s*\\{([^}]*)\\}`).exec(entry)?.[1] ?? "";
const authors = (list: { name: string }[]) => list.map((a) => ({ name: a.name, me: a.name === ME }));

/** Newest first. */
export const PAPERS: Paper[] = [
  {
    id: "tool-wear",
    href: "tool-wear/",
    year: bib(toolWear.BIBTEX, "year"),
    title: bib(toolWear.BIBTEX, "title"),
    authors: authors(toolWear.AUTHORS),
    first: toolWear.AUTHORS[0].name === ME,
    venue: both(toolWearEn.film.venue, toolWearKo.film.venue),
    links: [
      { label: both("DOI", "DOI"), href: toolWear.LINKS.doi },
      { label: both("PDF", "PDF"), href: toolWear.LINKS.pdf },
    ],
    tags: ["OPC UA", "AAS", "PyTorch", "Fully connected network", "Time-series signals"],
  },
  {
    id: "korean",
    href: "korean-shadowing/",
    year: bib(korean.BIBTEX, "year"),
    title: bib(korean.BIBTEX, "title"),
    authors: authors(korean.AUTHORS),
    first: korean.AUTHORS[0].name === ME,
    venue: both(koreanEn.film.venue, koreanKo.film.venue),
    links: [
      { label: both("DOI", "DOI"), href: korean.LINKS.doi },
      { label: both("PDF", "PDF"), href: korean.LINKS.pdf },
    ],
    tags: ["ArcFace", "YouTube Player API", "Whisper API", "Seed-VC", "Wav2Vec 2.0", "DTW"],
  },
  {
    id: "pic2plate",
    href: "pic2plate/",
    year: bib(pic2plate.BIBTEX, "year"),
    title: bib(pic2plate.BIBTEX, "title"),
    authors: authors(pic2plate.AUTHORS),
    first: pic2plate.AUTHORS[0].name === ME,
    venue: both(pic2plateEn.film.venue, pic2plateKo.film.venue),
    links: [
      { label: both("DOI", "DOI"), href: pic2plate.LINKS.doi },
      { label: both("PDF", "PDF"), href: pic2plate.LINKS.pdf },
      { label: both("Code", "코드"), href: pic2plate.LINKS.code },
    ],
    tags: ["GPT-4o", "LLaMA 3.2 Vision", "FoodSAM", "LLaMA 3.1 70B", "RAG", "Bradley–Terry"],
  },
];

const enDict = {
  langName: "English",
  skip: "Skip to the gallery",
  brand: "Andreas Lim",
  contact: "Contact",
  nav: {
    language: "Language",
    sections: "Sections",
    gallery: "Gallery",
    papers: "Papers",
    contact: "Contact",
  },

  hero: {
    eyebrow: "Portfolio · Applied AI",
    /** One line each; the hero sets the name as large as the screen allows. */
    name: ["Andreas", "Lim"],
    lead: "I build AI systems for images, speech and sensor data, and I publish how they work.",
    cue: "Enter the gallery",
  },

  gallery: {
    h: "Gallery",
    p: "Every piece opens a project page: the method as a scroll-driven film, a demo you can try and the paper's results.",
    filter: "Highlight",
    filters: { all: "All", project: "Projects", demo: "Demos", film: "Film stills", result: "Results" },
    kinds: { project: "Project", demo: "Live demo", film: "Film", result: "Result" },
  },

  papers: {
    h: "Papers",
    p: "Peer-reviewed and open access. Each paper has its own project page here.",
    first: "First author",
    co: "Co-author",
    page: "Project page",
  },

  contactSection: {
    h: "Contact",
    p: "For questions about the papers, or anything else, write by email or find me on GitHub and LinkedIn.",
  },

  pdf: {
    button: "Download portfolio PDF",
  },

  footer: {
    note: "The key art on this page and the films on the project pages are AI-generated illustrations, not footage from the studies or output from the systems. The interactive demos are scripted simulations. Each project page states its own figure sources and licenses.",
    papers: "Papers: IJIBC 2025 and IJIBC 2026 are open access under CC BY-NC 4.0; Sensors 2025 is open access under CC BY.",
  },
};

export type LandingDict = typeof enDict;

const koDict: LandingDict = {
  langName: "한국어",
  skip: "갤러리로 건너뛰기",
  brand: "림 안드레아스",
  contact: "연락처",
  nav: {
    language: "언어",
    sections: "섹션",
    gallery: "갤러리",
    papers: "논문",
    contact: "연락처",
  },

  hero: {
    eyebrow: "포트폴리오 · 응용 AI",
    name: ["림 안드레아스"],
    lead: "이미지, 음성, 센서 데이터를 다루는 AI 시스템을 만들고, 그 작동 원리를 논문으로 발표합니다.",
    cue: "갤러리 보기",
  },

  gallery: {
    h: "갤러리",
    p: "작품을 누르면 프로젝트 페이지가 열립니다. 스크롤로 보는 영상, 직접 해 보는 데모, 논문의 결과가 담겨 있습니다.",
    filter: "강조해서 보기",
    filters: { all: "전체", project: "프로젝트", demo: "데모", film: "영상", result: "결과" },
    kinds: { project: "프로젝트", demo: "체험 데모", film: "영상", result: "결과" },
  },

  papers: {
    h: "논문",
    p: "모두 동료 심사를 거친 오픈 액세스 논문이며, 논문마다 프로젝트 페이지가 있습니다.",
    first: "제1저자",
    co: "공동 저자",
    page: "프로젝트 페이지",
  },

  contactSection: {
    h: "연락처",
    p: "논문에 관한 질문이나 그 밖의 연락은 이메일로 주시거나 GitHub, LinkedIn에서 찾아 주세요.",
  },

  pdf: {
    button: "포트폴리오 PDF 다운로드",
  },

  footer: {
    note: "이 페이지의 키 아트와 프로젝트 페이지의 영상은 AI로 생성한 연출 이미지이며, 연구에서 촬영한 영상이나 시스템의 실제 출력이 아닙니다. 체험형 데모는 시나리오에 따른 시뮬레이션입니다. 그림의 출처와 라이선스는 각 프로젝트 페이지에 표기되어 있습니다.",
    papers: "논문: IJIBC 2025와 IJIBC 2026은 CC BY-NC 4.0, Sensors 2025는 CC BY 오픈 액세스입니다.",
  },
};

export const landing: Record<Lang, LandingDict> = { en: enDict, ko: koDict };
