import { describe, expect, it, beforeEach } from "vitest";
import {
  handleContactSubmission,
  resetRateLimiter,
  hashSource,
  extractClientIdentifier,
  MAX_PAYLOAD_BYTES,
} from "./contact-handler";

const validPayload = {
  name: "Anuj Dhavane",
  business: "KILT Partner Café",
  service: "Web Development",
  budget: "₹15,000–₹40,000",
  contact: "partner@example.com",
  details: "We are expanding our café branch and need a full digital menu and landing page.",
  _honey: "",
};

function createMockRequest(
  body: unknown,
  options: {
    ip?: string;
    method?: string;
    contentLength?: number;
    rawText?: string;
  } = {},
): Request {
  const method = options.method || "POST";
  const bodyText =
    options.rawText !== undefined
      ? options.rawText
      : typeof body === "string"
        ? body
        : JSON.stringify(body);

  const headers = new Headers({
    "Content-Type": "application/json",
  });

  if (options.ip) {
    headers.set("x-forwarded-for", options.ip);
  }

  if (options.contentLength !== undefined) {
    headers.set("content-length", String(options.contentLength));
  } else if (method === "POST") {
    headers.set("content-length", String(new TextEncoder().encode(bodyText).length));
  }

  const init: RequestInit = {
    method,
    headers,
  };
  if (method !== "GET" && method !== "HEAD") {
    init.body = bodyText;
  }

  return new Request("http://localhost:5173/api/contact", init);
}

describe("Server-Side Contact Security & Submission Handler", () => {
  beforeEach(() => {
    resetRateLimiter();
  });

  describe("HTTP Method & Payload Size Controls", () => {
    it("rejects non-POST HTTP methods with 405 Method Not Allowed", async () => {
      const req = createMockRequest(validPayload, { method: "GET" });
      const res = await handleContactSubmission(req);
      expect(res.status).toBe(405);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("Method not allowed");
    });

    it("rejects oversized Content-Length header with 413 Payload Too Large", async () => {
      const req = createMockRequest(validPayload, { contentLength: MAX_PAYLOAD_BYTES + 1024 });
      const res = await handleContactSubmission(req);
      expect(res.status).toBe(413);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain("Payload too large");
    });

    it("rejects oversized body bytes with 413 Payload Too Large", async () => {
      const largeString = "A".repeat(MAX_PAYLOAD_BYTES + 500);
      const req = createMockRequest(null, { rawText: largeString });
      const res = await handleContactSubmission(req);
      expect(res.status).toBe(413);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain("Payload too large");
    });

    it("rejects invalid JSON payloads with 400 Bad Request", async () => {
      const req = createMockRequest(null, { rawText: "{ not-valid-json " });
      const res = await handleContactSubmission(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid JSON format");
    });
  });

  describe("Honeypot Spam Defense", () => {
    it("silently traps automated bots when honeypot field is filled", async () => {
      let forwarded = false;
      const mockFetch = async () => {
        forwarded = true;
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      };

      const botPayload = {
        ...validPayload,
        _honey: "https://spam-link.ru/buy-now",
      };

      const req = createMockRequest(botPayload, { ip: "198.51.100.5" });
      const res = await handleContactSubmission(req, { fetchFn: mockFetch });

      // Returns fake success to deceive the spammer
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);

      // Crucial: Forwarding to email was NEVER executed
      expect(forwarded).toBe(false);
    });
  });

  describe("Input Validation & Sanitization", () => {
    it("rejects submissions with missing or whitespace-only name", async () => {
      const req = createMockRequest({ ...validPayload, name: "   " }, { ip: "192.0.2.1" });
      const res = await handleContactSubmission(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain("Please enter your name");
    });

    it("rejects submissions with missing business name", async () => {
      const req = createMockRequest({ ...validPayload, business: "" }, { ip: "192.0.2.2" });
      const res = await handleContactSubmission(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain("Please enter your business name");
    });

    it("rejects submissions with invalid contact string", async () => {
      const req = createMockRequest(
        { ...validPayload, contact: "invalid-contact-info" },
        { ip: "192.0.2.3" },
      );
      const res = await handleContactSubmission(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain("valid email or WhatsApp number");
    });

    it("rejects submissions with insufficient details (< 20 chars)", async () => {
      const req = createMockRequest({ ...validPayload, details: "Short" }, { ip: "192.0.2.4" });
      const res = await handleContactSubmission(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain("at least 20 characters");
    });

    it("sanitizes dangerous control characters from inputs", async () => {
      let forwardedPayload: Record<string, string> | null = null;
      const mockFetch = async (_url: string | URL | Request, init?: RequestInit) => {
        forwardedPayload = JSON.parse(init?.body as string);
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      };

      const payloadWithControlChars = {
        ...validPayload,
        name: "Anuj\x00\x08 Dhavane",
        business: "Clean\x1F Café",
      };

      const req = createMockRequest(payloadWithControlChars, { ip: "192.0.2.5" });
      const res = await handleContactSubmission(req, { fetchFn: mockFetch });
      expect(res.status).toBe(200);
      expect(forwardedPayload).not.toBeNull();
      expect(forwardedPayload!["name"]).toBe("Anuj Dhavane");
      expect(forwardedPayload!["business"]).toBe("Clean Café");
    });
  });

  describe("Cloudflare Turnstile Verification", () => {
    it("fails with 400 if Turnstile secret is configured but token is missing", async () => {
      const req = createMockRequest(validPayload, { ip: "192.0.2.10" });
      const res = await handleContactSubmission(req, {
        turnstileSecretKey: "1x0000000000000000000000000000000AA",
      });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain("Verification challenge missing");
    });

    it("fails with 403 if Turnstile verification API rejects the token", async () => {
      const mockTurnstileFetch = async (url: string | URL | Request) => {
        if (String(url).includes("siteverify")) {
          return new Response(
            JSON.stringify({ success: false, "error-codes": ["invalid-token"] }),
            {
              status: 200,
            },
          );
        }
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      };

      const req = createMockRequest(
        { ...validPayload, turnstileToken: "bad-token-123" },
        { ip: "192.0.2.11" },
      );

      const res = await handleContactSubmission(req, {
        turnstileSecretKey: "1x0000000000000000000000000000000AA",
        fetchFn: mockTurnstileFetch,
      });

      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain("Verification challenge failed");
    });

    it("succeeds when Turnstile verification API validates the token", async () => {
      let turnstileVerified = false;
      let emailForwarded = false;

      const mockTurnstileFetch = async (url: string | URL | Request) => {
        if (String(url).includes("siteverify")) {
          turnstileVerified = true;
          return new Response(JSON.stringify({ success: true }), { status: 200 });
        }
        emailForwarded = true;
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      };

      const req = createMockRequest(
        { ...validPayload, turnstileToken: "valid-turnstile-token" },
        { ip: "192.0.2.12" },
      );

      const res = await handleContactSubmission(req, {
        turnstileSecretKey: "1x0000000000000000000000000000000AA",
        fetchFn: mockTurnstileFetch,
      });

      expect(res.status).toBe(200);
      expect(turnstileVerified).toBe(true);
      expect(emailForwarded).toBe(true);
    });
  });

  describe("Rate Limiting & Privacy Controls", () => {
    it("enforces a 10-second burst cooldown between submissions from the same source", async () => {
      const mockFetch = async () =>
        new Response(JSON.stringify({ success: true }), { status: 200 });
      const ip = "203.0.113.50";
      const baseTime = 1700000000000;

      // 1st request at T=0s
      const req1 = createMockRequest(validPayload, { ip });
      const res1 = await handleContactSubmission(req1, { fetchFn: mockFetch, now: baseTime });
      expect(res1.status).toBe(200);

      // 2nd request at T=2s (violates 10s cooldown)
      const diffPayload = {
        ...validPayload,
        details: "Different details to avoid duplicate check 123",
      };
      const req2 = createMockRequest(diffPayload, { ip });
      const res2 = await handleContactSubmission(req2, {
        fetchFn: mockFetch,
        now: baseTime + 2000,
      });

      expect(res2.status).toBe(429);
      expect(res2.headers.get("Retry-After")).toBe("8");
      const data2 = await res2.json();
      expect(data2.success).toBe(false);
      expect(data2.error).toContain("Please wait");

      // 3rd request at T=11s (satisfies 10s cooldown)
      const req3 = createMockRequest(diffPayload, { ip });
      const res3 = await handleContactSubmission(req3, {
        fetchFn: mockFetch,
        now: baseTime + 11000,
      });
      expect(res3.status).toBe(200);
    });

    it("enforces sliding-window limit of max 5 submissions per 15 minutes", async () => {
      const mockFetch = async () =>
        new Response(JSON.stringify({ success: true }), { status: 200 });
      const ip = "203.0.113.60";
      const baseTime = 1700000000000;

      // Send 5 valid requests at 11s intervals
      for (let i = 0; i < 5; i++) {
        const payload = {
          ...validPayload,
          details: `Unique project detail sequence #${i} with more than twenty characters.`,
        };
        const req = createMockRequest(payload, { ip });
        const res = await handleContactSubmission(req, {
          fetchFn: mockFetch,
          now: baseTime + i * 11000,
        });
        expect(res.status).toBe(200);
      }

      // 6th request within window -> 429
      const payload6 = {
        ...validPayload,
        details: "Sixth submission attempt that should be blocked by window limit.",
      };
      const req6 = createMockRequest(payload6, { ip });
      const res6 = await handleContactSubmission(req6, {
        fetchFn: mockFetch,
        now: baseTime + 5 * 11000,
      });
      expect(res6.status).toBe(429);
      const data6 = await res6.json();
      expect(data6.error).toContain("Too many enquiry attempts");
    });

    it("hashes IP addresses with salt and does not retain raw IP in memory", () => {
      const rawIp = "203.0.113.99";
      const hash1 = hashSource(rawIp);
      const hash2 = hashSource(rawIp);

      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(rawIp);
      expect(hash1).toMatch(/^[a-f0-9]{64}$/);
    });

    it("correctly extracts client IP from proxy headers", () => {
      const reqWithVercelHeader = new Request("http://localhost:5173/api/contact", {
        headers: { "x-vercel-forwarded-for": "198.51.100.22, 10.0.0.1" },
      });
      expect(extractClientIdentifier(reqWithVercelHeader)).toBe("198.51.100.22");
    });

    it("prioritizes x-vercel-forwarded-for over client-spoofed x-forwarded-for headers", () => {
      const spoofedReq = new Request("http://localhost:5173/api/contact", {
        headers: {
          "x-vercel-forwarded-for": "198.51.100.55",
          "x-forwarded-for": "1.2.3.4, 5.6.7.8",
        },
      });
      expect(extractClientIdentifier(spoofedReq)).toBe("198.51.100.55");
    });

    it("strips port numbers from IPv4 addresses", () => {
      const reqWithPort = new Request("http://localhost:5173/api/contact", {
        headers: { "x-vercel-forwarded-for": "203.0.113.44:54321" },
      });
      expect(extractClientIdentifier(reqWithPort)).toBe("203.0.113.44");
    });

    it("safely falls back to 127.0.0.1 if headers contain malformed garbage", () => {
      const junkReq = new Request("http://localhost:5173/api/contact", {
        headers: { "x-forwarded-for": "; DROP TABLE users; --" },
      });
      expect(extractClientIdentifier(junkReq)).toBe("127.0.0.1");
    });
  });

  describe("Deduplication Controls", () => {
    it("deduplicates identical enquiries sent from the same source within 5 minutes", async () => {
      let forwardedCount = 0;
      const mockFetch = async () => {
        forwardedCount++;
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      };

      const ip = "192.0.2.77";
      const baseTime = 1700000000000;

      // 1st submission
      const req1 = createMockRequest(validPayload, { ip });
      const res1 = await handleContactSubmission(req1, { fetchFn: mockFetch, now: baseTime });
      expect(res1.status).toBe(200);
      expect(forwardedCount).toBe(1);

      // Duplicate submission sent at T=15s (after cooldown, but identical content)
      const req2 = createMockRequest(validPayload, { ip });
      const res2 = await handleContactSubmission(req2, {
        fetchFn: mockFetch,
        now: baseTime + 15000,
      });
      expect(res2.status).toBe(200);
      const data2 = await res2.json();
      expect(data2.message).toContain("already received");

      // Verify email delivery was NOT called twice
      expect(forwardedCount).toBe(1);
    });
  });

  describe("Email Delivery Preservation & Error Handling", () => {
    it("forwards legitimate enquiry to FormSubmit and returns 200 success", async () => {
      let forwardedUrl = "";
      let forwardedBody: Record<string, string> | null = null;

      const mockFetch = async (url: string | URL | Request, init?: RequestInit) => {
        forwardedUrl = String(url);
        forwardedBody = JSON.parse(init?.body as string);
        return new Response(JSON.stringify({ success: "true" }), { status: 200 });
      };

      const req = createMockRequest(validPayload, { ip: "192.0.2.88" });
      const res = await handleContactSubmission(req, { fetchFn: mockFetch });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);

      expect(forwardedUrl).toContain("https://formsubmit.co/ajax/kiltstudio10%40gmail.com");
      expect(forwardedBody).not.toBeNull();
      expect(forwardedBody!["name"]).toBe(validPayload.name);
      expect(forwardedBody!["business"]).toBe(validPayload.business);
      expect(forwardedBody!["contact"]).toBe(validPayload.contact);
      expect(forwardedBody!["email"]).toBe(validPayload.contact);
    });

    it("handles FormSubmit first-time activation response cleanly", async () => {
      const mockFetch = async () =>
        new Response(
          JSON.stringify({
            success: false,
            message: "Activation email has been sent to kiltstudio10@gmail.com",
          }),
          { status: 200 },
        );

      const req = createMockRequest(validPayload, { ip: "192.0.2.89" });
      const res = await handleContactSubmission(req, { fetchFn: mockFetch });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.activation).toBe(true);
      expect(data.message).toContain("Activation email has been sent");
    });

    it("handles delivery service network errors with 502 Bad Gateway and user advice", async () => {
      const mockFetch = async () => {
        throw new Error("Network timeout connecting to FormSubmit");
      };

      const req = createMockRequest(validPayload, { ip: "192.0.2.90" });
      const res = await handleContactSubmission(req, { fetchFn: mockFetch });

      expect(res.status).toBe(502);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain("Unable to connect to email delivery service");
    });
  });
});
