"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { decodeJwt } from "@atomx/lib";
import { useDashboardStore } from "../../../store/dashboardStore";
import SessionPrompt from "./SessionPrompt";

const WARNING_WINDOW_MS = 10 * 60 * 1000;

function sanitizeReturnTo(value) {
  try {
    const parsed = new URL(value, window.location.origin);
    parsed.searchParams.delete("returnTo");
    return parsed.toString();
  } catch (err) {
    return value;
  }
}

function resolvePortalBase() {
  const envBase =
    process.env.NEXT_PUBLIC_PORTAL_URL || process.env.NEXT_PUBLIC_ACCESS_PORTAL_URL;
  if (envBase) return envBase;
  if (typeof window !== "undefined") {
    const { protocol, hostname, port } = window.location;
    if (hostname === "localhost" && port === "3000") {
      return `${protocol}//${hostname}:3003/`;
    }
  }
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

export default function SessionGuard() {
  const token = useDashboardStore((state) => state.token);
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

  const startRelogin = useCallback(() => {
    if (reloginRef.current) return;
    if (typeof window === "undefined") return;
    const returnTo = sanitizeReturnTo(window.location.href);
    const payload = {
      returnTo,
      type: selectedService || null,
      eventId: eventMeta?.eventId ?? null
    };
    try {
      window.localStorage.setItem("atomx.portal.reauth", JSON.stringify(payload));
    } catch (err) {
      console.error("Failed to persist reauth context", err);
    }
    const loginUrl = getLoginUrl(returnTo);
    const popup = window.open(loginUrl, "_blank", "width=520,height=640");
    if (!popup) {
      const currentBase = `${window.location.origin}${window.location.pathname}`;
      const loginTarget = new URL(loginUrl, window.location.origin);
      const loginBase = `${loginTarget.origin}${loginTarget.pathname}`;
      if (loginBase !== currentBase) {
        reloginRef.current = true;
        window.location.assign(loginUrl);
        return;
      }
      reloginRef.current = false;
      return;
    }
    reloginRef.current = true;
  }, [selectedService, eventMeta]);

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
      startRelogin();
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
