"use client";

import { useRef, useState, type ReactNode } from "react";
import s from "./ui.module.css";

/** The ingredient list in the JSON shape the paper shows in Figure 2. */
export function IngredientJson({
  items,
  perLine = 3,
  className,
  label,
}: {
  items: string[];
  perLine?: number;
  className?: string;
  label?: string;
}) {
  const rows: string[][] = [];
  for (let i = 0; i < items.length; i += perLine) rows.push(items.slice(i, i + perLine));
  return (
    <pre className={[s.json, className].filter(Boolean).join(" ")} aria-label={label}>
      <span className={s.p}>{"{"}</span>
      {"\n  "}
      <span className={s.k}>&quot;ingredients&quot;</span>
      <span className={s.p}>{": ["}</span>
      {rows.map((row, r) => (
        <span key={r}>
          {"\n    "}
          {row.map((item, i) => (
            <span key={item}>
              <span className={s.v}>&quot;{item}&quot;</span>
              {(r < rows.length - 1 || i < row.length - 1) && <span className={s.p}>, </span>}
            </span>
          ))}
        </span>
      ))}
      {"\n  "}
      <span className={s.p}>]</span>
      {"\n"}
      <span className={s.p}>{"}"}</span>
    </pre>
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
