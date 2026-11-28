# Kliprix website

[Kliprix](https://github.com/sandeshlawhale/Kliprix), a free, open-source app
that turns long streams and videos into vertical shorts, right on your own computer.

**[kliprix.vercel.app](https://kliprix.vercel.app)** · [Download](https://kliprix.vercel.app/download) · [The app on GitHub](https://github.com/sandeshlawhale/Kliprix) · [Releases](https://github.com/sandeshlawhale/Kliprix/releases) · [Report a problem](https://github.com/sandeshlawhale/Kliprix/issues)

![The Kliprix home page: "One long video in. Scroll-stopping shorts out." above a fan of real clips](docs/screenshots/home.webp)

## About Kliprix

Paste a link to a long video, press Start, and come back to finished shorts. Kliprix reads the
chat, the audio, the motion and what's being said to find the best moments, then cuts them into
1080×1920 clips with word-by-word captions, a title and ready-to-post text. English or Hinglish.

It runs on your computer, uses whichever AI you already have (Gemini, Claude, OpenAI,
OpenRouter, or a local model), and costs nothing. No account, no watermark, and your videos
never leave your PC.

This repository is only the website. The app lives in
[sandeshlawhale/Kliprix](https://github.com/sandeshlawhale/Kliprix).

## The site

**Home** (`/`): what Kliprix does, real clips it made, how it works, the features, a side-by-side
with cloud clipping tools, an FAQ and a feedback form.

**Download** (`/download`): every release with its date and size, what you need installed
(with a copyable command for Windows, macOS or Linux), and three ways to install: the ZIP, Git,
or Docker. After the ZIP starts downloading, the page walks you through the first run.

![The download page: a table of releases with a Download button, and the list of what you need](docs/screenshots/download.webp)

## Privacy

The app has no analytics at all. The website counts a few things so we know whether it's
working: visits, download page views, downloads, GitHub link clicks and copied install commands.

- No cookies, no IDs, no personal data. The browser sends only the name of the event.
- No IP addresses are stored. To stop spam, each visitor gets 30 events a minute, tracked by a
  salted hash of their IP that disappears after 60 seconds.
- Bots and link previews aren't counted.
- If the counter is down, downloads still work.

## Run it locally

You need Node.js 22 or newer.

```bash
npm install
npm run dev          # http://127.0.0.1:3100
```

The site works without any setup; the counters just switch off. To use the real database, link
the folder to the Vercel project and pull the settings:

```bash
vercel link
vercel env pull .env.local
```

Other commands: `npm test`, `npm run lint`, `npm run typecheck` and `npm run build`.

## License

MIT, like [the app](https://github.com/sandeshlawhale/Kliprix).
