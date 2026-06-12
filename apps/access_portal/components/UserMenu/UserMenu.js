"use client";

import { useState } from "react";

function formatRole(value, long = false) {
  const raw = String(value || "member").trim();
  if (!raw) return long ? "Member" : "Member";
  if (raw.toLowerCase() === "admin") return long ? "Administrator" : "Admin";
  return raw
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function UserMenu({ user, onSignOut = () => {} }) {
  const [open, setOpen] = useState(false);
  const avatarText = String(user.initials || user.name || "A").slice(0, 1).toUpperCase();

  const handleSignOut = () => {
    setOpen(false);
    onSignOut();
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="flex h-[42px] items-center gap-2 rounded-lg border border-[#e8e8e8] bg-white px-2.5 text-left shadow-[0_5px_14px_rgba(15,23,42,0.08)] transition hover:-translate-y-[1px] hover:shadow-[0_8px_18px_rgba(15,23,42,0.12)]"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <div className="hidden min-w-0 flex-col leading-tight sm:flex">
          <span className="max-w-[6.5rem] truncate text-[0.72rem] font-medium text-[#6c6c6c]">
            {formatRole(user.role)}
          </span>
          <span className="max-w-[7rem] truncate text-[0.86rem] font-semibold text-[#202020]">
            {user.name}
          </span>
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[linear-gradient(135deg,#e04420,#2f1ec7)] text-[0.85rem] font-semibold text-white">
          {user.picture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.picture} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            avatarText
          )}
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          className={`text-[#8a8a8a] transition-transform ${open ? "rotate-180" : ""}`}
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
        <div className="absolute right-0 top-full z-50 mt-2 w-[236px] rounded-lg border border-[#eeeeee] bg-white p-2.5 shadow-[0_20px_44px_rgba(15,23,42,0.14)]">
          <div className="flex items-center gap-2.5 px-1 py-1">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#e04420,#2f1ec7)] text-sm font-semibold text-white">
              {user.picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.picture} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                avatarText
              )}
            </div>
            <div className="min-w-0 leading-tight">
              <p className="m-0 truncate text-[0.9rem] font-semibold text-[#202020]">
                {user.name}
              </p>
              <small className="text-[0.74rem] font-medium text-[#8d8d8d]">
                {formatRole(user.role, true)}
              </small>
            </div>
          </div>
          <button
            type="button"
            className="mt-2 w-full rounded-md bg-[#1f1f1f] px-3 py-2.5 text-left text-[0.84rem] font-semibold text-white transition hover:bg-black"
            onClick={handleSignOut}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
