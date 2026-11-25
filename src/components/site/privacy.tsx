import { CheckIcon } from "lucide-react";
import { Container, SectionHead } from "./section-head";

const facts = [
  { big: "₹0", text: "Free forever. No plans, no credits." },
  { big: "4 GB", text: "RAM is enough. It's just slower." },
  { big: "0", text: "Watermarks, accounts or trackers." },
  { big: "1", text: "command to install and start." },
];

export function Privacy() {
  return (
    <Container id="privacy" className="pt-[clamp(90px,14vw,150px)] pb-14 text-center">
      <SectionHead
        center
        eyebrow="Private by design"
        title={
          <span className="mx-auto block max-w-[900px] text-[clamp(38px,6vw,64px)]">
            Your videos never leave <span className="text-brand">your computer.</span>
          </span>
        }
        lede="No account, no cloud and no tracking. Your API key is kept encrypted on your PC, or only in memory if you prefer."
      />
      <div className="reveal mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line text-left sm:grid-cols-2 lg:grid-cols-4">
        {facts.map((f) => (
          <div key={f.big} className="bg-background p-6">
            <b className="mb-1.5 block text-[30px] font-semibold tracking-tight">{f.big}</b>
            <span className="text-sm text-muted-foreground">{f.text}</span>
          </div>
        ))}
      </div>
    </Container>
  );
}

const rows = [
  ["Price", "Free, open source", "Monthly plan or credits"],
  ["Watermark", "Never", "Often on the free tier"],
  ["Where your video goes", "Stays on your PC", "Uploaded to their servers"],
  ["AI model", "Any provider you choose", "Theirs"],
  ["Hinglish captions", "Built in", "Rare"],
  ["Account", "None", "Required"],
];

export function Compare() {
  return (
    <Container className="pt-[clamp(70px,10vw,110px)] pb-10">
      <SectionHead eyebrow="Why local" title="Kliprix vs. cloud clippers" />
      <div className="reveal mt-11 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-[15px]">
          <thead>
            <tr className="border-b border-line text-left text-[13px] font-semibold">
              <th className="px-5 py-4" />
              <th className="px-5 py-4 text-brand">Kliprix</th>
              <th className="px-5 py-4 text-dim">Typical cloud clipping tool</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([k, us, them]) => (
              <tr key={k} className="border-b border-line">
                <td className="px-5 py-4 text-muted-foreground">{k}</td>
                <td className="px-5 py-4 font-semibold">
                  <span className="flex items-center gap-2">
                    <CheckIcon className="size-4 text-brand" />
                    {us}
                  </span>
                </td>
                <td className="px-5 py-4 text-[#d8d8de]">{them}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
}
