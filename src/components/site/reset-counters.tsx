"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcwIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * "Reset counters" on /stats. Opens a dialog that asks for the stats password again, then
 * POSTs it to /api/stats/reset, which checks it on the server. The password is never stored.
 */
export function ResetCounters() {
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function open() {
    setPassword("");
    setError("");
    dialog.current?.showModal();
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!password) return setError("Enter the password.");
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/stats/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = (await res.json().catch(() => ({}))) as { deleted?: number; error?: string };
      if (!res.ok) {
        setError(body.error ?? "Couldn't reset. Try again.");
        return;
      }
      dialog.current?.close();
      setPassword("");
      toast.success("Counters reset", {
        description: `${body.deleted ?? 0} keys deleted. GitHub numbers are unchanged.`,
      });
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="outline" size="lg" onClick={open} className="gap-2 rounded-md">
        <RotateCcwIcon className="size-4" aria-hidden="true" />
        Reset counters
      </Button>

      <dialog
        ref={dialog}
        aria-labelledby="reset-title"
        onClose={() => setPassword("")}
        className="m-auto w-[min(420px,calc(100vw-32px))] rounded-lg border border-line-strong bg-popover p-0 text-foreground backdrop:bg-black/60 backdrop:backdrop-blur-sm"
      >
        <form onSubmit={submit} className="space-y-4 p-5">
          <div>
            <h2 id="reset-title" className="text-[17px] font-semibold">
              Reset all counters?
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              This deletes every total and daily count. It can&apos;t be undone. GitHub stars and
              release downloads are not affected.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reset-password">Stats password</Label>
            <Input
              id="reset-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "reset-error" : undefined}
              autoFocus
            />
            {error && (
              <p id="reset-error" role="alert" className="text-[13px] text-destructive">
                {error}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="rounded-md"
              onClick={() => dialog.current?.close()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="lg"
              className="rounded-md"
              disabled={busy}
            >
              {busy ? "Resetting…" : "Reset counters"}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
