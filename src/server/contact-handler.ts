import crypto from "node:crypto";
import { studioConfig, validateEnquiry, type Enquiry } from "../lib/studio-config";

type RateLimitRecord = {
  lastSubmissionTime: number;
  timestamps: number[];
};

type DuplicateRecord = {
  contentHash: string;
  timestamp: number;
};

const COOLDOWN_MS = 10 * 1000; // 10 seconds between submissions
const WINDOW_MS = 15 * 60 * 1000; // 15-minute sliding window
const MAX_REQUESTS_PER_WINDOW = 5;
const DUPLICATE_WINDOW_MS = 5 * 60 * 1000; // 5-minute deduplication window
export const MAX_PAYLOAD_BYTES = 32 * 1024; // 32 KB limit

// Shared in-memory rate limiting and deduplication storage
const rateLimitMap = new Map<string, RateLimitRecord>();
const duplicateMap = new Map<string, DuplicateRecord>();

// Daily rotating salt prevents long-term correlation of hashed client IPs
let currentSalt = crypto.randomBytes(16).toString("hex");
let lastSaltRotation = Date.now();

function getSalt(): string {
  const now = Date.now();
  if (now - lastSaltRotation > 24 * 60 * 60 * 1000) {
    currentSalt = crypto.randomBytes(16).toString("hex");
    lastSaltRotation = now;
  }
  return currentSalt;
}

/**
 * Resets the in-memory rate limiter and deduplication maps (primarily for automated tests).
 */
export function resetRateLimiter(): void {
  rateLimitMap.clear();
  duplicateMap.clear();
}

/**
 * Hashes a client identifier with a secret salt so raw IP addresses are never persisted in memory.
 */
export function hashSource(identifier: string): string {
  return crypto.createHash("sha256").update(`${identifier}:${getSalt()}`).digest("hex");
}

const IPV4_REGEX =
  /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const IPV6_REGEX = /^([0-9a-fA-F]{1,4}:){1,7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;

function sanitizeAndValidateIp(raw: string): string | null {
  let cleaned = raw.trim();
  // Strip port from IPv4 if present (e.g. 192.168.1.1:8080)
  if (cleaned.includes(".") && cleaned.includes(":")) {
    cleaned = cleaned.split(":")[0] ?? cleaned;
  }
  // Strip IPv6 brackets if present [::1]
  cleaned = cleaned.replace(/^\[|\]$/g, "");

  if (IPV4_REGEX.test(cleaned) || IPV6_REGEX.test(cleaned) || cleaned === "127.0.0.1") {
    return cleaned.toLowerCase();
  }
  return null;
}

/**
 * Extracts client IP from trusted reverse proxy headers with strict boundary checks.
 * Prevents client-spoofed headers from bypassing rate limits.
 */
export function extractClientIdentifier(request: Request): string {
  const headers = request.headers;

  // 1. Edge-authenticated headers (tamper-proof when deployed on Vercel or Cloudflare)
  const vercelIp = headers.get("x-vercel-forwarded-for");
  if (vercelIp) {
    const candidate = sanitizeAndValidateIp(vercelIp.split(",")[0] ?? "");
    if (candidate) return candidate;
  }

  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) {
    const candidate = sanitizeAndValidateIp(cfIp);
    if (candidate) return candidate;
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) {
    const candidate = sanitizeAndValidateIp(realIp);
    if (candidate) return candidate;
  }

  // 2. Generic X-Forwarded-For fallback (validated entry)
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ips = forwardedFor.split(",").map((s) => s.trim());
    for (const raw of ips) {
      const candidate = sanitizeAndValidateIp(raw);
      if (candidate) return candidate;
    }
  }

  return "127.0.0.1";
}

/**
 * Checks if the source has exceeded burst or sliding-window rate limits.
 */
export function checkRateLimit(
  sourceHash: string,
  now: number = Date.now(),
): {
  allowed: boolean;
  retryAfterSeconds?: number;
  reason?: string;
} {
  const record = rateLimitMap.get(sourceHash);
  if (!record) {
    return { allowed: true };
  }

  // 1. Burst cooldown check (10s between submissions)
  const timeSinceLast = now - record.lastSubmissionTime;
  if (timeSinceLast < COOLDOWN_MS) {
    const retryAfter = Math.ceil((COOLDOWN_MS - timeSinceLast) / 1000);
    return {
      allowed: false,
      retryAfterSeconds: retryAfter,
      reason: `Please wait ${retryAfter} second(s) before sending another enquiry.`,
    };
  }

  // 2. Sliding window check (5 submissions per 15 minutes)
  const validTimestamps = record.timestamps.filter((t) => now - t < WINDOW_MS);
  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldest = validTimestamps[0] ?? now;
    const retryAfter = Math.max(1, Math.ceil((WINDOW_MS - (now - oldest)) / 1000));
    return {
      allowed: false,
      retryAfterSeconds: retryAfter,
      reason:
        "Too many enquiry attempts. Please try again later or reach out directly on WhatsApp.",
    };
  }

  return { allowed: true };
}

/**
 * Records a successful submission timestamp for rate limiting.
 */
export function recordSubmission(sourceHash: string, now: number = Date.now()): void {
  const record = rateLimitMap.get(sourceHash);
  if (!record) {
    rateLimitMap.set(sourceHash, {
      lastSubmissionTime: now,
      timestamps: [now],
    });
  } else {
    record.lastSubmissionTime = now;
    record.timestamps = record.timestamps.filter((t) => now - t < WINDOW_MS);
    record.timestamps.push(now);
  }
}

/**
 * Computes a hash of the enquiry content to detect rapid duplicate submissions.
 */
export function hashEnquiryContent(sourceHash: string, values: Enquiry): string {
  const content = `${values.name.trim().toLowerCase()}:${values.business.trim().toLowerCase()}:${values.service}:${values.details.trim().slice(0, 100).toLowerCase()}`;
  return crypto.createHash("sha256").update(`${sourceHash}:${content}`).digest("hex");
}

export function isDuplicateSubmission(contentHash: string, now: number = Date.now()): boolean {
  const record = duplicateMap.get(contentHash);
  if (!record) return false;
  if (now - record.timestamp > DUPLICATE_WINDOW_MS) {
    duplicateMap.delete(contentHash);
    return false;
  }
  return true;
}

export function recordDuplicateContent(contentHash: string, now: number = Date.now()): void {
  duplicateMap.set(contentHash, { contentHash, timestamp: now });
}

/**
 * Verifies Cloudflare Turnstile token using official Cloudflare Siteverify API.
 */
export async function verifyTurnstileToken(
  token: string,
  secretKey: string,
  remoteIp?: string,
  fetchFn: typeof fetch = fetch,
): Promise<{ success: boolean; errorCodes?: string[] }> {
  try {
    const params = new URLSearchParams();
    params.append("secret", secretKey);
    params.append("response", token);
    if (remoteIp) {
      params.append("remoteip", remoteIp);
    }

    const res = await fetchFn("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!res.ok) {
      return { success: false, errorCodes: [`http-${res.status}`] };
    }

    const data = (await res.json()) as { success: boolean; "error-codes"?: string[] };
    return {
      success: data.success === true,
      ...(data["error-codes"] ? { errorCodes: data["error-codes"] } : {}),
    };
  } catch {
    return { success: false, errorCodes: ["network-error"] };
  }
}

/**
 * Sanitizes input string by stripping control characters and truncating to max length.
 */
export function sanitizeString(val: unknown, maxLength: number): string {
  if (typeof val !== "string") return "";
  return val
    .split("")
    .filter((ch) => {
      const code = ch.charCodeAt(0);
      return (code >= 32 && code !== 127) || code === 10 || code === 13 || code === 9;
    })
    .join("")
    .trim()
    .slice(0, maxLength);
}

export type ContactHandlerOptions = {
  fetchFn?: typeof fetch;
  turnstileSecretKey?: string;
  forwardDestination?: string;
  now?: number;
};

/**
 * Secure serverless handler for /api/contact.
 */
export async function handleContactSubmission(
  request: Request,
  options: ContactHandlerOptions = {},
): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", Allow: "POST" },
    });
  }

  // 1. Content-Length header verification
  const contentLengthHeader = request.headers.get("content-length");
  if (contentLengthHeader) {
    const length = parseInt(contentLengthHeader, 10);
    if (!isNaN(length) && length > MAX_PAYLOAD_BYTES) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Payload too large. Maximum allowed size is 32 KB.",
        }),
        { status: 413, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  // Read body text and verify actual byte length
  let bodyText: string;
  try {
    bodyText = await request.text();
  } catch {
    return new Response(JSON.stringify({ success: false, error: "Could not read request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (new TextEncoder().encode(bodyText).length > MAX_PAYLOAD_BYTES) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Payload too large. Maximum allowed size is 32 KB.",
      }),
      { status: 413, headers: { "Content-Type": "application/json" } },
    );
  }

  // 2. Parse JSON safely
  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(bodyText);
    if (!raw || typeof raw !== "object") throw new Error();
  } catch {
    return new Response(JSON.stringify({ success: false, error: "Invalid JSON format" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 3. Server-side honeypot evaluation
  // If honeypot is filled, return fake success to deceive automated bots without sending email
  const honey = typeof raw["_honey"] === "string" ? (raw["_honey"] as string).trim() : "";
  if (honey !== "") {
    return new Response(
      JSON.stringify({
        success: true,
        message: "Enquiry received.",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  // 4. Server-side rate limiting
  const clientIp = extractClientIdentifier(request);
  const sourceHash = hashSource(clientIp);
  const now = options.now ?? Date.now();

  const rateLimitStatus = checkRateLimit(sourceHash, now);
  if (!rateLimitStatus.allowed) {
    return new Response(
      JSON.stringify({
        success: false,
        error: rateLimitStatus.reason || "Too many requests. Please try again later.",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(rateLimitStatus.retryAfterSeconds ?? 10),
        },
      },
    );
  }

  // 5. Cloudflare Turnstile verification
  const turnstileSecret =
    options.turnstileSecretKey ??
    process.env["TURNSTILE_SECRET_KEY"] ??
    process.env["CLOUDFLARE_TURNSTILE_SECRET_KEY"];

  if (turnstileSecret) {
    const token =
      typeof raw["turnstileToken"] === "string" ? (raw["turnstileToken"] as string).trim() : "";
    if (!token) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Verification challenge missing. Please complete the verification.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const verification = await verifyTurnstileToken(
      token,
      turnstileSecret,
      clientIp,
      options.fetchFn ?? fetch,
    );

    if (!verification.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Verification challenge failed. Please try submitting again.",
        }),
        { status: 403, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  // 6. Input sanitization and server-side validation
  const values: Enquiry = {
    name: sanitizeString(raw["name"], 100),
    business: sanitizeString(raw["business"], 120),
    service: sanitizeString(raw["service"], 60),
    budget: sanitizeString(raw["budget"], 40),
    details: sanitizeString(raw["details"], 3000),
    contact: sanitizeString(raw["contact"], 100),
  };

  const validationErrors = validateEnquiry(values);
  if (Object.keys(validationErrors).length > 0) {
    const firstField = Object.keys(validationErrors)[0] as keyof Enquiry;
    return new Response(
      JSON.stringify({
        success: false,
        error: validationErrors[firstField] || "Validation failed",
        errors: validationErrors,
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // 7. Duplicate content detection
  const contentHash = hashEnquiryContent(sourceHash, values);
  if (isDuplicateSubmission(contentHash, now)) {
    return new Response(
      JSON.stringify({
        success: true,
        message:
          "Enquiry already received. We review all briefs promptly and will get back to you shortly.",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  // Update rate limiter and deduplication records
  recordSubmission(sourceHash, now);
  recordDuplicateContent(contentHash, now);

  // 8. Server-to-server forward to email delivery service
  const targetEmail =
    options.forwardDestination || process.env["CONTACT_EMAIL"] || studioConfig.email;
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contact);

  const forwardPayload = {
    name: values.name,
    business: values.business,
    email: isEmail ? values.contact : targetEmail,
    contact: values.contact,
    service: values.service,
    budget: values.budget || "Not specified",
    message: values.details,
    _subject: `New Project Enquiry: ${values.business || values.name} — KILT STUDIO`,
    _template: "table",
    _captcha: "false",
    _honey: "",
  };

  const forwardEndpoint = `https://formsubmit.co/ajax/${encodeURIComponent(targetEmail)}`;
  const fetchFn = options.fetchFn ?? fetch;

  try {
    const forwardRes = await fetchFn(forwardEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(forwardPayload),
    });

    if (!forwardRes.ok) {
      throw new Error(`HTTP ${forwardRes.status}`);
    }

    const data = (await forwardRes.json()) as { success?: string | boolean; message?: string };

    if (data.success === "true" || data.success === true) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (typeof data.message === "string" && data.message.toLowerCase().includes("activation")) {
      return new Response(
        JSON.stringify({
          success: false,
          activation: true,
          message: data.message,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: data.message || "Email delivery service could not accept enquiry.",
      }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  } catch {
    return new Response(
      JSON.stringify({
        success: false,
        error:
          "Unable to connect to email delivery service right now. Please retry or contact us directly on WhatsApp.",
      }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }
}
