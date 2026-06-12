"use client";

import { usePathname, useRouter } from "next/navigation";

const ITEMS = [
  { id: "deviceMaster", label: "Device Master", href: "/device_masterlist", match: "/device_masterlist" },
  { id: "analytics", label: "Analytics", href: "/admin", exact: true },
  { id: "configuration", label: "Configuration", href: "/Config", match: "/Config" },
  { id: "admin", label: "Admin", href: "/admin/Create_event", match: "/admin/Create_event" },
  { id: "reports", label: "Reports", href: "/Reports", match: "/Reports" },
  { id: "transactions", label: "Transactions", href: "/transactions", match: "/transactions" },
  { id: "device", label: "Devices", href: "/device", match: "/device" },
  { id: "blocked", label: "Blocked", href: "/Blocked", match: "/Blocked" },
  { id: "apk", label: "APK Uploads", href: "/apk_upload", match: "/apk_upload" }
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

export default function SideDrawer() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside
      className="group fixed left-0 z-50"
      style={{ top: "var(--header-h)", height: "calc(100vh - var(--header-h))" }}
    >
      <div className="h-full w-[60px] overflow-hidden bg-[#34363b] py-3 shadow-[16px_0_42px_rgba(15,23,42,0.16)] transition-[width] duration-300 ease-out group-hover:w-[220px]">
        <nav className="flex flex-col gap-2 px-2">
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
                  if (item.href) router.push(item.href);
                }}
                className={`flex h-10 w-full items-center gap-3 rounded-md px-3 text-left text-[0.84rem] font-semibold transition-colors duration-200 ${
                  isActive
                    ? "bg-white text-[#25272b]"
                    : "text-[#d4d4d6] hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                  {ICONS[item.id]}
                </span>
                <span className="whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
