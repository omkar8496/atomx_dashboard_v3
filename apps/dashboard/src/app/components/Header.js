"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import { getInitials } from "@atomx/lib";
import SideDrawer from "./SideDrawer";
import ProfileMenu from "./ProfileMenu";
import { useDashboardStore } from "../../store/dashboardStore";

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

export default function Header({
  eventId = "4004",
  eventName = "SunBurun",
  venue = "Mahalaxmi Race Cours",
  city = "Mumbai, India",
  areaLabel = "Configuration",
  profileInitials = "OD",
  profileRole = "Admin",
  profileEmail = "design@atomx.in",
  breadcrumb = "Profile / Operations"
}) {
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
  const resolvedEventMeta = useMemo(() => {
    return {
      eventId: storedEventMeta?.eventId ?? eventId,
      eventName: storedEventMeta?.eventName ?? eventName,
      venue: storedEventMeta?.venue ?? venue,
      city: storedEventMeta?.city ?? city
    };
  }, [storedEventMeta, eventId, eventName, venue, city]);

  const headerHeight = "60px";
  const crumbHeight = "44px";
  return (
    <div style={{ "--header-h": headerHeight, "--crumb-h": crumbHeight, "--header-total-h": `calc(${headerHeight} + ${crumbHeight})` }}>
      <div className="fixed left-0 right-0 top-0 z-40">
        <header
          className="w-full rounded-none bg-[#258d9c] text-white shadow-[0_14px_28px_rgba(0,0,0,0.25)]"
          style={{ height: "var(--header-h)" }}
        >
          <div className="flex h-full items-center gap-4 px-4">
          <div className="flex items-center gap-3">
            <Image
              src="/shared/logos/Atomx_White.png"
              alt="AtomX"
              width={230}
              height={70}
              className="h-10 -mt-1 w-auto object-contain"
              priority
            />
            <div className="h-8 w-px bg-white/35" />
          </div>

          <div className="flex flex-1 flex-col leading-tight">
            <div className="text-2xl font-semibold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.35)]">
              {resolvedEventMeta.eventId} - {resolvedEventMeta.eventName}
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-white/95">
              <span className="text-base -ml-1">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-white/90"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
              </span>
              <span>{resolvedEventMeta.venue}</span>
              <span className="text-white/70">•</span>
              <span className="font-normal text-white/85">{resolvedEventMeta.city}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ProfileMenu initials={resolvedInitials} role={resolvedRole} email={resolvedEmail} />
          </div>
          </div>
        </header>
        <div className="w-full bg-[color:rgb(var(--color-bg))] text-slate-600" style={{ height: "var(--crumb-h)" }}>
          <div className="flex h-full w-full items-center gap-4 pr-4 pl-12 md:pr-8 md:pl-16 text-sm">
            <div className="flex items-center gap-2 whitespace-nowrap">{breadcrumb}</div>
            <div className="h-px flex-1 bg-slate-300" />
          </div>
        </div>
      </div>
      <div style={{ height: "var(--header-total-h)" }} />
      <SideDrawer />
    </div>
  );
}
