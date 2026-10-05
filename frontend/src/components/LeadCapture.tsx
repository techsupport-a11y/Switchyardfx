import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { SubmissionKind, SubmissionPayload } from "@/lib/types";
import { HEDGE_POLICY_PDF } from "@/lib/siteLinks";
import { switchyardService } from "@/services/switchyard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function submitLead(payload: SubmissionPayload) {
  return switchyardService.createSubmission(payload);
}

export function LeadForm({ kind, compact = false, showVolume = false, showNewsletterFields = false }: { kind: SubmissionKind; compact?: boolean; showVolume?: boolean; showNewsletterFields?: boolean }) {
  const [sent, setSent] = useState(false);
  const mutation = useMutation({
    mutationFn: submitLead,
    onSuccess: () => { setSent(true); toast.success("Thanks — your request is on its way."); },
    onError: () => toast.error("Please check your details and try again."),
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    if (!email || !email.includes("@")) { toast.error("Please add a valid email address."); return; }
    const payload: SubmissionPayload = {
      kind, email, name: String(form.get("name") ?? ""), company: String(form.get("company") ?? ""),
      phone: String(form.get("phone") ?? ""), annual_fx_volume: String(form.get("annual_fx_volume") ?? ""),
      message: String(form.get("message") ?? ""), role: String(form.get("role") ?? ""),
      cadence: (form.get("cadence") as "daily" | "weekly" | null) ?? undefined,
      locale: document.documentElement.lang || "en", consent: form.get("consent") === "on",
    };
    if (!payload.consent) { toast.error("Please confirm you agree to be contacted."); return; }
    mutation.mutate(payload);
  }

  if (sent) return <div className="rounded-2xl border border-[#A8C5BA]/30 bg-[#A8C5BA]/10 p-6" data-testid={`${kind}-form-success`}><p className="font-bold text-[#A8C5BA]">Request received.</p><p className="mt-2 text-sm text-white/70">Our team will be in touch shortly.</p>{kind === "hedge-guide" && <a href={HEDGE_POLICY_PDF} download className="mt-4 inline-flex rounded-full bg-[#2D6A4F] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#3d8163]" data-testid="hedge-guide-download-link">Download the guide (PDF)</a>}</div>;

  return (
    <form onSubmit={onSubmit} className={`grid gap-4 ${compact ? "sm:grid-cols-[1fr_auto]" : "sm:grid-cols-2"}`} noValidate data-testid={`${kind}-form`}>
      <Input name="name" placeholder="Your name" aria-label="Your name" className="h-12 rounded-xl border-white/15 bg-white/10 text-white placeholder:text-white/40" />
      <Input name="company" placeholder="Company" aria-label="Company" className="h-12 rounded-xl border-white/15 bg-white/10 text-white placeholder:text-white/40" />
      <Input name="email" type="email" required placeholder="Work email *" aria-label="Work email" className="h-12 rounded-xl border-white/15 bg-white/10 text-white placeholder:text-white/40" />
      {!compact && <Input name="phone" placeholder="Phone number" aria-label="Phone number" className="h-12 rounded-xl border-white/15 bg-white/10 text-white placeholder:text-white/40" />}
      {showVolume && <select name="annual_fx_volume" defaultValue="" aria-label="Annual FX volume" className="h-12 rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none sm:col-span-2"><option value="" disabled>Annual FX volume</option><option>Under $1m</option><option>$1m–$10m</option><option>$10m–$50m</option><option>$50m+</option></select>}
      {showNewsletterFields && <><select name="role" defaultValue="CFO / Finance Director" aria-label="Your role" className="h-12 rounded-xl border border-white/15 bg-[#1C382E] px-3 text-sm text-white outline-none"><option>CFO / Finance Director</option><option>Treasury Manager</option><option>Financial Controller</option><option>Business Owner</option></select><div className="flex h-12 items-center rounded-xl border border-white/15 bg-white/10 p-1" data-testid="newsletter-cadence-options"><label className="flex flex-1 cursor-pointer items-center justify-center rounded-lg px-3 py-2 text-xs font-bold has-[:checked]:bg-[#A8C5BA] has-[:checked]:text-[#12261F]"><input type="radio" name="cadence" value="daily" className="sr-only" />Daily</label><label className="flex flex-1 cursor-pointer items-center justify-center rounded-lg px-3 py-2 text-xs font-bold has-[:checked]:bg-[#A8C5BA] has-[:checked]:text-[#12261F]"><input type="radio" name="cadence" value="weekly" defaultChecked className="sr-only" />Weekly</label></div></>}
      {!compact && <Textarea name="message" placeholder="Tell us a little about your FX exposure" aria-label="Message" className="min-h-28 rounded-xl border-white/15 bg-white/10 text-white placeholder:text-white/40 sm:col-span-2" />}
      <label className={`flex items-start gap-3 text-xs text-white/60 ${compact ? "sm:col-span-2" : "sm:col-span-2"}`}><input name="consent" type="checkbox" className="mt-0.5 accent-[#A8C5BA]" required /> I agree to be contacted by SwitchYard FX about this request.</label>
      <Button type="submit" disabled={mutation.isPending} className="h-12 rounded-full bg-[#A8C5BA] px-6 font-bold text-[#12261F] hover:bg-white sm:col-span-2">{mutation.isPending ? "Sending…" : compact ? "Send guide" : "Send message"}</Button>
    </form>
  );
}

export function GuideDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md rounded-3xl border-[#DCE5E1] bg-white p-7">
      <DialogHeader><DialogTitle className="text-2xl text-[#12261F]">Get the Hedge Policy Guide</DialogTitle><DialogDescription className="text-[#4A5A55]">A practical starting point for building a board-ready FX policy.</DialogDescription></DialogHeader>
      <LeadForm kind="hedge-guide" compact />
      <DialogFooter><p className="text-xs text-[#4A5A55]">We respect your inbox. Unsubscribe anytime.</p></DialogFooter>
    </DialogContent>
  </Dialog>;
}