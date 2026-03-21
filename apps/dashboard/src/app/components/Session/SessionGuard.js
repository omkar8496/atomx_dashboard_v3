"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { decodeJwt } from "@atomx/lib";
import {
  capturePostHogEvent,
  identifyPostHogUser
} from "@atomx/global-components";
import { useDashboardStore } from "../../../store/dashboardStore";
import SessionPrompt from "./SessionPrompt";

const WARNING_WINDOW_MS = 10 * 60 * 1000;
const REAUTH_CONTEXT_KEY = "atomx.portal.reauth";
const REAUTH_CONTEXT_TTL_MS = 24 * 60 * 60 * 1000;

function sanitizeReturnTo(value) {
  try {
    const parsed = new URL(value, window.location.origin);
    parsed.searchParams.delete("returnTo");
    parsed.searchParams.delete("token");
    return parsed.toString();
  } catch (err) {
    return value;
  }
}

function normalizeRoleType(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-");
}

function mapServiceParam(type) {
  const normalized = normalizeRoleType(type);
  if (normalized.includes("tag-series") || normalized.includes("tagseries")) {
    return "tag-series";
  }
  if (normalized.includes("cashless")) return "cashless";
  if (normalized.includes("inventory")) return "inventory";
  if (normalized.includes("admin")) return "admin";
  return normalized || null;
}

function coerceId(value) {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : value;
}

function buildReturnToUrl(currentHref, eventMeta, selectedService) {
  const sanitized = sanitizeReturnTo(currentHref);
  try {
    const parsed = new URL(sanitized, window.location.origin);
    if (eventMeta?.eventId && !parsed.searchParams.get("eventId")) {
      parsed.searchParams.set("eventId", String(eventMeta.eventId));
    }
    if (eventMeta?.eventName && !parsed.searchParams.get("eventName")) {
      parsed.searchParams.set("eventName", eventMeta.eventName);
    }
    if (eventMeta?.venue && !parsed.searchParams.get("venue")) {
      parsed.searchParams.set("venue", eventMeta.venue);
    }
    if (eventMeta?.city && !parsed.searchParams.get("city")) {
      parsed.searchParams.set("city", eventMeta.city);
    }
    const serviceParam = mapServiceParam(selectedService);
    if (serviceParam && !parsed.searchParams.get("service")) {
      parsed.searchParams.set("service", serviceParam);
    }
    return parsed.toString();
  } catch {
    return sanitized;
  }
}

function resolvePortalBase() {
  const envBase =
    process.env.NEXT_PUBLIC_PORTAL_URL || process.env.NEXT_PUBLIC_ACCESS_PORTAL_URL;
  if (envBase) return envBase;
  return "/";
}

function getLoginUrl(returnTo) {
  const portalBase = resolvePortalBase();
  const baseUrl = portalBase.startsWith("http")
    ? new URL(portalBase)
    : new URL(portalBase, window.location.origin);
  baseUrl.searchParams.delete("returnTo");
  if (returnTo) {
    const sanitized = sanitizeReturnTo(returnTo);
    const baseId = `${baseUrl.origin}${baseUrl.pathname}`;
    if (sanitized && sanitized !== baseId) {
      baseUrl.searchParams.set("returnTo", sanitized);
    }
  }
  return baseUrl.toString();
}

function formatCountdown(ms) {
  if (ms <= 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function clearDashboardAuthCache() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("atomx.portal.token");
  window.localStorage.removeItem("atomx.dashboard.store");
  const keysToRemove = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (key && key.startsWith("atomx.auth.")) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => window.localStorage.removeItem(key));
}

export default function SessionGuard() {
  const token = useDashboardStore((state) => state.token);
  const profile = useDashboardStore((state) => state.profile);
  const selectedService = useDashboardStore((state) => state.selectedService);
  const eventMeta = useDashboardStore((state) => state.eventMeta);
  const setToken = useDashboardStore((state) => state.setToken);
  const setSelectedService = useDashboardStore((state) => state.setSelectedService);
  const [warningOpen, setWarningOpen] = useState(false);
  const [expiredOpen, setExpiredOpen] = useState(false);
  const [countdown, setCountdown] = useState("");
  const timersRef = useRef({ warn: null, expire: null, tick: null });
  const reloginRef = useRef(false);

  const expiresAt = useMemo(() => {
    if (!token) return null;
    try {
      const decoded = decodeJwt(token);
      if (!decoded?.exp) return null;
      return decoded.exp * 1000;
    } catch (err) {
      console.error("Failed to decode token", err);
      return null;
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    try {
      const decoded = decodeJwt(token);
      const email = decoded?.email ?? null;
      const distinctId = decoded?.sub ?? decoded?.id ?? email;
      identifyPostHogUser(distinctId, {
        app: "dashboard",
        email,
        name: decoded?.name ?? null,
        role_type: decoded?.ctx?.type ?? decoded?.type ?? null
      });
      capturePostHogEvent("session_identified", {
        app: "dashboard",
        user_email: email,
        role_type: decoded?.ctx?.type ?? decoded?.type ?? null
      });
    } catch (err) {
      console.error("Failed to identify dashboard user in PostHog", err);
    }
  }, [token]);

  const startRelogin = useCallback(() => {
    if (reloginRef.current) return;
    if (typeof window === "undefined") return;
    const returnTo = buildReturnToUrl(window.location.href, eventMeta, selectedService);
    let decodedProfile = profile;
    if (!decodedProfile && token) {
      try {
        decodedProfile = decodeJwt(token);
      } catch (err) {
        console.error("Failed to decode token for reauth context", err);
      }
    }
    const roles = Array.isArray(decodedProfile?.roles) ? decodedProfile.roles : [];
    const ctxType = decodedProfile?.ctx?.type;
    const normalizedType = normalizeRoleType(ctxType || selectedService || "");
    const roleMatch = roles.find(
      (role) => normalizeRoleType(role?.type) === normalizedType
    );
    const payload = {
      version: 1,
      createdAt: Date.now(),
      expiresAt: Date.now() + REAUTH_CONTEXT_TTL_MS,
      returnTo,
      type: roleMatch?.type || ctxType || selectedService || null,
      service: mapServiceParam(roleMatch?.type || ctxType || selectedService),
      eventId: coerceId(eventMeta?.eventId ?? decodedProfile?.ctx?.eventId ?? roleMatch?.eventId),
      adminId: coerceId(decodedProfile?.ctx?.adminId ?? roleMatch?.adminId)
    };
    try {
      window.localStorage.setItem(REAUTH_CONTEXT_KEY, JSON.stringify(payload));
    } catch (err) {
      console.error("Failed to persist reauth context", err);
    }
    const loginUrl = getLoginUrl(returnTo);
    capturePostHogEvent("session_relogin_start", {
      app: "dashboard",
      service: mapServiceParam(payload.type),
      event_id: payload.eventId ?? null,
      admin_id: payload.adminId ?? null,
      return_to: returnTo
    });
    reloginRef.current = true;
    clearDashboardAuthCache();
    setToken(null);
    setSelectedService(null);
    window.location.assign(loginUrl);
  }, [eventMeta, profile, selectedService, setSelectedService, setToken, token]);

  const scheduleTimers = useCallback(() => {
    if (!expiresAt) return;
    const now = Date.now();
    const warnAt = expiresAt - WARNING_WINDOW_MS;
    const warnDelay = Math.max(warnAt - now, 0);
    const expireDelay = Math.max(expiresAt - now, 0);

    if (timersRef.current.warn) clearTimeout(timersRef.current.warn);
    if (timersRef.current.expire) clearTimeout(timersRef.current.expire);
    if (timersRef.current.tick) clearInterval(timersRef.current.tick);

    timersRef.current.warn = setTimeout(() => {
      setWarningOpen(true);
    }, warnDelay);

    timersRef.current.expire = setTimeout(() => {
      setExpiredOpen(true);
    }, expireDelay);

    timersRef.current.tick = setInterval(() => {
      const remaining = expiresAt - Date.now();
      if (remaining <= 0) {
        setCountdown("0:00");
        return;
      }
      setCountdown(formatCountdown(remaining));
    }, 1000);
  }, [expiresAt, startRelogin]);

  useEffect(() => {
    if (!expiresAt) return;
    scheduleTimers();
    return () => {
      if (timersRef.current.warn) clearTimeout(timersRef.current.warn);
      if (timersRef.current.expire) clearTimeout(timersRef.current.expire);
      if (timersRef.current.tick) clearInterval(timersRef.current.tick);
    };
  }, [expiresAt, scheduleTimers]);

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key && event.key.startsWith("atomx.auth.")) {
        capturePostHogEvent("session_relogin_success", {
          app: "dashboard",
          source: "storage"
        });
        reloginRef.current = false;
        setWarningOpen(false);
        setExpiredOpen(false);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const onMessage = (event) => {
      if (event?.data?.type !== "atomx.auth") return;
      const nextToken = event.data.token;
      if (nextToken) {
        setToken(nextToken);
      }
      if (event.data.service) {
        setSelectedService(event.data.service);
      }
      capturePostHogEvent("session_relogin_success", {
        app: "dashboard",
        source: "post_message",
        service: event.data.service ?? null
      });
      reloginRef.current = false;
      setWarningOpen(false);
      setExpiredOpen(false);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [setToken, setSelectedService]);

  if (!expiresAt) return null;

  return (
    <>
      <SessionPrompt
        open={warningOpen && !expiredOpen}
        title="Session expiring soon"
        message="Your session will expire in"
        countdown={countdown}
        actionLabel="Re-login"
        onAction={startRelogin}
        onClose={() => setWarningOpen(false)}
        allowDismiss
      />
      <SessionPrompt
        open={expiredOpen}
        title="Session expired"
        message="Please re-login to continue."
        actionLabel="Login"
        onAction={startRelogin}
        allowDismiss={false}
      />
    </>
  );
}
