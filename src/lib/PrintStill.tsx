"use client";

import { usePdfMode } from "@/lib/pdf";

/**
 * A frame of a project's film, for the printed page, where the film cannot play: the cover
 * behind the title, or a still beside a beat of the storyboard. Rendered only while
 * scripts/make-pdf.mjs prints the page.
 */
export default function PrintStill({ frame, className }: { frame: number; className?: string }) {
  const pdf = usePdfMode();
  if (!pdf) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src={`frames-md/frame_${String(frame).padStart(4, "0")}.webp`}
      alt=""
      width={1296}
      height={864}
    />
  );
}
