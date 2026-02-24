import Image from "next/image";
import { UserMenu } from "../UserMenu/UserMenu";

const LOGO_SRC = "/shared/logos/AtomX_Logo.svg";

export function HeaderBar({ user, onSignOut }) {
  return (
    <header className="flex w-full h-18 flex-col items-start justify-between gap-1 rounded-[16px] bg-white px-2 py-2 shadow-[0_6px_24px_rgba(15,23,42,0.07)] md:flex-row md:items-center md:gap-4 md:px-5">
      <div className="flex items-center ">
        <Image
          src={LOGO_SRC}
          alt="AtomX logo"
          width={220}
          height={90}
          priority
          className="h-[167px] w-auto -mt-2 -pr-5 -ml-8 "
        />
        <div className="flex items-center gap-3  mt-1 text-[30px] font-extrabold leading-none tracking-[0.02em] text-[#e35f1a]">
          <span className="h-10 w-px -ml-3 bg-slate-200" aria-hidden />
          <span>PORTAL</span>
        </div>
      </div>

      <UserMenu user={user} onSignOut={onSignOut} />
    </header>
  );
}
