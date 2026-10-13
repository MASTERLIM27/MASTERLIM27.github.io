"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * A box that scrolls sideways when its content is too wide (the data tables, on a phone).
 * While it overflows it is a named keyboard stop, so the hidden columns can be reached
 * with the arrow keys; when everything fits it is an ordinary box and not in the tab order.
 */
export default function ScrollRegion({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scrolls, setScrolls] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setScrolls(el.scrollWidth > el.clientWidth + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} {...(scrolls ? { tabIndex: 0, role: "region", "aria-label": label } : {})}>
      {children}
    </div>
  );
}
