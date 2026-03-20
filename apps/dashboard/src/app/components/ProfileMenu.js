"use client";

import { useEffect, useRef, useState } from "react";
import { decodeJwt } from "@atomx/lib";
import { useDashboardStore } from "../../store/dashboardStore";

const REAUTH_CONTEXT_KEY = "atomx.portal.reauth";
const REAUTH_CONTEXT_TTL_MS = 24 * 60 * 60 * 1000;

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

function sanitizeReturnTo(value) {
  try {
    const parsed = new URL(value, window.location.origin);
    parsed.searchParams.delete("returnTo");
    parsed.searchParams.delete("token");
    return parsed.toString();
  } catch {
    return value;
  }
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
    const service = mapServiceParam(selectedService);
    if (service && !parsed.searchParams.get("service")) {
      parsed.searchParams.set("service", service);
    }
    return parsed.toString();
  } catch {
    return sanitized;
  }
}

function getLoginUrl(returnTo) {
  const portalBase =
    process.env.NEXT_PUBLIC_PORTAL_URL ||
    process.env.NEXT_PUBLIC_ACCESS_PORTAL_URL ||
    "/";
  const baseUrl = portalBase.startsWith("http")
    ? new URL(portalBase)
    : new URL(portalBase, window.location.origin);
  baseUrl.searchParams.delete("returnTo");
  if (returnTo) {
    const baseId = `${baseUrl.origin}${baseUrl.pathname}`;
    if (returnTo !== baseId) {
      baseUrl.searchParams.set("returnTo", returnTo);
    }
  }
  return baseUrl.toString();
}

function clearAuthCache() {
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

const SERVICES = [
  {
    id: "cashless",
    label: "Cashless Payments",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M7 10h6" />
        <path d="M17 14h-4" />
      </svg>
    ),
  },
  {
    id: "crew",
    label: "Crew Meal",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 3v7a3 3 0 0 0 6 0V3" />
        <path d="M10 3v7a3 3 0 0 1-6 0V3" />
        <path d="M14 3v7" />
        <path d="M14 10a3 3 0 0 0 6 0V3" />
        <path d="M16 14v7" />
      </svg>
    ),
  },
  {
    id: "access",
    label: "Access Control",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3.2" />
        <path d="M12 5v2" />
        <path d="M12 17v2" />
        <path d="M5 12h2" />
        <path d="M17 12h2" />
      </svg>
    ),
  },
  {
    id: "inventory",
    label: "InventoryX",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 7h18" />
        <path d="M5 7l2-3h10l2 3" />
        <rect x="4" y="7" width="16" height="12" rx="2" />
        <path d="M9 11h6" />
      </svg>
    ),
  },
  {
    id: "tag-series",
    label: "Tag Series",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 7h10l8 5-8 5H3z" />
        <circle cx="7" cy="12" r="2" />
      </svg>
    ),
  }
];

export default function ProfileMenu({
  initials = "OD",
  role = "Admin",
  email = "design@atomx.in"
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const token = useDashboardStore((state) => state.token);
  const profile = useDashboardStore((state) => state.profile);
  const eventMeta = useDashboardStore((state) => state.eventMeta);
  const selectedService = useDashboardStore((state) => state.selectedService);
  const setToken = useDashboardStore((state) => state.setToken);
  const setSelectedService = useDashboardStore((state) => state.setSelectedService);

  useEffect(() => {
    const handler = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handler);
    }
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleLogout = () => {
    if (typeof window === "undefined") return;
    const returnTo = buildReturnToUrl(window.location.href, eventMeta, selectedService);
    let decodedProfile = profile;
    if (!decodedProfile && token) {
      try {
        decodedProfile = decodeJwt(token);
      } catch (err) {
        console.error("Failed to decode token for logout context", err);
      }
    }
    const roles = Array.isArray(decodedProfile?.roles) ? decodedProfile.roles : [];
    const ctxType = decodedProfile?.ctx?.type;
    const normalizedType = normalizeRoleType(ctxType || selectedService || "");
    const roleMatch = roles.find(
      (entry) => normalizeRoleType(entry?.type) === normalizedType
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
      console.error("Failed to save resume context before logout", err);
    }
    clearAuthCache();
    setToken(null);
    setSelectedService(null);
    window.location.assign(getLoginUrl(returnTo));
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-9 items-center gap-2 rounded-full bg-white/18 px-3 text-xs font-semibold text-white ring-1 ring-white/25"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[11px] font-bold text-[#258d9c]">
          {initials}
        </span>
        <svg
          viewBox="0 0 24 24"
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-3 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.18)]">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-700">{role}</div>
              <div className="text-xs text-slate-500">{email}</div>
            </div>
            <button
              type="button"
              className="text-xs font-semibold text-slate-500 hover:text-[color:rgb(var(--color-orange))]"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>

          <div className="my-3 h-px bg-slate-200" />

          <div className="grid grid-cols-2 gap-3">
            {SERVICES.map((service) => {
              const isSelected = selectedService === service.id;
              return (
              <button
                key={service.label}
                type="button"
                className={`flex flex-col items-center gap-2 rounded-2xl border px-2 py-3 text-center text-xs font-semibold transition ${
                  isSelected
                    ? "border-[#258d9c] bg-[#f0f8fa] text-[#258d9c]"
                    : "border-slate-200 text-slate-600 hover:border-[#258d9c] hover:text-[#258d9c]"
                }`}
                aria-pressed={isSelected}
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    isSelected ? "bg-[#dff3f6] text-[#258d9c]" : "bg-[#f2f6f9] text-[#258d9c]"
                  }`}
                >
                  {service.icon}
                </span>
                <span className="leading-tight">{service.label}</span>
              </button>
            )})}
          </div>
        </div>
      )}
    </div>
  );
}
