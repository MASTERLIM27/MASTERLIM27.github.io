"use client";

import { useCallback, useRef, useState, type FocusEvent, type PointerEvent, type ReactNode } from "react";
import { useLang } from "@/projects/tool-wear/lib/i18n";
import { CORRELATION, SUPPORT, TABLE2, type ClassId } from "@/projects/tool-wear/content/paper";
import ScrollRegion from "@/lib/ScrollRegion";
import { Section, SectionHead } from "./ui";
import c from "./Charts.module.css";

/* ---------- Shared tooltip: values lead, labels follow ---------- */

interface TipContent {
  title: string;
  rows: { value: string; label: string }[];
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
    setTip({ ...content, x: Math.min(Math.max(x - r.left, 100), r.width - 100), y: y - r.top });
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
          <strong>{row.value}</strong>
          <span>{row.label}</span>
        </p>
      ))}
    </div>
  ) : null;

  return { boxRef, bind, node };
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

/* ---------- Correlation with cycle time (Figure 2a) ---------- */

const DOMAIN = { min: -0.3, max: 0.4 };
const TICKS = [-0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3, 0.4];
const LABELED = new Set([-0.2, 0, 0.2, 0.4]);
const pos = (v: number) => ((v - DOMAIN.min) / (DOMAIN.max - DOMAIN.min)) * 100;
const fmtR = (r: number) => (Math.abs(r) < 0.005 ? "0.00" : r.toFixed(2));

function Correlation() {
  const { t } = useLang();
  const r = t.results.corr;
  const names = t.signalNames;
  const { boxRef, bind, node } = useTip();
  const zero = pos(0);
  const grid = { backgroundSize: `${100 / (TICKS.length - 1)}% 100%` };

  return (
    <div className={c.block}>
      <div className={c.blockText}>
        <h3 className={c.h3}>{r.h}</h3>
        <p className={c.body}>{r.p}</p>
      </div>
      <Figure title={r.chartTitle} note={r.note}>
        <ul className={c.legend}>
          <li>
            <span className={c.swatch} data-s="accent" aria-hidden="true" />
            <span>{r.legendCircled}</span>
          </li>
          <li>
            <span className={c.swatch} aria-hidden="true" />
            <span>{r.legendOther}</span>
          </li>
        </ul>
        <div ref={boxRef} className={c.chart}>
          {CORRELATION.map((d) => {
            const p = pos(d.r);
            const left = Math.min(zero, p);
            const width = Math.max(Math.abs(p - zero), 0.6);
            const neg = d.r < 0;
            return (
              <div key={d.id} className={`${c.row} ${c.corrRow}`}>
                <div className={c.rowLabel}>
                  <span>{names[d.id]}</span>
                  <small>
                    <code>{d.id}</code>
                  </small>
                </div>
                <div className={`${c.track} ${c.divTrack}`} style={grid}>
                  <span className={c.zero} style={{ left: `${zero}%` }} aria-hidden="true" />
                  <div
                    className={c.bar}
                    data-emph={d.circled ? "true" : "false"}
                    data-neg={neg}
                    style={{ left: `${left}%`, width: `${width}%` }}
                    tabIndex={0}
                    role="img"
                    aria-label={`${names[d.id]}: r = ${fmtR(d.r)}`}
                    {...bind({
                      title: names[d.id],
                      rows: [
                        { value: `r = ${fmtR(d.r)}`, label: neg ? r.shorter : d.r > 0 ? r.longer : "" },
                        ...(d.circled ? [{ value: "●", label: r.legendCircled }] : []),
                      ],
                    })}
                  />
                  <span
                    className={c.barValue}
                    data-neg={neg}
                    style={{ left: `${neg ? left : left + width}%` }}
                    aria-hidden="true"
                  >
                    {fmtR(d.r)}
                  </span>
                </div>
              </div>
            );
          })}
          <div className={`${c.axisRow} ${c.corrRow}`} aria-hidden="true">
            <span />
            <div className={c.axis}>
              {TICKS.filter((v) => LABELED.has(v)).map((v) => (
                <span key={v} style={{ left: `${pos(v)}%` }} className={c.tickCenter}>
                  {v === 0 ? "0" : v.toFixed(1)}
                </span>
              ))}
            </div>
          </div>
          <div className={`${c.axisRow} ${c.corrRow}`} aria-hidden="true">
            <span />
            <div className={c.direction}>
              <span>← {r.shorter}</span>
              <span>{r.longer} →</span>
            </div>
          </div>
          {node}
        </div>
        <details className={c.details}>
          <summary>{t.results.showTable}</summary>
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
                {CORRELATION.map((d) => (
                  <tr key={d.id}>
                    <th scope="row">{names[d.id]}</th>
                    <td className={c.codeCell}>{d.id}</td>
                    <td data-best={d.circled ? "true" : "false"}>{fmtR(d.r)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollRegion>
        </details>
      </Figure>
    </div>
  );
}

/* ---------- Figures from the paper ---------- */

function PaperFigure({ src, w, h, alt, caption }: { src: string; w: number; h: number; alt: string; caption: string }) {
  return (
    <figure className={c.paperFigure}>
      <img src={src} alt={alt} width={w} height={h} loading="lazy" />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

function SpindleLoad() {
  const { t } = useLang();
  const r = t.results.load;
  return (
    <div className={c.block}>
      <div className={c.blockText}>
        <h3 className={c.h3}>{r.h}</h3>
        <p className={c.body}>{r.p}</p>
      </div>
      <PaperFigure src="figures/fig2b-spindle-load.webp" w={862} h={458} alt={r.alt} caption={r.caption} />
    </div>
  );
}

function Training() {
  const { t } = useLang();
  const r = t.results.train;
  return (
    <div className={c.block}>
      <div className={c.blockText}>
        <h3 className={c.h3}>{r.h}</h3>
        <p className={c.body}>{r.p}</p>
        <dl className={c.stats}>
          {r.stats.map((x, i) => (
            <div key={x.k} data-lead={i === 0}>
              <dt>{x.k}</dt>
              <dd>{x.v}</dd>
              <dd className={c.statNote}>{x.note}</dd>
            </div>
          ))}
        </dl>
      </div>
      <PaperFigure src="figures/fig4-training.webp" w={885} h={364} alt={r.alt} caption={r.caption} />
    </div>
  );
}

function Compare() {
  const { t } = useLang();
  const r = t.results.compare;
  const classes: ClassId[] = ["notWorn", "worn"];
  return (
    <div className={c.block}>
      <div className={c.blockText}>
        <h3 className={c.h3}>{r.h}</h3>
        <p className={c.body}>{r.p}</p>
      </div>
      <figure className={c.figure}>
        <ScrollRegion className={c.tableWrap} label={r.tableCaption}>
          <table className={`${c.table} ${c.compare}`}>
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
              {TABLE2.map((m) =>
                classes.map((k, i) => (
                  <tr key={`${m.id}-${k}`} data-first={i === 0} data-ours={m.id === "ours"}>
                    {i === 0 && (
                      <th scope="rowgroup" rowSpan={2}>
                        {r.methods[m.id]}
                      </th>
                    )}
                    <td className={c.classCell} data-worn={k === "worn"}>
                      {r.classes[k]}
                    </td>
                    <td>{m.rows[k].p.toFixed(2)}</td>
                    <td>{m.rows[k].r.toFixed(2)}</td>
                    <td>{m.rows[k].f1.toFixed(2)}</td>
                    <td>{SUPPORT[k].toLocaleString("en-US")}</td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </ScrollRegion>
        <p className={c.note}>{r.note}</p>
      </figure>
    </div>
  );
}

function Software() {
  const { t } = useLang();
  const r = t.results.software;
  return (
    <div className={c.softwareBlock}>
      <div className={c.blockText}>
        <h3 className={c.h3}>{r.h}</h3>
        <p className={c.body}>{r.p}</p>
      </div>
      <figure className={c.figPair}>
        <div className={c.pair}>
          <div className={c.pairItem}>
            <img src="figures/fig5-normal.webp" alt={r.altLeft} width={635} height={419} loading="lazy" />
            <p lang="en">{r.left}</p>
          </div>
          <div className={c.pairItem}>
            <img src="figures/fig5-anomaly.webp" alt={r.altRight} width={785} height={516} loading="lazy" />
            <p lang="en">{r.right}</p>
          </div>
        </div>
        <figcaption>{r.caption}</figcaption>
      </figure>
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
        <Correlation />
        <SpindleLoad />
        <Training />
        <Compare />
        <Software />
      </div>
    </Section>
  );
}
