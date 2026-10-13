"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLang } from "@/projects/pic2plate/lib/i18n";
import { JSON_NAME, KITCHEN, TAU, adapt, run, type Round } from "@/projects/pic2plate/lib/engine";
import type { AnyIng, IngId, Need, Prefs, Taste } from "@/projects/pic2plate/lib/types";
import { IngredientJson, Section, SectionHead } from "./ui";
import s from "./Demo.module.css";

const NEEDS: Need[] = ["lowSodium", "diabetes", "glutenFree", "quick"];
const DEFAULT = { have: [...KITCHEN], prefs: { taste: "spicy", needs: ["lowSodium"] } as Prefs };
const STEP_MS = 950;

const fmt = (n: number) => n.toFixed(1);
const same = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);

export default function Demo() {
  const { t, lang } = useLang();
  const d = t.demo;

  const [have, setHave] = useState<IngId[]>(DEFAULT.have);
  const [taste, setTaste] = useState<Taste>(DEFAULT.prefs.taste);
  const [needs, setNeeds] = useState<Need[]>(DEFAULT.prefs.needs);
  const [ran, setRan] = useState(DEFAULT);
  const [shown, setShown] = useState(Number.POSITIVE_INFINITY);
  const [hasRun, setHasRun] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const result = useMemo(() => run(ran.have, ran.prefs), [ran]);
  const total = 2 + result.rounds.length;
  const running = shown < total;
  const stale = !same(have, ran.have) || taste !== ran.prefs.taste || !same(needs, ran.prefs.needs);

  useEffect(() => {
    if (shown >= total) return;
    const id = window.setTimeout(() => setShown((n) => n + 1), STEP_MS);
    return () => window.clearTimeout(id);
  }, [shown, total]);

  const toggleHave = (id: IngId) =>
    setHave((cur) => KITCHEN.filter((k) => (k === id ? !cur.includes(k) : cur.includes(k))));
  const toggleNeed = (id: Need) =>
    setNeeds((cur) => NEEDS.filter((n) => (n === id ? !cur.includes(n) : cur.includes(n))));

  const onRun = () => {
    if (!have.length) return;
    setRan({ have: [...have], prefs: { taste, needs: [...needs] } });
    setHasRun(true);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setShown(reduce ? Number.POSITIVE_INFINITY : 1);
    if (window.innerWidth < 1000) {
      outputRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  };

  const labels = [d.stepRecognize, ...result.rounds.map((r) => d.stepRound(r.k + 1)), d.stepPersonalize];
  const status = !hasRun ? "" : running ? d.status(shown, total, labels[shown - 1]) : d.done;
  const ingName = (id: AnyIng) => t.ingredients[id];

  const verdict = (r: Round, last: boolean) => {
    if (r.pass) return d.passVerdict(r.results[0].recipe.title[lang], fmt(r.best));
    return last && result.exhausted ? d.exhaustedVerdict : d.failVerdict;
  };

  const top = result.top[0];
  const adapted = top ? adapt(top, result.detected, ran.prefs, lang, ingName) : null;
  const runner = result.top[1];

  return (
    <Section id="demo">
      <SectionHead title={d.h}>
        <p className={s.intro}>{d.intro}</p>
        <p className={s.disclaimer}>{d.disclaimer}</p>
      </SectionHead>

      <div className={s.layout}>
        <form className={s.controls} onSubmit={(e) => e.preventDefault()}>
          <fieldset className={s.group}>
            <legend className={s.legend}>{d.kitchen}</legend>
            <p className={s.hint}>{d.kitchenHint}</p>
            <div className={s.tiles}>
              {KITCHEN.map((id) => (
                <label key={id} className={s.tile} htmlFor={`demo-ing-${id}`}>
                  <input
                    id={`demo-ing-${id}`}
                    type="checkbox"
                    className={s.srInput}
                    checked={have.includes(id)}
                    onChange={() => toggleHave(id)}
                  />
                  <span className={s.tileFace}>
                    <img src={`images/demo/${id}.webp`} alt="" width={480} height={360} loading="lazy" />
                    <span className={s.tileName}>{t.ingredients[id]}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className={s.group}>
            <legend className={s.legend}>{d.taste}</legend>
            <div className={s.segmented}>
              {(["spicy", "mild"] as Taste[]).map((id) => (
                <label key={id} htmlFor={`demo-taste-${id}`}>
                  <input
                    id={`demo-taste-${id}`}
                    type="radio"
                    name="demo-taste"
                    className={s.srInput}
                    checked={taste === id}
                    onChange={() => setTaste(id)}
                  />
                  <span>{d.tastes[id]}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className={s.group}>
            <legend className={s.legend}>{d.needs}</legend>
            <div className={s.chips}>
              {NEEDS.map((id) => (
                <label key={id} htmlFor={`demo-need-${id}`}>
                  <input
                    id={`demo-need-${id}`}
                    type="checkbox"
                    className={s.srInput}
                    checked={needs.includes(id)}
                    onChange={() => toggleNeed(id)}
                  />
                  <span>{d.needLabels[id]}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className={s.request}>
            <p className={s.legend}>{d.requestLabel}</p>
            <p className={s.requestText}>{d.request(taste, needs)}</p>
          </div>

          <div className={s.actions}>
            <button type="button" className={s.run} onClick={onRun} disabled={!have.length || running}>
              {running ? d.running : d.run}
            </button>
            {running && (
              <button type="button" className={s.ghost} onClick={() => setShown(Number.POSITIVE_INFINITY)}>
                {d.showAll}
              </button>
            )}
          </div>
          {!have.length && <p className={s.notice}>{d.empty}</p>}
          {have.length > 0 && stale && !running && <p className={s.notice}>{d.stale}</p>}
        </form>

        <div ref={outputRef} className={s.output} aria-label={d.output} role="region" data-stale={stale && !running}>
          <p className="visually-hidden" aria-live="polite">
            {status}
          </p>
          <ol className={s.pipeline}>
            {shown >= 1 && (
              <li className={s.pstep}>
                <StepHead n={1} stage={t.how.stage1.label} title={d.stepRecognize} />
                <div className={s.detected} aria-hidden="true">
                  {result.detected.map((id) => (
                    <figure key={id} className={s.det}>
                      <img src={`images/demo/${id}.webp`} alt="" width={480} height={360} loading="lazy" />
                      <figcaption>{t.ingredients[id]}</figcaption>
                    </figure>
                  ))}
                </div>
                <IngredientJson items={result.detected.map((id) => JSON_NAME[id])} perLine={2} />
                <p className={s.pnote}>{d.recognizeNote(result.detected.length)}</p>
              </li>
            )}

            {result.rounds.map(
              (r, i) =>
                shown >= i + 2 && (
                  <li key={`${r.k}-${r.query}`} className={s.pstep}>
                    <StepHead n={i + 2} stage={t.how.stage2.label} title={d.stepRound(r.k + 1)} />
                    <p className={s.query}>
                      <span>{d.query}</span>
                      <code>&quot;{r.query}&quot;</code>
                    </p>
                    <p className={s.pnote}>{r.k === 0 ? d.queryNote0 : d.queryNoteRefine}</p>
                    <table className={s.results}>
                      <thead>
                        <tr>
                          <th scope="col">{d.colRecipe}</th>
                          <th scope="col" className={s.scoreCol}>
                            {d.colScore}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {r.results.map((x) => {
                          const pass = x.score >= TAU;
                          return (
                            <tr key={x.recipe.id} data-pass={pass}>
                              <th scope="row">
                                <span className={s.rtitle}>{x.recipe.title[lang]}</span>
                                {x.missing.length > 0 && (
                                  <span className={s.missing}>
                                    {x.missing.map((m) => (
                                      <span key={m}>{d.needsItem(t.ingredients[m])}</span>
                                    ))}
                                  </span>
                                )}
                              </th>
                              <td className={s.scoreCol}>
                                <span className={s.scoreWrap}>
                                  <span className={s.track} aria-hidden="true">
                                    <span className={s.fill} style={{ width: `${x.score * 10}%` }} />
                                    <span className={s.tauMark} style={{ left: `${TAU * 10}%` }} />
                                  </span>
                                  <span className={s.scoreValue}>{fmt(x.score)}</span>
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <p className={s.tauNote}>{d.tau(fmt(TAU))}</p>
                    <p className={s.verdict} data-pass={r.pass}>
                      {verdict(r, i === result.rounds.length - 1)}
                    </p>
                  </li>
                ),
            )}

            {shown >= total && adapted && top && (
              <li className={s.pstep}>
                <StepHead n={total} stage={t.how.stage2.label} title={d.stepPersonalize} />
                <article className={s.card}>
                  <p className={s.cardKicker}>{d.recipeName}</p>
                  <h4 className={s.cardTitle}>{adapted.title}</h4>
                  <div className={s.cardGrid}>
                    <section>
                      <h5 className={s.cardH}>{d.ingredientsH}</h5>
                      <ul className={s.lines}>
                        {adapted.lines.map((l) => (
                          <li key={l.text}>
                            <span>{l.text}</span>
                            {l.note && <span className={s.lineNote}>{l.note}</span>}
                            {l.missing && <span className={s.lineMissing}>{d.missingTag}</span>}
                          </li>
                        ))}
                      </ul>
                    </section>
                    <section>
                      <h5 className={s.cardH}>{d.instructionsH}</h5>
                      <ol className={s.method}>
                        {adapted.steps.map((x) => (
                          <li key={x}>{x}</li>
                        ))}
                      </ol>
                    </section>
                  </div>
                  <section>
                    <h5 className={s.cardH}>{d.substitutionsH}</h5>
                    <ul className={s.notes}>
                      {(adapted.subs.length ? adapted.subs : [d.noSubs]).map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <h5 className={s.cardH}>{d.tipsH}</h5>
                    <ul className={s.notes}>
                      {adapted.tips.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </section>
                  {runner && <p className={s.runner}>{d.runnerUp(runner.recipe.title[lang], fmt(runner.score))}</p>}
                </article>
              </li>
            )}
          </ol>
        </div>
      </div>
    </Section>
  );
}

function StepHead({ n, stage, title }: { n: number; stage: string; title: string }) {
  return (
    <header className={s.phead}>
      <span className={s.pnum} aria-hidden="true">
        {n}
      </span>
      <div>
        <p className={s.pstage}>{stage}</p>
        <h3 className={s.ptitle}>{title}</h3>
      </div>
    </header>
  );
}
