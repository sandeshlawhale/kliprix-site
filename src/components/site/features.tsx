import { cn } from "@/lib/utils";
import { Container, SectionHead } from "./section-head";
import { CaptionStyles, LanguageToggle } from "./caption-demos";

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "reveal relative overflow-hidden rounded-[20px] border border-line bg-linear-to-b from-white/[0.03] to-white/[0.01] p-7",
        className,
      )}
    >
      {children}
    </div>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2 text-[22px] font-semibold">{children}</h3>;
}

function CardText({ children }: { children: React.ReactNode }) {
  return (
    <p className="max-w-[440px] text-[15px] leading-relaxed text-muted-foreground">{children}</p>
  );
}

/** Deterministic bars (same on server and client); bars 38–46 are the picked moment. */
function bars(seed: number, boost: number) {
  let s = seed;
  return Array.from({ length: 64 }, (_, i) => {
    s = (s * 9301 + 49297) % 233280;
    const hot = i >= 38 && i <= 46;
    const h = 12 + (s / 233280) * 45 + (hot ? 40 + boost : 0);
    return { h: Math.min(100, Math.round(h)), hot };
  });
}

const signals = [
  { label: "Chat activity", seed: 3 },
  { label: "Audio energy", seed: 7 },
  { label: "Motion", seed: 11 },
  { label: "Transcript", seed: 5 },
];

const ais = ["Gemini", "Claude", "OpenAI", "OpenRouter", "Local model"];

export function Features() {
  return (
    <Container id="features" className="pt-[clamp(80px,12vw,130px)] pb-10">
      <SectionHead
        eyebrow="Features"
        title="Everything a clip needs."
        sub="Nothing you have to fiddle with."
      />
      <div className="mt-14 grid gap-4 md:grid-cols-6">
        <Card className="md:col-span-4">
          <CardTitle>Finds highlights the way viewers do</CardTitle>
          <CardText>
            Four signals are read together, so it picks the moment chat lost it and not just a loud
            noise. Every clip tells you why it was picked.
          </CardText>
          <div className="mt-6 grid gap-3" aria-hidden="true">
            {signals.map((sig, k) => (
              <div
                key={sig.label}
                className="grid grid-cols-[96px_1fr] items-center gap-3.5 text-[12.5px] text-muted-foreground"
              >
                {sig.label}
                <div className="flex h-[30px] items-end gap-[3px]">
                  {bars(sig.seed, k * 4).map((b, i) => (
                    <i
                      key={i}
                      className={cn("flex-1 rounded-[2px]", b.hot ? "bg-brand" : "bg-white/12")}
                      style={{ height: `${b.h}%` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2.5 text-[13px]">
            <b className="rounded-lg border border-brand/30 bg-brand/12 px-2.5 py-1 text-xs font-semibold text-brand">
              Clip 04 · 24:44
            </b>
            “Takes down enemies one by one in a tense gunfight, then escapes.”
          </div>
        </Card>

        <Card className="md:col-span-2">
          <CardTitle>3 caption styles</CardTitle>
          <CardText>The spoken word lights up as it&apos;s said.</CardText>
          <CaptionStyles />
        </Card>

        <Card className="md:col-span-2">
          <CardTitle>English or Hinglish</CardTitle>
          <CardText>Hindi written the way your audience types it in chat.</CardText>
          <LanguageToggle />
        </Card>

        <Card className="md:col-span-2">
          <CardTitle>Your AI, your key</CardTitle>
          <CardText>
            Pick any provider. Free tiers are enough, or run a local model with no key at all.
          </CardText>
          <ul className="mt-5 flex flex-wrap gap-2">
            {ais.map((a, i) => (
              <li
                key={a}
                className={cn(
                  "rounded-full border border-line-strong px-3 py-1.5 text-[13px] text-[#d8d8de]",
                  i === 0 && "border-brand/50 text-brand",
                )}
              >
                {a}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="md:col-span-2">
          <CardTitle>Quick edits, no timeline</CardTitle>
          <CardText>
            Trim, fix a caption word, split or crop, preview live, then download at full quality.
          </CardText>
          <div className="mt-5 grid gap-2.5" aria-hidden="true">
            <div className="relative h-[46px] overflow-hidden rounded-[10px] border border-line bg-[repeating-linear-gradient(90deg,#1c1c23_0_18px,#22222a_18px_36px)]">
              <div className="absolute inset-y-[-2px] right-[26%] left-[18%] rounded-[10px] border-2 border-brand shadow-[0_0_0_999px_rgb(8_8_11/0.55)]" />
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              {[
                ["S", "split"],
                ["Del", "delete"],
                ["← →", "word"],
              ].map(([k, l]) => (
                <span key={k} className="flex items-center gap-1.5">
                  <kbd className="rounded-md border border-b-2 border-line-strong px-1.5 py-px font-mono text-[11.5px] text-foreground">
                    {k}
                  </kbd>
                  {l}
                </span>
              ))}
            </div>
          </div>
        </Card>

        <Card className="md:col-span-3">
          <CardTitle>Framed for vertical</CardTitle>
          <CardText>
            Blurred background, the main video framed on the face or the full frame, a punchy title
            on top and captions below. 1080×1920, 30 fps, ready for Shorts, Reels and TikTok.
          </CardText>
        </Card>
        <Card className="md:col-span-3">
          <CardTitle>Copy-ready post text</CardTitle>
          <CardText>
            On-video title, YouTube title and description, hashtags and a LinkedIn post for every
            clip, each one click to copy.
          </CardText>
        </Card>
      </div>
    </Container>
  );
}
