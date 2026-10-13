"use client";

import { LangProvider, useLang } from "@/projects/korean/lib/i18n";
import Nav from "./Nav";
import ScrollFilm from "./ScrollFilm";
import { Authors, Cite, Footer, HowItWorks, Limitations, Overview, Why } from "./Sections";
import Demo from "./Demo";
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
      {/* `theme-korean` carries this project's own tokens (see src/app/globals.css). */}
      <div className="projectRoot theme-korean">
        <SkipLink />
        <Nav />
        <main>
          <ScrollFilm />
          <Overview />
          <Why />
          <HowItWorks />
          <Demo />
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
