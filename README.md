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

After deploying, put the public URL in `data/site.json` → `siteUrl` (used for link previews).

## Content: the `data/` folder

| File | What it holds |
|---|---|
| `data/site.json` | Repo name, download link, public URL, and the optional review form endpoint |
| `data/changelog.json` | The "Recently shipped" list (newest first) |
| `data/reviews.json` | Reviews shown on the page. Starts empty, and the page says so |

Edit a file, then rebuild and redeploy. The data is read at build time.

### How reviews work

A static site cannot write files after it is deployed, so reviews take this path:

1. A visitor fills in the form.
2. **If `reviewFormEndpoint` is empty** (the default), the form opens a pre-filled GitHub issue
   in a new tab, and the visitor presses "Create". **If you set it** to a form service URL
   (for example a free [Formspree](https://formspree.io) form: `https://formspree.io/f/<id>`),
   the review is sent there and you get it by email.
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
page shows them as cards above the form. Only publish real reviews.

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

## Fonts

Inter (Google Fonts, downloaded at build time), plus Anton and Montserrat ExtraBold from
`src/fonts/` (SIL Open Font License, see the `OFL-*.txt` files), the same fonts the Kliprix
renderer uses for titles and captions.
