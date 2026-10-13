"use client";

import { useRef, useState, type ReactNode } from "react";
import s from "./ui.module.css";

/** A few columns of the collected-data table from Figure 1, as the database lists them. */
export function FieldList({ label, fields, className }: { label: string; fields: string[]; className?: string }) {
  return (
    <figure className={[s.fields, className].filter(Boolean).join(" ")}>
      <figcaption className={s.codeLabel}>{label}</figcaption>
      <ul>
        {fields.map((f) => (
          <li key={f}>
            <code className={s.fieldName}>{f}</code>
            <code className={s.fieldType}>float8</code>
          </li>
        ))}
        <li aria-hidden="true" className={s.more}>
          <code>…</code>
        </li>
      </ul>
    </figure>
  );
}

/** The worn-label rule from Section 3.2, written as code. Tokens: [text, class]. */
type Tok = [string, "k" | "n" | "c" | ""];
const RULE: { value: string; when: Tok[][] }[] = [
  {
    value: "1",
    when: [
      [
        ["if", "k"],
        [" spindle_temp > max(original_temp)", ""],
      ],
      [
        ["and", "k"],
        [" spindle_load > ", ""],
        ["100", "n"],
      ],
    ],
  },
  { value: "0", when: [[["otherwise", "c"]]] },
];

export function RuleCard({ label, className }: { label: string; className?: string }) {
  return (
    <figure className={[s.rule, className].filter(Boolean).join(" ")}>
      <figcaption className={s.codeLabel}>{label}</figcaption>
      {/* Two columns: the label value, then its condition lines. A long condition wraps with a hanging indent. */}
      <code className={s.ruleCode}>
        {RULE.map((r) => (
          <span key={r.value} className={s.ruleRow}>
            <span className={s.ruleLhs}>
              <span className={s.k}>worn</span> = <span className={s.n}>{r.value}</span>
            </span>
            <span className={s.ruleWhen}>
              {r.when.map((line, i) => (
                <span key={i} className={s.line}>
                  {line.map(([text, cls], j) => (
                    <span key={j} className={cls ? s[cls] : undefined}>
                      {text}
                    </span>
                  ))}
                </span>
              ))}
            </span>
          </span>
        ))}
      </code>
    </figure>
  );
}

export function Section({ id, children, className }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={[s.section, className].filter(Boolean).join(" ")}>
      <div className={s.frame}>{children}</div>
    </section>
  );
}

export function SectionHead({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className={s.head}>
      <h2 className={s.h2}>{title}</h2>
      {children}
    </header>
  );
}

/** Copy text with the Clipboard API; if that is refused, select the text so the reader can copy it. */
export function CopyBlock({
  title,
  text,
  copy,
  copied,
  fallback,
  mono = true,
}: {
  title: string;
  text: string;
  copy: string;
  copied: string;
  fallback: string;
  mono?: boolean;
}) {
  const [state, setState] = useState<"idle" | "copied" | "fallback">("idle");
  const ref = useRef<HTMLPreElement>(null);

  const selectText = () => {
    const el = ref.current;
    if (!el) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  };

  const onCopy = () => {
    const done = () => {
      setState("copied");
      window.setTimeout(() => setState("idle"), 2200);
    };
    const fail = () => {
      selectText();
      setState("fallback");
    };
    try {
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done, fail);
      else fail();
    } catch {
      fail();
    }
  };

  return (
    <div className={s.copyBlock}>
      <div className={s.copyBar}>
        <h3 className={s.copyTitle}>{title}</h3>
        <button type="button" className={s.copyButton} onClick={onCopy} aria-live="polite">
          {state === "copied" ? copied : copy}
        </button>
      </div>
      <pre ref={ref} className={mono ? s.copyText : `${s.copyText} ${s.copyTextSans}`}>
        {text}
      </pre>
      {state === "fallback" && <p className={s.copyHint}>{fallback}</p>}
    </div>
  );
}
