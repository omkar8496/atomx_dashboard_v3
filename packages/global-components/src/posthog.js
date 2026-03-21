import posthog from "posthog-js";

let posthogReady = false;
let gaConfigured = false;

const FALLBACK_GA_MEASUREMENT_ID = "G-HMEGGM1C7N";

function getEnv() {
  return {
    key: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    gaMeasurementId:
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || FALLBACK_GA_MEASUREMENT_ID
  };
}

function initGoogleAnalytics(app = "portal") {
  if (typeof window === "undefined") return false;
  const { gaMeasurementId } = getEnv();
  if (!gaMeasurementId) return false;

  if (!window.dataLayer) {
    window.dataLayer = [];
  }
  if (typeof window.gtag !== "function") {
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
  }

  if (!gaConfigured) {
    window.gtag("js", new Date());
    window.gtag("config", gaMeasurementId, {
      app_name: app
    });
    gaConfigured = true;
  }

  if (!document.getElementById("atomx-ga4-script")) {
    const script = document.createElement("script");
    script.id = "atomx-ga4-script";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaMeasurementId)}`;
    document.head.appendChild(script);
  }

  return true;
}

function buildGaPayload(properties = {}) {
  const payload = {};
  Object.entries(properties || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    // Avoid sending email/PII-like fields into GA4 custom events.
    if (key.toLowerCase().includes("email")) return;
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      payload[key] = value;
    }
  });
  return payload;
}

export function initPostHog(app = "portal") {
  initGoogleAnalytics(app);
  if (typeof window === "undefined") return false;
  if (posthogReady || posthog.__loaded) {
    posthogReady = true;
    return true;
  }

  const { key, host } = getEnv();
  if (!key || !host) return false;

  posthog.init(key, {
    api_host: host,
    capture_pageview: true,
    capture_pageleave: true,
    persistence: "localStorage+cookie",
    loaded: () => {
      posthogReady = true;
      posthog.register({ app });
    }
  });

  return true;
}

export function capturePostHogEvent(eventName, properties = {}) {
  if (typeof window === "undefined") return;
  initPostHog();
  const gaPayload = buildGaPayload(properties);
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, gaPayload);
  }
  if (!posthog.__loaded) return;
  posthog.capture(eventName, properties);
}

export function identifyPostHogUser(distinctId, properties = {}) {
  if (typeof window === "undefined" || !distinctId) return;
  initPostHog();
  if (!posthog.__loaded) return;
  posthog.identify(String(distinctId), properties);
}

export function resetPostHogUser() {
  if (typeof window === "undefined") return;
  if (!posthog.__loaded) return;
  posthog.reset();
}
