import { useState, type FormEvent } from "react";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { studioConfig, validateEnquiry, enquiryText, type Enquiry } from "@/lib/studio-config";

export function ContactForm() {
  const [values, setValues] = useState<Enquiry>({ name: "", business: "", service: "", budget: "", details: "", contact: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof Enquiry, string>>>({});
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const update = (key: keyof Enquiry, value: string) => { setValues(v => ({ ...v, [key]: value })); setReady(false); setCopied(false); };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next = validateEnquiry(values);
    setErrors(next);
    if (Object.keys(next).length) return;
    setReady(true);
  };
  const field = (key: keyof Enquiry, label: string, placeholder: string) => <div className="form-field"><label htmlFor={`enquiry-${key}`}>{label}</label><input id={`enquiry-${key}`} value={values[key]} onChange={e => update(key, e.target.value)} placeholder={placeholder} autoComplete={key === "name" ? "name" : key === "business" ? "organization" : "off"} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `${key}-error` : undefined} />{errors[key] && <span className="field-error" id={`${key}-error`}>{errors[key]}</span>}</div>;
  return <form className="enquiry-form" onSubmit={submit} noValidate>
    <div className="form-row">{field("name", "Your name *", "What should we call you?")}{field("business", "Business name *", "Your brand or business")}</div>
    <div className="form-row"><div className="form-field"><label htmlFor="service">What do you need? *</label><select id="service" value={values.service} onChange={e => update("service", e.target.value)} aria-invalid={!!errors.service} aria-describedby={errors.service ? "service-error" : undefined}><option value="">Select a service</option><option>Web Development</option><option>Video Editing</option><option>Social Media Management</option><option>AI Solutions & Automation</option><option>A little bit of everything</option></select>{errors.service && <span id="service-error" className="field-error">{errors.service}</span>}</div><div className="form-field"><label htmlFor="budget">Budget range <span>(optional)</span></label><select id="budget" value={values.budget} onChange={e => update("budget", e.target.value)}><option value="">Let’s discuss</option><option>Under ₹15,000</option><option>₹15,000–₹40,000</option><option>₹40,000–₹80,000</option><option>₹80,000+</option></select></div></div>
    {field("contact", "Email or WhatsApp *", "Where can we reach you?")}
    <div className="form-field"><label htmlFor="details">Tell us about your project *</label><textarea id="details" rows={4} value={values.details} onChange={e => update("details", e.target.value)} placeholder="The idea, the goal, the thing you want to change…" aria-invalid={!!errors.details} aria-describedby={errors.details ? "details-error" : undefined} />{errors.details && <span id="details-error" className="field-error">{errors.details}</span>}</div>
    <Button variant="studio" size="lg" type="submit" className="form-submit">Let’s make something great <ArrowUpRight /></Button>
    <p className="form-note">{studioConfig.email || studioConfig.whatsapp ? "Prepare your enquiry, then send it via email or WhatsApp." : "Direct contact is coming soon. Prepare and copy your enquiry — nothing is sent or stored."}</p>
    {ready && <div className="enquiry-result" role="status"><Check size={20} /><div><strong>Your enquiry is ready. Not sent yet.</strong><p>{studioConfig.email || studioConfig.whatsapp ? "Choose a channel below and send your message there." : "The studio’s email and WhatsApp aren’t configured yet. You can copy your enquiry and save it for later."}</p><div className="result-actions">{studioConfig.email && <Button variant="studio" asChild><a href={`mailto:${studioConfig.email}?subject=${encodeURIComponent(`Project enquiry — ${values.business}`)}&body=${encodeURIComponent(enquiryText(values))}`}>Open email <ArrowUpRight /></a></Button>}{studioConfig.whatsapp && <Button variant="studio" asChild><a href={`https://wa.me/${studioConfig.whatsapp}?text=${encodeURIComponent(enquiryText(values))}`} target="_blank" rel="noreferrer">Open WhatsApp <ArrowUpRight /></a></Button>}<Button variant="outline" type="button" onClick={async () => { try { await navigator.clipboard.writeText(enquiryText(values)); setCopied(true); setCopyError(false); } catch { setCopyError(true); } }}><Copy />{copied ? "Copied" : "Copy enquiry"}</Button></div>{copyError && <><p>Copy isn’t available here. Select and copy your enquiry below.</p><textarea aria-label="Prepared enquiry" readOnly value={enquiryText(values)} /></>}</div></div>}
  </form>;
}