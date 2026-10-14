#!/usr/bin/env node
/*
  The whole site as one PDF per language, for the download button on the landing page:
  out/pdf/Andreas-Lim-Portfolio-EN.pdf and out/pdf/Andreas-Lim-Portfolio-KO.pdf
  (names and titles in src/content/pdf.json).

  Run it after a build:   npm run build && npm run pdf

  It serves out/ on a free local port, prints the landing page and then every page the
  landing page links to, in the order it links to them, and joins each language's pages
  into one file with a bookmark per page. No page list is kept here: a new project page
  that the gallery links to is in the PDF the next time this runs.

  How a page looks on paper is up to its stylesheets (@media print), helped by
  window.__PDF__, which this script sets before the page's own scripts run (src/lib/pdf.ts).

  Needs Playwright's Chromium once:   npx playwright install --only-shell chromium
  SITE_URL (default https://masterlim27.github.io) is where the PDF's links point.
  BASE_PATH must match `basePath` in next.config.ts if one is set.
*/

import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { PDFDocument, PDFHexString, PDFName, StandardFonts, rgb } from "pdf-lib";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(root, "out");
const CONFIG = JSON.parse(readFileSync(path.join(root, "src/content/pdf.json"), "utf8"));
const SITE_URL = (process.env.SITE_URL || "https://masterlim27.github.io").replace(/\/+$/, "");
const BASE_PATH = (process.env.BASE_PATH || "").replace(/\/+$/, "");
const LANG_KEY = "andreas-portfolio-lang";
/** Pages are printed at this fraction of their CSS size, so A4 gets the desktop layout (about 1100 CSS px wide). */
const SCALE = 0.72;
/** Pictures go into the PDF as JPEGs no wider than this. */
const IMAGE_WIDTH = 1600;
const JPEG_QUALITY = 82;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};

function serve() {
  const server = createServer(async (req, res) => {
    let p = decodeURIComponent(new URL(req.url ?? "/", "http://local").pathname);
    if (BASE_PATH && p.startsWith(BASE_PATH)) p = p.slice(BASE_PATH.length) || "/";
    let file = path.join(OUT, p);
    if (!file.startsWith(OUT)) return res.writeHead(403).end();
    try {
      if (statSync(file).isDirectory()) file = path.join(file, "index.html");
      const body = await readFile(file);
      res.writeHead(200, { "content-type": TYPES[path.extname(file)] ?? "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404).end("not found");
    }
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

/*
  Chrome embeds a JPEG in a PDF as it is, but re-encodes a WebP or PNG without loss, which
  made each PDF about 25 MB. So while printing, every opaque picture is served as a JPEG.
  Pictures with transparency are left as they are.
*/
const jpegs = new Map();

async function asJpeg(file) {
  if (!jpegs.has(file)) {
    jpegs.set(
      file,
      (async () => {
        const img = sharp(file);
        const { hasAlpha } = await img.metadata();
        if (hasAlpha) return null;
        return img
          .resize({ width: IMAGE_WIDTH, withoutEnlargement: true })
          .jpeg({ quality: JPEG_QUALITY, progressive: false, mozjpeg: true })
          .toBuffer();
      })().catch(() => null),
    );
  }
  return jpegs.get(file);
}

function fileFor(url) {
  let p = decodeURIComponent(new URL(url).pathname);
  if (BASE_PATH && p.startsWith(BASE_PATH)) p = p.slice(BASE_PATH.length) || "/";
  const file = path.join(OUT, p);
  return file.startsWith(OUT) ? file : null;
}

/** The landing page, then each page it links to, in the order it links to them. */
function pageList() {
  const html = readFileSync(path.join(OUT, "index.html"), "utf8");
  const list = [""];
  for (const [, raw] of html.matchAll(/href="([^"]*)"/g)) {
    const href = raw.split("#")[0].replace(/^\.\//, "");
    if (!href.endsWith("/") || /^[a-z][a-z0-9+.-]*:|^\//i.test(href) || list.includes(href)) continue;
    if (existsSync(path.join(OUT, href, "index.html"))) list.push(href);
  }
  return list;
}

async function printPage(page, url, origin) {
  await page.goto(url, { waitUntil: "networkidle" });
  // Let React hydrate and add the print-only stills, then load everything the page shows.
  await page.waitForTimeout(800);
  await page.evaluate(
    async ({ site, origin }) => {
      for (const d of document.querySelectorAll('details[data-print="open"]')) d.open = true;
      for (const img of document.images) img.loading = "eager";
      // The PDF's links go to the live site, not to this temporary server.
      for (const a of document.querySelectorAll("a[href]")) {
        const u = new URL(a.getAttribute("href"), location.href);
        if (u.origin === origin) a.href = site + u.pathname + u.search + u.hash;
      }
      await document.fonts.ready;
    },
    { site: SITE_URL, origin },
  );
  await page.waitForLoadState("networkidle");
  await page.waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 60_000 });
  const broken = await page.evaluate(() =>
    [...document.images].filter((i) => i.currentSrc && !i.naturalWidth).map((i) => i.currentSrc),
  );
  if (broken.length) console.warn(`  missing images on ${url}:`, broken);
  const title = await page.evaluate(() => (document.querySelector("h1")?.innerText || document.title).replace(/\s+/g, " ").trim());
  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    scale: SCALE,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
  });
  return { pdf, title };
}

/** One bookmark per printed page, opened in the viewer's sidebar. */
function addOutline(doc, marks) {
  const ctx = doc.context;
  const outline = ctx.nextRef();
  const refs = marks.map(() => ctx.nextRef());
  marks.forEach((m, i) => {
    const entry = {
      Title: PDFHexString.fromText(m.title),
      Parent: outline,
      Dest: ctx.obj([doc.getPage(m.page).ref, "XYZ", null, null, null]),
    };
    if (i > 0) entry.Prev = refs[i - 1];
    if (i < marks.length - 1) entry.Next = refs[i + 1];
    ctx.assign(refs[i], ctx.obj(entry));
  });
  ctx.assign(outline, ctx.obj({ Type: "Outlines", First: refs[0], Last: refs[refs.length - 1], Count: marks.length }));
  doc.catalog.set(PDFName.of("Outlines"), outline);
  doc.catalog.set(PDFName.of("PageMode"), PDFName.of("UseOutlines"));
}

/** "3 / 32" in the bottom corner of every page but the cover, inside the page's side margin. */
async function numberPages(doc) {
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const total = doc.getPageCount();
  doc.getPages().forEach((page, i) => {
    if (i === 0) return;
    const label = `${i + 1} / ${total}`;
    const size = 7;
    page.drawText(label, {
      x: page.getWidth() - 18 - font.widthOfTextAtSize(label, size),
      y: 14,
      size,
      font,
      color: rgb(0.52, 0.5, 0.46),
    });
  });
}

async function join(parts, file) {
  const doc = await PDFDocument.create();
  const marks = [];
  for (const part of parts) {
    const src = await PDFDocument.load(part.pdf);
    marks.push({ title: part.title, page: doc.getPageCount() });
    for (const p of await doc.copyPages(src, src.getPageIndices())) doc.addPage(p);
  }
  marks[0].title = file.title;
  addOutline(doc, marks);
  await numberPages(doc);
  doc.setTitle(file.title, { showInWindowTitleBar: true });
  doc.setAuthor("Andreas Lim");
  doc.setSubject(file.subject);
  doc.setLanguage(file.lang === "ko" ? "ko-KR" : "en-US");
  doc.setCreator(`scripts/make-pdf.mjs, from ${SITE_URL}${BASE_PATH}/`);
  return { bytes: await doc.save(), pages: doc.getPageCount() };
}

async function main() {
  if (!existsSync(path.join(OUT, "index.html"))) {
    console.error("No build in out/. Run `npm run build` first.");
    process.exit(1);
  }
  const pages = pageList();
  const server = await serve();
  const origin = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    browser = await chromium.launch();
  } catch (e) {
    console.error("Could not start Chromium. Install it once with: npx playwright install --only-shell chromium\n");
    throw e;
  }
  await mkdir(path.join(OUT, CONFIG.dir), { recursive: true });

  try {
    for (const file of CONFIG.files) {
      const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: file.lang });
      await context.addInitScript(
        ([key, lang]) => {
          window.__PDF__ = true;
          try {
            localStorage.setItem(key, lang);
          } catch {
            /* the page falls back to its default language */
          }
        },
        [LANG_KEY, file.lang],
      );
      await context.route(/\.(webp|png)(\?.*)?$/i, async (route) => {
        const file = fileFor(route.request().url());
        const jpg = file && existsSync(file) ? await asJpeg(file) : null;
        if (jpg) await route.fulfill({ body: jpg, contentType: "image/jpeg" });
        else await route.continue();
      });
      const page = await context.newPage();
      await page.emulateMedia({ media: "print", reducedMotion: "reduce" });
      const parts = [];
      for (const p of pages) {
        const url = `${origin}${BASE_PATH}/${p}`;
        parts.push(await printPage(page, url, origin));
        console.log(`  ${file.lang}  /${p}`);
      }
      await context.close();
      const { bytes, pages: count } = await join(parts, file);
      const target = path.join(OUT, CONFIG.dir, file.name);
      await writeFile(target, bytes);
      console.log(`${path.relative(root, target)}: ${count} pages, ${(bytes.length / 1048576).toFixed(1)} MB`);
    }
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
