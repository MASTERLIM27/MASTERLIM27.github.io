"use client";

import { useLang } from "@/projects/tool-wear/lib/i18n";
import { AUTHORS, BIBTEX, CITATION, LAYERS, LINKS } from "@/projects/tool-wear/content/paper";
import ScrollRegion from "@/lib/ScrollRegion";
import { CopyBlock, RuleCard, Section, SectionHead } from "./ui";
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

export function Machine() {
  const { t } = useLang();
  const m = t.machine;
  return (
    <Section id="machine">
      <div className={s.machine}>
        <div className={s.machineText}>
          <h2 className={s.h2}>{m.h}</h2>
          <p className={s.body}>{m.p}</p>
        </div>
        <figure className={s.paperFigure}>
          <img src="figures/fig1-setup.webp" alt={m.alt} width={898} height={488} loading="lazy" />
          <figcaption>{m.caption}</figcaption>
        </figure>
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

function LayerTable() {
  const { t } = useLang();
  const h = t.how;
  const maxUnits = 64;
  return (
    <figure className={s.example}>
      <ScrollRegion className={s.tableWrap} label={h.layersCaption}>
        <table className={s.layers}>
          <caption className="visually-hidden">{h.layersCaption}</caption>
          <thead>
            <tr>
              {h.layerCols.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LAYERS.map((l, i) => {
              const [shapeIn, shapeOut] = l.shape.split(" → ");
              const formula = l.count > 0 ? l.params.split(" = ")[0] : "";
              return (
                <tr key={i} data-type={l.type}>
                  <th scope="row">{l.type}</th>
                  <td className={s.units}>
                    {l.units !== undefined ? (
                      <span className={s.unitCell}>
                        <span
                          className={s.unitBar}
                          style={{
                            width: `${Math.max(4, (l.units / maxUnits) * 100)}%`,
                          }}
                        />
                        <span>{l.units}</span>
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{l.activation ?? "—"}</td>
                  <td>{l.dropout ?? "—"}</td>
                  <td className={s.shape}>
                    <span>{shapeIn} →</span>
                    <span>{shapeOut}</span>
                  </td>
                  <td className={s.params}>
                    <span className={s.paramCount}>{l.count.toLocaleString("en-US")}</span>
                    {formula && <span className={s.paramFormula}>{formula}</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </ScrollRegion>
      <figcaption>
        {h.layersCaption}. {h.totalParams}.
      </figcaption>
      <p className={s.trainLine}>{h.training}</p>
    </figure>
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
          <div className={s.example}>
            <h4 className={s.exampleH}>{h.thresholdsH}</h4>
            <ul className={s.thresholds}>
              {h.thresholds.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <RuleCard label={h.ruleCaption} />
          </div>
        </article>

        <article className={s.stage}>
          <header className={s.stageHead}>
            <p className={s.stageLabel}>{h.stage2.label}</p>
            <h3 className={s.h3}>{h.stage2.h}</h3>
          </header>
          <ol className={s.steps}>
            {st.slice(3).map((x, i) => (
              <Step key={x.h} n={i + 4} h={x.h} p={x.p} />
            ))}
          </ol>
          <LayerTable />
        </article>
      </div>
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
        <a className={s.linkButton} href={LINKS.pdf} target="_blank" rel="noreferrer">
          {c.links.pdf}
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
        <p className={s.footerBrand}>MCT Tool Wear Prediction</p>
        <p>{t.footer.note}</p>
        <p>{t.footer.paper}</p>
      </div>
    </footer>
  );
}
