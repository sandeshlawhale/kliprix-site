import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Container, SectionHead } from "./section-head";

const faqs = [
  {
    q: "Is it really free?",
    a: "Yes. Kliprix is MIT open source. You only need a free API key from an AI provider, or a local model.",
  },
  {
    q: "Do I need a powerful PC?",
    a: "No. It runs on 4 GB of RAM (8 GB recommended). An NVIDIA GPU makes captions faster but isn't required.",
  },
  { q: "Which sites does it support?", a: "YouTube videos and stream VODs today." },
  {
    q: "Does it post to YouTube for me?",
    a: "No. You download the MP4 and post it yourself, with the title and hashtags ready to copy.",
  },
  {
    q: "Is my video uploaded anywhere?",
    a: "No. The video is processed on your PC. Only the transcript text goes to the AI you choose, so it can pick clips and write titles.",
  },
  {
    q: "Windows, Mac or Linux?",
    a: "All three. Windows is the main target. One command installs everything and starts the app.",
  },
];

export function Faq() {
  return (
    <Container id="faq" className="pt-[clamp(70px,10vw,120px)] pb-10">
      <SectionHead center eyebrow="FAQ" title="Questions, answered." />
      <Accordion
        type="single"
        collapsible
        defaultValue="0"
        className="reveal mx-auto mt-10 max-w-[820px]"
      >
        {faqs.map((f, i) => (
          <AccordionItem key={f.q} value={String(i)} className="border-line">
            <AccordionTrigger className="py-5 text-[17px] font-semibold hover:text-brand hover:no-underline">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-[15px] leading-relaxed text-muted-foreground">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Container>
  );
}
