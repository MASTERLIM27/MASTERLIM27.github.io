"use client";

import { LangProvider, useLang } from "@/projects/tool-wear/lib/i18n";
import Nav from "./Nav";
import ScrollFilm from "./ScrollFilm";
import { Authors, Cite, Footer, HowItWorks, Limitations, Machine, Overview } from "./Sections";
import Monitor from "./Monitor";
import Results from "./Results";

function SkipLink() {
  const { t } = useLang();
  return (
    <a className="skip-link" href="#overview">
      {t.skip}
    </a>
  );
}

export default function Site() {
  return (
    <LangProvider>
      {/* `theme-tool-wear` carries this project's own tokens (see src/app/globals.css). */}
      <div className="projectRoot theme-tool-wear">
        <SkipLink />
        <Nav />
        <main>
          <ScrollFilm />
          <Overview />
          <Machine />
          <HowItWorks />
          <Monitor />
          <Results />
          <Limitations />
          <Authors />
          <Cite />
        </main>
        <Footer />
      </div>
    </LangProvider>
  );
}
