"use client";

import { useLang } from "@/projects/korean/lib/i18n";
import { AUTHORS, BIBTEX, CITATION, LINKS, PSEUDO_FEEDBACK, PSEUDO_PRACTICE } from "@/projects/korean/content/paper";
import { CopyBlock, Section, SectionHead } from "./ui";
import s from "./Sections.module.css";

export function Overview() {
  const { t } = useLang();
  const o = t.overview;
  return (
    <Section id="overview">
      <div className={s.overview}>
        <div className={s.overviewText}>
          <SectionHead title={o.h} />
          <p className={s.lead}>{o.lead}</p>
          <p className={s.body}>{o.why}</p>
        </div>
        <dl className={s.facts}>
          {o.facts.map((f) => (
            <div key={f.k} className={s.fact}>
              <dt>{f.k}</dt>
              <dd>{f.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}

export function Why() {
  const { t } = useLang();
  const w = t.why;
  return (
    <Section id="why">
      <div className={s.why}>
        <div className={s.whyText}>
          <h2 className={s.h2}>{w.h}</h2>
          <p className={s.body}>{w.p}</p>
        </div>
        <dl className={s.whyStats}>
          {w.stats.map((x) => (
            <div key={x.k}>
              <dd>{x.v}</dd>
              <dt>{x.k}</dt>
            </div>
          ))}
        </dl>
        <p className={s.pilot}>{w.pilot}</p>
      </div>
    </Section>
  );
}

function Step({ n, h, p }: { n: number; h: string; p: string }) {
  return (
    <li className={s.step}>
      <span className={s.num} aria-hidden="true">
        {n}
      </span>
      <div className={s.stepBody}>
        <h4 className={s.stepH}>{h}</h4>
        <p className={s.stepP}>{p}</p>
      </div>
    </li>
  );
}

type NodeId = keyof ReturnType<typeof useLang>["t"]["how"]["diagram"]["nodes"];
const LANE1: { id: NodeId; kind: "source" | "target" | "learner" | "compare" }[] = [
  { id: "video", kind: "source" },
  { id: "click", kind: "learner" },
  { id: "face", kind: "target" },
  { id: "segments", kind: "target" },
  { id: "separate", kind: "target" },
  { id: "stt", kind: "target" },
];
const LANE2: typeof LANE1 = [
  { id: "read", kind: "learner" },
  { id: "convert", kind: "learner" },
  { id: "dtw", kind: "compare" },
  { id: "embed", kind: "compare" },
  { id: "score", kind: "compare" },
];

/** Figures 1–3 of the paper, redrawn as one pipeline (the originals contain third-party video stills). */
function Pipeline() {
  const { t } = useLang();
  const d = t.how.diagram;
  const lane = (nodes: typeof LANE1, label: string) => (
    <div className={s.lane}>
      <p className={s.laneLabel}>{label}</p>
      <ol className={s.laneNodes}>
        {nodes.map((n) => (
          <li key={n.id} className={s.node} data-kind={n.kind}>
            {d.nodes[n.id]}
          </li>
        ))}
      </ol>
    </div>
  );
  return (
    <figure className={s.pipeline}>
      {lane(LANE1, t.how.stage1.h)}
      <div className={s.handoff} aria-hidden="true" />
      {lane(LANE2, t.how.stage2.h)}
      <figcaption>{d.caption}</figcaption>
    </figure>
  );
}

function Cosine() {
  const { t } = useLang();
  const c = t.how.cosine;
  return (
    <div className={s.note}>
      <h4 className={s.noteH}>{c.h}</h4>
      <p className={s.formula} aria-label={c.aria}>
        <span>
          S<sub>C</sub>(A, B) =
        </span>
        <span className={s.frac}>
          <span>A · B</span>
          <span>‖A‖ ‖B‖</span>
        </span>
      </p>
      <p className={s.noteP}>{c.p}</p>
    </div>
  );
}

export function HowItWorks() {
  const { t } = useLang();
  const h = t.how;
  const st = h.steps;
  return (
    <Section id="how">
      <SectionHead title={h.h}>
        <p className={s.body}>{h.intro}</p>
      </SectionHead>

      <Pipeline />

      <div className={s.stages}>
        <article className={s.stage}>
          <header className={s.stageHead}>
            <p className={s.stageLabel}>{h.stage1.label}</p>
            <h3 className={s.h3}>{h.stage1.h}</h3>
          </header>
          <ol className={s.steps}>
            {st.slice(0, 3).map((x, i) => (
              <Step key={x.h} n={i + 1} h={x.h} p={x.p} />
            ))}
          </ol>
          <div className={s.note}>
            <h4 className={s.noteH}>{h.overlay.h}</h4>
            <p className={s.noteP}>{h.overlay.p}</p>
          </div>
        </article>

        <article className={s.stage} data-part="2">
          <header className={s.stageHead}>
            <p className={s.stageLabel}>{h.stage2.label}</p>
            <h3 className={s.h3}>{h.stage2.h}</h3>
          </header>
          <ol className={s.steps}>
            {st.slice(3).map((x, i) => (
              <Step key={x.h} n={i + 4} h={x.h} p={x.p} />
            ))}
          </ol>
          <Cosine />
          <div className={s.note}>
            <h4 className={s.noteH}>{h.privacy.h}</h4>
            <p className={s.noteP}>{h.privacy.p}</p>
          </div>
        </article>
      </div>

      <details className={s.code}>
        <summary>
          <span className={s.codeH}>{h.code.h}</span>
          <span className={s.codeShow}>{h.code.show}</span>
        </summary>
        <div className={s.codeGrid} lang="en">
          <figure>
            <figcaption>{h.code.left}</figcaption>
            <pre tabIndex={0}>{PSEUDO_PRACTICE}</pre>
          </figure>
          <figure>
            <figcaption>{h.code.right}</figcaption>
            <pre tabIndex={0}>{PSEUDO_FEEDBACK}</pre>
          </figure>
        </div>
        <p className={s.codeNote}>{h.code.note}</p>
      </details>
    </Section>
  );
}

export function Limitations() {
  const { t } = useLang();
  return (
    <Section id="limitations">
      <SectionHead title={t.limits.h} />
      <div className={s.limits}>
        {t.limits.items.map((item) => (
          <div key={item.h} className={s.limit}>
            <h3 className={s.limitH}>{item.h}</h3>
            <p className={s.body}>{item.p}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function Authors() {
  const { t } = useLang();
  const a = t.authors;
  return (
    <Section id="authors">
      <SectionHead title={a.h} />
      <ul className={s.authors}>
        {AUTHORS.map((p) => (
          <li key={p.name}>
            <span className={s.authorName}>
              {p.name}
              <sup className={s.sup}>
                {p.affil}
                {p.corresponding ? "*" : ""}
              </sup>
            </span>
            <span className={s.authorRole}>{a.roles[p.role]}</span>
          </li>
        ))}
      </ul>
      <ol className={s.affils}>
        {a.affiliations.map((x, i) => (
          <li key={x}>
            <sup className={s.sup}>{i + 1}</sup> {x}
          </li>
        ))}
        <li>
          <sup className={s.sup}>*</sup> {a.corresponding}
        </li>
      </ol>
      <p className={s.funding}>{a.funding}</p>
    </Section>
  );
}

export function Cite() {
  const { t } = useLang();
  const c = t.cite;
  return (
    <Section id="paper">
      <SectionHead title={c.h}>
        <p className={s.body}>{c.p}</p>
      </SectionHead>
      <div className={s.linkRow}>
        <a className={`${s.linkButton} ${s.primary}`} href={LINKS.doi} target="_blank" rel="noreferrer">
          {c.links.doi}
        </a>
        <span className={s.doi}>{c.links.doiShort}</span>
      </div>
      <div className={s.citeGrid}>
        <CopyBlock
          title={c.citation}
          text={CITATION}
          copy={c.copy}
          copied={c.copied}
          fallback={c.copyFallback}
          mono={false}
        />
        <CopyBlock title={c.bibtex} text={BIBTEX} copy={c.copy} copied={c.copied} fallback={c.copyFallback} />
      </div>
    </Section>
  );
}

export function Footer() {
  const { t } = useLang();
  return (
    <footer className={s.footer}>
      <div className={s.footerInner}>
        <p className={s.footerBrand}>{t.brand}</p>
        <p>{t.footer.note}</p>
        <p>{t.footer.paper}</p>
      </div>
    </footer>
  );
}
