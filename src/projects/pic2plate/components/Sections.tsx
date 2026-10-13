"use client";

import { useLang } from "@/projects/pic2plate/lib/i18n";
import { AUTHORS, BIBTEX, CITATION, LINKS, PAPER_JSON_EXAMPLE } from "@/projects/pic2plate/content/paper";
import { CopyBlock, IngredientJson, Section, SectionHead } from "./ui";
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
              <dd>
                {f.link ? (
                  <a href={LINKS[f.link]} target="_blank" rel="noreferrer">
                    {f.v}
                  </a>
                ) : (
                  f.v
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}

function LoopIcon() {
  return (
    <svg className={s.loopIcon} viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M15.5 7.5A6 6 0 0 0 4.4 6.2M4.5 12.5a6 6 0 0 0 11.1 1.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M4 2.8v3.7h3.7M16 17.2v-3.7h-3.7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
          <figure className={s.example}>
            <IngredientJson items={PAPER_JSON_EXAMPLE} perLine={3} />
            <figcaption>{h.jsonCaption}</figcaption>
          </figure>
        </article>

        <article className={s.stage}>
          <header className={s.stageHead}>
            <p className={s.stageLabel}>{h.stage2.label}</p>
            <h3 className={s.h3}>{h.stage2.h}</h3>
          </header>
          <ol className={s.steps}>
            <Step n={4} h={st[3].h} p={st[3].p} />
            <li className={s.loop}>
              <ol className={s.steps}>
                {st.slice(4, 7).map((x, i) => (
                  <Step key={x.h} n={i + 5} h={x.h} p={x.p} />
                ))}
              </ol>
              <p className={s.loopLabel}>
                <LoopIcon />
                {h.loop}
              </p>
            </li>
            <Step n={8} h={st[7].h} p={st[7].p} />
          </ol>
          <figure className={s.example}>
            <div className={s.queries}>
              <p>
                <span>{h.queryFrom}</span>
                <code>&quot;spicy tofu stir-fry&quot;</code>
              </p>
              <p>
                <span>{h.queryTo}</span>
                <code>&quot;tofu garlic chili&quot;</code>
              </p>
            </div>
            <figcaption>{h.queryCaption}</figcaption>
          </figure>
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
            <span className={s.authorName}>{p.name}</span>
            <sup className={s.sup}>
              {p.affil.join(", ")}
              {p.corresponding ? "*" : ""}
            </sup>
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
        <a className={`${s.linkButton} ${s.primary}`} href={LINKS.article} target="_blank" rel="noreferrer">
          {c.links.article}
        </a>
        <a className={s.linkButton} href={LINKS.pdf} target="_blank" rel="noreferrer">
          {c.links.pdf}
        </a>
        <a className={s.linkButton} href={LINKS.code} target="_blank" rel="noreferrer">
          {c.links.code}
        </a>
        <a className={s.linkButton} href={LINKS.doi} target="_blank" rel="noreferrer">
          {c.links.doi}
        </a>
      </div>
      <div className={s.citeGrid}>
        <CopyBlock title={c.citation} text={CITATION} copy={c.copy} copied={c.copied} fallback={c.copyFallback} mono={false} />
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
        <p className={s.footerBrand}>Pic2Plate</p>
        <p>{t.footer.note}</p>
        <p>{t.footer.paper}</p>
      </div>
    </footer>
  );
}
