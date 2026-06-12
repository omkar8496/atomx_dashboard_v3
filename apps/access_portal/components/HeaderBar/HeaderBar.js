import Image from "next/image";
import { UserMenu } from "../UserMenu/UserMenu";

const LOGO_SRC = "/shared/logos/AtomX_Logo.svg";

export function HeaderBar({ user, onSignOut, pageTitle = "Workspace" }) {
  return (
    <div
      style={{
        "--header-h": "58px",
        "--crumb-h": "0px",
        "--header-total-h": "var(--header-h)"
      }}
    >
      <div className="fixed left-0 right-0 top-0 z-40">
        <header
          className="w-full border-b border-[#ececec] bg-white text-[#171717] shadow-[0_6px_24px_rgba(15,23,42,0.08)]"
          style={{ height: "var(--header-h)" }}
        >
          <div className="flex h-full items-center gap-3 px-4 md:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="relative block h-[40px] w-[100px] shrink-0 overflow-hidden">
                <Image
                  src={LOGO_SRC}
                  alt="AtomX logo"
                  width={150}
                  height={150}
                  priority
                  className="absolute -left-[28px] -top-[52px] h-[132px] w-[150px] max-w-none"
                />
              </span>
              <div className="hidden h-9 w-px bg-[#dddddd] sm:block" aria-hidden />
              <div className="flex min-w-0 items-center gap-2 text-[1.35rem] font-semibold leading-none sm:text-[1.48rem]">
                <span className="truncate text-[#202020]">Portal</span>
                <span className="text-[#969696]">-</span>
                <span className="truncate text-[#e04420]">{pageTitle}</span>
              </div>
            </div>
            <div className="flex-1" />
            <UserMenu user={user} onSignOut={onSignOut} />
          </div>
        </header>
      </div>
      <div style={{ height: "var(--header-total-h)" }} />
    </div>
  );
}
