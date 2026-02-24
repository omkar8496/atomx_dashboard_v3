"use client";

import { useEffect } from "react";

const ITEMS = [
  { id: "analytics", label: "Analytics" },
  { id: "configuration", label: "Configuration", active: true, href: "/Config" },
  { id: "timeline", label: "Timeline", href: "/timeline" },
  { id: "whitelist", label: "Whitelist", href: "/whitelist" },
  { id: "device", label: "Device", href: "/device" },
  { id: "blocked", label: "Blocked", href: "/Blocked" },
  { id: "reports", label: "Reports", href: "/device/Reports" },
  { id: "apk", label: "APK Uploads", href: "/apk_upload" }
];

const ICONS = {
  analytics: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19V5" />
      <path d="M9 19V9" />
      <path d="M14 19v-6" />
      <path d="M19 19V7" />
    </svg>
  ),
  configuration: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3.5" />
      <path d="M19.4 15a7.6 7.6 0 0 0 .1-6l2-1.2-2-3.4-2.2.7a7.8 7.8 0 0 0-5.2-3L12 2 9.6 2.1a7.7 7.7 0 0 0-4.8 3.1l-2.3-.7-2 3.4 2 1.2a7.7 7.7 0 0 0 .2 6l-2 1.2 2 3.4 2.3-.7a7.7 7.7 0 0 0 4.8 3.1L12 22l2.3-.1a7.7 7.7 0 0 0 5-3.1l2.2.7 2-3.4-2-1.1Z" />
    </svg>
  ),
  timeline: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5l3 2" />
    </svg>
  ),
  whitelist: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <circle cx="4" cy="6" r="1.5" />
      <circle cx="4" cy="12" r="1.5" />
      <circle cx="4" cy="18" r="1.5" />
    </svg>
  ),
  device: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="6" y="2.5" width="12" height="19" rx="2" />
      <circle cx="12" cy="18" r="1" />
    </svg>
  ),
  blocked: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2l7 3v6c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V5l7-3Z" />
      <path d="M8 8l8 8" />
    </svg>
  ),
  reports: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 2h7l5 5v15a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
      <path d="M14 2v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
    </svg>
  ),
  apk: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3v12" />
      <path d="M8 7l4-4 4 4" />
      <rect x="4" y="15" width="16" height="6" rx="2" />
    </svg>
  )
};

export default function SideDrawer({ open, onClose, eventName = "SUNBURN" }) {
  useEffect(() => {
    if (!open) return;
    const handler = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-40 ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        className={`absolute left-0 top-0 h-full w-[300px] max-w-[86vw] transform rounded-r-[28px] bg-[#f88c43] text-white shadow-[0_30px_70px_rgba(0,0,0,0.35)] transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-white/25 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/25 text-2xl font-semibold">
              {eventName?.[0] ?? "S"}
            </div>
            <div className="text-xl font-semibold uppercase tracking-wide">
              {eventName}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-xl font-semibold transition hover:bg-white/30"
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <nav className="flex flex-col gap-2 px-4 py-5">
          {ITEMS.map((item) => {
            const isActive = Boolean(item.active);
            const classes = `flex items-center gap-4 rounded-2xl px-4 py-3 text-lg font-semibold transition ${
              isActive ? "bg-white text-[#f88c43] shadow-lg" : "text-white/95 hover:bg-white/15"
            }`;
            if (item.href) {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.location.href = item.href;
                    }
                    onClose?.();
                  }}
                  className={classes}
                >
                  <span className={isActive ? "text-[#f88c43]" : "text-white"}>
                    {ICONS[item.id]}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            }
            return (
              <button key={item.id} type="button" className={classes}>
                <span className={isActive ? "text-[#f88c43]" : "text-white"}>
                  {ICONS[item.id]}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}
