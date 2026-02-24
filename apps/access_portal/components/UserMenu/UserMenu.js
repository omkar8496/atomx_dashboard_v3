"use client";

import { useState } from "react";

export function UserMenu({ user, onSignOut = () => {} }) {
  const [open, setOpen] = useState(false);

  const handleSignOut = () => {
    setOpen(false);
    onSignOut();
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center gap-2 rounded-full bg-[#0f889b] px-3 pr-3 py-1.75 text-left text-white shadow-[0_10px_20px_rgba(15,136,155,0.22)] transition hover:shadow-[0_12px_26px_rgba(15,136,155,0.28)] hover:-translate-y-[1px] hover:brightness-105"
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#0f9ca3,#0a6f80)] text-sm font-semibold">
          {user.picture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.picture} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            user.initials
          )}
        </div>
        <div className="flex flex-col text-left leading-tight">
          <span className="text-[0.94rem] font-bold text-white leading-tight">{user.name}</span>
          <span className="text-[0.78rem] text-[#cdeff4] leading-tight">{user.role}</span>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          className={`text-[#e4f6f9] transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 9l6 6 6-6"
          />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_20px_40px_rgba(0,0,0,0.1)]">
          <div className="flex flex-col gap-1">
            <p className="m-0 break-words text-sm font-semibold leading-snug text-slate-800">{user.email}</p>
            <small className="text-sm leading-snug text-slate-500">Signed in from AtomX Access Portal</small>
          </div>
          <button
            type="button"
            className="mt-3 w-full rounded-xl bg-[#fef2ec] px-3 py-2 text-sm font-semibold text-[#e35f1a] transition hover:brightness-105"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
