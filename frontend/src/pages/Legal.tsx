import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Reveal, SectionLabel } from "@/components/SiteShell";
import { AFCA_URL, ASIC_REGISTER_URL, EBURY_LEGAL_URL, EMAIL, EMAIL_HREF } from "@/lib/siteLinks";

const link = "font-bold text-[#2D6A4F] underline";

// Policy wording carried over from the original switchyardfx.com.au site.
const content: Record<"privacy" | "terms" | "compliance", { title: string; intro: ReactNode; sections: [string, ReactNode][] }> = {
  privacy: {
    title: "Privacy Policy",
    intro: <>SwitchYard FX Advisory ABN 49 691 362 553, AFSL 520548 (“we”, “us”, “our”) is committed to protecting the privacy of your personal information in accordance with the <em>Privacy Act 1988</em> (Cth) and the Australian Privacy Principles (APPs).</>,
    sections: [
      ["Information we collect", "We collect personal information such as name, email address, phone number, business details, and financial information necessary to provide our FX advisory and hedging services. Information is collected directly from you, from third-party verification providers, and through your use of our website or platform."],
      ["How we use your information", "Your information is used to provide and improve our services, comply with legal and regulatory obligations, communicate with you about your account and market updates, and for internal analytics. We do not sell your personal information to third parties."],
      ["Data security", "We employ industry-standard security measures including encryption, secure servers, and access controls to protect your personal information. Despite these measures, no method of transmission over the internet is entirely secure."],
      ["Contact us", <>For privacy-related enquiries, contact our Privacy Officer at <a href={EMAIL_HREF} className={link}>{EMAIL}</a>.</>],
    ],
  },
  terms: {
    title: "Terms of Service",
    intro: "By accessing or using SwitchYard FX Advisory’s website, platform, or services, you agree to be bound by these Terms of Service. Please read them carefully before proceeding.",
    sections: [
      ["Services", <>SwitchYard FX Advisory provides foreign exchange advisory, hedging strategy, and related financial services to eligible wholesale and sophisticated investors as defined under the <em>Corporations Act 2001</em> (Cth). Our services are not available to retail clients or individuals under 18 years of age.</>],
      ["General advice warning", "Any information provided through our platform or communications constitutes general financial advice only and does not take into account your personal objectives, financial situation, or needs. You should consider obtaining independent financial advice before making any financial decision."],
      ["Intellectual property", "All content on this website, including text, graphics, logos, and software, is the property of SwitchYard FX Advisory and is protected by applicable intellectual property laws. You may not reproduce or distribute any content without prior written consent."],
      ["Limitation of liability", "To the maximum extent permitted by law, SwitchYard FX Advisory is not liable for any indirect, incidental, or consequential losses arising from your use of our services or reliance on information provided through our platform."],
      ["Governing law", "These terms are governed by the laws of New South Wales, Australia. You submit to the exclusive jurisdiction of the courts of New South Wales."],
    ],
  },
  compliance: {
    title: "Compliance",
    intro: "SwitchYard FX Advisory operates under an Australian Financial Services Licence (AFSL) and is regulated by the Australian Securities and Investments Commission (ASIC).",
    sections: [
      ["AML / CTF", <>We maintain a comprehensive Anti-Money Laundering and Counter-Terrorism Financing (AML/CTF) program in compliance with the <em>Anti-Money Laundering and Counter-Terrorism Financing Act 2006</em> (Cth). All clients are subject to identity verification and ongoing due-diligence procedures.</>],
      ["Client classification", <>We provide services exclusively to wholesale clients under section 761G of the <em>Corporations Act 2001</em>. Prior to onboarding, clients are required to provide evidence of their wholesale client status.</>],
      ["Complaints & disputes", <>We have an internal complaints handling procedure. If you are unsatisfied with the outcome, you may escalate to the Australian Financial Complaints Authority (AFCA) at <a href={AFCA_URL} target="_blank" rel="noreferrer" className={link} data-testid="compliance-afca-link">www.afca.org.au</a>.</>],
      ["ASIC register", <>You can verify our licence details on the ASIC Connect Professional Registers at <a href={ASIC_REGISTER_URL} target="_blank" rel="noreferrer" className={link} data-testid="compliance-asic-link">connectonline.asic.gov.au</a>.</>],
    ],
  },
};

export default function Legal({ type }: { type: keyof typeof content }) { const item = content[type]; return <><section className="bg-[#12261F] px-5 py-20 text-white lg:px-8 lg:py-24" data-testid={`${type}-hero`}><div className="mx-auto max-w-7xl"><Reveal><SectionLabel>SwitchYard FX</SectionLabel><h1 className="text-5xl font-bold tracking-[-0.05em] sm:text-6xl" data-testid={`${type}-heading`}>{item.title}</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-white/60" data-testid={`${type}-intro`}>{item.intro}</p></Reveal></div></section><section className="bg-white px-5 py-20 lg:px-8 lg:py-28" data-testid={`${type}-content`}><div className="mx-auto max-w-3xl space-y-10 text-[#4A5A55]">{item.sections.map(([heading, body]) => <div key={heading}><h2 className="text-2xl font-bold text-[#12261F]">{heading}</h2><p className="mt-4 leading-8">{body}</p></div>)}<div><h2 className="text-2xl font-bold text-[#12261F]">Regulatory information</h2><p className="mt-4 leading-8">Switchyard Capital Pty Ltd is an Authorised Representative (ASIC AR No. 001318359) of Ebury Partners Australia Pty Limited (ACN 632 570 702) which holds an Australian Financial Services Licence (AFSL 520548). Ebury is registered with the Australian Transaction Reports and Analysis Centre (AUSTRAC). Registered Office: Level 20, 201 Elizabeth Street, Sydney NSW 2000.</p><p className="mt-4 leading-8">Ebury’s Legal &amp; Compliance documentation: <a href={EBURY_LEGAL_URL} target="_blank" rel="noreferrer" className={link} data-testid={`${type}-ebury-legal-link`}>ebury.com/en-au/compliance-legal/legal</a></p></div><Link to="/contact" className="inline-flex font-bold text-[#2D6A4F]" data-testid={`${type}-contact-link`}>Questions? Talk to us <span className="ml-2">→</span></Link></div></section></>; }
