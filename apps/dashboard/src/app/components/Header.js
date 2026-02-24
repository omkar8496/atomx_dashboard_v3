"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import SideDrawer from "./SideDrawer";

const MenuIcon = ({ className = "h-6 w-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="4" x2="20" y1="7" y2="7" />
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="17" y2="17" />
  </svg>
);

const ChevronIcon = ({ className = "h-4 w-4" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

function useClickAway(ref, handler) {
  useEffect(() => {
    function onClick(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        handler();
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [ref, handler]);
}

export default function Header({
  eventId = "4356",
  eventName = "Sunburn",
  venue = "Mahalaxmi Race Cours",
  city = "Mumbai, India",
  pages = ["Access Control", "Tag Series", "Inventory"],
  currentPage = "Access Control",
  onPageChange = () => {},
  user = {
    name: "Omkar Designer",
    email: "design@atomx.in",
    image: null
  }
}) {
  const [pageOpen, setPageOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pageRef = useRef(null);
  const profileRef = useRef(null);
  const profileMobileRef = useRef(null);

  useClickAway(pageRef, () => setPageOpen(false));
  useClickAway(profileRef, () => setProfileOpen(false));
  useClickAway(profileMobileRef, () => setProfileOpen(false));

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AO";

  return (
    <header className="w-full rounded-[28px] bg-[#258d9c] text-white shadow-[0_16px_34px_rgba(37,141,156,0.35)]">
      <div className="flex flex-col gap-3 px-4 py-4 md:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Open menu"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white shadow-inner shadow-white/10 transition hover:bg-white/28"
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon className="h-6 w-6" />
          </button>

          <div className="flex flex-1 justify-center">
            <Image
              src="/shared/logos/Atomx_White.png"
              alt="AtomX"
              width={244}
              height={92}
              className="h-11 w-auto object-contain -mt-4 -mr-5"
              priority
            />
          </div>

          <div className="relative" ref={profileMobileRef}>
            <button
              type="button"
              className="flex h-11 items-center gap-2 rounded-full bg-white/18 px-4 text-white ring-1 ring-white/25 transition hover:bg-white/28"
              onClick={() => setProfileOpen((v) => !v)}
            >
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-white/60 bg-white text-sm font-bold text-[#258d9c] ">
                {user?.image ? (
                  <Image src={user.image} alt={user.name ?? "Profile"} width={40} height={40} />
                ) : (
                  initials
                )}
              </div>
              <ChevronIcon className={`h-4 w-4 transition ${profileOpen ? "rotate-180" : ""}`} />
            </button>
            {profileOpen && (
              <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl bg-white text-slate-900 shadow-xl ring-1 ring-slate-200">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <button
                  type="button"
                  className="flex w-full items-center justify-start px-4 py-3 text-sm font-semibold text-[#d13d10] transition hover:bg-slate-50"
                  onClick={() => setProfileOpen(false)}
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="h-px w-full bg-white/30" />

        <div className="flex flex-col items-center gap-1.5 text-center">
          <div className="text-2xl font-semibold tracking-tight text-white">
            {eventId} <span className="text-white/70">–</span> {eventName}
          </div>
          <div className="flex items-center gap-2 text-base font-semibold uppercase tracking-[0.08em] text-white/95">
            <span className="text-lg">📍</span>
            <span>{venue}</span>
          </div>
          <div className="text-base font-normal lowercase text-white/80">
            • {city}
          </div>
        </div>
      </div>

      <div className="hidden items-center gap-4 px-6 py-4 md:flex">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Open menu"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white shadow-inner shadow-white/10 transition hover:bg-white/28"
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-3">
            <Image
              src="/shared/logos/Atomx_White.png"
              alt="AtomX"
              width={260}
              height={84}
              className="h-14 w-auto object-contain md:h-10 lg:h-12 md:-mt-4"
              priority
            />
            <div className="h-10 w-px bg-white/35" />
          </div>
        </div>

        <div className="flex flex-1 items-center">
          <div className="flex flex-col gap-1">
            <div className="text-2xl font-semibold tracking-tight text-white">
              {eventId} <span className="text-white/70">–</span> {eventName}
            </div>
            <div className="items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-white/90 md:flex">
              <span className="text-base">📍</span>
              <span>{venue}</span>
              <span className="text-white/70">•</span>
              <span className="font-normal lowercase tracking-normal text-white/80">
                {city}
              </span>
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="relative" ref={pageRef}>
            <button
              type="button"
              className="flex h-12 items-center gap-2 rounded-full bg-white/18 px-5 text-base font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/28"
              onClick={() => setPageOpen((v) => !v)}
            >
              <span className="truncate max-w-[160px] md:max-w-[220px]">{currentPage}</span>
              <ChevronIcon className={`h-4 w-4 transition ${pageOpen ? "rotate-180" : ""}`} />
            </button>
            {pageOpen && (
              <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-2xl bg-white text-slate-900 shadow-xl ring-1 ring-slate-200">
                {pages.map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => {
                      onPageChange(page);
                      setPageOpen(false);
                    }}
                    className="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                  >
                    <span className="truncate">{page}</span>
                    {page === currentPage && <span className="text-[10px] text-teal-600">●</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <button
              type="button"
              className="flex h-12 items-center gap-2 rounded-full bg-white/18 px-4 text-white ring-1 ring-white/25 transition hover:bg-white/28"
              onClick={() => setProfileOpen((v) => !v)}
            >
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-white/60 bg-white text-sm font-bold text-[#258d9c]">
                {user?.image ? (
                  <Image src={user.image} alt={user.name ?? "Profile"} width={40} height={40} />
                ) : (
                  initials
                )}
              </div>
              <ChevronIcon className={`h-4 w-4 transition ${profileOpen ? "rotate-180" : ""}`} />
            </button>
            {profileOpen && (
              <div className="absolute right-0 z-20 mt-2 w-60 overflow-hidden rounded-2xl bg-white text-slate-900 shadow-xl ring-1 ring-slate-200">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <button
                  type="button"
                  className="flex w-full items-center justify-start px-4 py-3 text-sm font-semibold text-[#d13d10] transition hover:bg-slate-50"
                  onClick={() => setProfileOpen(false)}
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        eventName={eventName?.toUpperCase() ?? "SUNBURN"}
      />
    </header>
  );
}
