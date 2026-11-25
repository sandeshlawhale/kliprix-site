import type { NextConfig } from "next";

// The landing site is fully static (`next build` writes ./out), so it can be hosted anywhere:
// Vercel, Netlify, Cloudflare Pages or GitHub Pages.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
