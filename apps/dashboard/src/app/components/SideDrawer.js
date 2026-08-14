"use client";

import { usePathname, useRouter } from "next/navigation";

const ITEMS = [
  { id: "deviceMaster", label: "Device Master", href: "/device_masterlist", match: "/device_masterlist" },
  // { id: "analytics", label: "Analytics", disabled: true },
  { id: "configuration", label: "Configuration", href: "/Config", match: "/Config" },
  { id: "whitelist", label: "Whitelist", href: "/whitelist", match: "/whitelist" },
  { id: "admin", label: "Admin", href: "/admin/Create_event", match: "/admin/Create_event" },
  { id: "reports", label: "Reports", href: "/Reports", match: "/Reports" },
  { id: "transactions", label: "Transactions", href: "/transactions", match: "/transactions" },
  { id: "device", label: "Devices", href: "/device", match: "/device" },
  { id: "blocked", label: "Blocked", href: "/Blocked", match: "/Blocked" },
  // { id: "apk", label: "APK Uploads", href: "/apk_upload", match: "/apk_upload" },
  // { id: "tapx", label: "TapX-Transactions", href: "/tapx", match: "/tapx" },
  // { id: "patchaTrack", label: "Patcha-NY-Track", href: "/patcha-ny-track", match: "/patcha-ny-track" }
];

const iconClass = "h-4 w-4";

const ICONS = {
  deviceMaster: (
    <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 8h6" />
      <path d="M9 12h6" />
      <path d="M9 16h3" />
    </svg>
  ),
  analytics: (
    <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19h16" />
      <path d="M7 16V9" />
      <path d="M12 16V5" />
      <path d="M17 16v-4" />
    </svg>
  ),
  configuration: (
    <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h4" />
      <path d="M14 7h6" />
      <path d="M10 5v4" />
      <path d="M4 12h9" />
      <path d="M19 12h1" />
      <path d="M15 10v4" />
      <path d="M4 17h2" />
      <path d="M12 17h8" />
      <path d="M8 15v4" />
    </svg>
  ),
  whitelist: (
    <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 20 6.3v5.9c0 4.7-3.2 7.8-8 9.3-4.8-1.5-8-4.6-8-9.3V6.3L12 3Z" />
      <path d="m8.7 12.2 2.1 2.1 4.5-5" />
    </svg>
  ),
  tapx: (
    <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <path d="M10 7.5a3.5 3.5 0 0 1 3.5 3.5" />
      <path d="M10 10.5a.5.5 0 0 1 .5.5" />
      <path d="M11 17h2" />
    </svg>
  ),
  patchaTrack: (
    <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="6" r="2" />
      <path d="M8 18h3a3 3 0 0 0 3-3v-6a3 3 0 0 1 3-3" />
      <path d="m9 8 2-2-2-2" />
    </svg>
  ),
  admin: (
    <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  ),
  events: (
    <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <path d="M4 10h16" />
      <path d="M8 14h3" />
      <path d="M13 14h3" />
    </svg>
  ),
  reports: (
    <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3h7l5 5v13H7V3Z" />
      <path d="M14 3v5h5" />
      <path d="M10 13h6" />
      <path d="M10 17h5" />
    </svg>
  ),
  transactions: (
    <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 7h11" />
      <path d="m15 4 3 3-3 3" />
      <path d="M17 17H6" />
      <path d="m9 14-3 3 3 3" />
    </svg>
  ),
  device: (
    <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <path d="M11 17h2" />
    </svg>
  ),
  blocked: (
    <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" />
      <path d="M7 7l10 10" />
    </svg>
  ),
  apk: (
    <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4v12" />
      <path d="m7 9 5-5 5 5" />
      <path d="M5 20h14" />
    </svg>
  )
};

export default function SideDrawer({ mobileOpen = false, onMobileClose }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-x-0 bottom-0 z-[49] bg-[#0c0c0c]/45 backdrop-blur-[2px] min-[901px]:hidden"
          style={{ top: "var(--header-h)" }}
          onClick={onMobileClose}
          aria-label="Close navigation overlay"
        />
      ) : null}

      <aside
        className={`group fixed left-0 z-50 transition-transform duration-300 ease-out max-[900px]:z-[60] ${
          mobileOpen ? "max-[900px]:translate-x-0" : "max-[900px]:-translate-x-full"
        }`}
        style={{ top: "var(--header-h)", height: "calc(100vh - var(--header-h))" }}
      >
        <div className="flex h-full w-[60px] flex-col overflow-hidden bg-(--rail) text-(--railText) shadow-[16px_0_42px_rgba(0,0,0,0.28)] transition-[width] duration-300 ease-out group-hover:w-[248px] max-[900px]:w-[248px]">
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden px-2.5 py-3.5">
            {ITEMS.map((item) => {
              const matchBase = item.match || item.href;
              const isActive = item.exact
                ? pathname === matchBase
                : Boolean(matchBase && pathname?.startsWith(matchBase));

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (!item.href || item.disabled) return;
                    router.push(item.href);
                    onMobileClose?.();
                  }}
                  disabled={item.disabled}
                  title={item.label}
                  className={`flex h-10 w-full items-center gap-3.5 rounded-[10px] px-[9px] text-left text-[0.84rem] transition-colors duration-200 ${
                    isActive
                      ? "bg-(--surface) font-semibold text-(--text)"
                      : item.disabled
                        ? "cursor-default font-normal text-(--railText)"
                        : "font-normal text-(--railText) hover:bg-white/[0.09]"
                  }`}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                    {ICONS[item.id]}
                  </span>
                  <span className="whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100 max-[900px]:opacity-100">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
          <div className="flex items-center gap-3 border-t border-white/10 px-3 py-3">
            <span className="font-chillax flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-[0.85rem] font-semibold text-(--railText)">
              N
            </span>
            <span className="font-vcr whitespace-nowrap text-[9px] tracking-[0.12em] text-white/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100 max-[900px]:opacity-100">
              Nexus Build 4.2
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
