import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getMeasurementId,
  initGA,
  isValidMeasurementId,
  sanitizePath,
  trackPageView,
} from "./analytics";

describe("Analytics Module - GA4 Validation & Privacy", () => {
  beforeEach(() => {
    // Reset window state before each test
    delete window.dataLayer;
    delete window.gtag;
    delete window.__gaInitialized;
    delete window.__gaCurrentPath;
    const existingScript = document.getElementById("ga4-gtag-script");
    if (existingScript) {
      existingScript.remove();
    }
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("isValidMeasurementId", () => {
    it("accepts valid GA4 measurement IDs", () => {
      expect(isValidMeasurementId("G-ABC123456")).toBe(true);
      expect(isValidMeasurementId("G-1A2B3C4D5E")).toBe(true);
      expect(isValidMeasurementId("  G-9999999999  ")).toBe(true);
    });

    it("rejects invalid or malformed measurement IDs", () => {
      expect(isValidMeasurementId("")).toBe(false);
      expect(isValidMeasurementId("   ")).toBe(false);
      expect(isValidMeasurementId(null)).toBe(false);
      expect(isValidMeasurementId(undefined)).toBe(false);
      expect(isValidMeasurementId(12345)).toBe(false);
      expect(isValidMeasurementId("UA-12345678-1")).toBe(false); // Universal Analytics
      expect(isValidMeasurementId("G-")).toBe(false); // Incomplete
      expect(isValidMeasurementId("G-12")).toBe(false); // Too short
      expect(isValidMeasurementId("G-INVALID<script>")).toBe(false); // Malicious payload
      expect(isValidMeasurementId("G-INVALID-EXTRA-SEGMENT")).toBe(false);
    });
  });

  describe("sanitizePath", () => {
    it("strips search parameters to eliminate PII leakage", () => {
      expect(sanitizePath("/contact?email=test@example.com&phone=12345")).toBe("/contact");
      expect(sanitizePath("/services?name=ClientName#web")).toBe("/services#web");
    });

    it("handles root and empty inputs safely", () => {
      expect(sanitizePath("")).toBe("/");
      expect(sanitizePath("/", "#contact")).toBe("/#contact");
      expect(sanitizePath("/#work?tracker=123")).toBe("/#work");
    });
  });

  describe("getMeasurementId", () => {
    it("returns null when VITE_GA_MEASUREMENT_ID is not configured", () => {
      vi.stubEnv("VITE_GA_MEASUREMENT_ID", "");
      expect(getMeasurementId()).toBeNull();
    });

    it("returns trimmed ID when VITE_GA_MEASUREMENT_ID is valid", () => {
      vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-SAMPLE12345");
      expect(getMeasurementId()).toBe("G-SAMPLE12345");
    });

    it("returns null when VITE_GA_MEASUREMENT_ID has invalid format", () => {
      vi.stubEnv("VITE_GA_MEASUREMENT_ID", "INVALID_FORMAT");
      expect(getMeasurementId()).toBeNull();
    });
  });

  describe("initGA", () => {
    it("skips initialization if measurement ID is invalid", () => {
      const result = initGA("not-valid");
      expect(result).toBe(false);
      expect(window.__gaInitialized).toBeUndefined();
      expect(document.getElementById("ga4-gtag-script")).toBeNull();
    });

    it("initializes dataLayer and injects script tag once for valid ID", () => {
      const result = initGA("G-VALID12345");
      expect(result).toBe(true);
      expect(window.__gaInitialized).toBe(true);
      expect(Array.isArray(window.dataLayer)).toBe(true);
      expect(typeof window.gtag).toBe("function");

      const script = document.getElementById("ga4-gtag-script") as HTMLScriptElement;
      expect(script).not.toBeNull();
      expect(script.src).toContain("https://www.googletagmanager.com/gtag/js?id=G-VALID12345");
      expect(script.async).toBe(true);

      // Verify privacy settings in config call (entries in dataLayer are Arguments objects)
      const configEntry = window.dataLayer?.find(
        (entry) =>
          typeof entry === "object" && entry !== null && (entry as IArguments)[0] === "config",
      ) as IArguments | undefined;
      expect(configEntry).toBeDefined();
      expect(configEntry?.[1]).toBe("G-VALID12345");
      expect(configEntry?.[2]).toEqual({
        send_page_view: false,
        anonymize_ip: true,
        allow_google_signals: false,
        restricted_data_processing: true,
      });

      // Subsequent init calls should return true without duplicate script tags
      const secondResult = initGA("G-VALID12345");
      expect(secondResult).toBe(true);
      expect(document.querySelectorAll("#ga4-gtag-script").length).toBe(1);
    });

    it("ensures queued gtag commands use standard Arguments objects for Google tag loader compatibility", () => {
      // Regression test: Google's gtag.js parser specifically validates queued items with:
      // Object.prototype.toString.call(a) === "[object Arguments]" || Object.prototype.hasOwnProperty.call(a, "callee")
      // Pushing JavaScript arrays causes Google's tag loader to silently discard config and event commands.
      initGA("G-VALID12345");
      expect(window.dataLayer).toBeDefined();
      expect(window.dataLayer!.length).toBe(2);

      const isGoogleArguments = (a: unknown): boolean =>
        Boolean(a) &&
        (Object.prototype.toString.call(a) === "[object Arguments]" ||
          Object.prototype.hasOwnProperty.call(a as object, "callee"));

      // Check both 'js' and 'config' entries queued during initialization
      for (const entry of window.dataLayer!) {
        expect(Array.isArray(entry)).toBe(false);
        expect(Object.prototype.toString.call(entry)).toBe("[object Arguments]");
        expect(isGoogleArguments(entry)).toBe(true);
      }

      const jsEntry = window.dataLayer![0] as IArguments;
      expect(jsEntry[0]).toBe("js");
      expect(jsEntry[1]).toBeInstanceOf(Date);

      const configEntry = window.dataLayer![1] as IArguments;
      expect(configEntry[0]).toBe("config");
      expect(configEntry[1]).toBe("G-VALID12345");

      // Verify page_view event dispatch also queues standard Arguments
      vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-VALID12345");
      const tracked = trackPageView("/#work");
      expect(tracked).toBe(true);
      expect(window.dataLayer!.length).toBe(3);

      const eventEntry = window.dataLayer![2] as IArguments;
      expect(Array.isArray(eventEntry)).toBe(false);
      expect(Object.prototype.toString.call(eventEntry)).toBe("[object Arguments]");
      expect(isGoogleArguments(eventEntry)).toBe(true);
      expect(eventEntry[0]).toBe("event");
      expect(eventEntry[1]).toBe("page_view");
      expect(eventEntry[2]).toMatchObject({
        page_path: "/#work",
      });
    });
  });

  describe("trackPageView", () => {
    it("returns false if GA is not initialized", () => {
      expect(trackPageView("/#work")).toBe(false);
    });

    it("dispatches page_view event when initialized and avoids duplicates for same path", () => {
      vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-VALID12345");
      initGA("G-VALID12345");

      const firstTrack = trackPageView("/#work");
      expect(firstTrack).toBe(true);

      // Duplicate track call for same path is ignored
      const duplicateTrack = trackPageView("/#work");
      expect(duplicateTrack).toBe(false);

      // Tracking a new path succeeds
      const newPathTrack = trackPageView("/#services");
      expect(newPathTrack).toBe(true);
    });
  });
});
