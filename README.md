# Kliprix landing site

The public website for Kliprix. It is a separate, fully static Next.js app (Tailwind 4 + shadcn/ui)
and shares no code with the local app in `frontend/` and `backend/` (decision D-064).

## Run it

```
cd site
npm install
npm run dev        # http://127.0.0.1:3100
```

Checks: `npm run typecheck`, `npm run lint`, `npm run build` (writes the static site to `site/out`).

## Deploy

`npm run build` produces plain HTML/CSS/JS in `out/`, so any static host works:

- **Vercel / Netlify / Cloudflare Pages:** set the root directory to `site`, build command
  `npm run build`, output directory `out`.
- **GitHub Pages:** upload `out/` (add `basePath` in `next.config.ts` if it is served from
  `/<repo>/`).

On Vercel the production address is filled in automatically (`VERCEL_PROJECT_PRODUCTION_URL`).
When you get your own domain, put it in `data/site.json` → `siteUrl`; it wins over Vercel's.
`vercel.json` sets browser caching for `/media` (7 days) and the icons (1 day).

## Link previews (WhatsApp, LinkedIn, X, ...)

`src/app/layout.tsx` sets the Open Graph and Twitter tags that chat apps and social sites read
when a link is shared: title, description and `public/og.jpg` (1200x630, about 90 KB; WhatsApp
skips images much over 300 KB). It also adds the canonical address, icons, a web manifest,
`robots.txt`, `sitemap.xml` and structured data (schema.org SoftwareApplication, free).

The preview image and the icons are made by a script from the logo and the clips in
`public/media`. Run it again after replacing the clips:

```
python scripts/make-share-image.py      # needs Pillow
```

Sites cache previews. After a change, refresh them here:
[LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/),
[Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) (also used by
WhatsApp and Instagram). X and WhatsApp pick up changes on their own, usually within a day.

## Speed

- Only Inter is preloaded (one 48 KB woff2). Montserrat, used by the caption demos further
  down, is a subset woff2 that loads when needed.
- The hero videos have `preload="none"`: the posters show at once and the video files start
  downloading only after the page has loaded, so they never slow the first paint.
- Pages and scripts are plain static files, served from Vercel's CDN.

## Content: the `data/` folder

| File | What it holds |
|---|---|
| `data/site.json` | Repo name, download link, public URL, and the optional feedback form endpoint |
| `data/reviews.json` | Reviews shown in the Feedback section. Starts empty, and the page says so |

Edit a file, then rebuild and redeploy. The data is read at build time.

### How feedback and reviews work

A static site cannot write files after it is deployed, and feedback must stay private (a public
GitHub issue would let anyone post on the site's behalf), so feedback goes to a form service:

1. Create a free form at [Formspree](https://formspree.io) (or a similar service) and put its URL
   in `data/site.json` → `reviewFormEndpoint`, for example `https://formspree.io/f/<id>`.
   **Until this is set, the form refuses to send** ("Feedback isn't open yet").
2. A visitor picks Review, Idea or Bug and writes it. It is sent privately and you get it by
   email. Nothing is posted publicly.
3. You read it and copy the ones you approve into `data/reviews.json`:

```json
[
  {
    "name": "Rohit",
    "role": "Gaming clips",
    "rating": 5,
    "text": "Turned a 3-hour VOD into five shorts while I slept.",
    "date": "2026-12-01",
    "url": "https://github.com/sandeshlawhale/Kliprix/issues/12"
  }
]
```

`url` is optional (a link to where the review was posted). As soon as the list has entries, the
Feedback section shows the first two below the form. Only publish real reviews.

## Media

`public/media/clip-N.mp4` are 8-second muted loops cut from real Kliprix exports, each with a
`clip-N.jpg` poster. `hero-reel.mp4` is the same clips side by side in one 1920x1080 video, for
use elsewhere (social posts, README).

Before the site goes public, replace any clip made from someone else's video with one made
from your own video or one you have permission to use. To cut a new loop from an export:

```
ffmpeg -ss 2 -t 8 -i path/to/clip.mp4 -an -vf "scale=540:960,fps=30" -c:v libx264 -crf 27 -preset slow -pix_fmt yuv420p -movflags +faststart public/media/clip-1.mp4
ffmpeg -ss 3 -i public/media/clip-1.mp4 -frames:v 1 -q:v 4 public/media/clip-1.jpg
```

## Animations

Built with [Motion](https://motion.dev) (the successor of Framer Motion), imported from
`motion/react`. Every animation follows the visitor's "reduce motion" setting
(`MotionConfig reducedMotion="user"` in `src/components/site/motion-provider.tsx`).

## Logos

The AI provider logos in `src/components/site/provider-logos.ts` come from
[@lobehub/icons-static-svg](https://github.com/lobehub/lobe-icons) 1.106.0 (MIT). They are
trademarks of their owners and are shown only to say which providers Kliprix works with.

## Fonts

Inter and Montserrat ExtraBold (Google Fonts, downloaded and self-hosted at build time).
`scripts/assets/Montserrat-ExtraBold.ttf` is only used by the preview-image script
(SIL Open Font License, see `scripts/assets/OFL-Montserrat.txt`).
