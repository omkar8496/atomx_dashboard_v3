"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getInitials } from "@atomx/lib";
import SideDrawer from "./SideDrawer";
import ProfileMenu from "./ProfileMenu";
import { useDashboardStore } from "../../store/dashboardStore";

export default function Header({
  eventId = null,
  eventName = "SunBurun",
  venue = "Mahalaxmi Race Cours",
  city = "Mumbai, India",
  areaLabel = "Configuration",
  profileName = "Omkar",
  profileInitials = "OD",
  profileRole = "Admin",
  profileEmail = "design@atomx.in",
  breadcrumb = "Profile / Operations",
  variant = "portal",
  showEditEventButton = false,
  hideNav = false
}) {
  const router = useRouter();
  const profile = useDashboardStore((state) => state.profile);
  const storedEventMeta = useDashboardStore((state) => state.eventMeta);
  const storedEventDetails = useDashboardStore((state) => state.eventDetails);
  const selectedService = useDashboardStore((state) => state.selectedService);
  const setEventMeta = useDashboardStore((state) => state.setEventMeta);
  const setSelectedService = useDashboardStore((state) => state.setSelectedService);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    if (typeof document === "undefined") return;
    setTheme(
      document.documentElement.getAttribute("data-atx") === "dark" ? "dark" : "light"
    );
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      if (typeof document !== "undefined") {
        if (next === "dark") {
          document.documentElement.setAttribute("data-atx", "dark");
        } else {
          document.documentElement.removeAttribute("data-atx");
        }
      }
      try {
        window.localStorage.setItem("atomx.theme", next);
      } catch (err) {
        /* ignore storage failures */
      }
      return next;
    });
  };
  const isDark = theme === "dark";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const nextEventId = params.get("eventId");
    const nextEventName = params.get("eventName");
    const nextVenue = params.get("venue");
    const nextCity = params.get("city");
    const nextService = params.get("service");

    if (nextEventId || nextEventName || nextVenue || nextCity) {
      setEventMeta({
        eventId: nextEventId || storedEventMeta?.eventId || eventId,
        eventName: nextEventName || storedEventMeta?.eventName || eventName,
        venue: nextVenue || storedEventMeta?.venue || venue,
        city: nextCity || storedEventMeta?.city || city
      });
    }
    if (nextService && nextService !== selectedService) {
      setSelectedService(nextService);
    }
  }, [
    storedEventMeta,
    eventId,
    eventName,
    venue,
    city,
    selectedService,
    setEventMeta,
    setSelectedService
  ]);

  const resolvedInitials = useMemo(() => {
    if (profile?.name) return getInitials(profile.name);
    return profileInitials;
  }, [profile, profileInitials]);

  const resolvedRole = profile?.type ?? profileRole;
  const resolvedEmail = profile?.email ?? profileEmail;
  const resolvedName = profile?.name ?? profileName;
  const resolvedPicture =
    profile?.picture ?? profile?.image ?? profile?.avatar ?? profile?.photoURL ?? null;
  const resolvedEventMeta = useMemo(() => {
    return {
      eventId:
        storedEventMeta?.eventId ??
        storedEventDetails?.id ??
        profile?.ctx?.eventId ??
        eventId,
      eventName: storedEventMeta?.eventName ?? eventName,
      venue: storedEventMeta?.venue ?? venue,
      city: storedEventMeta?.city ?? city
    };
  }, [storedEventMeta, storedEventDetails, profile, eventId, eventName, venue, city]);

  const headerHeight = "58px";
  const crumbHeight = "0px";
  return (
    <div
      style={{
        "--header-h": headerHeight,
        "--crumb-h": crumbHeight,
        "--header-total-h": "var(--header-h)"
      }}
    >
      <div className="fixed left-0 right-0 top-0 z-40">
        <header
          className="w-full border-b border-(--line) bg-(--surface) text-(--text) shadow-(--shadow)"
          style={{ height: "var(--header-h)" }}
        >
          <div className="flex h-full items-center gap-3 px-4 md:px-5 max-[900px]:gap-2 max-[900px]:px-3">
            <div className="flex min-w-0 items-center gap-3 max-[900px]:gap-2">
              {!hideNav ? (
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(true)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-(--line) bg-(--surface) text-(--text) shadow-(--shadow) transition hover:border-(--orange) hover:text-(--orange) min-[901px]:hidden"
                aria-label="Open navigation"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </svg>
              </button>
              ) : null}
              <span className="relative block h-[40px] w-[100px] shrink-0 overflow-hidden max-[900px]:w-[88px]">
                <Image
                  src="/shared/logos/AtomX_Logo.svg"
                  alt="AtomX logo"
                  width={148}
                  height={148}
                  priority
                  className="absolute -left-[27px] -top-[52px] h-[132px] w-[150px] max-w-none"
                />
              </span>
              <div className="hidden h-9 w-px bg-(--line) sm:block" aria-hidden />
              <div className="font-chillax flex min-w-0 items-center gap-2 text-[1.3rem] font-semibold leading-none tracking-[-0.01em] sm:text-[1.4rem] max-[900px]:gap-1.5 max-[900px]:text-[1.05rem]">
                <span className="truncate text-(--muted)">Portal</span>
                <span className="text-(--faint)">/</span>
                <span className="truncate text-(--orange)">{areaLabel}</span>
              </div>
            </div>
            <div className="flex-1" />
            <span
              className="font-vcr inline-flex shrink-0 items-center gap-2 text-[11px] font-semibold tracking-[0.1em] text-(--muted)"
              aria-label={`Event ID ${resolvedEventMeta.eventId ?? "not selected"}`}
              title="Selected event ID"
            >
              <span className="hidden uppercase sm:inline">Event</span>
              <span className="font-chillax text-[14px] font-bold tracking-[0.01em] text-(--text)">
                #{resolvedEventMeta.eventId ?? "-"}
              </span>
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              aria-pressed={isDark}
              className="mr-1 grid h-8 w-8 shrink-0 place-items-center rounded-[10px] border border-(--line) bg-(--surface) text-(--muted) transition hover:border-(--orange) hover:text-(--orange)"
            >
              {isDark ? (
                <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M20.5 14.2A8.4 8.4 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z" />
                </svg>
              )}
            </button>
            {showEditEventButton ? (
              <button
                type="button"
                onClick={() => router.push("/event-edit")}
                className="mr-1 inline-flex h-9 items-center gap-2 rounded-lg border border-(--line) bg-(--surface) px-3 text-[0.82rem] font-bold text-(--text) shadow-(--shadow) transition hover:border-(--orange) hover:text-(--orange)"
                aria-label="Edit event"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
                </svg>
                <span>Event</span>
              </button>
            ) : null}
            <ProfileMenu
              initials={resolvedInitials}
              name={resolvedName}
              role={resolvedRole}
              email={resolvedEmail}
              picture={resolvedPicture}
              variant="portal"
            />
          </div>
        </header>
      </div>
      <div style={{ height: "var(--header-total-h)" }} />
      {!hideNav ? (
        <SideDrawer
          mobileOpen={isMobileDrawerOpen}
          onMobileClose={() => setIsMobileDrawerOpen(false)}
        />
      ) : null}
    </div>
  );
}
