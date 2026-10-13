import type { AnyIng, Need, Taste } from "@/projects/pic2plate/lib/types";
import type { ReasonId } from "@/projects/pic2plate/content/paper";

type ReasonIdLike = ReasonId;

const listEn = (items: string[]) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

export const en = {
  langName: "English",
  skip: "Skip to content",
  nav: {
    home: "Pic2Plate home",
    how: "How it works",
    demo: "Try it",
    results: "Results",
    paper: "Paper",
    language: "Language",
    sections: "Sections",
  },

  film: {
    aria: "Pic2Plate in one scroll",
    title: "Pic2Plate",
    subtitle: "Take a photo of your ingredients. Get a recipe that fits your diet.",
    paper: "A vision-language and retrieval-augmented framework for personalized recipe recommendations",
    venue: "Sensors 2025, 25(2), 449",
    scroll: "Scroll",
    caption: "AI-generated illustration, not system output",
    loading: (pct: number) => `Loading film ${pct}%`,
    problem: {
      h: "Recipes start with a dish. Dinner starts with what you have.",
      p: "Finding a recipe that suits the food in your kitchen, your health and your taste takes time, and most recommenders miss at least one of the three.",
    },
    see: {
      stage: "Stage 1",
      h: "It reads the photo.",
      p: "A vision-language model such as GPT-4o names every ingredient in a smartphone photo, even when items overlap or the light is poor. For simple scenes, the FoodSAM segmentation model outlines each item pixel by pixel.",
    },
    detect: {
      h: "Every item becomes data.",
      p: "The detected ingredients are written to a JSON list, which becomes the input for the second stage.",
    },
    search: {
      stage: "Stage 2",
      h: "It searches, scores and tries again.",
      p: "A large language model combines the list with your request, searches recipe sites such as Cookpad and Food.com, and scores each result from 0 to 10. If nothing reaches the threshold τ, it rewrites the query and searches again.",
      trace: [
        { code: 'Q₀ = "spicy tofu stir-fry"', note: "no recipe scores ≥ τ, so refine" },
        { code: 'Q₁ = "tofu garlic chili"', note: "a recipe scores ≥ τ, so keep the top n" },
      ],
      traceNote: "Query example from the paper",
    },
    adapt: {
      h: "Then it rewrites the recipe for you.",
      p: "The best recipes are adjusted to your request: low-sodium soy sauce for high blood pressure, less chili for a milder plate, substitutes for anything you don't have.",
    },
    plate: {
      h: "From picture to plate.",
      p: "In a survey of 120 people, retrieval-augmented LLaMA 3.1 70B ranked first in all five test sets, ahead of the same model without retrieval and of GPT-4o with retrieval.",
    },
  },

  ingredients: {
    tofu: "Tofu",
    garlic: "Garlic",
    chili: "Red chili",
    ginger: "Ginger",
    scallion: "Spring onion",
    soy: "Soy sauce",
    beef: "Beef",
    chicken: "Chicken",
    shrimp: "Shrimp",
    noodles: "Noodles",
    kimchi: "Kimchi",
    rice: "Cooked rice",
    egg: "Egg",
    bokchoy: "Bok choy",
    broccoli: "Broccoli",
    beanpaste: "Chili bean paste",
    butter: "Butter",
  } as Record<AnyIng, string>,

  overview: {
    h: "What Pic2Plate does",
    lead: "Pic2Plate takes a smartphone photo of your ingredients and a sentence about what you want, and recommends recipes you can actually make. A vision-language model recognizes the ingredients; a retrieval-augmented generation (RAG) pipeline finds real recipes online and adapts them to your diet, allergies and taste.",
    why: "Retrieval keeps the language model grounded in recipes that exist, which limits made-up instructions, and searching live sites keeps suggestions current without retraining.",
    facts: [
      { k: "Journal", v: "Sensors, vol. 25, no. 2, article 449" },
      { k: "Published", v: "14 January 2025" },
      { k: "Special issue", v: "Deep Learning Technology and Image Sensing: 2nd Edition" },
      { k: "Input", v: "A smartphone photo of ingredients and a request in plain language" },
      { k: "Output", v: "Ranked recipes adapted to the request, with substitutions and tips" },
      { k: "Code", v: "github.com/leonardcl/pic2plate", link: "code" as const },
    ],
  },

  how: {
    h: "How it works",
    intro: "Two stages. The first turns pixels into an ingredient list. The second turns that list and your request into recipes, using retrieval so the model works from real, current sources.",
    stage1: { label: "Stage 1", h: "Image to ingredients" },
    stage2: { label: "Stage 2", h: "Retrieval-augmented recommendation" },
    steps: [
      { h: "Capture", p: "The user photographs the ingredients with a phone and types a request, such as a cuisine, an allergy or a health condition." },
      { h: "Recognize", p: "FoodSAM segments simple, uncluttered scenes at the pixel level. A vision-language model (GPT-4o or LLaMA 3.2 Vision) handles cluttered ones, reasoning about items that overlap or hide each other. In the hybrid mode, FoodSAM's masks guide the language model." },
      { h: "Structure", p: "The detected ingredients are saved as a JSON list." },
      { h: "Write queries", p: "A language model combines the ingredient list and the request into several search queries." },
      { h: "Retrieve", p: "Each query searches online recipe sources. The system opens every result and extracts its ingredients and instructions." },
      { h: "Score", p: "The language model rates each recipe from 0 to 10 for ingredient overlap and fit with the request." },
      { h: "Refine", p: "If no recipe reaches the threshold τ, the model rewrites the query and searches again, for at most K_max rounds. After the last round it keeps the best recipes found." },
      { h: "Personalize", p: "The model takes the top n recipes and adapts them with substitutions, adjusted amounts and tailored steps." },
    ],
    loop: "Repeats until a recipe scores at least τ, for at most K_max rounds",
    jsonCaption: "Example output in the paper (Figure 2)",
    queryCaption: "Query refinement example in the paper",
    queryFrom: "First query",
    queryTo: "Refined query",
  },

  demo: {
    h: "Try the pipeline",
    intro: "Pick what's in your kitchen and what you need, then run it. Each stage appears in order, including any round where the system rewrites its search.",
    disclaimer: "This is a scripted simulation for illustration. It does not call the trained models: a pool of 12 recipes stands in for the web, and a simple formula stands in for the language model's 0–10 scores.",
    kitchen: "Your kitchen",
    kitchenHint: "Select an ingredient to add or remove it.",
    taste: "Taste",
    tastes: { spicy: "Spicy", mild: "Mild" } as Record<Taste, string>,
    needs: "Needs",
    needLabels: {
      lowSodium: "High blood pressure",
      diabetes: "Diabetes",
      glutenFree: "Gluten-free",
      quick: "20 minutes or less",
    } as Record<Need, string>,
    requestLabel: "Personalized request",
    request: (taste: Taste, needs: Need[]) => {
      const base = taste === "spicy" ? "I want something spicy" : "I want something mild";
      const phrase: Record<Need, string> = {
        lowSodium: "I have high blood pressure",
        diabetes: "I have diabetes",
        glutenFree: "I eat gluten-free",
        quick: "I only have 20 minutes",
      };
      if (!needs.length) return `${base}.`;
      return `${base}, but ${listEn(needs.map((n) => phrase[n]))}.`;
    },
    run: "Run Pic2Plate",
    running: "Running",
    showAll: "Show all steps",
    empty: "Add at least one ingredient to run the pipeline.",
    stale: "Your choices changed. Run again to update the result.",
    output: "Pipeline output",
    stepRecognize: "Recognize ingredients",
    recognizeNote: (n: number) => `${n} ingredient${n === 1 ? "" : "s"} recognized and saved as JSON.`,
    stepRound: (k: number) => `Search round ${k}`,
    query: "Query",
    queryNote0: "Round 1 searches with your own request, as Algorithm 2 does.",
    queryNoteRefine: "The language model rewrote the query around your ingredients.",
    colRecipe: "Retrieved recipe",
    colScore: "Score",
    needsItem: (name: string) => `needs ${name.toLowerCase()}`,
    passVerdict: (title: string, score: string) => `${title} scored ${score}, which reaches τ. The search stops.`,
    failVerdict: "No recipe reached τ, so the language model refines the query.",
    exhaustedVerdict: "No recipe reached τ within K_max rounds, so Pic2Plate keeps the best recipes it found.",
    tau: (tau: string) => `τ = ${tau} here (the paper leaves it as a parameter)`,
    stepPersonalize: "Personalize",
    recipeName: "Recipe name",
    ingredientsH: "Ingredients",
    instructionsH: "Instructions",
    substitutionsH: "Substitution suggestions",
    tipsH: "Tips and enhancements",
    missingTag: "not in your kitchen",
    noSubs: "None needed for this request.",
    runnerUp: (title: string, score: string) => `Runner-up: ${title}, score ${score}`,
    status: (i: number, n: number, label: string) => `Step ${i} of ${n}: ${label}`,
    done: "Pipeline finished.",
    scoreAria: (title: string, score: string) => `${title}: score ${score} out of 10`,
  },

  results: {
    h: "Results",
    intro: "The paper evaluates the two stages separately: how accurately each model recognizes ingredients, and which recommendations people prefer.",
    showTable: "Show data table",
    det: {
      h: "Ingredient recognition",
      p: "Four models were tested on photos from several smartphones and tablets and on images from the web, against human labels. General-purpose vision-language models outperformed segmentation models trained on FoodSeg103, a dataset with very uneven class sizes.",
      chartTitle: "F1-score by model",
      kinds: { vlm: "Vision-language model", seg: "Segmentation model" },
      cols: ["Model", "Precision", "Recall", "F1-score", "Accuracy"],
      tableCaption: "Ingredient recognition metrics for the four models",
      note: "Best value in each column in bold. Source: Figure 5.",
    },
    pref: {
      h: "Recommendation preference",
      p: "120 participants compared three anonymized systems on five test cases and picked the best and the worst in each. The votes were turned into Bradley–Terry strengths, normalized so each set adds up to 100%.",
      takeaway: "LLaMA 3.1 70B with retrieval ranked first in every set, with nearly twice the strength of either alternative.",
      chartTitle: "Share of preference strength in each test set",
      models: { a: "LLaMA 3.1 70B + RAG", b: "LLaMA 3.1 70B", c: "GPT-4o + RAG" },
      aliases: { a: "Model A", b: "Model B", c: "Model C" },
      set: (n: number) => `Set ${n}`,
      tableCaption: "Bradley–Terry strength (%) per system and test set",
      note: "Source: Figure 7.",
    },
    reasons: {
      h: "Why participants chose their favorite",
      p: "After picking the best system, participants could tick any number of reasons. Relevance to their personal request came first in four of the five sets.",
      chartTitle: "Share of the 120 participants citing each reason",
      labels: {
        relevant: "Relevant to my request",
        ease: "Easy to follow",
        reliable: "Reliable content",
        diverse: "Diverse but useful content",
      } as Record<ReasonIdLike, string>,
      legendBar: "Average of the five sets",
      legendDot: "One test set",
      countOf: (n: number) => `${n} of 120`,
      tableCaption: "Number of participants citing each reason, by test set",
      note: "Multiple answers allowed. Source: Figure 8.",
    },
    people: {
      h: "Who took part",
      total: "Participants",
      gender: "Gender",
      genderValue: "59 women, 61 men",
      age: "Age",
      ageBands: ["20 or under", "21–30", "31–40", "41–50", "51–60"],
      occupations: "Occupations",
      occupationValue: "Seven groups; corporate professionals were the largest (52)",
      ageAria: (band: string, n: number) => `${band}: ${n} participants`,
    },
    cases: {
      h: "The five test cases",
      p: "Each set paired a photo with a request. For each one: what the recognizer listed, and the recipe the top-ranked system proposed.",
      request: "Request",
      detected: "Recognized",
      recipe: "Model A's recipe",
      items: [
        { request: "Japanese-style food, but I have high blood pressure", detected: ["Bananas", "White mushrooms", "Spring onion", "Tomatoes", "Cucumber", "Corn on the cob", "Figs"], recipe: "Japanese-Style Stir-Fried Mushrooms and Vegetables" },
        { request: "French food that won't affect my diabetes", detected: ["Pork", "Cheese", "Onion", "Garlic", "Egg"], recipe: "Diabetic-Friendly French-Style Pork Chop" },
        { request: "An easy breakfast", detected: ["Banana", "Milk"], recipe: "Easy Breakfast Banana Pancakes" },
        { request: "Comforting food for dinner", detected: ["Carrot", "Onion", "Spring onion", "Cucumber", "Lettuce", "Tomato", "Mushroom"], recipe: "Comforting Vegetable Soup" },
        { request: "Easy, comforting and savory food for lunch", detected: ["Egg", "Tomato", "Beans", "Tuna", "Farro", "Olive"], recipe: "Comforting Tuna and Olive Farro Bowl" },
      ],
      original: "",
    },
  },

  limits: {
    h: "Limitations and next steps",
    items: [
      { h: "Uneven training data", p: "FoodSeg103 (7,118 images, 103 classes) has very uneven class sizes, which makes rare or regional ingredients harder to detect." },
      { h: "Needs a connection", p: "Retrieval runs against live websites, so the system can't recommend recipes offline." },
      { h: "Next steps", p: "Broader, balanced datasets across cuisines; an offline mode with a preloaded recipe database; and adaptive learning from user feedback to sharpen personalization over time." },
    ],
  },

  authors: {
    h: "Authors",
    affiliations: [
      "Department of Computer Engineering, Dongseo University, Busan 47011, Republic of Korea",
      "Department of Information Systems, Universitas Ciputra Surabaya, Surabaya 60219, Indonesia",
    ],
    corresponding: "Corresponding author",
    funding: "Funded by Dongseo University, “Dongseo Cluster Project (type 1)” Research Fund of 2024 (DSU-20240008).",
  },

  cite: {
    h: "Read and cite",
    p: "The paper is open access.",
    links: { article: "Read on MDPI", pdf: "PDF", doi: "DOI 10.3390/s25020449", code: "Code on GitHub" },
    citation: "Citation",
    bibtex: "BibTeX",
    copy: "Copy",
    copied: "Copied",
    copyFallback: "Selected. Press Ctrl+C or ⌘C to copy.",
  },

  footer: {
    note: "The film and ingredient photos on this page are AI-generated illustrations, not output from Pic2Plate. The demo is a simplified simulation of the method.",
    paper: "Paper © 2025 by the authors, published open access by MDPI.",
  },
};

export type Dict = typeof en;

const josa = (word: string, withBatchim: string, without: string) => {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  if (code < 0 || code > 11171) return `${word}${withBatchim}(${without})`;
  return `${word}${code % 28 === 0 ? without : withBatchim}`;
};

export const ko: Dict = {
  langName: "한국어",
  skip: "본문으로 건너뛰기",
  nav: {
    home: "Pic2Plate 처음으로",
    how: "작동 방식",
    demo: "체험하기",
    results: "결과",
    paper: "논문",
    language: "언어",
    sections: "섹션",
  },

  film: {
    aria: "스크롤로 보는 Pic2Plate",
    title: "Pic2Plate",
    subtitle: "재료 사진 한 장으로, 내 식단에 맞는 레시피까지.",
    paper: "개인 맞춤형 레시피 추천을 위한 비전-언어 및 검색 증강 생성 프레임워크",
    venue: "Sensors 2025, 25(2), 449",
    scroll: "스크롤",
    caption: "AI로 생성한 연출 영상이며 시스템의 실제 출력이 아닙니다",
    loading: (pct: number) => `영상 불러오는 중 ${pct}%`,
    problem: {
      h: "레시피는 요리에서 시작하지만, 저녁은 냉장고에서 시작합니다.",
      p: "집에 있는 재료와 건강 상태, 입맛까지 모두 맞는 레시피를 찾는 데는 시간이 걸리고, 대부분의 추천 시스템은 이 셋 중 하나 이상을 놓칩니다.",
    },
    see: {
      stage: "1단계",
      h: "사진을 읽습니다.",
      p: "GPT-4o 같은 비전-언어 모델이 스마트폰 사진 속 재료를 하나하나 알아봅니다. 재료가 겹쳐 있거나 조명이 어두워도 마찬가지입니다. 단순한 장면에서는 FoodSAM 분할 모델이 재료의 윤곽을 픽셀 단위로 따냅니다.",
    },
    detect: {
      h: "모든 재료가 데이터가 됩니다.",
      p: "인식된 재료는 JSON 목록으로 정리되어 두 번째 단계의 입력이 됩니다.",
    },
    search: {
      stage: "2단계",
      h: "검색하고, 채점하고, 다시 시도합니다.",
      p: "대규모 언어 모델이 재료 목록과 사용자의 요청을 결합해 Cookpad, Food.com 같은 레시피 사이트를 검색하고, 찾은 레시피마다 0~10점을 매깁니다. 기준값 τ에 도달한 레시피가 없으면 검색어를 고쳐 다시 검색합니다.",
      trace: [
        { code: 'Q₀ = "spicy tofu stir-fry"', note: "τ 이상인 레시피가 없어 검색어 수정" },
        { code: 'Q₁ = "tofu garlic chili"', note: "τ 이상인 레시피가 나와 상위 n개 선택" },
      ],
      traceNote: "논문에 실린 검색어 예시",
    },
    adapt: {
      h: "그리고 나에게 맞게 레시피를 고쳐 씁니다.",
      p: "상위 레시피는 사용자의 요청에 맞게 조정됩니다. 고혈압이라면 저염 간장으로, 순한 맛을 원하면 고추를 줄이고, 없는 재료는 대체 재료로 바꿉니다.",
    },
    plate: {
      h: "사진에서 접시까지.",
      p: "120명이 참여한 설문에서 검색 증강을 적용한 LLaMA 3.1 70B가 다섯 개 테스트 세트 모두 1위를 차지했습니다. 검색 없이 같은 모델을 쓴 경우와 GPT-4o에 검색을 적용한 경우보다 앞섰습니다.",
    },
  },

  ingredients: {
    tofu: "두부",
    garlic: "마늘",
    chili: "홍고추",
    ginger: "생강",
    scallion: "쪽파",
    soy: "간장",
    beef: "소고기",
    chicken: "닭고기",
    shrimp: "새우",
    noodles: "면",
    kimchi: "김치",
    rice: "밥",
    egg: "달걀",
    bokchoy: "청경채",
    broccoli: "브로콜리",
    beanpaste: "두반장",
    butter: "버터",
  },

  overview: {
    h: "Pic2Plate가 하는 일",
    lead: "Pic2Plate는 재료를 찍은 스마트폰 사진과 원하는 요리에 대한 한 문장을 받아, 실제로 만들 수 있는 레시피를 추천합니다. 비전-언어 모델이 재료를 인식하고, 검색 증강 생성(RAG) 파이프라인이 온라인에서 실제 레시피를 찾아 사용자의 식단, 알레르기, 입맛에 맞게 조정합니다.",
    why: "검색을 거치기 때문에 언어 모델이 실제로 존재하는 레시피에 근거해 답하고, 지어낸 조리법이 줄어듭니다. 실시간 사이트를 검색하므로 모델을 다시 학습하지 않아도 추천이 최신 상태로 유지됩니다.",
    facts: [
      { k: "학술지", v: "Sensors 25권 2호, 논문 번호 449" },
      { k: "게재일", v: "2025년 1월 14일" },
      { k: "특별호", v: "Deep Learning Technology and Image Sensing: 2nd Edition" },
      { k: "입력", v: "재료를 찍은 스마트폰 사진과 일상 언어로 쓴 요청" },
      { k: "출력", v: "요청에 맞게 조정한 레시피 순위와 대체 재료, 팁" },
      { k: "코드", v: "github.com/leonardcl/pic2plate", link: "code" as const },
    ],
  },

  how: {
    h: "작동 방식",
    intro: "두 단계로 이루어집니다. 첫 단계는 사진을 재료 목록으로 바꾸고, 두 번째 단계는 그 목록과 사용자의 요청을 레시피로 바꿉니다. 이때 검색을 활용해 모델이 실제 최신 레시피에 근거하도록 합니다.",
    stage1: { label: "1단계", h: "이미지에서 재료 목록으로" },
    stage2: { label: "2단계", h: "검색 증강 추천" },
    steps: [
      { h: "촬영", p: "사용자가 휴대폰으로 재료를 찍고, 원하는 요리 스타일이나 알레르기, 건강 상태 같은 요청을 입력합니다." },
      { h: "인식", p: "단순하고 깔끔한 장면은 FoodSAM이 픽셀 단위로 분할합니다. 복잡한 장면은 비전-언어 모델(GPT-4o 또는 LLaMA 3.2 Vision)이 겹치거나 가려진 재료까지 맥락으로 파악합니다. 하이브리드 방식에서는 FoodSAM의 마스크가 언어 모델을 보조합니다." },
      { h: "구조화", p: "인식된 재료를 JSON 목록으로 저장합니다." },
      { h: "검색어 작성", p: "언어 모델이 재료 목록과 요청을 결합해 여러 개의 검색어를 만듭니다." },
      { h: "검색", p: "각 검색어로 온라인 레시피 사이트를 검색하고, 결과마다 페이지를 열어 재료와 조리법을 추출합니다." },
      { h: "채점", p: "언어 모델이 레시피마다 재료 일치도와 요청 부합도를 기준으로 0~10점을 매깁니다." },
      { h: "재검색", p: "기준값 τ에 도달한 레시피가 없으면 모델이 검색어를 고쳐 다시 검색합니다. 최대 K_max회까지 반복하며, 마지막에는 그때까지 찾은 가장 좋은 레시피를 사용합니다." },
      { h: "맞춤화", p: "모델이 상위 n개 레시피를 골라 대체 재료, 분량, 조리 단계를 사용자에게 맞게 조정합니다." },
    ],
    loop: "τ 이상인 레시피가 나올 때까지 반복, 최대 K_max회",
    jsonCaption: "논문에 실린 출력 예시 (그림 2)",
    queryCaption: "논문에 실린 검색어 수정 예시",
    queryFrom: "처음 검색어",
    queryTo: "수정한 검색어",
  },

  demo: {
    h: "직접 실행해 보기",
    intro: "주방에 있는 재료와 원하는 조건을 고른 뒤 실행해 보세요. 시스템이 검색어를 고쳐 다시 검색하는 과정까지 단계별로 보여 줍니다.",
    disclaimer: "이 데모는 설명을 위한 시뮬레이션입니다. 실제 학습된 모델을 호출하지 않으며, 웹 대신 레시피 12개로 된 작은 풀을 쓰고, 언어 모델의 0~10점 채점은 간단한 공식으로 대신합니다.",
    kitchen: "내 주방",
    kitchenHint: "재료를 눌러 넣거나 뺄 수 있어요.",
    taste: "맛",
    tastes: { spicy: "매콤하게", mild: "순하게" },
    needs: "조건",
    needLabels: {
      lowSodium: "고혈압",
      diabetes: "당뇨",
      glutenFree: "글루텐 프리",
      quick: "20분 이내",
    },
    requestLabel: "맞춤 요청",
    request: (taste: Taste, needs: Need[]) => {
      const end = taste === "spicy" ? "매콤한 요리가 먹고 싶어요" : "맵지 않은 순한 요리가 먹고 싶어요";
      const conn = taste === "spicy" ? "매콤한 요리가 먹고 싶은데" : "맵지 않은 순한 요리가 먹고 싶은데";
      const phrase: Record<Need, [string, string]> = {
        lowSodium: ["고혈압이 있고", "고혈압이 있어요"],
        diabetes: ["당뇨가 있고", "당뇨가 있어요"],
        glutenFree: ["글루텐을 먹지 않고", "글루텐을 먹지 않아요"],
        quick: ["시간은 20분밖에 없고", "시간은 20분밖에 없어요"],
      };
      if (!needs.length) return `${end}.`;
      const parts = needs.map((n, i) => phrase[n][i === needs.length - 1 ? 1 : 0]);
      return `${conn}, ${parts.join(" ")}.`;
    },
    run: "Pic2Plate 실행",
    running: "실행 중",
    showAll: "모든 단계 바로 보기",
    empty: "재료를 하나 이상 선택해야 실행할 수 있어요.",
    stale: "선택이 바뀌었습니다. 다시 실행하면 결과가 갱신됩니다.",
    output: "파이프라인 출력",
    stepRecognize: "재료 인식",
    recognizeNote: (n: number) => `재료 ${n}개를 인식해 JSON으로 저장했습니다.`,
    stepRound: (k: number) => `${k}차 검색`,
    query: "검색어",
    queryNote0: "알고리즘 2처럼, 1차 검색은 사용자의 요청을 그대로 검색어로 씁니다.",
    queryNoteRefine: "언어 모델이 사용자의 재료를 중심으로 검색어를 고쳤습니다.",
    colRecipe: "찾은 레시피",
    colScore: "점수",
    needsItem: (name: string) => `${name} 필요`,
    passVerdict: (title: string, score: string) => `${josa(title, "이", "가")} ${score}점으로 τ에 도달해 검색을 멈춥니다.`,
    failVerdict: "τ에 도달한 레시피가 없어 언어 모델이 검색어를 고칩니다.",
    exhaustedVerdict: "K_max회 안에 τ에 도달한 레시피가 없어, 지금까지 찾은 가장 좋은 레시피를 사용합니다.",
    tau: (tau: string) => `이 데모의 τ = ${tau} (논문에서는 설정값으로 둠)`,
    stepPersonalize: "맞춤화",
    recipeName: "레시피 이름",
    ingredientsH: "재료",
    instructionsH: "조리법",
    substitutionsH: "대체 재료 제안",
    tipsH: "팁과 개선점",
    missingTag: "주방에 없음",
    noSubs: "이 요청에서는 바꿀 재료가 없습니다.",
    runnerUp: (title: string, score: string) => `2순위: ${title}, ${score}점`,
    status: (i: number, n: number, label: string) => `${n}단계 중 ${i}단계: ${label}`,
    done: "파이프라인 실행이 끝났습니다.",
    scoreAria: (title: string, score: string) => `${title}: 10점 만점에 ${score}점`,
  },

  results: {
    h: "결과",
    intro: "논문은 두 단계를 따로 평가했습니다. 모델별로 재료를 얼마나 정확히 인식하는지, 그리고 사람들이 어떤 추천을 더 선호하는지입니다.",
    showTable: "데이터 표 보기",
    det: {
      h: "재료 인식",
      p: "여러 스마트폰과 태블릿으로 찍은 사진과 웹 이미지를 사람이 직접 라벨링한 정답과 비교해 네 모델을 평가했습니다. 범용 비전-언어 모델이, 클래스별 데이터 양의 편차가 큰 FoodSeg103으로 학습한 분할 모델보다 좋은 성능을 보였습니다.",
      chartTitle: "모델별 F1 점수",
      kinds: { vlm: "비전-언어 모델", seg: "분할 모델" },
      cols: ["모델", "정밀도", "재현율", "F1 점수", "정확도"],
      tableCaption: "네 모델의 재료 인식 지표",
      note: "열마다 가장 높은 값은 굵게 표시했습니다. 출처: 그림 5.",
    },
    pref: {
      h: "추천 선호도",
      p: "참여자 120명이 다섯 개 테스트 사례마다 익명 처리된 세 시스템을 비교해 가장 좋은 것과 가장 나쁜 것을 골랐습니다. 이 투표를 브래들리–테리(Bradley–Terry) 모델로 분석하고, 세트별 합이 100%가 되도록 정규화했습니다.",
      takeaway: "검색 증강을 적용한 LLaMA 3.1 70B가 모든 세트에서 1위였고, 선호 강도는 다른 두 시스템의 두 배 가까이 됐습니다.",
      chartTitle: "테스트 세트별 선호 강도 비율",
      models: { a: "LLaMA 3.1 70B + RAG", b: "LLaMA 3.1 70B", c: "GPT-4o + RAG" },
      aliases: { a: "모델 A", b: "모델 B", c: "모델 C" },
      set: (n: number) => `세트 ${n}`,
      tableCaption: "시스템별, 테스트 세트별 브래들리–테리 강도(%)",
      note: "출처: 그림 7.",
    },
    reasons: {
      h: "가장 좋은 시스템을 고른 이유",
      p: "참여자들은 가장 좋은 시스템을 고른 뒤 이유를 여러 개 선택할 수 있었습니다. 다섯 세트 중 네 세트에서 ‘내 요청과의 관련성’이 가장 많이 꼽혔습니다.",
      chartTitle: "각 이유를 꼽은 참여자 비율 (전체 120명)",
      labels: {
        relevant: "내 요청과의 관련성",
        ease: "따라 하기 쉬움",
        reliable: "신뢰할 수 있는 내용",
        diverse: "다양하면서도 유용한 내용",
      },
      legendBar: "다섯 세트 평균",
      legendDot: "개별 테스트 세트",
      countOf: (n: number) => `120명 중 ${n}명`,
      tableCaption: "테스트 세트별로 각 이유를 꼽은 참여자 수",
      note: "복수 응답 가능. 출처: 그림 8.",
    },
    people: {
      h: "참여자 구성",
      total: "참여자",
      gender: "성별",
      genderValue: "여성 59명, 남성 61명",
      age: "연령",
      ageBands: ["20세 이하", "21–30세", "31–40세", "41–50세", "51–60세"],
      occupations: "직업",
      occupationValue: "7개 직업군, 가장 많은 그룹은 기업 전문직(52명)",
      ageAria: (band: string, n: number) => `${band}: ${n}명`,
    },
    cases: {
      h: "다섯 가지 테스트 사례",
      p: "각 세트는 사진 한 장과 요청 하나로 구성됐습니다. 사례마다 인식된 재료와, 1위 시스템이 제안한 레시피를 정리했습니다.",
      request: "요청",
      detected: "인식된 재료",
      recipe: "모델 A의 레시피",
      items: [
        { request: "일본식 요리를 먹고 싶지만 고혈압이 있어요", detected: ["바나나", "양송이버섯", "쪽파", "토마토", "오이", "옥수수", "무화과"], recipe: "일본식 버섯 채소 볶음" },
        { request: "당뇨에 영향을 주지 않는 프랑스 요리", detected: ["돼지고기", "치즈", "양파", "마늘", "달걀"], recipe: "당뇨 친화 프렌치 스타일 포크찹" },
        { request: "간단한 아침 식사", detected: ["바나나", "우유"], recipe: "간단한 아침 바나나 팬케이크" },
        { request: "저녁으로 먹을 든든하고 따뜻한 음식", detected: ["당근", "양파", "쪽파", "오이", "양상추", "토마토", "버섯"], recipe: "든든한 채소 수프" },
        { request: "점심으로 먹을 간단하고 든든한 짭짤한 음식", detected: ["달걀", "토마토", "콩", "참치", "파로", "올리브"], recipe: "든든한 참치 올리브 파로 볼" },
      ],
      original: "원문",
    },
  },

  limits: {
    h: "한계와 향후 과제",
    items: [
      { h: "고르지 않은 학습 데이터", p: "FoodSeg103(이미지 7,118장, 103개 클래스)은 클래스별 데이터 양의 편차가 커서, 드물거나 지역 특유의 재료를 인식하기 어렵습니다." },
      { h: "인터넷 연결 필요", p: "실시간 웹사이트를 검색하기 때문에 오프라인에서는 레시피를 추천할 수 없습니다." },
      { h: "향후 과제", p: "다양한 요리를 고르게 담은 데이터셋 확장, 레시피 데이터베이스를 미리 내장한 오프라인 모드, 그리고 사용자 피드백으로 맞춤화를 점점 개선하는 적응형 학습." },
    ],
  },

  authors: {
    h: "저자",
    affiliations: [
      "동서대학교 컴퓨터공학과, 부산 47011, 대한민국",
      "Universitas Ciputra Surabaya 정보시스템학과, 수라바야 60219, 인도네시아",
    ],
    corresponding: "교신저자",
    funding: "이 연구는 동서대학교 2024년 「Dongseo Cluster Project (type 1)」 연구비(DSU-20240008)의 지원을 받았습니다.",
  },

  cite: {
    h: "논문 보기와 인용",
    p: "이 논문은 오픈 액세스로 공개되어 있습니다.",
    links: { article: "MDPI에서 읽기", pdf: "PDF", doi: "DOI 10.3390/s25020449", code: "GitHub 코드" },
    citation: "인용",
    bibtex: "BibTeX",
    copy: "복사",
    copied: "복사됨",
    copyFallback: "선택했습니다. Ctrl+C 또는 ⌘C를 눌러 복사하세요.",
  },

  footer: {
    note: "이 페이지의 영상과 재료 사진은 AI로 생성한 연출 이미지이며 Pic2Plate의 실제 출력이 아닙니다. 데모는 방법론을 단순화한 시뮬레이션입니다.",
    paper: "논문 © 2025 저자, MDPI 오픈 액세스 출판.",
  },
};
