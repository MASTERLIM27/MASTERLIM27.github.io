"use client";

import { useLang } from "@/projects/korean/lib/i18n";
import { RESULTS } from "@/projects/korean/content/paper";
import { Section, SectionHead } from "./ui";
import c from "./Charts.module.css";

type ResultId = keyof typeof RESULTS;

const fmt = (id: ResultId) => {
  const r = RESULTS[id];
  return `${id === "similarityGain" ? "+" : ""}${r.value}${r.unit}`;
};

export default function Results() {
  const { t } = useLang();
  const r = t.results;
  return (
    <Section id="results">
      <SectionHead title={r.h}>
        <p className={c.body}>{r.intro}</p>
      </SectionHead>

      <ul className={c.resultGrid}>
        {r.cards.map((card) => (
          <li key={card.id} className={c.resultCard} data-id={card.id}>
            <p className={c.resultValue}>{fmt(card.id as ResultId)}</p>
            <p className={c.resultUnit}>{card.unit}</p>
            <h3 className={c.resultK}>{card.k}</h3>
            <p className={c.resultN}>{card.n}</p>
            <p className={c.resultP}>{card.p}</p>
          </li>
        ))}
      </ul>

      <div className={c.formulas}>
        <h3 className={c.h3}>{r.formulas.h}</h3>
        <ul>
          <li>{r.formulas.increase}</li>
          <li>{r.formulas.wer}</li>
          <li>
            {r.formulas.phoneme}
            <span className={c.perNote}>{r.formulas.perNote}</span>
          </li>
        </ul>
      </div>

      <div className={c.block}>
        <div className={c.blockText}>
          <h3 className={c.h3}>{r.testbeds.h}</h3>
          <p className={c.body}>{r.testbeds.p}</p>
          <p className={c.note}>{r.env}</p>
        </div>
        <figure className={c.paperFigure}>
          <img src="figures/fig5-testbeds.webp" alt={r.testbeds.alt} width={1472} height={1235} loading="lazy" />
          <figcaption>{r.testbeds.caption}</figcaption>
        </figure>
      </div>
    </Section>
  );
}
