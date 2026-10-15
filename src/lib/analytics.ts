/**
 * Privacy-conscious Google Analytics 4 (GA4) integration for KILT STUDIO.
 *
 * Requirements:
 * - Reads VITE_GA_MEASUREMENT_ID from environment.
 * - Strict validation: Must match standard GA4 format (/^G-[A-Za-z0-9]+$/).
 * - No-op when ID is missing, empty, or invalid.
 * - Prevents duplicate script injection and duplicate initialization.
 * - Privacy settings: anonymize_ip: true, allow_google_signals: false, restricted_data_processing: true.
 * - URL sanitization: strips search queries to prevent accidental PII leakage.
 * - Handles client-side navigation page views without duplicate dispatches.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __gaInitialized?: boolean;
    __gaCurrentPath?: string;
  }
}

/**
 * Validates whether a value matches the Google Analytics 4 measurement ID format (G-XXXXXXXXXX).
 */
export function isValidMeasurementId(id: unknown): id is string {
  if (typeof id !== "string") return false;
  const trimmed = id.trim();
  return /^G-[A-Za-z0-9]+$/.test(trimmed) && trimmed.length >= 7 && trimmed.length <= 25;
}

/**
 * Retrieves and validates the GA4 Measurement ID from Vite environment variables.
 * Returns null if not configured, empty, or invalid.
 */
export function getMeasurementId(): string | null {
  const metaEnv = (import.meta as { env?: Record<string, string | undefined> }).env;
  const envId =
    metaEnv?.["VITE_GA_MEASUREMENT_ID"] ||
    (typeof process !== "undefined" ? process.env?.["VITE_GA_MEASUREMENT_ID"] : undefined);
  if (isValidMeasurementId(envId)) {
    return envId.trim();
  }
  return null;
}

/**
 * Sanitizes URL paths before sending to analytics, stripping query parameters to protect user privacy (zero PII).
 */
export function sanitizePath(pathname: string, hash = ""): string {
  try {
    const raw = `${pathname || "/"}${hash || ""}`;
    const parsed = new URL(raw, "http://localhost");
    const cleanHash = parsed.hash ? parsed.hash.split("?")[0] : "";
    return `${parsed.pathname}${cleanHash}`;
  } catch {
    const cleanPath = (pathname || "/").split("?")[0] || "/";
    const cleanHash = (hash || "").split("?")[0] || "";
    return `${cleanPath}${cleanHash}`;
  }
}

/**
 * Initializes Google Analytics 4.
 * Returns true if initialization succeeded, or false if skipped (e.g. invalid ID, SSR, or unconfigured).
 */
export function initGA(measurementId: string): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }
  if (!isValidMeasurementId(measurementId)) {
    return false;
  }
  if (window.__gaInitialized) {
    return true;
  }

  // Set up dataLayer and gtag function
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // Google's tag loader strictly checks that queued commands are Arguments objects
    // (Object.prototype.toString.call(a) === "[object Arguments]" or 'callee' in a).
    // Pushing an Array causes the loader to ignore the commands as gtag API calls.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments);
  };

  // Configure timestamp and privacy-preserving settings
  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    send_page_view: false, // Page views managed explicitly for SPA navigation
    anonymize_ip: true,
    allow_google_signals: false,
    restricted_data_processing: true,
  });

  // Inject async gtag.js script if not present
  const scriptId = "ga4-gtag-script";
  if (!document.getElementById(scriptId)) {
    const script = document.createElement("script");
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
  }

  window.__gaInitialized = true;
  return true;
}

/**
 * Dispatches a page_view event to GA4 if initialized and the path has changed.
 */
export function trackPageView(path?: string): boolean {
  if (typeof window === "undefined") return false;
  const measurementId = getMeasurementId();
  if (!measurementId || !window.gtag || !window.__gaInitialized) {
    return false;
  }

  const currentPath = path || sanitizePath(window.location.pathname, window.location.hash);
  if (window.__gaCurrentPath === currentPath) {
    return false; // Prevent duplicate event for same path
  }

  window.__gaCurrentPath = currentPath;
  window.gtag("event", "page_view", {
    page_path: currentPath,
    page_title: typeof document !== "undefined" ? document.title : "KILT STUDIO",
    page_location:
      typeof window !== "undefined" ? `${window.location.origin}${currentPath}` : undefined,
  });
  return true;
}
