"use client";

import { useCallback, useRef, useState, type FocusEvent, type PointerEvent, type ReactNode } from "react";
import { useLang } from "@/projects/pic2plate/lib/i18n";
import { en } from "@/projects/pic2plate/content/dict";
import { DETECTION, PARTICIPANTS, PREFERENCE, REASONS, type ReasonId, type SystemId } from "@/projects/pic2plate/content/paper";
import ScrollRegion from "@/lib/ScrollRegion";
import { Section, SectionHead } from "./ui";
import c from "./Charts.module.css";

/* ---------- Shared tooltip: values lead, labels follow ---------- */

interface TipContent {
  title: string;
  rows: { value: string; label: string; key?: string }[];
}
interface TipState extends TipContent {
  x: number;
  y: number;
}

function useTip() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<TipState | null>(null);

  const place = useCallback((x: number, y: number, content: TipContent) => {
    const box = boxRef.current;
    if (!box) return;
    const r = box.getBoundingClientRect();
    setTip({ ...content, x: Math.min(Math.max(x - r.left, 90), r.width - 90), y: y - r.top });
  }, []);

  const bind = (content: TipContent) => ({
    onPointerMove: (e: PointerEvent<HTMLElement>) => place(e.clientX, e.clientY, content),
    onPointerLeave: () => setTip(null),
    onFocus: (e: FocusEvent<HTMLElement>) => {
      const r = e.currentTarget.getBoundingClientRect();
      place(r.left + r.width / 2, r.top, content);
    },
    onBlur: () => setTip(null),
  });

  const node = tip ? (
    <div className={c.tooltip} style={{ left: tip.x, top: tip.y }} aria-hidden="true">
      <p className={c.tipTitle}>{tip.title}</p>
      {tip.rows.map((row) => (
        <p key={row.label} className={c.tipRow}>
          {row.key && <span className={c.tipKey} data-s={row.key} />}
          <strong>{row.value}</strong>
          <span>{row.label}</span>
        </p>
      ))}
    </div>
  ) : null;

  return { boxRef, bind, node };
}

function Axis({ ticks, format, valueCol }: { ticks: number[]; format: (v: number) => string; valueCol?: boolean }) {
  const max = ticks[ticks.length - 1];
  return (
    <div className={valueCol ? `${c.axisRow} ${c.withValue}` : c.axisRow} aria-hidden="true">
      <span />
      <div className={c.axis}>
        {ticks.map((v) => (
          <span key={v} style={{ left: `${(v / max) * 100}%` }}>
            {format(v)}
          </span>
        ))}
      </div>
      {valueCol && <span />}
    </div>
  );
}

function Figure({ title, children, note }: { title: string; children: ReactNode; note?: string }) {
  return (
    <figure className={c.figure}>
      <figcaption className={c.chartTitle}>{title}</figcaption>
      {children}
      {note && <p className={c.note}>{note}</p>}
    </figure>
  );
}

/* ---------- Ingredient recognition ---------- */

function Detection() {
  const { t } = useLang();
  const r = t.results.det;
  const { boxRef, bind, node } = useTip();
  const best = {
    precision: Math.max(...DETECTION.map((m) => m.precision)),
    recall: Math.max(...DETECTION.map((m) => m.recall)),
    f1: Math.max(...DETECTION.map((m) => m.f1)),
    accuracy: Math.max(...DETECTION.map((m) => m.accuracy)),
  };
  const f2 = (v: number) => v.toFixed(2);

  return (
    <div className={c.block}>
      <div className={c.blockText}>
        <h3 className={c.h3}>{r.h}</h3>
        <p className={c.body}>{r.p}</p>
      </div>
      <Figure title={r.chartTitle}>
        <div ref={boxRef} className={c.chart}>
          {DETECTION.map((m) => (
            <div key={m.id} className={c.row}>
              <div className={c.rowLabel}>
                <span>{m.name}</span>
                <small>{r.kinds[m.kind]}</small>
              </div>
              <div className={c.track} data-grid="4">
                <div
                  className={c.bar}
                  data-emph={m.id === "gpt4o"}
                  style={{ width: `${m.f1 * 100}%` }}
                  tabIndex={0}
                  role="img"
                  aria-label={`${m.name}: ${r.cols[3]} ${f2(m.f1)}`}
                  {...bind({
                    title: m.name,
                    rows: [
                      { value: f2(m.f1), label: r.cols[3] },
                      { value: f2(m.precision), label: r.cols[1] },
                      { value: f2(m.recall), label: r.cols[2] },
                      { value: f2(m.accuracy), label: r.cols[4] },
                    ],
                  })}
                />
                <span className={c.barValue} style={{ left: `${m.f1 * 100}%` }}>
                  {f2(m.f1)}
                </span>
              </div>
            </div>
          ))}
          <Axis ticks={[0, 0.25, 0.5, 0.75, 1]} format={(v) => (v === 0 || v === 1 ? String(v) : v.toFixed(2))} />
          {node}
        </div>
        <ScrollRegion className={c.tableWrap} label={r.tableCaption}>
          <table className={c.table}>
            <caption className="visually-hidden">{r.tableCaption}</caption>
            <thead>
              <tr>
                {r.cols.map((col) => (
                  <th key={col} scope="col">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DETECTION.map((m) => (
                <tr key={m.id}>
                  <th scope="row">
                    {m.name}
                    <small>{r.kinds[m.kind]}</small>
                  </th>
                  {(["precision", "recall", "f1", "accuracy"] as const).map((k) => (
                    <td key={k} data-best={m[k] === best[k]}>
                      {f2(m[k])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollRegion>
        <p className={c.note}>{r.note}</p>
      </Figure>
    </div>
  );
}

/* ---------- Recommendation preference ---------- */

const SYSTEMS: SystemId[] = ["a", "b", "c"];

function Preference() {
  const { t } = useLang();
  const r = t.results.pref;
  const { boxRef, bind, node } = useTip();
  const f1 = (v: number) => v.toFixed(1);

  return (
    <div className={c.block}>
      <div className={c.blockText}>
        <h3 className={c.h3}>{r.h}</h3>
        <p className={c.body}>{r.p}</p>
        <p className={c.takeaway}>{r.takeaway}</p>
      </div>
      <Figure title={r.chartTitle}>
        <ul className={c.legend}>
          {SYSTEMS.map((id) => (
            <li key={id}>
              <span className={c.swatch} data-s={id} aria-hidden="true" />
              <span>{r.models[id]}</span>
              <small>{r.aliases[id]}</small>
            </li>
          ))}
        </ul>
        <div ref={boxRef} className={c.chart}>
          {PREFERENCE.map((row) => (
            <div key={row.set} className={c.row}>
              <div className={c.rowLabel}>
                <span>{r.set(row.set)}</span>
              </div>
              <div className={c.stack}>
                {SYSTEMS.map((id) => (
                  <div
                    key={id}
                    className={c.seg}
                    data-s={id}
                    style={{ flexGrow: row[id] }}
                    tabIndex={0}
                    role="img"
                    aria-label={`${r.set(row.set)}, ${r.models[id]}: ${f1(row[id])}%`}
                    {...bind({
                      title: r.set(row.set),
                      rows: SYSTEMS.map((s) => ({ key: s, value: `${f1(row[s])}%`, label: r.models[s] })),
                    })}
                  >
                    <span className={c.segLabel}>{f1(row[id])}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <Axis ticks={[0, 25, 50, 75, 100]} format={(v) => `${v}%`} />
          {node}
        </div>
        <details className={c.details}>
          <summary>{t.results.showTable}</summary>
          <ScrollRegion className={c.tableWrap} label={r.tableCaption}>
            <table className={c.table}>
              <caption className="visually-hidden">{r.tableCaption}</caption>
              <thead>
                <tr>
                  <th scope="col" />
                  {SYSTEMS.map((id) => (
                    <th key={id} scope="col">
                      {r.models[id]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PREFERENCE.map((row) => (
                  <tr key={row.set}>
                    <th scope="row">{r.set(row.set)}</th>
                    {SYSTEMS.map((id) => (
                      <td key={id} data-best={id === "a"}>
                        {row[id].toFixed(3)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollRegion>
        </details>
        <p className={c.note}>{r.note}</p>
      </Figure>
    </div>
  );
}

/* ---------- Reasons ---------- */

const REASON_IDS: ReasonId[] = ["relevant", "ease", "reliable", "diverse"];
const AXIS_MAX = 80;

function Reasons() {
  const { t } = useLang();
  const r = t.results.reasons;
  const sets = t.results.pref.set;
  const { boxRef, bind, node } = useTip();
  const pct = (n: number) => (n / 120) * 100;

  return (
    <div className={c.block}>
      <div className={c.blockText}>
        <h3 className={c.h3}>{r.h}</h3>
        <p className={c.body}>{r.p}</p>
      </div>
      <Figure title={r.chartTitle}>
        <ul className={c.legend}>
          <li>
            <span className={c.swatch} data-s="mean" aria-hidden="true" />
            <span>{r.legendBar}</span>
          </li>
          <li>
            <span className={c.dotKey} aria-hidden="true" />
            <span>{r.legendDot}</span>
          </li>
        </ul>
        <div ref={boxRef} className={c.chart}>
          {REASON_IDS.map((id) => {
            const counts = REASONS[id];
            const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
            return (
              <div key={id} className={`${c.row} ${c.withValue}`}>
                <div className={c.rowLabel}>
                  <span>{r.labels[id]}</span>
                </div>
                <div className={c.track} data-grid="4">
                  <div
                    className={c.bar}
                    data-tone="mean"
                    style={{ width: `${(pct(mean) / AXIS_MAX) * 100}%` }}
                    tabIndex={0}
                    role="img"
                    aria-label={`${r.labels[id]}: ${pct(mean).toFixed(1)}%`}
                    {...bind({
                      title: r.labels[id],
                      rows: [
                        { value: `${pct(mean).toFixed(1)}%`, label: r.legendBar },
                        ...counts.map((n, i) => ({ value: r.countOf(n), label: sets(i + 1) })),
                      ],
                    })}
                  />
                  {counts.map((n, i) => (
                    <span
                      key={i}
                      className={c.dot}
                      style={{ left: `${(pct(n) / AXIS_MAX) * 100}%` }}
                      tabIndex={0}
                      role="img"
                      aria-label={`${r.labels[id]}, ${sets(i + 1)}: ${r.countOf(n)}`}
                      {...bind({ title: r.labels[id], rows: [{ value: r.countOf(n), label: sets(i + 1) }] })}
                    />
                  ))}
                </div>
                <span className={c.sideValue}>{pct(mean).toFixed(1)}%</span>
              </div>
            );
          })}
          <Axis ticks={[0, 20, 40, 60, 80]} format={(v) => `${v}%`} valueCol />
          {node}
        </div>
        <details className={c.details}>
          <summary>{t.results.showTable}</summary>
          <ScrollRegion className={c.tableWrap} label={r.tableCaption}>
            <table className={c.table}>
              <caption className="visually-hidden">{r.tableCaption}</caption>
              <thead>
                <tr>
                  <th scope="col" />
                  {[1, 2, 3, 4, 5].map((n) => (
                    <th key={n} scope="col">
                      {sets(n)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {REASON_IDS.map((id) => (
                  <tr key={id}>
                    <th scope="row">{r.labels[id]}</th>
                    {REASONS[id].map((n, i) => (
                      <td key={i}>{n}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollRegion>
        </details>
        <p className={c.note}>{r.note}</p>
      </Figure>
    </div>
  );
}

/* ---------- Participants and test cases ---------- */

function People() {
  const { t } = useLang();
  const p = t.results.people;
  const max = Math.max(...PARTICIPANTS.age);
  return (
    <div className={c.people}>
      <h3 className={c.h3}>{p.h}</h3>
      <dl className={c.peopleGrid}>
        <div>
          <dt>{p.total}</dt>
          <dd className={c.big}>{PARTICIPANTS.total}</dd>
        </div>
        <div>
          <dt>{p.gender}</dt>
          <dd>{p.genderValue}</dd>
        </div>
        <div>
          <dt>{p.occupations}</dt>
          <dd>{p.occupationValue}</dd>
        </div>
        <div className={c.ageCell}>
          <dt>{p.age}</dt>
          <dd>
            <ul className={c.columns}>
              {PARTICIPANTS.age.map((n, i) => (
                <li key={p.ageBands[i]} aria-label={p.ageAria(p.ageBands[i], n)}>
                  <span className={c.colArea} aria-hidden="true">
                    <span className={c.colValue}>{n}</span>
                    <span className={c.col} style={{ height: `${Math.max(3, (n / max) * 96)}px` }} />
                  </span>
                  <span className={c.colLabel} aria-hidden="true">
                    {p.ageBands[i]}
                  </span>
                </li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>
    </div>
  );
}

function Cases() {
  const { t, lang } = useLang();
  const k = t.results.cases;
  const sets = t.results.pref.set;
  return (
    <div className={c.casesBlock}>
      <div className={c.blockText}>
        <h3 className={c.h3}>{k.h}</h3>
        <p className={c.body}>{k.p}</p>
      </div>
      <ol className={c.cases}>
        {k.items.map((item, i) => (
          <li key={i} className={c.case}>
            <p className={c.caseSet}>{sets(i + 1)}</p>
            <dl className={c.caseBody}>
              <div>
                <dt>{k.request}</dt>
                <dd>{item.request}</dd>
              </div>
              <div>
                <dt>{k.detected}</dt>
                <dd>
                  <ul className={c.tags}>
                    {item.detected.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt>{k.recipe}</dt>
                <dd>
                  <span className={c.caseRecipe}>{item.recipe}</span>
                  {lang === "ko" && (
                    <span className={c.original}>
                      {k.original}: {en.results.cases.items[i].recipe}
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function Results() {
  const { t } = useLang();
  return (
    <Section id="results">
      <SectionHead title={t.results.h}>
        <p className={c.body}>{t.results.intro}</p>
      </SectionHead>
      <div className={c.stack3}>
        <Detection />
        <Preference />
        <Reasons />
        <People />
        <Cases />
      </div>
    </Section>
  );
}
