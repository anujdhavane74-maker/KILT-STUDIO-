import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import { getMeasurementId, initGA, sanitizePath, trackPageView } from "@/lib/analytics";

/**
 * Privacy-preserving Analytics Tracker component.
 * Automatically initializes GA4 if VITE_GA_MEASUREMENT_ID is configured with a valid format.
 * Listens to client-side route changes and tracks page views with zero PII.
 */
export function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    const measurementId = getMeasurementId();
    if (!measurementId) return;

    initGA(measurementId);
    const sanitized = sanitizePath(location.pathname, location.hash);
    trackPageView(sanitized);
  }, [location.pathname, location.hash]);

  return null;
}
