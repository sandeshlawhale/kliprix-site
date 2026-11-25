"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeftIcon,
  BugIcon,
  CheckIcon,
  LightbulbIcon,
  SendIcon,
  StarIcon,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { issuesNewUrl, reviews, site, type Review } from "@/lib/site";
import { Eyebrow } from "./section-head";

type Kind = "review" | "idea" | "bug";

const kinds: {
  id: Kind;
  icon: LucideIcon;
  title: string;
  hint: string;
  label: string;
  placeholder: string;
}[] = [
  {
    id: "review",
    icon: StarIcon,
    title: "Leave a review",
    hint: "Tried it? Tell others how it went.",
    label: "review",
    placeholder: "What worked, what didn't, what surprised you…",
  },
  {
    id: "idea",
    icon: LightbulbIcon,
    title: "Suggest an idea",
    hint: "A feature you'd love to see.",
    label: "enhancement",
    placeholder: "I'd love it if Kliprix could…",
  },
  {
    id: "bug",
    icon: BugIcon,
    title: "Report a problem",
    hint: "Something broke? We'll fix it.",
    label: "bug",
    placeholder: "What you did, what happened, and what you expected…",
  },
];

const ease = [0.2, 0.8, 0.2, 1] as const;
const step = {
  initial: { opacity: 0, x: 24, filter: "blur(4px)" },
  animate: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.4, ease } },
  exit: { opacity: 0, x: -24, filter: "blur(4px)", transition: { duration: 0.25, ease } },
};

/**
 * Feedback in three steps: pick a kind, write it, done.
 * It goes to the form service in data/site.json ("reviewFormEndpoint") when one is set,
 * otherwise it opens a pre-filled GitHub issue the visitor posts. Approved reviews are copied
 * into data/reviews.json by hand, so nothing on the page is invented.
 */
function FeedbackForm() {
  const [kind, setKind] = useState<Kind | null>(null);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [trap, setTrap] = useState(""); // honeypot for bots, hidden from people
  const [errors, setErrors] = useState<{ name?: string; text?: string }>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<"sent" | "github" | null>(null);

  const k = kinds.find((x) => x.id === kind);

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!k) return;
    const e: typeof errors = {};
    if (!name.trim()) e.name = "Add your name or channel.";
    else if (name.trim().length > 60) e.name = "Keep it under 60 characters.";
    if (text.trim().length < 10) e.text = "Write at least a sentence (10+ characters).";
    else if (text.trim().length > 1500) e.text = "Keep it under 1500 characters.";
    setErrors(e);
    if (Object.keys(e).length || trap) return;

    const payload = {
      kind: k.id,
      name: name.trim(),
      rating: k.id === "review" ? rating : undefined,
      text: text.trim(),
    };

    if (!site.reviewFormEndpoint) {
      const body = [
        `**From:** ${payload.name}`,
        ...(payload.rating ? [`**Rating:** ${"★".repeat(rating)}${"☆".repeat(5 - rating)}`] : []),
        "",
        payload.text,
      ].join("\n");
      const prefix = { review: "Review", idea: "Idea", bug: "Bug" }[k.id];
      const url = `${issuesNewUrl}?${new URLSearchParams({
        title: `${prefix}: ${payload.text.slice(0, 60)}${payload.text.length > 60 ? "…" : ""}`,
        body,
        labels: k.label,
      })}`;
      window.open(url, "_blank", "noopener,noreferrer");
      setDone("github");
      return;
    }

    setSending(true);
    try {
      const res = await fetch(site.reviewFormEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(String(res.status));
      setDone("sent");
    } catch {
      toast.error("Couldn't send it", {
        description: "Please try again in a minute, or open an issue on GitHub.",
      });
    } finally {
      setSending(false);
    }
  }

  function reset() {
    setKind(null);
    setText("");
    setErrors({});
    setDone(null);
  }

  return (
    <div className="relative min-h-[340px]">
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div
            key="done"
            {...step}
            className="grid h-full place-items-center py-10 text-center"
          >
            <div>
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 16 }}
                className="mx-auto grid size-16 place-items-center rounded-full bg-brand text-black shadow-[0_0_60px_-10px_var(--brand)]"
              >
                <CheckIcon className="size-8" strokeWidth={3} />
              </motion.div>
              <h3 className="mt-6 text-2xl font-semibold">Thank you, {name.trim()}!</h3>
              <p className="mx-auto mt-2 max-w-[360px] text-[15px] leading-relaxed text-muted-foreground">
                {done === "github"
                  ? "GitHub opened in a new tab with your message filled in. Press “Create” there to post it."
                  : "We read every message. Reviews show up here once they're checked."}
              </p>
              <Button variant="outline" onClick={reset} className="mt-6 border-line-strong">
                Send something else
              </Button>
            </div>
          </motion.div>
        ) : !k ? (
          <motion.div key="pick" {...step} className="grid gap-3">
            <p className="mb-1 text-sm text-muted-foreground">What would you like to share?</p>
            {kinds.map((x, i) => (
              <motion.button
                key={x.id}
                type="button"
                onClick={() => setKind(x.id)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.06 * i, duration: 0.4, ease } }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className="group flex items-center gap-4 rounded-2xl border border-line-strong bg-white/[0.02] p-4 text-left transition-colors hover:border-brand/60 hover:bg-brand/[0.04]"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/5 text-muted-foreground transition-colors group-hover:bg-brand group-hover:text-black">
                  <x.icon className="size-5" />
                </span>
                <span>
                  <b className="block text-[15px] font-semibold">{x.title}</b>
                  <span className="text-[13px] text-muted-foreground">{x.hint}</span>
                </span>
                <span className="ml-auto text-dim transition-transform group-hover:translate-x-1 group-hover:text-brand">
                  →
                </span>
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <motion.form key="write" {...step} onSubmit={submit} noValidate className="grid gap-4">
            <button
              type="button"
              onClick={() => setKind(null)}
              className="flex w-fit items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"
            >
              <ArrowLeftIcon className="size-3.5" />
              {k.title}
            </button>

            {k.id === "review" && (
              <div role="radiogroup" aria-label="Rating" className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <motion.button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={rating === n}
                    aria-label={`${n} star${n > 1 ? "s" : ""}`}
                    onClick={() => setRating(n)}
                    whileHover={{ scale: 1.12, rotate: -6 }}
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                      "grid size-10 place-items-center rounded-xl border border-line-strong text-dim",
                      n <= rating && "border-brand/45 bg-brand/8 text-brand",
                    )}
                  >
                    <StarIcon
                      className="size-[18px]"
                      fill={n <= rating ? "currentColor" : "none"}
                    />
                  </motion.button>
                ))}
              </div>
            )}

            <div className="grid gap-1.5">
              <Label htmlFor="f-name" className="text-[12.5px] text-muted-foreground">
                Name
              </Label>
              <Input
                id="f-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name or channel"
                aria-invalid={!!errors.name}
                maxLength={80}
                className="h-11 bg-panel"
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="f-text" className="text-[12.5px] text-muted-foreground">
                Message
              </Label>
              <Textarea
                id="f-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={k.placeholder}
                aria-invalid={!!errors.text}
                maxLength={1600}
                className="min-h-28 resize-none bg-panel"
              />
              {errors.text && <p className="text-xs text-destructive">{errors.text}</p>}
            </div>

            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={trap}
              onChange={(e) => setTrap(e.target.value)}
              className="hidden"
              name="website"
            />

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="submit"
                size="lg"
                disabled={sending}
                className="h-11 gap-2 rounded-xl px-5 font-semibold glow-brand"
              >
                <SendIcon className="size-4" />
                {sending ? "Sending…" : "Send"}
              </Button>
              <span className="text-xs text-dim">
                {site.reviewFormEndpoint
                  ? "Goes straight to us."
                  : "Opens a pre-filled GitHub issue."}
              </span>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReviewCard({ r }: { r: Review }) {
  const body = (
    <>
      <span className="flex gap-0.5 text-brand" aria-label={`${r.rating} out of 5`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <StarIcon key={i} className="size-3.5" fill={i <= r.rating ? "currentColor" : "none"} />
        ))}
      </span>
      <p className="mt-3 text-[15px] leading-relaxed text-[#d8d8de]">“{r.text}”</p>
      <p className="mt-4 text-[13px]">
        <b className="font-semibold">{r.name}</b>
        <span className="text-dim"> · {r.role}</span>
      </p>
    </>
  );
  const cls = "block rounded-2xl border border-line bg-white/[0.02] p-5";
  return r.url ? (
    <a href={r.url} target="_blank" rel="noreferrer" className={`${cls} hover:border-line-strong`}>
      {body}
    </a>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export function Feedback() {
  return (
    <section id="feedback" className="relative pt-[clamp(70px,10vw,120px)]">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="reveal relative overflow-hidden rounded-[28px] border border-line-strong bg-linear-to-br from-[#15151c] via-[#0f0f14] to-[#0b0b0f]">
          <div className="pointer-events-none absolute -top-40 -left-32 size-[460px] rounded-full bg-brand/12 blur-[100px]" />
          <div className="pointer-events-none absolute -right-40 -bottom-40 size-[420px] rounded-full bg-violet/12 blur-[110px]" />
          <div className="relative grid gap-10 p-7 sm:p-10 lg:grid-cols-[1fr_1.05fr] lg:p-14">
            <div>
              <Eyebrow>Feedback</Eyebrow>
              <h2 className="mt-3.5 text-[clamp(34px,4.6vw,52px)] leading-[1.04] font-semibold">
                Help shape
                <br />
                <span className="text-gradient">what comes next.</span>
              </h2>
              <p className="mt-4 max-w-[420px] text-lg leading-relaxed text-muted-foreground">
                Kliprix is open source and built in the open. Every review, idea and bug report is
                read, and the best ideas get built.
              </p>
              <div className="mt-8 grid gap-3">
                {reviews.length > 0 ? (
                  reviews.slice(0, 2).map((r) => <ReviewCard key={`${r.name}-${r.date}`} r={r} />)
                ) : (
                  <div className="rounded-2xl border border-dashed border-line-strong p-5 text-[14px] text-muted-foreground">
                    No reviews yet. Yours could be the first one shown here.
                  </div>
                )}
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-background/60 p-5 backdrop-blur-sm sm:p-7">
              <FeedbackForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
