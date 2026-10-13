import type { Metadata, Viewport } from "next";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
// One display face per project, plus the shared text and mono faces.
import "@fontsource-variable/archivo/standard.css";
import "@fontsource-variable/bricolage-grotesque/standard.css";
import "@fontsource-variable/hahmlet";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import { LangProvider } from "@/lib/lang";

export const metadata: Metadata = {
  title: "Andreas Lim — Portfolio",
  description:
    "A gallery of Andreas Lim's published AI work: Korean shadowing from YouTube video, Pic2Plate recipe recommendation, and tool wear prediction for MCT machines. Each project has a scroll-driven film, an interactive demo and the paper's results.",
};

export const viewport: Viewport = {
  themeColor: "#070605",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* One language choice for the landing page and all three project pages. */}
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
