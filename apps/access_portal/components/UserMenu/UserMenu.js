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
        className="flex h-[42px] items-center gap-2 rounded-lg border border-(--line) bg-(--surface) px-2.5 text-left shadow-(--shadow) transition hover:-translate-y-[1px] hover:border-(--orange)"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <div className="hidden min-w-0 flex-col leading-tight sm:flex">
          <span className="font-vcr max-w-[6.5rem] truncate text-[0.62rem] uppercase tracking-[0.12em] text-(--muted)">
            {formatRole(user.role)}
          </span>
          <span className="max-w-[7rem] truncate text-[0.86rem] font-semibold text-(--text)">
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
          className={`text-(--muted) transition-transform ${open ? "rotate-180" : ""}`}
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
        <div className="absolute right-0 top-full z-50 mt-2 w-[236px] rounded-lg border border-(--line) bg-(--surface) p-2.5 shadow-(--shadowUp)">
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
              <p className="m-0 truncate text-[0.9rem] font-semibold text-(--text)">
                {user.name}
              </p>
              <small className="text-[0.74rem] font-medium text-(--muted)">
                {formatRole(user.role, true)}
              </small>
            </div>
          </div>
          <button
            type="button"
            className="mt-2 w-full rounded-md bg-(--text) px-3 py-2.5 text-left text-[0.84rem] font-semibold text-(--bg) transition hover:opacity-90"
            onClick={handleSignOut}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
