"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getInitials } from "@atomx/lib";
import SideDrawer from "./SideDrawer";
import ProfileMenu from "./ProfileMenu";
import { useDashboardStore } from "../../store/dashboardStore";

export default function Header({
  eventId = "4004",
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
  showEditEventButton = false
}) {
  const router = useRouter();
  const profile = useDashboardStore((state) => state.profile);
  const storedEventMeta = useDashboardStore((state) => state.eventMeta);
  const selectedService = useDashboardStore((state) => state.selectedService);
  const setEventMeta = useDashboardStore((state) => state.setEventMeta);
  const setSelectedService = useDashboardStore((state) => state.setSelectedService);

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
      eventId: storedEventMeta?.eventId ?? eventId,
      eventName: storedEventMeta?.eventName ?? eventName,
      venue: storedEventMeta?.venue ?? venue,
      city: storedEventMeta?.city ?? city
    };
  }, [storedEventMeta, eventId, eventName, venue, city]);

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
          className="w-full border-b border-[#ececec] bg-white text-[#171717] shadow-[0_6px_24px_rgba(15,23,42,0.08)]"
          style={{ height: "var(--header-h)" }}
        >
          <div className="flex h-full items-center gap-3 px-4 md:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="relative block h-[40px] w-[100px] shrink-0 overflow-hidden">
                <Image
                  src="/shared/logos/AtomX_Logo.svg"
                  alt="AtomX logo"
                  width={148}
                  height={148}
                  priority
                  className="absolute -left-[27px] -top-[52px] h-[132px] w-[150px] max-w-none"
                />
              </span>
              <div className="hidden h-9 w-px bg-[#dddddd] sm:block" aria-hidden />
              <div className="flex min-w-0 items-center gap-2 text-[1.35rem] font-semibold leading-none sm:text-[1.48rem]">
                <span className="truncate text-[#202020]">Portal</span>
                <span className="text-[#969696]">-</span>
                <span className="truncate text-[#e04420]">{areaLabel}</span>
              </div>
            </div>
            <div className="flex-1" />
            {showEditEventButton ? (
              <button
                type="button"
                onClick={() => router.push("/event-edit")}
                className="mr-1 inline-flex h-9 items-center gap-2 rounded-lg border border-[#e5e5e5] bg-white px-3 text-[0.82rem] font-bold text-[#1c1c1c] shadow-[0_8px_18px_rgba(15,23,42,0.06)] transition hover:border-[#d5b7ff] hover:text-[#e04420] hover:shadow-[0_10px_22px_rgba(224,68,32,0.09)]"
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
      <SideDrawer />
    </div>
  );
}
