import { Plus } from "lucide-react";
import { Reveal, SectionLabel } from "@/components/SiteShell";
import { FAQS } from "@/lib/seo";
import { BOOKING_URL } from "@/lib/siteLinks";

// Common questions, answered in plain language. The same answers are published as FAQPage
// structured data (lib/seo.ts), so search engines and AI assistants can quote them.
export default function FaqSection() {
  return <section className="bg-white px-5 py-20 lg:px-8 lg:py-28" aria-labelledby="faq-heading" data-testid="faq-section">
    <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
      <Reveal from="left">
        <SectionLabel>FAQ</SectionLabel>
        <h2 id="faq-heading" className="text-4xl font-bold tracking-[-0.04em] sm:text-5xl">Questions CFOs ask us.</h2>
        <p className="mt-6 max-w-sm text-lg leading-8 text-[#4A5A55]">Straight answers on FX hedging, payments and how we work. Something else on your mind? <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="font-bold text-[#2D6A4F] underline-offset-4 hover:underline">Book a free call</a>.</p>
      </Reveal>
      <Reveal from="right" delay={0.1} className="divide-y divide-[#DCE5E1] border-y border-[#DCE5E1]">
        {FAQS.map(([question, answer], index) => <details key={question} className="group" open={index === 0} data-testid={`faq-item-${index}`}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left text-lg font-bold [&::-webkit-details-marker]:hidden">
            <h3>{question}</h3>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#DCE5E1] text-[#2D6A4F] transition-[transform,background-color] duration-300 group-open:rotate-45 group-open:bg-[#E8EEEB]"><Plus size={18} /></span>
          </summary>
          <p className="max-w-2xl pb-6 leading-7 text-[#4A5A55]">{answer}</p>
        </details>)}
      </Reveal>
    </div>
  </section>;
}
