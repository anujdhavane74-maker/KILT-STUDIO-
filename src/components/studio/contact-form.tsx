import { useState, useRef, useEffect, type FormEvent } from "react";
import { ArrowUpRight, Check, Copy, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  studioConfig,
  validateEnquiry,
  enquiryText,
  getWhatsAppUrl,
  type Enquiry,
} from "@/lib/studio-config";
import { WhatsAppIcon } from "@/components/studio/whatsapp-icon";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "auto" | "light" | "dark";
          size?: "normal" | "flexible" | "compact";
        },
      ) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId?: string) => void;
    };
  }
}

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
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileContainerRef = useRef<HTMLDivElement>(null);

  const turnstileSiteKey =
    typeof window !== "undefined"
      ? (import.meta.env["VITE_TURNSTILE_SITE_KEY"] as string | undefined)
      : undefined;

  // Cloudflare Turnstile progressive integration
  useEffect(() => {
    if (!turnstileSiteKey || !turnstileContainerRef.current) return;

    let widgetId: string | undefined;

    const renderTurnstile = () => {
      if (window.turnstile && turnstileContainerRef.current) {
        try {
          widgetId = window.turnstile.render(turnstileContainerRef.current, {
            sitekey: turnstileSiteKey,
            callback: (token: string) => setTurnstileToken(token),
            "expired-callback": () => setTurnstileToken(""),
            "error-callback": () => setTurnstileToken(""),
            theme: "dark",
            size: "flexible",
          });
        } catch {
          // ignore error if widget already attached
        }
      }
    };

    if (window.turnstile) {
      renderTurnstile();
    } else {
      const scriptId = "cloudflare-turnstile-script";
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          if (window.turnstile) renderTurnstile();
        };
        document.head.appendChild(script);
      }
    }

    return () => {
      if (widgetId && window.turnstile) {
        try {
          window.turnstile.remove(widgetId);
        } catch {
          // ignore
        }
      }
    };
  }, [turnstileSiteKey]);

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

    // Honeypot check: if filled by bot, silently claim success in UI
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
      const payload = {
        name: values.name.trim(),
        business: values.business.trim(),
        contact: values.contact.trim(),
        service: values.service,
        budget: values.budget || "Not specified",
        details: values.details.trim(),
        _honey: honey,
        turnstileToken: turnstileToken || undefined,
      };

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean | string;
        activation?: boolean;
        message?: string;
        error?: string;
      };

      if (!res.ok && res.status !== 200) {
        if (res.status === 429) {
          throw new Error(
            data.error || "Too many enquiry attempts. Please wait a moment before trying again.",
          );
        }
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      if (data.success === "true" || data.success === true) {
        setStatus("success");
      } else if (
        data.activation === true ||
        (typeof data.message === "string" && data.message.toLowerCase().includes("activation"))
      ) {
        setStatus("activation");
      } else {
        setStatus("error");
        setErrorMessage(
          data.error || data.message || "Submission was not accepted. Please try again.",
        );
      }
    } catch (err: unknown) {
      setStatus("error");
      const msg = err instanceof Error ? err.message : "";
      setErrorMessage(
        msg ||
          "Unable to connect to email delivery service right now. Your details have been preserved below so you can retry or contact us directly on WhatsApp.",
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

      {/* Cloudflare Turnstile human verification container (progressive enhancement) */}
      {turnstileSiteKey && (
        <div
          ref={turnstileContainerRef}
          className="turnstile-wrapper"
          aria-label="Security check"
        />
      )}

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

      {studioConfig.whatsapp && (
        <div className="form-whatsapp-alternative">
          <span>Prefer direct messaging?</span>{" "}
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="form-whatsapp-link"
            aria-label="Chat directly on WhatsApp (opens in new tab)"
          >
            <WhatsAppIcon size={14} aria-hidden="true" />
            <span>Chat on WhatsApp</span>
            <ArrowUpRight size={12} aria-hidden="true" />
          </a>
        </div>
      )}

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
              {studioConfig.whatsapp && (
                <Button variant="studio" size="sm" asChild>
                  <a
                    href={getWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Chat directly on WhatsApp (opens in new tab)"
                  >
                    <WhatsAppIcon size={14} aria-hidden="true" />
                    <span>Chat on WhatsApp</span>
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                </Button>
              )}
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
