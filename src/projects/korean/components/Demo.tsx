"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLang } from "@/projects/korean/lib/i18n";
import { LINES, SCENE_LENGTH, practice, type Attempt, type Line, type SpeakerId } from "@/projects/korean/lib/shadowing";
import { Section, SectionHead } from "./ui";
import s from "./Demo.module.css";

type Phase = "pick" | "detecting" | "ready" | "playing" | "paused" | "turn" | "listening" | "scored" | "done";

const LISTEN_MS = 1600;
const DETECT_MS = 1400;

/* ---------- The scene: an original, flat café illustration ---------- */

function Character({ id, x, speaking, selected }: { id: SpeakerId; x: number; speaking: boolean; selected: boolean }) {
  const sua = id === "sua";
  return (
    <g transform={`translate(${x} 0)`} className={s.character} data-speaking={speaking} data-selected={selected}>
      {/* body */}
      <path
        d={
          sua
            ? "M-62 360 C-60 262 -30 236 0 236 C30 236 60 262 62 360 Z"
            : "M-70 360 C-68 256 -34 230 0 230 C34 230 68 256 70 360 Z"
        }
        fill={sua ? "#c9785f" : "#3f5a7a"}
      />
      {/* neck */}
      <rect x="-12" y="196" width="24" height="44" rx="10" fill={sua ? "#e7b796" : "#d9a57f"} />
      {/* hair back */}
      {sua && (
        <path d="M-50 150 C-56 98 -30 70 0 70 C30 70 56 98 50 150 L54 214 C30 222 -30 222 -54 214 Z" fill="#2a1c19" />
      )}
      {/* face */}
      <ellipse cx="0" cy="150" rx="40" ry="50" fill={sua ? "#efc3a2" : "#e2b08b"} />
      {/* hair front */}
      {sua ? (
        <path
          d="M-42 136 C-40 96 -16 84 6 86 C26 88 42 104 42 132 C26 116 4 108 -18 112 C-30 116 -38 124 -42 136 Z"
          fill="#2a1c19"
        />
      ) : (
        <path
          d="M-42 138 C-46 92 -14 76 6 78 C34 80 48 102 42 136 C36 116 22 106 2 106 C-18 106 -34 116 -42 138 Z"
          fill="#1d2230"
        />
      )}
      {/* eyes */}
      <ellipse cx="-14" cy="152" rx="3.4" ry="4.2" fill="#1b1716" />
      <ellipse cx="14" cy="152" rx="3.4" ry="4.2" fill="#1b1716" />
      {/* mouth */}
      <ellipse className={s.mouth} cx="0" cy="176" rx="8" ry="3" fill="#8a3f3a" />
    </g>
  );
}

const FACES: Record<SpeakerId, { cx: number; cy: number }> = {
  sua: { cx: 230, cy: 150 },
  minjun: { cx: 470, cy: 150 },
};

function Scene({
  speaking,
  selected,
  choose,
  canChoose,
  names,
  chooseLabel,
  sceneLabel,
  subtitle,
}: {
  speaking: SpeakerId | null;
  selected: SpeakerId | null;
  choose: (id: SpeakerId) => void;
  canChoose: boolean;
  names: Record<SpeakerId, string>;
  chooseLabel: (name: string) => string;
  sceneLabel: string;
  subtitle: { name: string; text: string; you: boolean } | null;
}) {
  return (
    <div className={s.screen}>
      <svg viewBox="0 0 700 360" className={s.sceneSvg} role="img" aria-label={sceneLabel}>
        <defs>
          <linearGradient id="wall" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#2a2421" />
            <stop offset="1" stopColor="#1a1615" />
          </linearGradient>
          <radialGradient id="lamp" cx="0.5" cy="0" r="0.8">
            <stop offset="0" stopColor="#ffcf8a" stopOpacity="0.35" />
            <stop offset="1" stopColor="#ffcf8a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="700" height="360" fill="url(#wall)" />
        {/* window with evening street lights */}
        <rect x="270" y="34" width="160" height="150" rx="6" fill="#141c2b" stroke="#3a3330" strokeWidth="6" />
        {[
          [300, 80, 9, "#ffb86b"],
          [345, 120, 6, "#7fd0ff"],
          [392, 70, 7, "#ffd38a"],
          [318, 150, 5, "#ff8e7a"],
          [405, 140, 8, "#ffc27a"],
        ].map(([x, y, r, c]) => (
          <circle
            key={`${x}-${y}`}
            cx={x as number}
            cy={y as number}
            r={r as number}
            fill={c as string}
            opacity="0.55"
          />
        ))}
        <line x1="350" y1="34" x2="350" y2="184" stroke="#3a3330" strokeWidth="4" />
        <rect width="700" height="200" fill="url(#lamp)" />
        {/* shelf */}
        <rect x="52" y="96" width="150" height="6" rx="3" fill="#4a3d36" />
        <rect x="66" y="74" width="16" height="22" rx="3" fill="#7d6a5e" />
        <rect x="90" y="66" width="14" height="30" rx="3" fill="#5f7d74" />
        <rect x="112" y="78" width="24" height="18" rx="4" fill="#a8806a" />
        <rect x="498" y="96" width="150" height="6" rx="3" fill="#4a3d36" />
        <circle cx="530" cy="84" r="12" fill="#6d8a5a" />
        <rect x="560" y="72" width="18" height="24" rx="3" fill="#8d6d5c" />
        <Character id="sua" x={230} speaking={speaking === "sua"} selected={selected === "sua"} />
        <Character id="minjun" x={470} speaking={speaking === "minjun"} selected={selected === "minjun"} />
        {/* table */}
        <rect x="0" y="300" width="700" height="60" fill="#3b2c25" />
        <rect x="0" y="296" width="700" height="8" fill="#5a4136" />
        <path d="M318 296 h28 v-18 a14 14 0 0 0 -28 0z" fill="#e9e3dc" />
        <path d="M372 296 h28 v-18 a14 14 0 0 0 -28 0z" fill="#e9e3dc" />
      </svg>

      {(Object.keys(FACES) as SpeakerId[]).map((id) => {
        const f = FACES[id];
        return (
          <button
            key={id}
            type="button"
            className={s.face}
            data-selected={selected === id}
            data-dim={selected !== null && selected !== id}
            disabled={!canChoose}
            style={{ left: `${((f.cx - 52) / 700) * 100}%`, top: `${((f.cy - 64) / 360) * 100}%` }}
            onClick={() => choose(id)}
            aria-label={chooseLabel(names[id])}
            aria-pressed={selected === id}
          >
            <span className={s.faceTag}>{names[id]}</span>
          </button>
        );
      })}

      {subtitle && (
        <p className={s.subtitle} data-you={subtitle.you} lang="ko">
          <span className={s.subName}>{subtitle.name}</span>
          {subtitle.text}
        </p>
      )}
    </div>
  );
}

/* ---------- Feedback pieces ---------- */

function DtwChart({ a, label }: { a: Attempt; label: string }) {
  const W = 600;
  const H = 170;
  const mid = H / 2;
  const n = a.target.length;
  const m = a.user.length;
  const xt = (i: number) => 10 + (i / Math.max(1, n - 1)) * (W - 20);
  const xu = (j: number) => 10 + (j / Math.max(1, m - 1)) * (W - 20);
  const top = (v: number) => mid - 10 - v * 58;
  const bot = (v: number) => mid + 10 + v * 58;
  const pathT = a.target.map((v, i) => `${i ? "L" : "M"}${xt(i).toFixed(1)} ${top(v).toFixed(1)}`).join(" ");
  const pathU = a.user.map((v, j) => `${j ? "L" : "M"}${xu(j).toFixed(1)} ${bot(v).toFixed(1)}`).join(" ");
  const links = a.path.filter((_, k) => k % 3 === 0);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={s.dtw} role="img" aria-label={label}>
      {links.map(([i, j]) => (
        <line key={`${i}-${j}`} x1={xt(i)} y1={top(a.target[i])} x2={xu(j)} y2={bot(a.user[j])} className={s.dtwLink} />
      ))}
      <line x1="10" x2={W - 10} y1={mid - 10} y2={mid - 10} className={s.dtwBase} />
      <line x1="10" x2={W - 10} y1={mid + 10} y2={mid + 10} className={s.dtwBase} />
      <path d={pathT} className={s.dtwTarget} />
      <path d={pathU} className={s.dtwUser} />
    </svg>
  );
}

function Feedback({ a, attempt, line }: { a: Attempt; attempt: number; line: Line }) {
  const { t } = useLang();
  const d = t.demo;
  const words = line.ko.split(" ");
  return (
    <div className={s.feedback}>
      <div className={s.scoreBlock}>
        <p className={s.attemptLabel}>{d.attempt(attempt + 1)}</p>
        <p className={s.scoreLabel}>{d.score}</p>
        <p className={s.score}>
          {a.score}
          <span>{d.outOf}</span>
        </p>
        <div className={s.bars}>
          <div className={s.barRow}>
            <span>{d.original}</span>
            <span className={s.barTrack}>
              <span className={s.barOrig} style={{ width: `${a.original * 100}%` }} />
            </span>
            <strong>{a.original.toFixed(3)}</strong>
          </div>
          <div className={s.barRow}>
            <span>{d.converted}</span>
            <span className={s.barTrack}>
              <span className={s.barConv} style={{ width: `${a.converted * 100}%` }} />
            </span>
            <strong>{a.converted.toFixed(3)}</strong>
          </div>
        </div>
        <p className={s.increase}>
          {d.increase} <strong>+{Math.round(a.increase)}%</strong>
        </p>
        <p className={s.small}>{d.increaseNote}</p>
      </div>

      <div className={s.detail}>
        <div className={s.detailBlock}>
          <h4 className={s.detailH}>
            {d.heard}
            <span>
              {d.wer} <strong>{a.wer.toFixed(1)}%</strong>
            </span>
          </h4>
          <p className={s.heard} lang="ko">
            {a.heard.map((w, i) => (
              <span key={i} data-ok={w.ok} title={w.ok ? undefined : words[i]}>
                {w.word}
              </span>
            ))}
          </p>
        </div>

        <div className={s.detailBlock}>
          <h4 className={s.detailH}>
            {d.phonemes}
            <span>
              {d.phonemeAcc} <strong>{a.phonemeAccuracy.toFixed(1)}%</strong>
            </span>
          </h4>
          <ol className={s.jamo} lang="ko">
            {a.phonemes.map((p, i) => (
              <li key={i} data-ok={p.target === p.user}>
                <span>{p.target}</span>
                <span>{p.user}</span>
              </li>
            ))}
          </ol>
          <p className={s.small}>{d.phonemeNote}</p>
        </div>

        <div className={s.detailBlock}>
          <h4 className={s.detailH}>
            {d.dtw}
            <span className={s.legend}>
              <i data-k="target" /> {d.target} <i data-k="you" /> {d.you}
            </span>
          </h4>
          <DtwChart a={a} label={d.dtw} />
          <p className={s.small}>{d.dtwNote}</p>
        </div>
      </div>
    </div>
  );
}

/* ---------- The demo ---------- */

export default function Demo() {
  const { t } = useLang();
  const d = t.demo;
  const [phase, setPhase] = useState<Phase>("pick");
  const [who, setWho] = useState<SpeakerId | null>(null);
  const [time, setTime] = useState(0);
  const [turn, setTurn] = useState<Line | null>(null);
  const [attempts, setAttempts] = useState<Record<number, number>>({});
  const [scores, setScores] = useState<Record<number, number>>({});
  // What to announce, not the sentence itself, so it follows a change of language.
  const [live, setLive] = useState<{ kind: "pause" } | { kind: "scored"; score: number } | null>(null);
  const timeRef = useRef(0);
  const doneLines = useRef(new Set<number>());
  const speakRef = useRef<HTMLButtonElement>(null);
  const againRef = useRef<HTMLButtonElement>(null);
  const playRef = useRef<HTMLButtonElement>(null);

  // Buttons swap as the session moves on: keep keyboard focus on the next action.
  useEffect(() => {
    const el =
      phase === "turn"
        ? speakRef.current
        : phase === "scored"
          ? againRef.current
          : phase === "ready"
            ? playRef.current
            : null;
    const active = document.activeElement;
    // Only when focus was lost (its button just disappeared) or is already inside the demo.
    if (el && (!active || active === document.body || el.closest("section")?.contains(active))) {
      el.focus({ preventScroll: true });
    }
  }, [phase]);

  const mine = useMemo(() => LINES.filter((l) => l.speaker === who), [who]);
  const name = who ? d.names[who] : "";
  const current = LINES.find((l) => time >= l.start && time < l.end) ?? null;

  const choose = (id: SpeakerId) => {
    setWho(id);
    setPhase("detecting");
    setTime(0);
    timeRef.current = 0;
    setTurn(null);
    setAttempts({});
    setScores({});
    doneLines.current = new Set();
  };

  useEffect(() => {
    if (phase !== "detecting") return;
    const id = window.setTimeout(() => setPhase("ready"), DETECT_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  // Playback clock: pauses on the start of each of the learner's lines.
  useEffect(() => {
    if (phase !== "playing") return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const next = timeRef.current + dt;
      const hit = mine.find((l) => !doneLines.current.has(l.id) && timeRef.current <= l.start && next >= l.start);
      if (hit) {
        timeRef.current = hit.start;
        setTime(hit.start);
        setTurn(hit);
        setPhase("turn");
        setLive({ kind: "pause" });
        return;
      }
      if (next >= SCENE_LENGTH) {
        timeRef.current = SCENE_LENGTH;
        setTime(SCENE_LENGTH);
        setPhase("done");
        return;
      }
      timeRef.current = next;
      setTime(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, mine]);

  useEffect(() => {
    if (phase !== "listening" || !turn) return;
    const id = window.setTimeout(() => {
      setPhase("scored");
      const a = practice(turn, attempts[turn.id] ?? 0);
      setScores((cur) => ({ ...cur, [turn.id]: a.score }));
      setLive({ kind: "scored", score: a.score });
    }, LISTEN_MS);
    return () => window.clearTimeout(id);
  }, [phase, turn, attempts]);

  const speak = () => setPhase("listening");
  const again = () => {
    if (!turn) return;
    setAttempts((cur) => ({ ...cur, [turn.id]: (cur[turn.id] ?? 0) + 1 }));
    setPhase("listening");
  };
  const next = useCallback(() => {
    if (!turn) return;
    doneLines.current.add(turn.id);
    timeRef.current = turn.end;
    setTime(turn.end);
    setTurn(null);
    setPhase("playing");
  }, [turn]);
  const restart = () => {
    timeRef.current = 0;
    setTime(0);
    setTurn(null);
    setAttempts({});
    setScores({});
    doneLines.current = new Set();
    setPhase("ready");
  };

  const attemptNo = turn ? (attempts[turn.id] ?? 0) : 0;
  const result = useMemo(
    () => (turn && phase === "scored" ? practice(turn, attemptNo) : null),
    [turn, phase, attemptNo],
  );

  const speaking: SpeakerId | null =
    phase === "listening" ? null : current && (phase === "playing" || phase === "paused") ? current.speaker : null;
  const subtitleLine = turn ?? (phase === "playing" || phase === "paused" ? current : null);
  const subtitle = subtitleLine
    ? { name: d.names[subtitleLine.speaker], text: subtitleLine.ko, you: subtitleLine.speaker === who }
    : null;

  const stepIndex =
    phase === "pick"
      ? 0
      : phase === "detecting"
        ? 1
        : phase === "ready" || phase === "playing" || phase === "paused"
          ? 2
          : phase === "turn" || phase === "listening"
            ? 3
            : 4;
  const finalScores = Object.values(scores);
  const avg = finalScores.length ? Math.round(finalScores.reduce((x, y) => x + y, 0) / finalScores.length) : 0;

  return (
    <Section id="demo">
      <SectionHead title={d.h}>
        <p className={s.intro}>{d.intro}</p>
        <p className={s.disclaimer}>{d.disclaimer}</p>
      </SectionHead>

      <div className={s.console}>
        <p className="visually-hidden" aria-live="polite">
          {live ? (live.kind === "pause" ? d.live.pause(name) : d.live.scored(live.score)) : ""}
        </p>

        <ol className={s.stepper} aria-label={d.h}>
          {d.steps.map((label, i) => (
            <li key={label} data-state={i < stepIndex ? "done" : i === stepIndex ? "now" : "next"}>
              <span aria-hidden="true">{i + 1}</span>
              {label}
            </li>
          ))}
        </ol>

        <div className={s.stageGrid}>
          <div className={s.player}>
            <Scene
              speaking={speaking}
              selected={who}
              choose={choose}
              canChoose={phase === "pick" || phase === "ready" || phase === "done"}
              names={d.names}
              chooseLabel={d.choose}
              sceneLabel={d.scene}
              subtitle={subtitle}
            />

            <div className={s.timeline} aria-label={d.timeline} role="group">
              <div className={s.track}>
                {LINES.map((l) => (
                  <span
                    key={l.id}
                    className={s.seg}
                    data-you={who !== null && l.speaker === who && phase !== "pick" && phase !== "detecting"}
                    data-scan={phase === "detecting"}
                    style={{
                      left: `${(l.start / SCENE_LENGTH) * 100}%`,
                      width: `${((l.end - l.start) / SCENE_LENGTH) * 100}%`,
                    }}
                  />
                ))}
                <span className={s.playhead} style={{ left: `${(time / SCENE_LENGTH) * 100}%` }} />
              </div>
              <p className={s.legendRow}>
                <span>
                  <i data-k="you" /> {d.legendYou}
                </span>
                <span>
                  <i data-k="other" /> {d.legendOther}
                </span>
                <span className={s.clock}>
                  0:{String(Math.floor(time)).padStart(2, "0")} / 0:{SCENE_LENGTH}
                </span>
              </p>
            </div>

            <div className={s.controls}>
              {(phase === "ready" || phase === "paused") && (
                <button ref={playRef} type="button" className={s.primary} onClick={() => setPhase("playing")}>
                  {d.play}
                </button>
              )}
              {phase === "playing" && (
                <button type="button" className={s.primary} onClick={() => setPhase("paused")}>
                  {d.pause}
                </button>
              )}
              {phase !== "pick" && phase !== "detecting" && (
                <button type="button" className={s.secondary} onClick={restart}>
                  {d.restart}
                </button>
              )}
              {phase !== "pick" && phase !== "detecting" && (
                <button
                  type="button"
                  className={s.secondary}
                  onClick={() => {
                    setWho(null);
                    setPhase("pick");
                    setTurn(null);
                    timeRef.current = 0;
                    setTime(0);
                  }}
                >
                  {d.change}
                </button>
              )}
            </div>
          </div>

          <div className={s.side}>
            {phase === "pick" && <p className={s.prompt}>{d.pick}</p>}
            {phase === "detecting" && (
              <p className={s.prompt} data-busy="true">
                {d.detecting}
              </p>
            )}
            {who && phase !== "pick" && phase !== "detecting" && (
              <p className={s.found}>{d.found(mine.length, name)}</p>
            )}

            {turn && (phase === "turn" || phase === "listening" || phase === "scored") ? (
              <div className={s.turnCard}>
                <p className={s.turnLabel}>{d.yourTurn}</p>
                <p className={s.turnHint}>{d.readAloud}</p>
                <p className={s.lineKo} lang="ko">
                  {turn.ko}
                </p>
                <p className={s.lineRoman}>{turn.roman}</p>
                <p className={s.lineEn}>
                  <span>{d.meaning}</span> {turn.en}
                </p>
                <div className={s.turnButtons}>
                  {phase === "turn" && (
                    <button ref={speakRef} type="button" className={s.speak} onClick={speak}>
                      <span className={s.micDot} aria-hidden="true" />
                      {d.speak}
                    </button>
                  )}
                  {phase === "listening" && (
                    <p className={s.listening}>
                      <span className={s.wave} aria-hidden="true">
                        {Array.from({ length: 9 }, (_, i) => (
                          <i key={i} style={{ animationDelay: `${i * 90}ms` }} />
                        ))}
                      </span>
                      {d.speaking}
                    </p>
                  )}
                  {phase === "scored" && (
                    <>
                      <button ref={againRef} type="button" className={s.secondary} onClick={again}>
                        {d.tryAgain}
                      </button>
                      <button type="button" className={s.primary} onClick={next}>
                        {d.next}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              who &&
              phase !== "detecting" && (
                <ol className={s.script} lang="ko">
                  {LINES.map((l) => (
                    <li
                      key={l.id}
                      data-you={l.speaker === who}
                      data-now={current?.id === l.id && (phase === "playing" || phase === "paused")}
                    >
                      <span className={s.scriptName}>{d.names[l.speaker]}</span>
                      <span>{l.ko}</span>
                      {scores[l.id] !== undefined && <strong className={s.scriptScore}>{scores[l.id]}</strong>}
                    </li>
                  ))}
                </ol>
              )
            )}

            {phase === "done" && (
              <div className={s.doneCard}>
                <p className={s.turnLabel}>{d.done}</p>
                {finalScores.length > 0 && <p>{d.summary(finalScores.length, avg)}</p>}
                <button type="button" className={s.primary} onClick={restart}>
                  {d.playAgain}
                </button>
              </div>
            )}
          </div>
        </div>

        {result && turn && <Feedback a={result} attempt={attemptNo} line={turn} />}
      </div>
    </Section>
  );
}
