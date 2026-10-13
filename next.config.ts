import type { NextConfig } from "next";

/*
  Static export: `npm run build` writes a plain HTML/CSS/JS site to `out/` that any
  static host (GitHub Pages, Netlify, Vercel, S3) can serve.

  `trailingSlash` matters here. Every asset URL inside the three project pages is
  *relative* (`frames/frame_0001.webp`, `figures/fig1-setup.webp`, `images/poster.webp`),
  which is what makes the whole site work under any path prefix without rewriting a
  single one. For those to resolve, each project page has to be served as a directory
  (`/tool-wear/` → `out/tool-wear/index.html`), so its assets live at
  `public/tool-wear/...` and resolve to `/tool-wear/frames/...`.

  For a project-page deployment at `https://<user>.github.io/<repo>/`, set `basePath`
  (and nothing else) — see the README.
*/
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  // basePath: "/portfolio",
};

export default nextConfig;
