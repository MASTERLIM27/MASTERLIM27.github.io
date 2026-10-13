export const en = {
  langName: "English",
  skip: "Skip to content",
  brand: "Korean Shadowing",
  nav: {
    home: "Back to the top",
    how: "How it works",
    demo: "Try it",
    results: "Results",
    paper: "Paper",
    language: "Language",
    sections: "Sections",
  },

  film: {
    aria: "The shadowing system in one scroll",
    title: "Learn Korean by Shadowing",
    subtitle: "Pick anyone in a YouTube video, take over their lines, and see how close you sound.",
    paper: "AI-Based Korean Language Learning App Using Target Person Search and YouTube Video Shadowing",
    venue: "IJIBC Vol. 17, No. 4, pp. 311–320 (2025)",
    scroll: "Scroll",
    caption: "AI-generated illustration, not footage from the study",
    loading: (pct: number) => `Loading film ${pct}%`,
    stages: { find: "Find the speaker", practice: "Practice" },
    beats: {
      problem: {
        h: "Learners want the Korean they hear on screen.",
        p: "K-pop and K-dramas drive demand for Korean, yet many apps teach stiff or inaccurate expressions and struggle to keep learners coming back.",
      },
      select: {
        h: "Pick anyone on screen.",
        p: "Click a person in any YouTube video. Face recognition (ArcFace) then follows that person from frame to frame.",
      },
      segments: {
        h: "Only their lines are kept.",
        p: "The system records when the chosen person appears and speaks. It controls playback through the YouTube Player API and never downloads the video.",
      },
      transcribe: {
        h: "Their voice becomes text.",
        p: "The person's voice is separated from the scene and transcribed, so every line can be read, heard again and practiced.",
      },
      practice: {
        h: "Then it's your line.",
        p: "Playback pauses whenever your character speaks. You say the line, and the system converts your voice into that speaker's style.",
      },
      align: {
        h: "Two voices, lined up.",
        p: "Dynamic time warping lines up your converted speech with the original. Wav2Vec 2.0 turns both into embeddings, and cosine similarity compares them.",
      },
      score: {
        h: "A score out of 100.",
        p: "You see right away how close your timing, tone and pronunciation came. In the paper's tests, voice conversion raised the similarity score by 543% on average.",
      },
    },
    hud: { label: "Voice similarity after conversion", value: "+543%", note: "Average increase, Section 4.2" },
  },

  overview: {
    h: "What the paper does",
    lead: "The paper designs a Korean-learning app that turns any YouTube video into a speaking lesson. A learner picks a person on screen, the app finds and transcribes that person's lines, and the learner then plays the role while the other characters speak.",
    why: "Each attempt is compared with the original speaker's voice and scored out of 100, so the learner can hear and see how close they came. The authors built a test web app and checked each core function separately.",
    facts: [
      {
        k: "Journal",
        v: "International Journal of Internet, Broadcasting and Communication (IJIBC), Vol. 17, No. 4, pp. 311–320",
      },
      { k: "Published", v: "2025, accepted 23 October 2025" },
      { k: "Input", v: "Any YouTube video the learner chooses, played through the official player" },
      { k: "Models", v: "ArcFace (faces), Whisper API and Seed-VC (voice), Wav2Vec 2.0 (speech embeddings)" },
      { k: "Output", v: "The chosen person's lines as text, and a 100-point voice similarity score per attempt" },
    ],
  },

  why: {
    h: "Why build it",
    p: "Demand for Korean keeps growing, and so does the need for tools that keep learners practicing real, accurate Korean.",
    stats: [
      { v: "300,000", k: "international students Korea aims to attract by 2027" },
      { v: "₩18.4T", k: "global digital language-learning market" },
      { v: "₩4.4T", k: "Korean online learning market" },
    ],
    pilot:
      "A pilot Korean-language service for Vietnamese students at Kyungnam College of Information & Technology (January 2024) confirmed demand for a study app.",
  },

  how: {
    h: "How it works",
    intro:
      "Two parts. The first finds one person in a video and turns their lines into practice material. The second listens to the learner and scores how close they sound.",
    stage1: { label: "Part 1", h: "Find the speaker" },
    stage2: { label: "Part 2", h: "Practice and score" },
    steps: [
      { h: "Select", p: "While a video plays, the learner clicks the person they want to learn from." },
      {
        h: "Detect",
        p: "An image-recognition layer finds faces in every frame. ArcFace matches the selected face and records the timestamps where that person appears.",
      },
      {
        h: "Extract",
        p: "Through the YouTube Player API, the system marks that person's segments, separates their voice and converts it to text.",
      },
      {
        h: "Speak",
        p: "Playback pauses on the person's lines. The learner reads the line aloud and the app records it.",
      },
      {
        h: "Convert",
        p: "The learner's voice is converted into the target speaker's style, with the Whisper API and Seed-VC as the paper reports.",
      },
      {
        h: "Compare",
        p: "DTW aligns the two waveforms, Wav2Vec 2.0 embeds them, and cosine similarity gives a 100-point score.",
      },
    ],
    overlay: {
      h: "No video is downloaded",
      p: "The video plays in the official YouTube player. A recognition layer and an interactive layer sit on top of it and control play and pause, while all language-learning analysis runs separately.",
    },
    cosine: {
      h: "Cosine similarity, Eq. (1)",
      aria: "S C of A and B equals A dot B over the norm of A times the norm of B",
      p: "A and B are the speech embeddings of the converted learner voice and the target voice.",
    },
    privacy: {
      h: "Privacy",
      p: "Recordings are processed in real time and not stored permanently. Temporary data is encrypted and deleted after analysis. Learners agree before recording, and audio is used only to evaluate pronunciation.",
    },
    diagram: {
      caption: "The two parts as a pipeline, redrawn from Figures 1–3 of the paper.",
      nodes: {
        video: "YouTube video",
        click: "Learner clicks a person",
        face: "Face detection (ArcFace)",
        segments: "Their segments (Player API)",
        separate: "Voice separation",
        stt: "Speech to text",
        read: "Learner reads the line",
        convert: "Voice conversion",
        dtw: "DTW alignment",
        embed: "Wav2Vec 2.0 + cosine",
        score: "Score / 100",
      },
    },
    code: {
      h: "Table 1: the paper's pseudo-code",
      left: "Specific Person Language Practice System",
      right: "Speech Comparison and Feedback System",
      show: "Show the pseudo-code",
      note: "Reproduced as published.",
    },
  },

  demo: {
    h: "Try a shadowing session",
    intro:
      "A short café scene with two speakers. Choose who you want to play, then take over their lines when the scene pauses.",
    disclaimer:
      "This is a scripted simulation in an original scene, not the paper's system or a YouTube video. Your microphone is never used: pressing Speak plays a scripted attempt, and every number is illustrative. Each try comes out a little better, to show how the feedback changes.",
    scene: "Café scene with two speakers",
    names: { sua: "Sua", minjun: "Minjun" },
    choose: (name: string) => `Play ${name}`,
    steps: ["Pick a speaker", "Find their lines", "Play", "Your turn", "Score"],
    pick: "Click a face to choose who you'll play.",
    detecting: "Finding their lines…",
    found: (n: number, name: string) => `Found ${n} lines by ${name}. The scene pauses on each one.`,
    play: "Play",
    pause: "Pause",
    restart: "Restart scene",
    change: "Choose someone else",
    timeline: "Scene timeline",
    legendYou: "Your lines",
    legendOther: "Other speaker",
    yourTurn: "Your turn",
    readAloud: "Read this line aloud",
    speak: "Speak",
    speaking: "Listening…",
    meaning: "Meaning",
    attempt: (n: number) => `Attempt ${n}`,
    score: "Similarity score",
    outOf: "/ 100",
    original: "Your own voice vs target",
    converted: "Converted voice vs target",
    increase: "Increase in similarity",
    increaseNote: "(converted − original) ÷ original × 100, as in Section 4.2",
    heard: "What speech-to-text heard",
    wer: "Word error rate",
    phonemes: "Phoneme alignment",
    phonemeAcc: "Phoneme accuracy",
    phonemeNote: "Each Hangul syllable split into its letters. Mismatches are marked.",
    dtw: "DTW alignment of loudness",
    dtwNote: "Lines link the points that dynamic time warping matched.",
    target: "Target",
    you: "You",
    tryAgain: "Try again",
    next: "Continue the scene",
    done: "Scene complete",
    summary: (n: number, avg: number) => `You played ${n} lines with an average score of ${avg} / 100.`,
    playAgain: "Play the scene again",
    live: {
      pause: (name: string) => `Paused. It's your turn as ${name}.`,
      scored: (score: number) => `Similarity score ${score} out of 100.`,
    },
  },

  results: {
    h: "Results",
    intro:
      "The authors tested each core function in a separate test web app. These are functional checks on a few videos and sentences, not a study with learners.",
    cards: [
      {
        id: "detection",
        k: "Target-person detection",
        unit: "average accuracy",
        n: "3 YouTube Shorts videos",
        p: "Clicking a face in a playing video and tracking that person through the following frames. A red box marks the match, with a similarity score against the selected face.",
      },
      {
        id: "similarityGain",
        k: "Increase in voice similarity",
        unit: "average increase",
        n: "3 YouTube Shorts videos",
        p: "How much the similarity score rises when the learner's voice is converted into the target speaker's style. The paper used the OpenAI Whisper API for this conversion.",
      },
      {
        id: "wer",
        k: "Word error rate",
        unit: "average",
        n: "5 sentences",
        p: "A sentence is read aloud, transcribed by the speech-to-text module and compared word by word with the original.",
      },
      {
        id: "phoneme",
        k: "Phoneme accuracy",
        unit: "average",
        n: "30 statements",
        p: "The converted voice and the original are aligned at the phoneme level and compared.",
      },
    ],
    formulas: {
      h: "How the numbers are computed",
      increase:
        "Increase in similarity score = (converted voice similarity − original voice similarity) ÷ original voice similarity × 100%",
      wer: "Error rate = A ÷ B × 100, where A is the number of incorrect words and B the total number of words",
      phoneme: "Accuracy = 1 − Phoneme Error Rate",
      perNote:
        "As published, the paper defines the Phoneme Error Rate as the ratio of correctly matched phonemes to the total number of phonemes.",
    },
    testbeds: {
      h: "The test apps",
      p: "Each function had its own testbed: voice similarity, phoneme error rate, word error rate, and a phoneme alignment view.",
      caption:
        "Figure 5 from the paper: (a) voice similarity, (b) phoneme error rate, (c) word error rate, (d) phoneme alignment.",
      alt: "Four screenshots of the test web apps, with recorded waveforms, text boxes and similarity values.",
    },
    env: "Tests ran on a PC with an Intel Core i9-10850K at 3.60 GHz, Windows 11 64-bit and 64 GB of RAM.",
  },

  limits: {
    h: "Limitations and next steps",
    items: [
      {
        h: "Small functional tests",
        p: "Results come from 3 videos, 5 sentences and 30 statements in a test app. The authors plan studies with diverse learners to measure how much the app helps people learn.",
      },
      {
        h: "Outside AI services",
        p: "The Whisper API adds network latency, usage costs and accuracy that varies with accents, dialects and noise. Model updates, outages and limited fine-tuning are further risks.",
      },
      {
        h: "Next features",
        p: "More detailed feedback, such as highlighting mispronounced syllables. Because the APIs support many languages, the same approach could teach languages other than Korean.",
      },
    ],
  },

  authors: {
    h: "Authors",
    affiliations: [
      "Department of Computer Engineering, Dongseo University, Korea",
      "Department of Practical Content Creation, Dongseo University, Korea",
    ],
    roles: { candidate: "Master's degree candidate", professor: "Professor" },
    corresponding: "Corresponding author",
    funding:
      "Supported by the Collabo R&D Program (RS-2025-02314239), funded by the Ministry of SMEs and Startups (MSS), Korea.",
  },

  cite: {
    h: "Read and cite",
    p: "The paper is open access under the Creative Commons Attribution Non-Commercial license (CC BY-NC 4.0).",
    links: { doi: "Read the paper", doiShort: "DOI 10.7236/IJIBC.2025.17.4.311" },
    citation: "Citation",
    bibtex: "BibTeX",
    copy: "Copy",
    copied: "Copied",
    copyFallback: "Selected. Press Ctrl+C or ⌘C to copy.",
  },

  footer: {
    note: "The film on this page is an AI-generated illustration, not footage from the study, and the practice scene is original. Figure 5 is reproduced from the paper; Figures 1–3 are redrawn as a diagram. The demo is a scripted simulation.",
    paper: "Paper © 2025 The International Association for Artificial Intelligence, open access under CC BY-NC 4.0.",
  },
};

export type Dict = typeof en;

export const ko: Dict = {
  langName: "한국어",
  skip: "본문으로 건너뛰기",
  brand: "Korean Shadowing",
  nav: {
    home: "맨 위로",
    how: "작동 방식",
    demo: "체험하기",
    results: "결과",
    paper: "논문",
    language: "언어",
    sections: "섹션",
  },

  film: {
    aria: "한 번의 스크롤로 보는 쉐도잉 시스템",
    title: "따라 말하며 배우는 한국어",
    subtitle: "유튜브 영상 속 원하는 인물을 골라 그 사람의 대사를 직접 말하고, 얼마나 비슷한지 확인합니다.",
    paper: "AI-Based Korean Language Learning App Using Target Person Search and YouTube Video Shadowing",
    venue: "IJIBC 17권 4호, 311–320쪽 (2025)",
    scroll: "스크롤",
    caption: "AI로 생성한 연출 영상이며 연구에서 촬영한 영상이 아닙니다",
    loading: (pct: number) => `영상 불러오는 중 ${pct}%`,
    stages: { find: "인물 찾기", practice: "연습" },
    beats: {
      problem: {
        h: "학습자는 화면 속 한국어를 배우고 싶어 합니다.",
        p: "K-팝과 K-드라마로 한국어 수요는 늘고 있지만, 많은 앱이 어색하거나 부정확한 표현을 가르치고 학습자를 꾸준히 붙잡지 못합니다.",
      },
      select: {
        h: "화면 속 누구든 고르세요.",
        p: "유튜브 영상에서 인물을 클릭하면 얼굴 인식(ArcFace)이 프레임마다 그 사람을 따라갑니다.",
      },
      segments: {
        h: "그 사람의 대사만 남깁니다.",
        p: "선택한 인물이 나오고 말하는 구간을 기록합니다. 재생은 YouTube Player API로 제어하며 영상을 내려받지 않습니다.",
      },
      transcribe: {
        h: "목소리가 글이 됩니다.",
        p: "장면에서 그 사람의 목소리를 분리해 텍스트로 바꾸므로, 모든 대사를 읽고 다시 듣고 연습할 수 있습니다.",
      },
      practice: {
        h: "이제 당신의 차례입니다.",
        p: "내 캐릭터가 말할 때마다 재생이 멈춥니다. 대사를 말하면 시스템이 내 목소리를 그 인물의 음성 스타일로 변환합니다.",
      },
      align: {
        h: "두 목소리를 나란히 맞춥니다.",
        p: "동적 시간 정합(DTW)으로 변환된 내 음성과 원래 음성을 맞추고, Wav2Vec 2.0 임베딩을 코사인 유사도로 비교합니다.",
      },
      score: {
        h: "100점 만점의 점수.",
        p: "타이밍, 억양, 발음이 얼마나 가까웠는지 바로 확인합니다. 논문의 실험에서 음성 변환은 유사도 점수를 평균 543% 높였습니다.",
      },
    },
    hud: { label: "변환 후 음성 유사도", value: "+543%", note: "평균 상승률, 4.2절" },
  },

  overview: {
    h: "논문이 하는 일",
    lead: "이 논문은 어떤 유튜브 영상이든 말하기 수업으로 바꾸는 한국어 학습 앱을 설계합니다. 학습자가 화면 속 인물을 고르면 앱이 그 사람의 대사를 찾아 텍스트로 바꾸고, 학습자는 다른 인물들이 말하는 동안 그 역할을 맡아 대화합니다.",
    why: "매 시도는 원래 화자의 목소리와 비교해 100점 만점으로 평가되므로, 얼마나 비슷하게 말했는지 듣고 볼 수 있습니다. 저자들은 테스트용 웹 앱을 만들어 핵심 기능을 하나씩 검증했습니다.",
    facts: [
      {
        k: "학술지",
        v: "International Journal of Internet, Broadcasting and Communication (IJIBC), 17권 4호, 311–320쪽",
      },
      { k: "게재", v: "2025년, 2025년 10월 23일 게재 승인" },
      { k: "입력", v: "학습자가 고른 유튜브 영상(공식 플레이어로 재생)" },
      { k: "모델", v: "ArcFace(얼굴), Whisper API·Seed-VC(음성), Wav2Vec 2.0(음성 임베딩)" },
      { k: "출력", v: "선택한 인물의 대사 텍스트와, 시도마다 100점 만점의 음성 유사도 점수" },
    ],
  },

  why: {
    h: "왜 만들었나",
    p: "한국어 수요는 계속 늘고 있고, 정확한 실제 한국어를 꾸준히 연습하게 해 줄 도구도 그만큼 필요합니다.",
    stats: [
      { v: "30만 명", k: "2027년까지 유치를 목표로 하는 외국인 유학생 수" },
      { v: "18.4조 원", k: "전 세계 디지털 언어 학습 시장" },
      { v: "4.4조 원", k: "국내 온라인 학습 시장" },
    ],
    pilot:
      "2024년 1월 경남정보대학교에서 베트남 학생을 대상으로 한국어 서비스를 시범 운영해 학습 앱 수요를 확인했습니다.",
  },

  how: {
    h: "작동 방식",
    intro:
      "두 부분으로 이루어집니다. 첫 번째는 영상 속 한 인물을 찾아 그 대사를 연습 자료로 만듭니다. 두 번째는 학습자의 말을 듣고 얼마나 비슷한지 점수를 매깁니다.",
    stage1: { label: "1부", h: "인물 찾기" },
    stage2: { label: "2부", h: "연습과 평가" },
    steps: [
      { h: "선택", p: "영상이 재생되는 동안 학습자가 배우고 싶은 인물을 클릭합니다." },
      {
        h: "탐지",
        p: "이미지 인식 계층이 모든 프레임에서 얼굴을 찾고, ArcFace가 선택한 얼굴과 일치하는지 판단해 그 인물이 나오는 시점을 기록합니다.",
      },
      {
        h: "추출",
        p: "YouTube Player API로 그 인물의 구간을 표시하고, 목소리를 분리해 텍스트로 변환합니다.",
      },
      { h: "말하기", p: "그 인물의 대사에서 재생이 멈추면 학습자가 대사를 소리 내어 읽고, 앱이 이를 녹음합니다." },
      {
        h: "변환",
        p: "논문에 따르면 Whisper API와 Seed-VC를 사용해 학습자의 목소리를 대상 화자의 음성 스타일로 변환합니다.",
      },
      {
        h: "비교",
        p: "DTW로 두 파형을 맞추고 Wav2Vec 2.0으로 임베딩한 뒤, 코사인 유사도로 100점 만점의 점수를 냅니다.",
      },
    ],
    overlay: {
      h: "영상을 내려받지 않습니다",
      p: "영상은 공식 유튜브 플레이어에서 재생됩니다. 그 위에 인식 계층과 인터랙티브 계층이 올라가 재생과 정지를 제어하고, 언어 학습을 위한 분석은 모두 별도로 이루어집니다.",
    },
    cosine: {
      h: "코사인 유사도, 식 (1)",
      aria: "A와 B의 코사인 유사도는 A와 B의 내적을 A의 노름과 B의 노름의 곱으로 나눈 값입니다",
      p: "A와 B는 변환된 학습자 음성과 대상 음성의 임베딩입니다.",
    },
    privacy: {
      h: "개인정보 보호",
      p: "녹음은 실시간으로 처리되며 영구 저장하지 않습니다. 임시 데이터는 암호화하고 분석 후 삭제합니다. 학습자는 녹음 전에 동의하며, 음성은 발음 평가에만 쓰입니다.",
    },
    diagram: {
      caption: "두 부분을 하나의 흐름으로 다시 그린 그림(논문 그림 1–3 참고).",
      nodes: {
        video: "유튜브 영상",
        click: "학습자가 인물 클릭",
        face: "얼굴 탐지 (ArcFace)",
        segments: "인물 구간 (Player API)",
        separate: "음성 분리",
        stt: "음성 → 텍스트",
        read: "학습자가 대사 읽기",
        convert: "음성 변환",
        dtw: "DTW 정렬",
        embed: "Wav2Vec 2.0 + 코사인",
        score: "점수 / 100",
      },
    },
    code: {
      h: "표 1: 논문의 의사코드",
      left: "Specific Person Language Practice System",
      right: "Speech Comparison and Feedback System",
      show: "의사코드 보기",
      note: "논문에 실린 그대로 옮겼습니다.",
    },
  },

  demo: {
    h: "쉐도잉 직접 해 보기",
    intro:
      "두 사람이 나오는 짧은 카페 장면입니다. 연기할 인물을 고르고, 장면이 멈추면 그 인물의 대사를 대신 말해 보세요.",
    disclaimer:
      "직접 만든 장면에서 돌아가는 각본 시뮬레이션이며, 논문의 시스템이나 유튜브 영상이 아닙니다. 마이크는 사용하지 않습니다. ‘말하기’를 누르면 미리 정해 둔 시도가 재생되고, 모든 수치는 예시입니다. 피드백이 어떻게 달라지는지 보여 주기 위해 시도할수록 조금씩 좋아집니다.",
    scene: "두 사람이 나오는 카페 장면",
    names: { sua: "수아", minjun: "민준" },
    choose: (name: string) => `${name} 역 맡기`,
    steps: ["인물 고르기", "대사 찾기", "재생", "내 차례", "점수"],
    pick: "얼굴을 클릭해 연기할 인물을 고르세요.",
    detecting: "대사를 찾는 중…",
    found: (n: number, name: string) => `${name}의 대사 ${n}개를 찾았습니다. 대사마다 장면이 멈춥니다.`,
    play: "재생",
    pause: "일시정지",
    restart: "처음부터",
    change: "다른 인물 고르기",
    timeline: "장면 타임라인",
    legendYou: "내 대사",
    legendOther: "상대 대사",
    yourTurn: "내 차례",
    readAloud: "이 대사를 소리 내어 읽으세요",
    speak: "말하기",
    speaking: "듣는 중…",
    meaning: "뜻",
    attempt: (n: number) => `${n}번째 시도`,
    score: "유사도 점수",
    outOf: "/ 100",
    original: "내 원래 목소리 vs 대상",
    converted: "변환한 목소리 vs 대상",
    increase: "유사도 상승률",
    increaseNote: "(변환 후 − 원래) ÷ 원래 × 100, 4.2절과 같은 식",
    heard: "음성 인식 결과",
    wer: "단어 오류율",
    phonemes: "음소 정렬",
    phonemeAcc: "음소 정확도",
    phonemeNote: "한글 음절을 자모로 나눴습니다. 다른 자모는 표시됩니다.",
    dtw: "음량 곡선의 DTW 정렬",
    dtwNote: "선은 동적 시간 정합이 서로 짝지은 지점을 잇습니다.",
    target: "대상",
    you: "나",
    tryAgain: "다시 하기",
    next: "장면 이어 보기",
    done: "장면 끝",
    summary: (n: number, avg: number) => `대사 ${n}개를 연기했고 평균 점수는 ${avg}점입니다.`,
    playAgain: "장면 다시 보기",
    live: {
      pause: (name: string) => `일시정지. ${name}의 대사를 말할 차례입니다.`,
      scored: (score: number) => `유사도 점수 100점 만점에 ${score}점.`,
    },
  },

  results: {
    h: "결과",
    intro:
      "저자들은 핵심 기능마다 별도의 테스트 웹 앱으로 검증했습니다. 학습자를 대상으로 한 연구가 아니라, 몇 개의 영상과 문장으로 한 기능 시험입니다.",
    cards: [
      {
        id: "detection",
        k: "대상 인물 탐지",
        unit: "평균 정확도",
        n: "유튜브 쇼츠 영상 3개",
        p: "재생 중인 영상에서 얼굴을 클릭하고 이후 프레임에서 그 인물을 계속 추적합니다. 일치한 얼굴은 빨간 상자로 표시되고, 선택한 얼굴과의 유사도가 함께 나옵니다.",
      },
      {
        id: "similarityGain",
        k: "음성 유사도 상승",
        unit: "평균 상승률",
        n: "유튜브 쇼츠 영상 3개",
        p: "학습자의 목소리를 대상 화자의 스타일로 변환했을 때 유사도 점수가 얼마나 오르는지 측정했습니다. 논문은 이 변환에 OpenAI Whisper API를 사용했습니다.",
      },
      {
        id: "wer",
        k: "단어 오류율",
        unit: "평균",
        n: "문장 5개",
        p: "문장을 소리 내어 읽고, 음성 인식 모듈이 받아 적은 결과를 원문과 단어 단위로 비교했습니다.",
      },
      {
        id: "phoneme",
        k: "음소 정확도",
        unit: "평균",
        n: "문장 30개",
        p: "변환된 음성과 원래 음성을 음소 단위로 정렬해 비교했습니다.",
      },
    ],
    formulas: {
      h: "수치 계산 방법",
      increase: "유사도 상승률 = (변환 음성 유사도 − 원래 음성 유사도) ÷ 원래 음성 유사도 × 100%",
      wer: "오류율 = A ÷ B × 100 (A: 틀린 단어 수, B: 전체 단어 수)",
      phoneme: "정확도 = 1 − 음소 오류율(PER)",
      perNote:
        "논문에서는 음소 오류율을 ‘정확히 일치한 음소 수와 전체 음소 수의 비율’로 정의하며, 여기서도 그대로 옮겼습니다.",
    },
    testbeds: {
      h: "테스트 앱",
      p: "기능마다 테스트 환경이 따로 있었습니다. 음성 유사도, 음소 오류율, 단어 오류율, 음소 정렬 시각화입니다.",
      caption: "논문 그림 5: (a) 음성 유사도, (b) 음소 오류율, (c) 단어 오류율, (d) 음소 정렬.",
      alt: "녹음 파형, 텍스트 상자, 유사도 값이 보이는 테스트 웹 앱 화면 네 개.",
    },
    env: "실험은 Intel Core i9-10850K 3.60 GHz, Windows 11 64비트, RAM 64 GB인 PC에서 진행했습니다.",
  },

  limits: {
    h: "한계와 향후 과제",
    items: [
      {
        h: "작은 규모의 기능 시험",
        p: "결과는 테스트 앱에서 영상 3개, 문장 5개, 문장 30개로 얻은 것입니다. 저자들은 다양한 학습자를 대상으로 실제 학습 효과를 검증할 계획입니다.",
      },
      {
        h: "외부 AI 서비스 의존",
        p: "Whisper API는 네트워크 지연과 사용량 비용이 생기고, 억양·방언·소음에 따라 정확도가 달라집니다. 모델 업데이트, 서비스 장애, 제한적인 미세 조정도 위험 요소입니다.",
      },
      {
        h: "다음 기능",
        p: "잘못 발음한 음절을 표시하는 등 더 자세한 피드백을 준비합니다. API가 여러 언어를 지원하므로 한국어 외의 언어 학습으로도 넓힐 수 있습니다.",
      },
    ],
  },

  authors: {
    h: "저자",
    affiliations: ["동서대학교 컴퓨터공학과, 대한민국", "동서대학교 Dept. of Practical Content Creation, 대한민국"],
    roles: { candidate: "석사과정", professor: "교수" },
    corresponding: "교신저자",
    funding: "이 연구는 중소벤처기업부 산학연 Collabo R&D 사업(RS-2025-02314239)의 지원을 받았습니다.",
  },

  cite: {
    h: "논문 보기와 인용",
    p: "이 논문은 크리에이티브 커먼즈 저작자표시-비영리 라이선스(CC BY-NC 4.0)로 공개되어 있습니다.",
    links: { doi: "논문 읽기", doiShort: "DOI 10.7236/IJIBC.2025.17.4.311" },
    citation: "인용",
    bibtex: "BibTeX",
    copy: "복사",
    copied: "복사됨",
    copyFallback: "선택되었습니다. Ctrl+C 또는 ⌘C를 눌러 복사하세요.",
  },

  footer: {
    note: "이 페이지의 영상은 AI로 생성한 연출 영상이며 연구에서 촬영한 영상이 아니고, 연습 장면은 직접 만든 것입니다. 그림 5는 논문에서 가져왔고, 그림 1–3은 다이어그램으로 다시 그렸습니다. 체험은 각본 시뮬레이션입니다.",
    paper: "논문 © 2025 The International Association for Artificial Intelligence, CC BY-NC 4.0 오픈 액세스.",
  },
};
