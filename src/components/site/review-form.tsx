"use client";

import { useState } from "react";
import { StarIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { issuesNewUrl, site } from "@/lib/site";

const roles = ["Gaming clips", "Stream highlights", "Movie clips", "Podcasts", "Something else"];

type Errors = Partial<Record<"name" | "text", string>>;

/**
 * Sends a review to the form service in data/site.json ("reviewFormEndpoint").
 * Without one, it opens a pre-filled GitHub issue the visitor posts themselves.
 * Either way the owner reads it and copies approved reviews into data/reviews.json.
 */
export function ReviewForm() {
  const [name, setName] = useState("");
  const [role, setRole] = useState(roles[0]);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [trap, setTrap] = useState(""); // honeypot for bots, hidden from people
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  function validate(): Errors {
    const e: Errors = {};
    if (!name.trim()) e.name = "Add your name or channel.";
    else if (name.trim().length > 60) e.name = "Keep it under 60 characters.";
    if (text.trim().length < 10) e.text = "Write at least a sentence (10+ characters).";
    else if (text.trim().length > 1000) e.text = "Keep it under 1000 characters.";
    return e;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length || trap) return;

    const review = { name: name.trim(), role, rating, text: text.trim() };

    if (!site.reviewFormEndpoint) {
      const body = [
        `**Name:** ${review.name}`,
        `**Makes:** ${review.role}`,
        `**Rating:** ${"★".repeat(rating)}${"☆".repeat(5 - rating)} (${rating}/5)`,
        "",
        review.text,
      ].join("\n");
      const url = `${issuesNewUrl}?${new URLSearchParams({
        title: `Review: ${review.name} (${rating}/5)`,
        body,
        labels: "review",
      })}`;
      window.open(url, "_blank", "noopener,noreferrer");
      toast("GitHub opened in a new tab", {
        description: "Press “Create” there to post your review. Thank you!",
      });
      return;
    }

    setSending(true);
    try {
      const res = await fetch(site.reviewFormEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(review),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSent(true);
      toast.success("Review sent. Thank you!");
    } catch {
      toast.error("Couldn't send your review", {
        description: "Please try again in a minute, or post it as a GitHub issue.",
      });
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="mt-5 rounded-xl border border-ok/30 bg-ok/6 p-5 text-sm leading-relaxed text-[#d8d8de]">
        Thanks, {name.trim()}! We read every review and show it here once it&apos;s checked.
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="mt-5 grid gap-3.5">
      <div className="grid gap-3.5 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="r-name" className="text-[12.5px] text-muted-foreground">
            Name
          </Label>
          <Input
            id="r-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name or channel"
            aria-invalid={!!errors.name}
            maxLength={80}
            className="h-10 bg-panel"
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="r-role" className="text-[12.5px] text-muted-foreground">
            You make
          </Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger id="r-role" className="h-10! w-full bg-panel">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <fieldset className="grid gap-1.5">
        <legend className="mb-1.5 text-[12.5px] text-muted-foreground">Rating</legend>
        <div className="flex gap-1.5" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onClick={() => setRating(n)}
              className={cn(
                "grid size-[38px] place-items-center rounded-[10px] border border-line-strong text-dim transition-colors hover:border-brand/45",
                n <= rating && "border-brand/45 bg-brand/7 text-brand",
              )}
            >
              <StarIcon className="size-4" fill={n <= rating ? "currentColor" : "none"} />
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-1.5">
        <Label htmlFor="r-text" className="text-[12.5px] text-muted-foreground">
          Your review
        </Label>
        <Textarea
          id="r-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What worked, what didn't, what you'd add…"
          aria-invalid={!!errors.text}
          maxLength={1200}
          className="min-h-24 resize-none bg-panel"
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
          className="h-11 rounded-xl px-5 font-semibold glow-brand"
        >
          {sending ? "Sending…" : "Send review"}
        </Button>
        <span className="text-xs text-dim">
          {site.reviewFormEndpoint ? "Goes straight to us." : "Opens a pre-filled GitHub issue."}
        </span>
      </div>
    </form>
  );
}
