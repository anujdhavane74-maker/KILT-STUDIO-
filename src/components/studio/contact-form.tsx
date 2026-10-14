import { useState, type FormEvent } from "react";
import { ArrowUpRight, Check, Copy, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { studioConfig, validateEnquiry, enquiryText, type Enquiry } from "@/lib/studio-config";

export function ContactForm() {
  const [values, setValues] = useState<Enquiry>({
    name: "",
    business: "",
    service: "",
    budget: "",
    details: "",
    contact: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Enquiry, string>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "activation" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [honey, setHoney] = useState("");

  const update = (key: keyof Enquiry, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) {
      setErrors((e) => {
        const next = { ...e };
        delete next[key];
        return next;
      });
    }
    if (status === "error" || status === "activation") {
      setStatus("idle");
    }
    setCopied(false);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (status === "submitting") return;

    // Honeypot spam protection: if filled, silently ignore bot submission
    if (honey.trim() !== "") {
      setStatus("success");
      return;
    }

    const next = validateEnquiry(values);
    setErrors(next);
    if (Object.keys(next).length > 0) {
      const firstKey = Object.keys(next)[0] as keyof Enquiry;
      document.getElementById(`enquiry-${firstKey}`)?.focus();
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isEmail = emailRegex.test(values.contact.trim());

      const payload = {
        name: values.name.trim(),
        business: values.business.trim(),
        email: isEmail ? values.contact.trim() : studioConfig.email,
        contact: values.contact.trim(),
        service: values.service,
        budget: values.budget || "Not specified",
        message: values.details.trim(),
        _subject: `New Project Enquiry: ${values.business || values.name} — KILT STUDIO`,
        _template: "table",
        _captcha: "false",
        _honey: "",
      };

      const endpoint = `https://formsubmit.co/ajax/${encodeURIComponent(studioConfig.email)}`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = (await res.json()) as { success?: string | boolean; message?: string };

      if (data.success === "true" || data.success === true) {
        setStatus("success");
      } else if (
        typeof data.message === "string" &&
        data.message.toLowerCase().includes("activation")
      ) {
        setStatus("activation");
      } else {
        setStatus("error");
        setErrorMessage(data.message || "Submission was not accepted. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMessage(
        "Unable to connect to email delivery service right now. Your details have been preserved below so you can retry or copy your enquiry.",
      );
    }
  };

  const field = (key: keyof Enquiry, label: string, placeholder: string) => (
    <div className="form-field">
      <label htmlFor={`enquiry-${key}`}>{label}</label>
      <input
        id={`enquiry-${key}`}
        value={values[key]}
        onChange={(e) => update(key, e.target.value)}
        placeholder={placeholder}
        autoComplete={key === "name" ? "name" : key === "business" ? "organization" : "off"}
        aria-invalid={!!errors[key]}
        aria-describedby={errors[key] ? `${key}-error` : undefined}
      />
      {errors[key] && (
        <span className="field-error" id={`${key}-error`} role="alert">
          {errors[key]}
        </span>
      )}
    </div>
  );

  return (
    <form className="enquiry-form" onSubmit={submit} noValidate>
      {/* Honeypot field for bot spam prevention */}
      <input
        type="text"
        name="_honey"
        value={honey}
        onChange={(e) => setHoney(e.target.value)}
        style={{ display: "none" }}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div className="form-row">
        {field("name", "Your name *", "What should we call you?")}
        {field("business", "Business name *", "Your brand or business")}
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="enquiry-service">What do you need? *</label>
          <select
            id="enquiry-service"
            value={values.service}
            onChange={(e) => update("service", e.target.value)}
            aria-invalid={!!errors.service}
            aria-describedby={errors.service ? "service-error" : undefined}
          >
            <option value="">Select a service</option>
            <option>Web Development</option>
            <option>Video Editing</option>
            <option>Social Media Management</option>
            <option>AI Solutions & Automation</option>
            <option>A little bit of everything</option>
          </select>
          {errors.service && (
            <span id="service-error" className="field-error" role="alert">
              {errors.service}
            </span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="enquiry-budget">
            Budget range <span>(optional)</span>
          </label>
          <select
            id="enquiry-budget"
            value={values.budget}
            onChange={(e) => update("budget", e.target.value)}
          >
            <option value="">Let’s discuss</option>
            <option>Under ₹15,000</option>
            <option>₹15,000–₹40,000</option>
            <option>₹40,000–₹80,000</option>
            <option>₹80,000+</option>
          </select>
        </div>
      </div>

      {field("contact", "Email or WhatsApp *", "Where can we reach you?")}

      <div className="form-field">
        <label htmlFor="enquiry-details">Tell us about your project *</label>
        <textarea
          id="enquiry-details"
          rows={4}
          value={values.details}
          onChange={(e) => update("details", e.target.value)}
          placeholder="The idea, the goal, the thing you want to change…"
          aria-invalid={!!errors.details}
          aria-describedby={errors.details ? "details-error" : undefined}
        />
        {errors.details && (
          <span id="details-error" className="field-error" role="alert">
            {errors.details}
          </span>
        )}
      </div>

      <Button
        variant="studio"
        size="lg"
        type="submit"
        className="form-submit"
        disabled={status === "submitting"}
        aria-busy={status === "submitting"}
      >
        {status === "submitting" ? (
          <>
            Sending enquiry... <Loader2 className="animate-spin" size={17} />
          </>
        ) : (
          <>
            Send project enquiry <ArrowUpRight />
          </>
        )}
      </Button>

      <p className="privacy-note">
        We respect your privacy. Your information is only used by KILT STUDIO to review and respond
        to your project enquiry.
      </p>

      {status === "success" && (
        <div className="enquiry-result enquiry-success" role="status" aria-live="polite">
          <Check size={20} />
          <div>
            <strong>Enquiry sent successfully!</strong>
            <p>
              Thank you, {values.name}. Your enquiry for <strong>{values.business}</strong> has been
              delivered to KILT STUDIO. We review all briefs promptly and will get back to you
              within 24 hours.
            </p>
            <div className="result-actions">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => {
                  setValues({
                    name: "",
                    business: "",
                    service: "",
                    budget: "",
                    details: "",
                    contact: "",
                  });
                  setStatus("idle");
                  setErrors({});
                }}
              >
                Send another enquiry
              </Button>
            </div>
          </div>
        </div>
      )}

      {status === "activation" && (
        <div className="enquiry-result enquiry-activation" role="status" aria-live="polite">
          <AlertCircle size={20} />
          <div>
            <strong>First-time inbox activation needed</strong>
            <p>
              FormSubmit has sent an activation link to <strong>{studioConfig.email}</strong>. Once
              the inbox owner clicks “Activate Form”, all future client submissions will arrive
              directly in your inbox.
            </p>
            <div className="result-actions">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(enquiryText(values));
                    setCopied(true);
                  } catch {
                    // ignore
                  }
                }}
              >
                <Copy size={14} />
                {copied ? "Copied" : "Copy enquiry text"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="enquiry-result enquiry-error" role="alert" aria-live="polite">
          <AlertCircle size={20} />
          <div>
            <strong>Could not deliver enquiry</strong>
            <p>{errorMessage}</p>
            <div className="result-actions">
              <Button variant="studio" size="sm" type="submit">
                Try again <ArrowUpRight size={14} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(enquiryText(values));
                    setCopied(true);
                  } catch {
                    // ignore
                  }
                }}
              >
                <Copy size={14} />
                {copied ? "Copied" : "Copy enquiry text"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
