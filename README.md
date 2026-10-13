# Andreas Lim — portfolio

One Next.js static-export app: a gallery landing page and three scroll-driven project
pages, merged from `korean-site.zip`, `pic2plate-site.zip` and `toolwear-site.zip`.

| Route               | Page                                                      |
| ------------------- | --------------------------------------------------------- |
| `/`                 | Gallery: hero, an 18-tile wall of the work, the papers, contact |
| `/korean-shadowing/`| Korean Shadowing App — IJIBC 2025, 17(4), 311–320          |
| `/pic2plate/`       | Pic2Plate — Sensors 2025, 25(2), 449                       |
| `/tool-wear/`       | AI-based Tool Wear Prediction for MCT Machines — IJIBC 2026, 18(1), 361–369 |

## Running it

Needs Node 20.9 or newer (Next.js 16). The `portfolio` conda environment has Node 22.

```bash
conda activate portfolio
npm install
npm run dev     # http://localhost:3000
npm run build   # static export into out/
npm start       # serves out/ on http://localhost:3000
```

`npm run build` writes a complete static site to `out/` — no server required.

## Structure

```
src/
  app/
    layout.tsx              root layout: fonts, globals.css, the shared LangProvider
    globals.css             shared resets + one token block per project (.theme-*)
    page.tsx                /
    korean-shadowing/       /korean-shadowing/  (page.tsx + icon.svg)
    pic2plate/              /pic2plate/
    tool-wear/              /tool-wear/
  components/landing/       the gallery page and its nav
  content/
    landing.ts              gallery tiles, paper list and landing copy, EN + KO
    shared.ts               the "back to portfolio" label
  lib/
    lang.tsx                the one language choice, shared by every page
    filmFrames.ts           frame loading shared by the three scroll films
    ScrollRegion.tsx        a sideways-scrolling box that keyboards can reach
    types.ts
  projects/
    korean/ pic2plate/ tool-wear/
        components/ content/ lib/     each project's own source
public/
  korean-shadowing/ pic2plate/ tool-wear/   each project's frames, figures and images
  landing/                                   hero, key art, film stills, demo screenshots
scripts/
  make-frames-md.sh         rebuilds each film's mid-size frame set
  make-landing-images.sh    rebuilds the landing page's pictures
```

## The landing page

The landing page is a gallery, in the black and gold of its key art.

- **Hero.** The chip from the key art, twice: unlit, and lit. The lit one comes on over the
  other with a short flicker and then breathes; the picture leans a few pixels away from
  the mouse. With reduced motion it is simply lit.
- **Wall.** Six tiles per project: its key art (the "project" tile), a screenshot of its
  demo, two stills from its film and two results. Each tile opens the matching part of the
  project page. The buttons above the wall highlight one kind of tile and dim the rest;
  nothing is removed, so the wall keeps its shape.
- **Papers.** Title, authors, venue, the methods each paper reports, and links to the
  project page and the paper.
- **Contact.** An email address and a GitHub profile, in the hero and the footer. They live
  in `CONTACT` in `src/content/landing.ts`; nothing else personal is published.

Everything on the wall is data in `src/content/landing.ts`. Titles, venues and captions are
read out of each project's own dictionary and every number out of its `paper.ts`, so the
gallery cannot drift from the pages it links to.

**To add a project:** add six entries to `TILES` (project, demo, then the four small tiles,
in the order the existing projects use) and one to `PAPERS`. The wall lays out any number
of projects, alternating which side the key art sits on.

### Landing pictures

`bash scripts/make-landing-images.sh [key-art-folder]` rebuilds the hero, the key art and
the film stills (it needs ffmpeg; the key art folder defaults to `../../Images`). The six
`demo-*.webp` files are screenshots of the demos, taken once in each language at twice the
tile's size. Retake them by hand if a demo's look changes.

## The project pages

### How the three projects were merged

**Assets are namespaced by route, and no asset path was rewritten.** Every asset URL in
the original projects is relative (`frames/frame_0001.webp`, `figures/fig1-setup.webp`,
`images/poster.webp`). Putting each project's `public/` contents in a folder named after
its route, and turning on `trailingSlash` so each page is served as a directory, makes
every one of those paths resolve to the right file untouched — and keeps the whole site
working under any path prefix.

**Content is reused verbatim.** `paper.ts`, `dict.ts` and the film timings are the
originals. No copy was rewritten or re-translated, and no number was changed.

**Styling.** The three `globals.css` files were near-identical apart from their `:root`
token blocks, so the resets are shared once in `src/app/globals.css` and each project's
tokens — colours, display font, heading weights — moved verbatim into a `.theme-korean`,
`.theme-pic2plate` or `.theme-tool-wear` block, applied to a wrapper element in that
project's `Site.tsx`. Each project therefore looks as it did.

**Language.** The three projects each had their own `LangProvider` and their own
localStorage key. They now share one provider (`src/lib/lang.tsx`, mounted in the root
layout) under the single key `andreas-portfolio-lang`, so a choice made anywhere holds
across the landing page and all three project pages and survives a reload. Each
project's `lib/i18n.tsx` is a thin shim that picks its own `en`/`ko` dictionary from that
shared choice.

### What changed in the project source since the merge

- **Nav.** A "← Portfolio" link on the left of each bar. On a phone it shows only the
  arrow, so the language toggle stays on screen.
- **Film loading.** All three films now load through `src/lib/filmFrames.ts` (below).
- **Korean film sizing.** In a landscape window the picture is fitted whole instead of
  filling the window, and is never drawn more than about 15% wider than its largest frame.
  Filling a wide window had pushed the phone off the top and stretched the frames past
  their own pixels, which made the picture soft. Where the picture stops short of the
  window its edges dissolve into the page.
- **Accessibility.** Tables that scroll sideways on a phone are keyboard stops with a name
  (`src/lib/ScrollRegion.tsx`); the pseudo-code blocks can be focused; the tool-wear slider
  is taller.
- **Korean-language gaps.** The Pic2Plate nav's label, the cosine formula's spoken text
  and the shadowing demo's status message now follow the language.

### How the films load

Each film is 218–241 stills scrubbed by scroll. They used to be fetched all at once when a
page opened: 13–17 MB per project page, most of it for readers who never scroll the film.
`src/lib/filmFrames.ts` now fetches a film in the order it is watched:

- on arrival, the title frame, each beat's still and a coarse pass — about 25 frames;
- once the reader is scrolling through the film, the frames around the playhead, nearest
  first, favouring the ones ahead;
- nothing while the film is off screen, and nothing extra for a jump straight to a section
  below it (the loader waits to see that the reader is moving at reading speed).

It also picks the frame set from the width the picture is actually drawn at:

| Set          | Width  | Used when the picture is drawn        |
| ------------ | ------ | ------------------------------------- |
| `frames-sm`  | 864px  | up to about 950 device pixels wide    |
| `frames-md`  | 1296px | up to about 1425                      |
| `frames`     | 1728px | wider than that                       |

`frames-md` is made from `frames` by `bash scripts/make-frames-md.sh` (needs ffmpeg). Run
it again whenever a film's frames change. Before this, the set was chosen from the window's
width alone, so a mid-size window could be sent the small frames and stretch them.

Measured in Chrome at 1440 × 900, bytes fetched when a project page opens:

| Page             | Before  | Now    | Whole film watched |
| ---------------- | ------- | ------ | ------------------ |
| Korean shadowing | 13.8 MB | 2.0 MB | 9.9 MB             |
| Pic2Plate        | 17.0 MB | 2.3 MB | 12.2 MB            |
| Tool wear        | 17.8 MB | 2.5 MB | 12.8 MB            |

At that size the mid-size frames are used. A larger window is sent the full-size frames,
so there the saving is in what opens, not in the whole film.

With reduced motion only the stills are fetched (7 frames on the Korean page).

### Disclaimers

The in-page disclaimers are unchanged and still shown on every project page: the
interactive demos are scripted simulations, and the films and illustrations are
AI-generated, not footage from the studies or output from the systems. Figure sources
and licences are unchanged too — Korean Figure 5 and Tool Wear Figures 1, 2(b), 4 and 5
are reproduced under CC BY-NC 4.0 (attribution required, non-commercial); Pic2Plate is
CC BY. The landing page says the same of its own key art.

## Deploying to GitHub Pages

The build is deploy-ready: a static export with relative asset paths and no server
dependency. `out/` is about 106 MB, nearly all of it film frames. Two notes for a GitHub
Pages deployment.

**A project site at `https://<user>.github.io/<repo>/`** needs a `basePath`. Uncomment
the line in `next.config.ts` and set it to your repository name:

```ts
basePath: "/<repo>",
```

That is the only change needed. Next prefixes its own `/_next/...` chunk and icon URLs
with it; every project asset is relative and needs nothing. A user or organisation site
at `https://<user>.github.io/` serves from the root, so it needs no `basePath` at all.

**`.nojekyll`** ships in `public/`, so it lands in `out/`. Without it GitHub Pages runs
Jekyll, which drops the `_next` folder and the site loads unstyled.

Nothing here is deployed yet: no repository, no workflow, no custom domain.

## Verification

`npm run build` succeeds and exports all four routes. The built site was then driven in
headless Chrome (desktop 1440 × 900 and 1920 × 1080, a 2× laptop, a tablet and a 390 × 844
phone, in English and Korean):

- every page: no console errors, no failed requests, no sideways page scroll, no broken
  images, one `h1`, no skipped heading levels, no duplicate ids, no dead in-page links;
- the three demos, clicked through: a whole shadowing scene (pick, find lines, play, speak,
  retry, score, finish), the Pic2Plate pipeline with a dozen ingredient and diet
  combinations (the run button is off with no ingredients), and the tool-wear monitor
  (pause, wear slider, alarm, replace, worn tool, alarm log);
- the films: what is fetched on arrival, after a jump past the film, while scrolling
  through it and with reduced motion;
- the landing page: the wall at each size, the highlight buttons, keyboard focus, and the
  reveal in both languages and after switching language.

Not checked: Safari and Firefox, a real phone, and the numbers against the papers
themselves.
