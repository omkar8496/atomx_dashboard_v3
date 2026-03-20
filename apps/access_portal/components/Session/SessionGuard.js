import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { decodeJwt } from "@atomx/lib";

const WARNING_WINDOW_MS = 10 * 60 * 1000;
const REAUTH_CONTEXT_KEY = "atomx.portal.reauth";
const REAUTH_CONTEXT_TTL_MS = 24 * 60 * 60 * 1000;

function sanitizeReturnTo(value) {
  try {
    const parsed = new URL(value, window.location.origin);
    parsed.searchParams.delete("returnTo");
    return parsed.toString();
  } catch (err) {
    return value;
  }
}

function getLoginUrl(returnTo) {
  const baseUrl = new URL("/", window.location.origin);
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

function formatCountdown(ms) {
  if (ms <= 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function clearPortalAuthCache() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("atomx.portal.token");
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
  const router = useRouter();
  const isLoginRoute = router.pathname === "/";
  const [token, setToken] = useState(null);
  const [warningOpen, setWarningOpen] = useState(false);
  const [expiredOpen, setExpiredOpen] = useState(false);
  const [countdown, setCountdown] = useState("");
  const timersRef = useRef({ warn: null, expire: null, tick: null });
  const reloginRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("atomx.portal.token");
    if (stored) setToken(stored);

    const onStorage = (event) => {
      if (event.key === "atomx.portal.token") {
        setToken(event.newValue || null);
        reloginRef.current = false;
        setWarningOpen(false);
        setExpiredOpen(false);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

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
    const returnTo = sanitizeReturnTo(window.location.href);
    let contextType = null;
    let contextAdminId = null;
    let contextEventId = null;
    if (token) {
      try {
        const decoded = decodeJwt(token);
        const roles = Array.isArray(decoded?.roles) ? decoded.roles : [];
        const ctxType = decoded?.ctx?.type;
        const normalizedCtxType = normalizeRoleType(ctxType);
        const roleMatch = roles.find(
          (role) => normalizeRoleType(role?.type) === normalizedCtxType
        );
        contextType = roleMatch?.type || ctxType || null;
        contextAdminId = coerceId(decoded?.ctx?.adminId ?? roleMatch?.adminId);
        contextEventId = coerceId(decoded?.ctx?.eventId ?? roleMatch?.eventId);
      } catch (err) {
        console.error("Failed to decode token for reauth context", err);
      }
    }
    const payload = {
      version: 1,
      createdAt: Date.now(),
      expiresAt: Date.now() + REAUTH_CONTEXT_TTL_MS,
      returnTo,
      type: contextType,
      service: mapServiceParam(contextType),
      adminId: contextAdminId,
      eventId: contextEventId
    };
    try {
      window.localStorage.setItem(REAUTH_CONTEXT_KEY, JSON.stringify(payload));
    } catch (err) {
      console.error("Failed to persist reauth context", err);
    }
    const loginUrl = getLoginUrl(returnTo);
    reloginRef.current = true;
    clearPortalAuthCache();
    window.location.assign(loginUrl);
  }, [token]);

  const scheduleTimers = useCallback(() => {
    if (!expiresAt || isLoginRoute) return;
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
  }, [expiresAt, isLoginRoute]);

  useEffect(() => {
    if (!isLoginRoute) return;
    setWarningOpen(false);
    setExpiredOpen(false);
    reloginRef.current = false;
    if (token && expiresAt && expiresAt <= Date.now()) {
      clearPortalAuthCache();
      setToken(null);
    }
  }, [isLoginRoute, token, expiresAt]);

  useEffect(() => {
    if (!expiresAt) return;
    scheduleTimers();
    return () => {
      if (timersRef.current.warn) clearTimeout(timersRef.current.warn);
      if (timersRef.current.expire) clearTimeout(timersRef.current.expire);
      if (timersRef.current.tick) clearInterval(timersRef.current.tick);
    };
  }, [expiresAt, scheduleTimers]);

  if (!expiresAt || isLoginRoute) return null;

  return (
    <>
      {(warningOpen || expiredOpen) && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-xl border border-[#f2d9c8] bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.25)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-800">
                  {expiredOpen ? "Session expired" : "Session expiring soon"}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  {expiredOpen
                    ? "Please re-login to continue."
                    : "Your session will expire in"}
                  {!expiredOpen && countdown ? (
                    <span className="ml-1 text-slate-800 font-semibold">{countdown}</span>
                  ) : null}
                </p>
              </div>
              {!expiredOpen ? (
                <button
                  type="button"
                  onClick={() => setWarningOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                  aria-label="Close"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6L6 18" />
                    <path d="M6 6l12 12" />
                  </svg>
                </button>
              ) : null}
            </div>
            <div className="mt-5 flex items-center justify-end">
              <button
                type="button"
                onClick={startRelogin}
                className="rounded-md bg-[#f88c43] px-4 py-2 text-sm font-semibold text-white shadow-[0_6px_12px_rgba(248,140,67,0.25)]"
              >
                {expiredOpen ? "Login" : "Re-login"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
