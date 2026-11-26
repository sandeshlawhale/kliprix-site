"use client";

import { useState } from "react";
import { CheckIcon, StarIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { reviews, site, type Review } from "@/lib/site";
import { Container, SectionHead } from "./section-head";

type Kind = "review" | "idea" | "bug";

const kinds: { id: Kind; title: string; label: string; placeholder: string }[] = [
  {
    id: "review",
    title: "Review",
    label: "review",
    placeholder: "What worked, what didn't, what surprised you…",
  },
  { id: "idea", title: "Idea", label: "enhancement", placeholder: "I'd love it if Kliprix could…" },
  {
    id: "bug",
    title: "Bug",
    label: "bug",
    placeholder: "What you did, what happened, and what you expected…",
  },
];

/**
 * One plain form for reviews, ideas and bug reports.
 * It is sent privately to the form service in data/site.json ("reviewFormEndpoint"), which
 * emails it to the owner; nothing is posted publicly. Approved reviews are copied into
 * data/reviews.json by hand, so nothing on the page is invented.
 */
function FeedbackForm() {
  const [kind, setKind] = useState<Kind>("review");
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [trap, setTrap] = useState(""); // honeypot for bots, hidden from people
  const [errors, setErrors] = useState<{ name?: string; text?: string }>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const k = kinds.find((x) => x.id === kind)!;

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
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
      // Formspree uses this as the email subject.
      _subject: `Kliprix ${{ review: "review", idea: "idea", bug: "bug report" }[k.id]} from ${name.trim()}`,
    };

    if (!site.reviewFormEndpoint) {
      // The owner has not added a form address to data/site.json yet (see site/README.md).
      toast.error("Feedback isn't open yet", {
        description: "Please try again later.",
      });
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
      setDone(true);
    } catch {
      toast.error("Couldn't send it", {
        description: "Please try again in a minute, or open an issue on GitHub.",
      });
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="flex items-start gap-3 border-t border-line pt-8">
        <CheckIcon className="mt-0.5 size-5 shrink-0 text-ok" />
        <div>
          <p className="font-semibold">Thanks, {name.trim()}.</p>
          <p className="mt-1 text-[15px] text-muted-foreground">
            We read every message. Reviews show up here once they&apos;re checked.
          </p>
          <button
            type="button"
            onClick={() => {
              setText("");
              setDone(false);
            }}
            className="mt-3 text-[13px] text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Send another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-5">
      <div
        role="radiogroup"
        aria-label="What is it?"
        className="inline-flex w-fit rounded-[10px] border border-line-strong p-[3px] text-[13px]"
      >
        {kinds.map((x) => (
          <button
            key={x.id}
            type="button"
            role="radio"
            aria-checked={kind === x.id}
            onClick={() => setKind(x.id)}
            className={cn(
              "rounded-[7px] px-3.5 py-1.5 transition-colors",
              kind === x.id
                ? "bg-white/10 font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {x.title}
          </button>
        ))}
      </div>

      {kind === "review" && (
        <div role="radiogroup" aria-label="Rating" className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onClick={() => setRating(n)}
              className={cn("p-0.5 transition-colors", n <= rating ? "text-brand" : "text-dim")}
            >
              <StarIcon className="size-5" fill={n <= rating ? "currentColor" : "none"} />
            </button>
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
          className="h-11"
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
          className="min-h-28 resize-none"
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

      <div>
        <Button type="submit" disabled={sending} className="h-10 rounded-[10px] px-5 font-semibold">
          {sending ? "Sending…" : "Send"}
        </Button>
      </div>
    </form>
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
      <p className="mt-3 text-[13px]">
        <b className="font-semibold">{r.name}</b>
        <span className="text-dim"> · {r.role}</span>
      </p>
    </>
  );
  const cls = "block border-t border-line pt-5";
  return r.url ? (
    <a href={r.url} target="_blank" rel="noreferrer" className={cls}>
      {body}
    </a>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export function Feedback() {
  return (
    <Container id="feedback" className="pt-[clamp(56px,8vw,96px)]">
      <div className="mx-auto max-w-[640px]">
        <SectionHead
          eyebrow="Feedback"
          title="Tell us what you think."
          lede="A review, an idea or a bug. Every message is read."
        />
        <div className="reveal mt-8">
          <FeedbackForm />
        </div>
        {reviews.length > 0 && (
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {reviews.slice(0, 2).map((r) => (
              <ReviewCard key={`${r.name}-${r.date}`} r={r} />
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
