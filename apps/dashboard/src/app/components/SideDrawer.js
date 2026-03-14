"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const ITEMS = [
  { id: "analytics", label: "Analytics" },
  { id: "configuration", label: "Configuration", href: "/Config/operations", match: "/Config" },
  { id: "admin", label: "Admin", href: "/admin", match: "/admin" },
  { id: "create-event", label: "Create Event", href: "/admin/Create_event", match: "/admin/Create_event" },
  { id: "reports", label: "Reports", href: "/device/Reports", match: "/device/Reports" },
  { id: "transactions", label: "Transactions" },
  { id: "device", label: "Devices", href: "/device", exact: true },
  { id: "blocked", label: "Blocked", href: "/Blocked" },
  { id: "apk", label: "APK Uploads", href: "/apk_upload" }
];

const ICONS = {
  analytics: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M5 20h2V9H5v11zm6 0h2V4h-2v16zm6 0h2v-7h-2v7z" />
    </svg>
  ),
  configuration: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M4 6h16v2H4V6zm0 5h10v2H4v-2zm0 5h16v2H4v-2z" />
    </svg>
  ),
  admin: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M12 2l7 3v6c0 5-3.8 9.3-7 10-3.2-.7-7-5-7-10V5l7-3z" />
      <path d="M9.5 11.5l1.8 1.8 3.5-3.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "create-event": (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M6 3h9l5 5v13a1.8 1.8 0 01-1.8 1.8H6A1.8 1.8 0 014.2 21V4.8A1.8 1.8 0 016 3z" />
      <path d="M14 3v5h5" fill="rgb(var(--color-orange))" />
      <path d="M12 10v6M9 13h6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  device: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <rect x="7" y="2.5" width="10" height="19" rx="2.2" />
      <rect x="10" y="18" width="4" height="1.6" rx="0.8" fill="rgb(var(--color-orange))" />
    </svg>
  ),
  blocked: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 3.5a6.5 6.5 0 014.6 1.9L7.4 16.6A6.5 6.5 0 0112 5.5zm0 13a6.5 6.5 0 01-4.6-1.9L16.6 7.4A6.5 6.5 0 0112 18.5z" />
    </svg>
  ),
  reports: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M7 2h7l5 5v15a2 2 0 01-2 2H7a2 2 0 01-2-2V4a2 2 0 012-2zm7 1.5V8h4.5L14 3.5zM9 13h6v2H9v-2zm0 4h6v2H9v-2z" />
    </svg>
  ),
  transactions: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M4 6h16a2 2 0 012 2v2H2V8a2 2 0 012-2zm-2 6h20v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4zm4 2h6v2H6v-2z" />
    </svg>
  ),
  apk: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M12 2l4 4h-3v7h-2V6H8l4-4zm-7 12h14a2 2 0 012 2v4H3v-4a2 2 0 012-2z" />
    </svg>
  ),
};

export default function SideDrawer({ open, onClose, eventName = "SUNBURN" }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdminArea = pathname?.startsWith("/admin");
  const visibleItems = isAdminArea
    ? ITEMS.filter((item) => item.id === "admin" || item.id === "create-event")
    : ITEMS.filter((item) => item.id !== "create-event");

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
      className="group fixed left-0 z-50"
      style={{ top: "var(--header-h)", height: "calc(100vh - var(--header-h))" }}
    >
      <div
        className="h-full w-12 bg-[color:rgb(var(--color-orange))] py-6 shadow-[0_18px_40px_rgba(0,0,0,0.25)] transition-[width] duration-500 ease-in-out group-hover:w-56"
      >
        <nav className="flex flex-col gap-3 px-1">
          {visibleItems.map((item) => {
            const matchBase = item.match || item.href;
            const isActive = item.exact
              ? pathname === matchBase
              : Boolean(matchBase && pathname?.startsWith(matchBase));
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.href && typeof window !== "undefined") {
                    router.push(item.href);
                  }
                }}
                className={`flex items-center gap-3 rounded-2xl px-2 py-2 text-sm font-semibold transition-colors duration-300 ease-in-out ${
                  isActive ? "text-white" : "text-white/85 hover:bg-white/10"
                } group-hover:px-4`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    isActive ? "bg-white/25 text-white" : "text-white/85"
                  }`}
                >
                  {ICONS[item.id]}
                </span>
                <span className="whitespace-nowrap opacity-0 translate-x-2 transition-all duration-400 ease-in-out group-hover:opacity-100 group-hover:translate-x-0">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
