import posthog from "posthog-js";

let posthogReady = false;
let gaConfigured = false;

const FALLBACK_GA_MEASUREMENT_ID = "G-HMEGGM1C7N";
const ANALYTICS_CONSENT_KEY = "atomx.analytics.consent.v1";

function getConsentPayload() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function getEnv() {
  return {
    key: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    gaMeasurementId:
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || FALLBACK_GA_MEASUREMENT_ID
  };
}

function hasAnalyticsConsent() {
  const payload = getConsentPayload();
  return payload?.analytics === true;
}

function applyGaConsent(granted) {
  if (typeof window === "undefined") return;
  const { gaMeasurementId } = getEnv();
  if (!gaMeasurementId) return;

  window[`ga-disable-${gaMeasurementId}`] = !granted;
  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      analytics_storage: granted ? "granted" : "denied"
    });
  }
}

function initGoogleAnalytics(app = "portal") {
  if (typeof window === "undefined") return false;
  if (!hasAnalyticsConsent()) return false;
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
  if (!hasAnalyticsConsent()) return false;
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
  if (!hasAnalyticsConsent()) return;
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
  if (!hasAnalyticsConsent()) return;
  initPostHog();
  if (!posthog.__loaded) return;
  posthog.identify(String(distinctId), properties);
}

export function resetPostHogUser() {
  if (typeof window === "undefined") return;
  if (!posthog.__loaded) return;
  posthog.reset();
}

export function getAnalyticsConsent() {
  const payload = getConsentPayload();
  if (!payload) return null;
  return payload.analytics === true ? "granted" : "denied";
}

export function setAnalyticsConsent(granted, app = "portal") {
  if (typeof window === "undefined") return;

  const payload = {
    version: 1,
    analytics: Boolean(granted),
    updatedAt: Date.now()
  };
  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_KEY, JSON.stringify(payload));
  } catch {
    // ignore storage failures
  }

  applyGaConsent(Boolean(granted));

  if (granted) {
    initPostHog(app);
    if (posthog.__loaded) {
      posthog.opt_in_capturing();
    }
    return;
  }

  if (posthog.__loaded) {
    posthog.opt_out_capturing();
    posthog.reset();
  }
}
