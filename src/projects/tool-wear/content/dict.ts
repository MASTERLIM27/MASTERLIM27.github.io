const fmtInt = (n: number) => n.toLocaleString("en-US");

export const en = {
  langName: "English",
  skip: "Skip to content",
  nav: {
    home: "Back to the top",
    how: "How it works",
    monitor: "Monitor",
    results: "Results",
    paper: "Paper",
    language: "Language",
    sections: "Sections",
  },

  film: {
    aria: "The tool wear prediction system in one scroll",
    title: "Tool Wear Prediction",
    subtitle: "Reading an MCT machine's own signals to catch a worn tool before it ruins a part.",
    paper: "AI-based Tool Wear Prediction for MCT Machines based on Multi-modal Data",
    venue: "IJIBC Vol. 18, No. 1, pp. 361–369 (2026)",
    scroll: "Scroll",
    caption: "AI-generated illustration, not footage from the study",
    loading: (pct: number) => `Loading film ${pct}%`,
    problem: {
      h: "Tool wear is too small to see.",
      p: "On a machining center, a worn cutting edge looks almost new. Shops usually replace tools based on experience or after something fails, which leads to unplanned downtime and defective parts.",
    },
    collect: {
      stage: "Data",
      h: "Every signal from the machine, collected.",
      p: "A data collection system on the MCT reads spindle load, axis currents, temperatures and tool positions over OPC UA. The Asset Administration Shell (AAS) matches them into structured records in a database.",
      fieldsLabel: "Collected columns, Figure 1",
    },
    signals: {
      h: "Four signals follow the wear.",
      p: "Against cycle time, machining depth (Z-axis distance, r = 0.36) mattered most, and warmer axes went with shorter cycles. On a factory visit, a longer or stronger spindle-load pattern pointed to tool wear. The study kept temperature, spindle load, Z-axis position and Z-axis current.",
      labels: { load: "Spindle load", temp: "Spindle temperature", zcur: "Z-axis current", zpos: "Z-axis position" },
    },
    dataset: {
      h: "Wear data, built from expert rules.",
      p: "Running a tool until it wears out is too costly, so the recorded data covered new tools only. To simulate wear, part of it was copied, spindle temperature was raised gradually and spindle load was set between 101 and 120%.",
      ruleLabel: "Labeling rule, Section 3.2",
    },
    model: {
      stage: "Model",
      h: "A small network scores tool health.",
      p: "Temperature, spindle load and current feed a fully connected network with 2,882 trainable parameters, built in PyTorch. Its output is read as a tool-health score, and a low score means an anomaly.",
      net: "3 → 64 → 32 → 16 → 1",
      netLabel: "Fully connected layers",
    },
    alert: {
      h: "The alarm fires before the defect.",
      p: "A real-time monitor tracks every tool's health and raises an alarm when a tool is likely worn and should be replaced.",
      hud: {
        tool: (n: number) => `Tool ${n}`,
        health: (v: string) => `Health ${v}%`,
        status: "Critical",
        load: (v: number) => `Spindle load ${v}`,
        temp: (v: number) => `Spindle temp. ${v} °C`,
        note: "Values from the paper's Figure 5",
      },
    },
    result: {
      h: "99.9% validation accuracy, on simulated wear.",
      p: "Training was stable and the loss converged to nearly zero. The authors stress that this accuracy comes from expert-augmented data, and they name real wear data with ground-truth labels as the next step.",
    },
  },

  signalNames: {
    zdistance: "Z-axis distance (depth)",
    zabs: "Z-axis absolute position",
    xcurr: "X-axis current",
    toolnum: "Tool number",
    ycurr: "Y-axis current",
    xdistance: "X-axis distance",
    yabs: "Y-axis absolute position",
    spindlespeed: "Spindle speed",
    zloadmeter: "Z-axis load",
    ydistance: "Y-axis distance",
    yposition: "Y-axis position",
    xloadmeter: "X-axis load",
    ytemp: "Y-axis temperature",
    spindletemp: "Spindle temperature",
    ztemp: "Z-axis temperature",
    xtemp: "X-axis temperature",
  } as Record<string, string>,

  overview: {
    h: "What the paper does",
    lead: "The paper builds a tool wear prediction system for MCT machines, the CNC machining centers common in small and medium-sized factories. It collects the machine's operating signals over OPC UA and the Asset Administration Shell (AAS), finds the signals linked to wear, and trains a neural network that scores tool health in real time and raises an alarm before a worn tool causes defects.",
    why: "Earlier tool-wear studies treat these machines as generic CNC systems. This work targets an MCT machine directly, using its own signals.",
    facts: [
      {
        k: "Journal",
        v: "International Journal of Internet, Broadcasting and Communication (IJIBC), Vol. 18, No. 1, pp. 361–369",
      },
      { k: "Published", v: "2026, accepted 28 January 2026" },
      { k: "Machine", v: "One MCT machine, one product and machining process" },
      { k: "Data", v: "Multi-modal operating signals collected over OPC UA and AAS" },
      { k: "Model", v: "Fully connected neural network, 2,882 trainable parameters, PyTorch" },
      { k: "Output", v: "A tool-health score and an alarm in a real-time monitor" },
    ],
  },

  machine: {
    h: "The real machine",
    p: "These photos from the study show the MCT machine, its cutting tool and three worn tools, with the wear marked by red circles. As the paper notes, the degree of wear is minimal and can't be reliably judged by visual inspection alone, so the system reads the machine's signals instead.",
    caption:
      "Figure 1 from the paper: the MCT machine and cutting tool, tool wear status (red circles mark the wear), and the collected data types.",
    alt: "Photos of the MCT machine, the cutting tool during operation and three worn tools, next to a diagram of the data collection system and a table of collected data types.",
  },

  how: {
    h: "How it works",
    intro:
      "Two stages. The first turns raw machine signals and expert knowledge into a labeled dataset. The second trains a small network on it and runs it as a live monitor.",
    stage1: { label: "Stage 1", h: "Data and domain knowledge" },
    stage2: { label: "Stage 2", h: "Model and monitoring" },
    steps: [
      {
        h: "Collect",
        p: "A data collection system connected to the MCT acquires spindle load, axis currents, temperatures and tool positions over OPC UA and AAS, then stores and preprocesses them.",
      },
      {
        h: "Analyze",
        p: "A correlation analysis against program cycle time, plus spindle-load patterns observed during a factory visit, point to the signals linked to wear: temperature, spindle load, Z-axis position and Z-axis current.",
      },
      {
        h: "Augment",
        p: "Because every recorded tool was new, wear is simulated from expert knowledge. A copied subset gets rising temperature and spindle load of 101–120%, and a rule assigns the worn label.",
      },
      {
        h: "Train",
        p: "A sequential network of fully connected layers learns to separate healthy from worn samples, using binary cross-entropy loss and the Adam optimizer at a learning rate of 0.001.",
      },
      {
        h: "Score health",
        p: "For each new sample, the network's output is read as the tool's health. A low health score counts as an anomaly.",
      },
      {
        h: "Alert",
        p: "Monitoring software shows each tool's live signals and health, and raises an alarm when a tool should be replaced.",
      },
    ],
    thresholdsH: "Thresholds used to build the data",
    thresholds: [
      "Spindle load above 100% is abnormal.",
      "Spindle temperature above 48 °C is abnormal.",
      "A tool is in use when spindle load is above 1 and the absolute Z position is below 0.",
    ],
    ruleCaption: "Labeling rule, Section 3.2",
    layersCaption: "Network configuration, Table 1",
    layerCols: ["Layer (type)", "Units", "Activation", "Dropout", "Input → output shape", "Trainable params"],
    totalParams: "2,882 trainable parameters, as stated in Section 3.3",
    training: "Loss: binary cross-entropy · Optimizer: Adam, learning rate 0.001 · Framework: PyTorch",
  },

  monitor: {
    h: "Try the live monitor",
    intro:
      "Watch a simulated machining cycle the way the paper's monitoring software shows it. Let the tool wear down with use, or set the wear yourself, and see when the alarm fires.",
    disclaimer:
      "This is a simplified simulation. It replays a spindle-load pattern modeled on Figure 2(b) and applies the paper's abnormal thresholds (spindle load above 100%, temperature above 48 °C) through a smooth stand-in for the trained network. It is not the paper's model or real machine data.",
    start: "Start",
    pause: "Pause",
    replace: "Replace tool",
    worn: "Load the worn tool from Figure 5",
    wearLabel: "Tool wear",
    wearAuto: "Wear builds up with each cycle",
    controls: "Monitor controls",
    readouts: "Live values",
    fields: {
      zCurrent: "Z current",
      cycle: "Cycle",
      load: "Spindle load",
      temp: "Spindle temp.",
      zAbs: "Z absolute",
      tool: "Tool number",
      usage: "Tool usage",
    },
    usageUnit: "s",
    health: "Tool health",
    status: { good: "Good", critical: "Critical" },
    alarm: (tool: number) => `Anomaly detected on tool ${tool}. Replace the tool.`,
    ok: (tool: number) => `Tool ${tool} is operating normally.`,
    charts: {
      load: "Spindle load (%)",
      temp: "Spindle temperature (°C)",
      zCurrent: "Z current",
      zAbs: "Z absolute position",
      loadLimit: "Abnormal above 100%",
      tempLimit: "Abnormal above 48 °C",
      xLabel: "Last 120 samples, 1 sample = 1 s of machining",
    },
    log: {
      h: "Alarm log",
      empty: "No alarms yet.",
      alarm: (cycle: number, health: string) => `Cycle ${cycle}: health fell to ${health}%, alarm raised`,
      replaced: (cycle: number) => `Cycle ${cycle}: tool replaced`,
      loaded: "Worn tool from Figure 5 loaded",
    },
    running: "Running",
    paused: "Paused",
    healthAlarmNote: (v: number) =>
      `The demo raises the alarm when health falls below ${v}% and holds it until the tool is replaced.`,
  },

  results: {
    h: "Results",
    intro:
      "The paper reports which signals relate to machining time, how training behaved, how the network compares with two simple baselines, and what the monitoring software looks like.",
    showTable: "Show data table",
    corr: {
      h: "Which signals matter",
      p: "Correlation of each signal with program cycle time. Machining depth (Z-axis distance) has the strongest link. Higher temperatures go with shorter cycles, which the paper reads as warmed-up machines running more efficiently. Position signals sit near zero. The six cells the authors circled are highlighted.",
      chartTitle: "Correlation with program cycle time (r)",
      legendCircled: "Circled in the paper",
      legendOther: "Other signals",
      longer: "Longer cycles",
      shorter: "Shorter cycles",
      cols: ["Signal", "Column", "r"],
      tableCaption: "Correlation of each signal with program cycle time",
      note: "Read from Figure 2(a). Five near-zero cells that can't be read precisely in the published figure are left out.",
    },
    load: {
      h: "Spindle load repeats every cycle",
      p: "Across five production counts of the same process, the spindle-load pattern lines up closely, which makes changes easy to compare. A longer or more pronounced pattern suggests wear, because more load is needed for the same cut.",
      caption: "Figure 2(b) from the paper: spindle load for tool 2 over five production counts.",
      alt: "Line chart of spindle load in percent over about 1.6 minutes for five production counts: a spike near 65 percent, ten flat steps near 17 percent, and a final spike near 95 percent.",
    },
    train: {
      h: "Training",
      p: "On the expert-augmented dataset, training was stable. Loss dropped to nearly zero within a few epochs, and validation accuracy reached 99.9% over 25 epochs.",
      caption: "Figure 4 from the paper: loss and accuracy for training and validation.",
      alt: "Two line charts over 25 epochs: training and validation loss falling from about 0.055 to near zero, and accuracy rising from about 0.987 to nearly 1.0.",
      stats: [
        { k: "Validation accuracy", v: "99.9%", note: "on expert-augmented data" },
        { k: "Validation samples", v: fmtInt(45216), note: "42,224 not worn, 2,992 worn" },
        { k: "Worn share", v: "6.6%", note: "2,992 of 45,216 samples" },
      ],
    },
    compare: {
      h: "Simple baselines score the same",
      p: "Gaussian Naive Bayes and logistic regression reach almost the same precision, recall and F1-score. The paper points out that the worn labels come from fixed rules, so a model can learn the rules themselves. The scores show feasibility, not real-world accuracy.",
      cols: ["Method", "Class", "Precision", "Recall", "F1-score", "Support"],
      classes: { notWorn: "Not worn (0)", worn: "Worn (1)" },
      methods: { ours: "Ours", gnb: "Gaussian Naive Bayes", lr: "Logistic regression" },
      tableCaption: "Validation results for the network and two baselines",
      note: "Source: Table 2.",
    },
    software: {
      h: "The monitoring software",
      p: "The implemented monitor plots Z current, the cycle counter, spindle load, spindle temperature, Z absolute position and tool number in real time, and shows each tool's health with a colored icon. In this version the anomaly results come from predefined scenarios; the paper notes it can run live once connected to an MCT machine.",
      left: "Left: The tool has a high health value and is operating normally (green icon).",
      right: "Right: The tool has a high health value and anomaly is detected (red icon).",
      caption:
        "Figure 5 from the paper: simulation of the software for the tool wear prediction and anomaly detection. Captions as published.",
      altLeft:
        "Screenshot of the live data viewer: tool 13 at 100.0 percent health, marked Good with a green icon, with flat spindle load and temperature charts.",
      altRight:
        "Screenshot of the live data viewer: tool 5 at 0.2 percent health, marked Critical with a red icon, with spindle load ramping up to 115 and spindle temperature at 50.",
    },
  },

  limits: {
    h: "Threats to validity and next steps",
    items: [
      {
        h: "Labels come from rules",
        p: "Worn labels were generated from fixed temperature and spindle-load thresholds, so the model may partly learn those rules instead of real wear patterns, and the reported performance may overestimate real-world detection.",
      },
      {
        h: "One machine, one process",
        p: "All data came from a single MCT machine making the same product with new tools, and the monitor's anomaly results use predefined scenarios.",
      },
      {
        h: "Next steps",
        p: "Collect real tool-wear data with reliable ground-truth labels, and validate the system under diverse machining conditions.",
      },
    ],
  },

  authors: {
    h: "Authors",
    affiliations: [
      "Department of Computer Engineering, Dongseo University, Korea",
      "Department of Information Security, Dongseo University, Korea",
    ],
    roles: { candidate: "Master's degree candidate", professor: "Professor" },
    corresponding: "Corresponding author",
    funding:
      "Supported by Dongseo University, “Dongseo Cluster Project (type 1)” Research Fund of 2025 (DSU-20250009, IAI Research Center).",
  },

  cite: {
    h: "Read and cite",
    p: "The paper is open access under the Creative Commons Attribution Non-Commercial license (CC BY-NC 4.0).",
    links: { doi: "Read the paper", pdf: "PDF", doiShort: "DOI 10.7236/IJIBC.2026.18.1.361" },
    citation: "Citation",
    bibtex: "BibTeX",
    copy: "Copy",
    copied: "Copied",
    copyFallback: "Selected. Press Ctrl+C or ⌘C to copy.",
  },

  footer: {
    note: "The film on this page is an AI-generated illustration, not footage from the study. Figures 1, 2(b), 4 and 5 are reproduced from the paper. The live monitor is a simplified simulation.",
    paper: "Paper © 2026 The International Association for Artificial Intelligence, open access under CC BY-NC 4.0.",
  },
};

export type Dict = typeof en;

export const ko: Dict = {
  langName: "한국어",
  skip: "본문으로 건너뛰기",
  nav: {
    home: "맨 위로",
    how: "작동 방식",
    monitor: "모니터",
    results: "결과",
    paper: "논문",
    language: "언어",
    sections: "섹션",
  },

  film: {
    aria: "스크롤로 보는 공구 마모 예측 시스템",
    title: "공구 마모 예측",
    subtitle: "MCT 장비의 신호를 읽어, 마모된 공구가 불량을 만들기 전에 알려 줍니다.",
    paper: "멀티모달 데이터 기반 MCT 장비의 AI 공구 마모 예측",
    venue: "IJIBC 18권 1호, 361–369쪽 (2026)",
    scroll: "스크롤",
    caption: "AI로 생성한 연출 영상이며 연구에서 촬영한 영상이 아닙니다",
    loading: (pct: number) => `영상 불러오는 중 ${pct}%`,
    problem: {
      h: "공구 마모는 눈으로 보기 어렵습니다.",
      p: "머시닝센터에서 마모된 절삭날은 새것과 거의 똑같아 보입니다. 현장에서는 보통 경험에 의존하거나 고장이 난 뒤에 공구를 교체하기 때문에, 예기치 않은 설비 중단과 불량이 생깁니다.",
    },
    collect: {
      stage: "데이터",
      h: "장비의 모든 신호를 수집합니다.",
      p: "MCT에 연결한 데이터 수집 시스템이 OPC UA로 주축 부하, 축 전류, 온도, 공구 위치를 읽고, 자산관리쉘(AAS)이 이를 구조화된 레코드로 정리해 데이터베이스에 저장합니다.",
      fieldsLabel: "수집 컬럼, 그림 1",
    },
    signals: {
      h: "마모를 따라가는 네 가지 신호",
      p: "사이클 타임과의 상관 분석에서는 가공 깊이(Z축 이동 거리, r = 0.36)의 영향이 가장 컸고, 축 온도가 높을수록 사이클이 짧았습니다. 공장 방문에서는 주축 부하 패턴이 길어지거나 두드러질수록 공구 마모가 의심된다는 점을 확인했습니다. 그래서 온도, 주축 부하, Z축 위치, Z축 전류를 핵심 지표로 골랐습니다.",
      labels: { load: "주축 부하", temp: "주축 온도", zcur: "Z축 전류", zpos: "Z축 위치" },
    },
    dataset: {
      h: "전문가 규칙으로 만든 마모 데이터",
      p: "공구를 완전히 마모될 때까지 쓰는 것은 비용이 너무 커서, 기록된 데이터에는 새 공구만 있었습니다. 마모를 재현하기 위해 데이터 일부를 복사한 뒤 주축 온도를 서서히 올리고 주축 부하를 101~120%로 설정했습니다.",
      ruleLabel: "라벨링 규칙, 3.2절",
    },
    model: {
      stage: "모델",
      h: "작은 신경망이 공구 건전성을 점수로 매깁니다.",
      p: "온도, 주축 부하, 전류가 학습 가능한 파라미터 2,882개의 완전 연결 신경망에 입력됩니다(PyTorch로 구현). 출력은 공구 건전성 점수로 해석하며, 점수가 낮으면 이상으로 판단합니다.",
      net: "3 → 64 → 32 → 16 → 1",
      netLabel: "완전 연결 계층",
    },
    alert: {
      h: "불량이 생기기 전에 경보가 울립니다.",
      p: "실시간 모니터링 소프트웨어가 공구마다 건전성을 추적하고, 공구가 마모되어 교체가 필요해 보이면 경보를 띄웁니다.",
      hud: {
        tool: (n: number) => `${n}번 공구`,
        health: (v: string) => `건전성 ${v}%`,
        status: "위험",
        load: (v: number) => `주축 부하 ${v}`,
        temp: (v: number) => `주축 온도 ${v} °C`,
        note: "논문 그림 5의 값",
      },
    },
    result: {
      h: "검증 정확도 99.9%, 시뮬레이션한 마모 기준",
      p: "학습은 안정적이었고 손실은 거의 0으로 수렴했습니다. 저자들은 이 정확도가 전문가 지식으로 증강한 데이터에서 나온 것임을 분명히 밝히며, 정답 라벨이 있는 실제 마모 데이터 확보를 다음 과제로 꼽습니다.",
    },
  },

  signalNames: {
    zdistance: "Z축 이동 거리(가공 깊이)",
    zabs: "Z축 절대 위치",
    xcurr: "X축 전류",
    toolnum: "공구 번호",
    ycurr: "Y축 전류",
    xdistance: "X축 이동 거리",
    yabs: "Y축 절대 위치",
    spindlespeed: "주축 속도",
    zloadmeter: "Z축 부하",
    ydistance: "Y축 이동 거리",
    yposition: "Y축 위치",
    xloadmeter: "X축 부하",
    ytemp: "Y축 온도",
    spindletemp: "주축 온도",
    ztemp: "Z축 온도",
    xtemp: "X축 온도",
  },

  overview: {
    h: "논문이 하는 일",
    lead: "이 논문은 중소 제조기업에서 흔히 쓰는 CNC 머시닝센터, 즉 MCT 장비를 위한 공구 마모 예측 시스템을 만듭니다. OPC UA와 자산관리쉘(AAS)로 장비의 운전 신호를 수집하고, 마모와 관련된 신호를 찾아낸 뒤, 공구 건전성을 실시간으로 점수화해 마모된 공구가 불량을 만들기 전에 경보를 울리는 신경망을 학습합니다.",
    why: "기존 공구 마모 연구는 이런 장비를 일반적인 CNC 시스템으로 다뤘습니다. 이 연구는 MCT 장비 자체와 그 장비의 신호를 직접 대상으로 합니다.",
    facts: [
      {
        k: "학술지",
        v: "International Journal of Internet, Broadcasting and Communication (IJIBC), 18권 1호, 361–369쪽",
      },
      { k: "게재", v: "2026년, 2026년 1월 28일 게재 승인" },
      { k: "장비", v: "MCT 장비 1대, 동일 제품과 동일 가공 공정" },
      { k: "데이터", v: "OPC UA와 AAS로 수집한 멀티모달 운전 신호" },
      { k: "모델", v: "완전 연결 신경망, 학습 가능한 파라미터 2,882개, PyTorch" },
      { k: "출력", v: "실시간 모니터에 표시되는 공구 건전성 점수와 경보" },
    ],
  },

  machine: {
    h: "실제 장비",
    p: "연구에서 찍은 사진으로, MCT 장비와 절삭 공구, 그리고 빨간 원으로 마모 부위를 표시한 공구 세 개입니다. 논문이 지적하듯 마모 정도가 미미해 육안 검사만으로는 신뢰성 있게 구분하기 어렵기 때문에, 시스템은 장비의 신호를 읽습니다.",
    caption: "논문 그림 1: MCT 장비와 절삭 공구, 공구 마모 상태(빨간 원이 마모 부위), 수집한 데이터 유형.",
    alt: "MCT 장비, 가공 중인 절삭 공구, 마모된 공구 세 개를 찍은 사진과, 데이터 수집 시스템 도식 및 수집 데이터 유형 표.",
  },

  how: {
    h: "작동 방식",
    intro:
      "두 단계로 이루어집니다. 첫 단계는 장비의 원시 신호와 전문가 지식을 라벨이 붙은 데이터셋으로 바꾸고, 두 번째 단계는 그 데이터로 작은 신경망을 학습해 실시간 모니터로 운영합니다.",
    stage1: { label: "1단계", h: "데이터와 도메인 지식" },
    stage2: { label: "2단계", h: "모델과 모니터링" },
    steps: [
      {
        h: "수집",
        p: "MCT에 연결한 데이터 수집 시스템이 OPC UA와 AAS로 주축 부하, 축 전류, 온도, 공구 위치를 받아 저장하고 전처리합니다.",
      },
      {
        h: "분석",
        p: "프로그램 사이클 타임과의 상관 분석, 그리고 공장 방문에서 관찰한 주축 부하 패턴을 바탕으로 마모와 관련된 신호인 온도, 주축 부하, Z축 위치, Z축 전류를 고릅니다.",
      },
      {
        h: "증강",
        p: "기록된 공구가 모두 새것이었기 때문에, 전문가 지식으로 마모를 재현합니다. 복사한 데이터 일부에 서서히 오르는 온도와 101~120%의 주축 부하를 넣고, 규칙에 따라 마모 라벨을 붙입니다.",
      },
      {
        h: "학습",
        p: "완전 연결 계층으로 이루어진 순차 신경망이 정상 샘플과 마모 샘플을 구분하도록 학습합니다. 손실 함수는 이진 교차 엔트로피, 옵티마이저는 학습률 0.001의 Adam입니다.",
      },
      {
        h: "건전성 점수",
        p: "새 샘플이 들어올 때마다 신경망의 출력을 공구 건전성으로 해석합니다. 건전성 점수가 낮으면 이상으로 봅니다.",
      },
      {
        h: "경보",
        p: "모니터링 소프트웨어가 공구별 실시간 신호와 건전성을 보여 주고, 공구를 교체해야 할 때 경보를 띄웁니다.",
      },
    ],
    thresholdsH: "데이터 구축에 쓴 기준값",
    thresholds: [
      "주축 부하가 100%를 넘으면 이상입니다.",
      "주축 온도가 48 °C를 넘으면 이상입니다.",
      "주축 부하가 1보다 크고 Z축 절대 위치가 0보다 작으면 공구가 사용 중입니다.",
    ],
    ruleCaption: "라벨링 규칙, 3.2절",
    layersCaption: "신경망 구성, 표 1",
    layerCols: ["계층 (유형)", "유닛", "활성화 함수", "드롭아웃", "입력 → 출력 형태", "학습 파라미터"],
    totalParams: "3.3절에 밝힌 학습 가능한 파라미터 2,882개",
    training: "손실 함수: 이진 교차 엔트로피 · 옵티마이저: Adam, 학습률 0.001 · 프레임워크: PyTorch",
  },

  monitor: {
    h: "실시간 모니터 체험하기",
    intro:
      "논문의 모니터링 소프트웨어처럼, 시뮬레이션한 가공 사이클을 지켜보세요. 사용할수록 공구가 마모되게 두거나 마모도를 직접 정해 보고, 언제 경보가 울리는지 확인할 수 있습니다.",
    disclaimer:
      "단순화한 시뮬레이션입니다. 그림 2(b)를 본뜬 주축 부하 패턴을 재생하고, 논문의 이상 기준(주축 부하 100% 초과, 온도 48 °C 초과)을 학습된 신경망 대신 매끄러운 함수로 적용합니다. 논문의 실제 모델이나 실제 장비 데이터가 아닙니다.",
    start: "시작",
    pause: "일시정지",
    replace: "공구 교체",
    worn: "그림 5의 마모 공구 불러오기",
    wearLabel: "공구 마모도",
    wearAuto: "사이클마다 마모가 누적됩니다",
    controls: "모니터 조작",
    readouts: "실시간 값",
    fields: {
      zCurrent: "Z축 전류",
      cycle: "사이클",
      load: "주축 부하",
      temp: "주축 온도",
      zAbs: "Z축 절대 위치",
      tool: "공구 번호",
      usage: "공구 사용 시간",
    },
    usageUnit: "초",
    health: "공구 건전성",
    status: { good: "정상", critical: "위험" },
    alarm: (tool: number) => `${tool}번 공구에서 이상이 감지되었습니다. 공구를 교체하세요.`,
    ok: (tool: number) => `${tool}번 공구가 정상적으로 작동 중입니다.`,
    charts: {
      load: "주축 부하 (%)",
      temp: "주축 온도 (°C)",
      zCurrent: "Z축 전류",
      zAbs: "Z축 절대 위치",
      loadLimit: "100% 초과 시 이상",
      tempLimit: "48 °C 초과 시 이상",
      xLabel: "최근 120개 샘플, 1샘플 = 가공 1초",
    },
    log: {
      h: "경보 기록",
      empty: "아직 경보가 없습니다.",
      alarm: (cycle: number, health: string) => `${cycle}번째 사이클: 건전성 ${health}%로 하락, 경보 발생`,
      replaced: (cycle: number) => `${cycle}번째 사이클: 공구 교체`,
      loaded: "그림 5의 마모 공구를 불러왔습니다",
    },
    running: "실행 중",
    paused: "일시정지됨",
    healthAlarmNote: (v: number) =>
      `이 데모는 건전성이 ${v}% 아래로 떨어지면 경보를 울리고, 공구를 교체할 때까지 유지합니다.`,
  },

  results: {
    h: "결과",
    intro:
      "논문은 어떤 신호가 가공 시간과 관련 있는지, 학습이 어떻게 진행됐는지, 신경망이 두 가지 단순한 기준 모델과 비교해 어떤지, 그리고 모니터링 소프트웨어가 어떤 모습인지 보고합니다.",
    showTable: "데이터 표 보기",
    corr: {
      h: "어떤 신호가 중요한가",
      p: "각 신호와 프로그램 사이클 타임의 상관관계입니다. 가공 깊이(Z축 이동 거리)의 연관성이 가장 큽니다. 온도가 높을수록 사이클이 짧았는데, 논문은 이를 예열된 장비가 더 효율적으로 작동한 결과로 해석합니다. 위치 신호는 0에 가깝습니다. 저자들이 그림에서 동그라미 친 여섯 칸을 강조했습니다.",
      chartTitle: "프로그램 사이클 타임과의 상관계수 (r)",
      legendCircled: "논문에서 표시한 신호",
      legendOther: "기타 신호",
      longer: "사이클 길어짐",
      shorter: "사이클 짧아짐",
      cols: ["신호", "컬럼", "r"],
      tableCaption: "각 신호와 프로그램 사이클 타임의 상관계수",
      note: "그림 2(a)에서 읽은 값입니다. 출판된 그림에서 정확히 읽을 수 없는 0에 가까운 다섯 칸은 제외했습니다.",
    },
    load: {
      h: "주축 부하는 사이클마다 반복됩니다",
      p: "같은 공정의 생산 카운트 다섯 번에 걸쳐 주축 부하 패턴이 거의 그대로 겹쳐서, 변화를 비교하기 쉽습니다. 패턴이 길어지거나 두드러지면 같은 가공에 더 큰 부하가 필요하다는 뜻이므로 마모를 의심할 수 있습니다.",
      caption: "논문 그림 2(b): 생산 카운트 다섯 번 동안 2번 공구의 주축 부하.",
      alt: "생산 카운트 다섯 번의 주축 부하(%)를 약 1.6분 동안 그린 선 그래프. 시작 부분에 약 65% 스파이크, 약 17%의 평평한 구간 열 개, 끝부분에 약 95% 스파이크가 있습니다.",
    },
    train: {
      h: "학습",
      p: "전문가 지식으로 증강한 데이터셋에서 학습은 안정적이었습니다. 손실은 몇 에포크 만에 거의 0으로 떨어졌고, 25 에포크 동안 검증 정확도는 99.9%에 이르렀습니다.",
      caption: "논문 그림 4: 학습과 검증의 손실 및 정확도.",
      alt: "25 에포크에 걸친 선 그래프 두 개. 학습과 검증 손실이 약 0.055에서 거의 0으로 떨어지고, 정확도는 약 0.987에서 거의 1.0으로 오릅니다.",
      stats: [
        { k: "검증 정확도", v: "99.9%", note: "전문가 지식 기반 증강 데이터 기준" },
        { k: "검증 샘플", v: fmtInt(45216), note: "정상 42,224개, 마모 2,992개" },
        { k: "마모 비율", v: "6.6%", note: "45,216개 중 2,992개" },
      ],
    },
    compare: {
      h: "단순한 기준 모델도 같은 점수를 냅니다",
      p: "가우시안 나이브 베이즈와 로지스틱 회귀도 정밀도, 재현율, F1 점수가 거의 같습니다. 논문은 마모 라벨이 고정된 규칙에서 나왔기 때문에 모델이 규칙 자체를 학습할 수 있다고 지적합니다. 이 점수는 실제 현장 정확도가 아니라 실현 가능성을 보여 줍니다.",
      cols: ["방법", "클래스", "정밀도", "재현율", "F1 점수", "샘플 수"],
      classes: { notWorn: "정상 (0)", worn: "마모 (1)" },
      methods: { ours: "제안 모델", gnb: "가우시안 나이브 베이즈", lr: "로지스틱 회귀" },
      tableCaption: "신경망과 두 기준 모델의 검증 결과",
      note: "출처: 표 2.",
    },
    software: {
      h: "모니터링 소프트웨어",
      p: "구현한 모니터는 Z축 전류, 사이클 카운터, 주축 부하, 주축 온도, Z축 절대 위치, 공구 번호를 실시간으로 그리고, 공구별 건전성을 색 아이콘으로 보여 줍니다. 현재 버전의 이상 탐지 결과는 미리 정한 시나리오를 바탕으로 하며, 논문은 실제 MCT 장비에 연결하면 실시간으로 운영할 수 있다고 설명합니다.",
      left: "Left: The tool has a high health value and is operating normally (green icon).",
      right: "Right: The tool has a high health value and anomaly is detected (red icon).",
      caption: "논문 그림 5: 공구 마모 예측과 이상 탐지 소프트웨어의 시뮬레이션. 캡션은 원문 그대로입니다.",
      altLeft:
        "실시간 데이터 뷰어 화면. 13번 공구의 건전성이 100.0%로 정상(초록 아이콘)이며, 주축 부하와 온도 그래프가 평평합니다.",
      altRight:
        "실시간 데이터 뷰어 화면. 5번 공구의 건전성이 0.2%로 위험(빨간 아이콘)이며, 주축 부하가 115까지 오르고 주축 온도는 50입니다.",
    },
  },

  limits: {
    h: "타당성 위협 요인과 향후 과제",
    items: [
      {
        h: "라벨이 규칙에서 나옴",
        p: "마모 라벨을 고정된 온도와 주축 부하 기준값으로 만들었기 때문에, 모델이 실제 마모 패턴 대신 그 규칙을 일부 학습했을 수 있고, 보고된 성능은 실제 탐지 능력을 과대평가할 수 있습니다.",
      },
      {
        h: "장비 1대, 공정 1개",
        p: "모든 데이터는 같은 제품을 새 공구로 가공한 MCT 장비 1대에서 나왔으며, 모니터의 이상 탐지 결과는 미리 정한 시나리오를 사용합니다.",
      },
      {
        h: "향후 과제",
        p: "신뢰할 수 있는 정답 라벨이 있는 실제 공구 마모 데이터를 수집하고, 다양한 가공 조건에서 시스템을 검증합니다.",
      },
    ],
  },

  authors: {
    h: "저자",
    affiliations: ["동서대학교 컴퓨터공학과, 대한민국", "동서대학교 정보보안학과, 대한민국"],
    roles: { candidate: "석사과정", professor: "교수" },
    corresponding: "교신저자",
    funding:
      "이 연구는 동서대학교 2025년 「Dongseo Cluster Project (type 1)」 연구비(DSU-20250009, IAI Research Center)의 지원을 받았습니다.",
  },

  cite: {
    h: "논문 보기와 인용",
    p: "이 논문은 크리에이티브 커먼즈 저작자표시-비영리 라이선스(CC BY-NC 4.0)로 공개되어 있습니다.",
    links: { doi: "논문 읽기", pdf: "PDF", doiShort: "DOI 10.7236/IJIBC.2026.18.1.361" },
    citation: "인용",
    bibtex: "BibTeX",
    copy: "복사",
    copied: "복사됨",
    copyFallback: "선택했습니다. Ctrl+C 또는 ⌘C를 눌러 복사하세요.",
  },

  footer: {
    note: "이 페이지의 영상은 AI로 생성한 연출 영상이며 연구에서 촬영한 영상이 아닙니다. 그림 1, 2(b), 4, 5는 논문에서 가져왔습니다. 실시간 모니터는 단순화한 시뮬레이션입니다.",
    paper: "논문 © 2026 The International Association for Artificial Intelligence, CC BY-NC 4.0 오픈 액세스.",
  },
};
