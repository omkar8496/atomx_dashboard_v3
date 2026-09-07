"use client";

import { useEffect, useRef, useState } from "react";
import { useDashboardStore } from "../../store/dashboardStore";

const REAUTH_CONTEXT_KEY = "atomx.portal.reauth";

function formatRole(value, long = false) {
  const raw = String(value || "member").trim();
  if (!raw) return long ? "Member" : "Member";
  if (raw.toLowerCase() === "admin") return long ? "Administrator" : "Admin";
  return raw
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

// Logout returns the user to the workspace picker, so no returnTo is attached -
// the portal must not bounce them straight back into the dashboard.
function getAccessUrl() {
  const portalBase =
    process.env.NEXT_PUBLIC_PORTAL_URL ||
    process.env.NEXT_PUBLIC_ACCESS_PORTAL_URL ||
    "/";
  const baseUrl = portalBase.startsWith("http")
    ? new URL(portalBase)
    : new URL(portalBase, window.location.origin);
  baseUrl.searchParams.delete("returnTo");
  const path = baseUrl.pathname.replace(/\/+$/, "");
  baseUrl.pathname = path.endsWith("/access") ? `${path}/` : `${path}/access/`;
  return baseUrl.toString();
}

// keepPortalToken: logging out of the dashboard drops the service session but
// keeps the portal session, so /access can still show the workspace list.
function clearAuthCache({ keepPortalToken = false } = {}) {
  if (typeof window === "undefined") return;
  if (!keepPortalToken) {
    window.localStorage.removeItem("atomx.portal.token");
  }
  window.localStorage.removeItem("atomx.dashboard.token");
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
  name = "Omkar",
  role = "Admin",
  email = "design@atomx.in",
  picture = null,
  variant = "event"
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const eventMeta = useDashboardStore((state) => state.eventMeta);
  const selectedService = useDashboardStore((state) => state.selectedService);
  const setToken = useDashboardStore((state) => state.setToken);
  const setSelectedService = useDashboardStore((state) => state.setSelectedService);
  const isPortalVariant = variant === "portal";

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

    // Drop any pending resume context so the portal does not send the user
    // back into the dashboard after they pick a workspace.
    try {
      window.localStorage.removeItem(REAUTH_CONTEXT_KEY);
    } catch (err) {
      console.error("Failed to clear resume context on logout", err);
    }

    clearAuthCache({ keepPortalToken: true });
    setToken(null);
    setSelectedService(null);
    window.location.assign(getAccessUrl());
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={
          isPortalVariant
            ? "flex h-[42px] items-center gap-2 rounded-[11px] border border-(--line) bg-(--surface2) px-2.5 text-left text-(--text) transition hover:border-(--orange)"
            : "flex h-9 items-center gap-2 rounded-full bg-white/18 px-3 text-xs font-semibold text-white ring-1 ring-white/25"
        }
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {isPortalVariant ? (
          <div className="hidden min-w-0 flex-col leading-tight sm:flex">
            <span className="font-vcr max-w-[6.5rem] truncate text-[0.6rem] uppercase tracking-[0.14em] text-(--muted)">
              {formatRole(role)}
            </span>
            <span className="max-w-[7rem] truncate text-[0.82rem] font-semibold text-(--text)">
              {name}
            </span>
          </div>
        ) : null}
        <span
          className={
            isPortalVariant
              ? "font-chillax flex h-8 w-8 items-center justify-center overflow-hidden rounded-[9px] bg-[linear-gradient(140deg,#341cd6,#e04420)] text-[0.85rem] font-semibold text-white"
              : "flex h-7 w-7 items-center justify-center rounded-full bg-white text-[11px] font-bold text-[#258d9c]"
          }
        >
          {picture && isPortalVariant ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={picture} alt={name} className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </span>
        <svg
          viewBox="0 0 24 24"
          className={`h-4 w-4 transition-transform ${
            open ? "rotate-180" : ""
          } ${isPortalVariant ? "text-(--muted)" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && isPortalVariant && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[236px] rounded-[11px] border border-(--line) bg-(--surface) p-2.5 shadow-(--shadowUp)">
          <div className="flex items-center gap-2.5 px-1 py-1">
            <div className="font-chillax flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(140deg,#341cd6,#e04420)] text-sm font-semibold text-white">
              {picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={picture} alt={name} className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0 leading-tight">
              <p className="m-0 truncate text-[0.9rem] font-semibold text-(--text)">
                {name}
              </p>
              <small className="text-[0.74rem] font-medium text-(--muted)">
                {formatRole(role, true)}
              </small>
            </div>
          </div>
          <button
            type="button"
            className="mt-2 w-full rounded-md bg-(--text) px-3 py-2.5 text-left text-[0.84rem] font-semibold text-(--bg) transition hover:opacity-90"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}

      {open && !isPortalVariant && (
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
