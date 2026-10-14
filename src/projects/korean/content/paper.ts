// Facts taken from the paper:
// Lim, A.; Song, S.-K.; Lee, S.-H. "AI-Based Korean Language Learning App Using Target Person Search and
// YouTube Video Shadowing." International Journal of Internet, Broadcasting and Communication (IJIBC)
// 17(4), 311–320, 2025. doi:10.7236/IJIBC.2025.17.4.311
// Numbers and wording are kept as published.

export const LINKS = {
  doi: "https://doi.org/10.7236/IJIBC.2025.17.4.311",
  // The journal's open-access PDF, on KoreaScience (where the DOI resolves).
  pdf: "https://koreascience.or.kr/article/JAKO202535143214173.pdf",
};

/** Section 4: the four functional tests. */
export const RESULTS = {
  detection: { value: 99.5, unit: "%", videos: 3 }, // 4.1, average accuracy of target-person detection
  similarityGain: { value: 543, unit: "%", videos: 3 }, // 4.2, average increase in similarity score
  wer: { value: 0.35, unit: "%", sentences: 5 }, // 4.3, average word error rate
  phoneme: { value: 99.5, unit: "%", statements: 30 }, // 4.4, average phoneme accuracy
};

/** Table 1, left column: Specific Person Language Practice System (verbatim). */
export const PSEUDO_PRACTICE = `BEGIN
// ===== Image Recognition Layer =====
LOAD YouTube video file
FOR each frame in video DO
  DETECT all faces
  IF user selects a specific person THEN
    STORE specific person's image features
  ENDIF
ENDFOR
// ===== Interactive Layer =====
PROMPT user to select a specific person from detected faces
SET selected_person ← user selection
// ===== Specific Person Detection =====
FOR each frame in video DO
  IF selected_person is detected THEN
    RECORD timestamp and segment information
  ENDIF
ENDFOR
// ===== YouTube Player API =====
CALL YouTube API to:
  - RECORD playback segments of selected_person
  - EXTRACT video and audio segments of selected_person
// ===== Speech Separation Module =====
FOR each extracted audio segment DO
  PERFORM voice separation to isolate selected_person’s voice
  CONVERT isolated voice to text
ENDFOR
// ===== Language Practice Module =====
DISPLAY extracted text to user
RECORD user’s speech input reading the text
CONVERT user’s voice into target person’s voice characteristics
COMPARE converted user’s voice with original target’s voice
OUTPUT feedback to user
END`;

/** Table 1, right column: Speech Comparison and Feedback System (verbatim). */
export const PSEUDO_FEEDBACK = `BEGIN
// ===== Detect Target Speech =====
DETECT and isolate the dialogue of a specific person from input video
PERFORM speech extraction on the detected segment
// ===== Speech-to-Text Conversion =====
CONVERT extracted speech audio into text format
DISPLAY the converted text on the application interface
// ===== User Practice Phase =====
PROMPT user to read the displayed text aloud
RECORD user's voice during reading
EXTRACT user's speech segment for further processing
// ===== Speech Style Conversion =====
CONVERT the specific person’s speech style into the user’s voice characteristics
GENERATE a reference waveform based on the user’s converted speech style
// ===== Similarity Measurement =====
APPLY Dynamic Time Warping (DTW) between:
  - The original speech waveform of the target person
  - The converted user speech waveform
MEASURE alignment distance and COMPUTE similarity score
// ===== Feedback Output =====
DISPLAY speech similarity metrics and feedback to the user
END`;

export const AUTHORS: { name: string; affil: number; role: "candidate" | "professor"; corresponding?: boolean }[] = [
  { name: "Andreas Lim", affil: 1, role: "candidate" },
  { name: "Seung-Keun Song", affil: 2, role: "professor" },
  { name: "Suk-Ho Lee", affil: 1, role: "professor", corresponding: true },
];

export const CITATION =
  "Lim, A.; Song, S.-K.; Lee, S.-H. AI-Based Korean Language Learning App Using Target Person Search and YouTube Video Shadowing. International Journal of Internet, Broadcasting and Communication 2025, 17(4), 311–320. https://doi.org/10.7236/IJIBC.2025.17.4.311";

export const BIBTEX = `@article{lim2025shadowing,
  title   = {AI-Based Korean Language Learning App Using Target Person Search and YouTube Video Shadowing},
  author  = {Lim, Andreas and Song, Seung-Keun and Lee, Suk-Ho},
  journal = {International Journal of Internet, Broadcasting and Communication},
  volume  = {17},
  number  = {4},
  pages   = {311--320},
  year    = {2025},
  doi     = {10.7236/IJIBC.2025.17.4.311}
}`;
