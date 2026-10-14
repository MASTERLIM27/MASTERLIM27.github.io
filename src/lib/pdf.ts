"use client";

import { useEffect, useState } from "react";

/*
  scripts/make-pdf.mjs prints every page into the downloadable PDFs. Before a page's own
  scripts run, it sets `window.__PDF__`; components read it to add what only the printed
  page needs (the film stills), so visitors never download any of it.
*/

declare global {
  interface Window {
    __PDF__?: boolean;
  }
}

/** True while the PDF script is printing this page. */
export function usePdfMode(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => setOn(window.__PDF__ === true), []);
  return on;
}
