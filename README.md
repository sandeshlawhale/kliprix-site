# Kliprix website

The public website for **Kliprix**, a free and open-source app that turns long YouTube videos and
stream VODs into ready-to-post vertical shorts, with captions, titles and hashtags, on your own
computer.

The site explains what Kliprix does, shows real results, answers common questions and gets people
to download it. It is a separate, fully static Next.js site (Tailwind 4, shadcn/ui, Motion) and
shares no code with the app in `frontend/` and `backend/` (decision D-064).

## What Kliprix does

Paste up to 3 video links, press Start, and come back to finished clips:

- **Finds the best moments.** It reads chat activity, audio energy, motion and the transcript
  together, then your AI model picks the clips and says why each one was chosen.
- **Makes vertical shorts.** Up to 5 clips per video at 1080x1920, 30 fps: blurred background,
  the main video framed on the face or the full frame, a punchy title on top and word-by-word
  captions below.
- **Writes the post for you.** A title, description, hashtags and a LinkedIn post for every clip,
  one click to copy.
- **Speaks your audience's language.** English or Hinglish captions (Hindi written the way people
  type it in chat), in 3 caption styles.
- **Lets you fix things fast.** Trim, fix a caption word, split or crop, preview live, then
  download at full quality. No timeline to learn.
- **Uses the AI you already have.** Gemini, Claude, OpenAI, OpenRouter, or a local model with
  LM Studio or Ollama. Free tiers are enough.

## How it helps

- **Saves hours.** Turning a 3-hour stream into five shorts is a paste and a wait, not an
  evening of scrubbing and editing.
- **Free, for good.** No plans, no credits, no trial that runs out, and no watermark.
- **Private.** The video never leaves your computer. No account, no tracking. Your API key is kept
  encrypted on your PC, or only in memory if you prefer. Only the transcript text goes to the AI
  you choose.
- **Runs on normal hardware.** 4 GB of RAM is enough (8 GB recommended). An NVIDIA GPU makes
  captions faster but is not required.
- **Open source (MIT).** Anyone can read the code, suggest ideas or report problems.

It is made for streamers, gaming channels, and anyone with long videos who wants a steady flow of
Shorts, Reels and TikToks without paying for a cloud clipping tool.

## What visitors find on the site

| Section | What it shows |
|---|---|
| **Hero** | The promise ("One long video in. Five scroll-stopping shorts out.") over a fan of real clips made by Kliprix, and a Download for Free button |
| **AI providers** | The AI services Kliprix works with, with their logos |
| **How it works** | Three steps (paste links, it finds the moments, download and post), each with a small animation, and a drawing of the app's batch page with real generated text |
| **Features** | Highlight signals, caption styles, English or Hinglish, your own AI key, quick edits, vertical framing, copy-ready post text |
| **Private by design** | The numbers that matter: free, 4 GB RAM, 0 trackers, 1 command to start |
| **Why local** | Kliprix side by side with a typical cloud clipping tool |
| **FAQ** | Price, hardware, supported sites, posting, privacy, operating systems |
| **Feedback** | A short form for a review, an idea or a bug report |
| **Get started** | Download, Star on GitHub, and the one Windows command that installs and starts the app |

## Sharing the site

Links to the site show a rich preview in WhatsApp, LinkedIn, X, Facebook, Telegram, Slack,
Discord and iMessage: the title, a short description and a 1200x630 image (`public/og.jpg`,
about 90 KB). The site also has icons for phones, a web manifest, `robots.txt`, `sitemap.xml` and
structured data, so search engines can show Kliprix as a free app.

The preview image and the icons are made from the logo and the clips by
`scripts/make-share-image.py` (needs Pillow). Run it again after replacing the clips.

Apps cache previews. After a change, refresh them with the
[LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) and the
[Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) (also used by WhatsApp
and Instagram). X picks up changes on its own, usually within a day.

## Feedback and reviews

Feedback must stay private, so the form never posts anything publicly. It sends to a form
service that emails it to you:

1. Create a free form at [Formspree](https://formspree.io) (or a similar service) and put its URL
   in `data/site.json` → `reviewFormEndpoint`, for example `https://formspree.io/f/<id>`.
   **Until this is set, the form refuses to send** ("Feedback isn't open yet").
2. A visitor picks Review, Idea or Bug and writes it. You get it by email.
3. Copy the reviews you approve into `data/reviews.json`. As soon as the list has entries, the
   Feedback section shows the first two below the form. Only publish real reviews.

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

`url` is optional (a link to where the review was posted).

## Editing the content

The site's settings live in the `data/` folder and are read when the site is built. Edit a
file, commit and push, and the next deploy picks it up.

| File | What it holds |
|---|---|
| `data/site.json` | Public address (`siteUrl`), GitHub repo, download link, feedback form address |
| `data/reviews.json` | Reviews shown in the Feedback section (starts empty) |

## Hosting

The site is plain static files, hosted on Vercel from the `landing-site` branch. The `main`
branch stays the clean app people download, so `landing-site` is never merged into it.

Vercel settings:

- **Root Directory:** `site`. Framework preset Next.js, default build settings.
- **Production branch** (Settings → Environments → Production → Branch Tracking):
  `landing-site`.
- **Ignored Build Step** (Settings → Build and Deployment), behavior Custom, so pushes to the
  app branches do not rebuild the site:
  `if [ "$VERCEL_GIT_COMMIT_REF" = "landing-site" ]; then exit 1; else exit 0; fi`
- **Address:** Vercel's production address is used automatically for share previews and the
  sitemap. With your own domain (or a renamed `.vercel.app` address), put it in
  `data/site.json` → `siteUrl`; it wins over Vercel's.
- `vercel.json` lets browsers cache `/media` for 7 days and the icons for 1 day.

## Speed

- One font file (Inter, 48 KB) loads up front. The caption font loads only when its section
  comes into view.
- The hero shows still posters at once. The clip videos start downloading only after the page
  has loaded, so they never slow the first view.
- Everything is static and served from Vercel's CDN.
- Every animation follows the visitor's "reduce motion" setting.

## Media

`public/media/clip-N.mp4` are 8-second muted loops cut from real Kliprix exports, each with a
`clip-N.jpg` poster. `hero-reel.mp4` is the same clips side by side in one 1920x1080 video, for
social posts.

Before the site goes public, replace any clip made from someone else's video with one made
from your own video or one you have permission to use, then rebuild the preview image. To cut a
new loop from an export:

```
ffmpeg -ss 2 -t 8 -i path/to/clip.mp4 -an -vf "scale=540:960,fps=30" -c:v libx264 -crf 27 -preset slow -pix_fmt yuv420p -movflags +faststart public/media/clip-1.mp4
ffmpeg -ss 3 -i public/media/clip-1.mp4 -frames:v 1 -q:v 4 public/media/clip-1.jpg
```

## Credits

- Animations: [Motion](https://motion.dev) (the successor of Framer Motion).
- AI provider logos: [@lobehub/icons-static-svg](https://github.com/lobehub/lobe-icons) 1.106.0
  (MIT). They are trademarks of their owners and are shown only to say which providers Kliprix
  works with.
- Fonts: Inter and Montserrat ExtraBold (Google Fonts, self-hosted at build time).
  `scripts/assets/Montserrat-ExtraBold.ttf` is used only by the preview-image script
  (SIL Open Font License, see `scripts/assets/OFL-Montserrat.txt`).
