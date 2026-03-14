import Image from "next/image";
import { UserMenu } from "../UserMenu/UserMenu";

const LOGO_SRC = "/shared/logos/AtomX_Logo.svg";

export function HeaderBar({ user, onSignOut, sessionLabel }) {
  return (
    <div
      style={{
        "--header-h": "60px",
        "--crumb-h": "0px",
        "--header-total-h": "var(--header-h)"
      }}
    >
      <div className="fixed left-0 right-0 top-0 z-40">
        <header
          className="w-full bg-white text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.12)]"
          style={{ height: "var(--header-h)" }}
        >
          <div className="flex h-full items-center gap-4 px-4 md:px-6">
            <div className="flex items-center gap-3">
              <Image
                src={LOGO_SRC}
                alt="AtomX logo"
                width={260}
                height={80}
                priority
                className="h-40 w-auto object-contain md:-ml-8 md:-mr-7"
              />
              <div className="h-10 w-px bg-slate-200" aria-hidden />
              <div className="flex flex-col leading-tight ">
                <span className="text-3xl md:mt-3 font-semibold  tracking-[0.1em] text-orange-700">
                  Portal
                </span>
              </div>
            </div>
            <div className="flex-1" />
            {sessionLabel && (
              <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 md:flex">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
                <span className="whitespace-nowrap">{sessionLabel}</span>
              </div>
            )}
            <UserMenu user={user} onSignOut={onSignOut} />
          </div>
        </header>
      </div>
      <div style={{ height: "var(--header-total-h)" }} />
    </div>
  );
}
