"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import { AtomXLoader } from "@atomx/global-components";
import { useDashboardStore } from "../../store/dashboardStore";
import { fetchEventDetails, fetchEventsList } from "../../lib/dashboardApi";

const ACCESS_FALLBACK_PATH = "/access";
const ADMIN_BACK_GUARD_KEY = "__atomxAdminBackGuard";
const SEARCH_PLACEHOLDERS = [
  "Search By Event",
  "Name Try Sunburn Arena",
  "Search by Event ID"
];
const DEFAULT_EVENT_IMAGE = "/images/event_card.avif";
const FALLBACK_EVENT_IMAGE = "/images/event_card.png";
const EVENT_ACTIONS = [
  { id: "open", label: "Open event" },
  { id: "reports", label: "Reports" },
  { id: "analytics", label: "Analytics" },
  { id: "devices", label: "Devices" }
];

function parseDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function classifyEvent(eventItem) {
  const rawStatus = String(
    eventItem?.status ??
      eventItem?.eventStatus ??
      eventItem?.state ??
      eventItem?.eventState ??
      ""
  ).toLowerCase();

  const startDate = parseDate(
    eventItem?.startAt ??
      eventItem?.startDate ??
      eventItem?.eventStartDate ??
      eventItem?.eventStart ??
      eventItem?.start_date ??
      eventItem?.start
  );
  const endDate = parseDate(
    eventItem?.endAt ??
      eventItem?.endDate ??
      eventItem?.eventEndDate ??
      eventItem?.eventEnd ??
      eventItem?.end_date ??
      eventItem?.end
  );
  const now = new Date();

  if (endDate && endDate < now) return "past";
  if (startDate && startDate > now) return "upcoming";
  if (startDate && endDate && startDate <= now && endDate >= now) return "present";

  if (/(past|closed|complete|completed|ended|expired)/.test(rawStatus)) {
    return "past";
  }
  if (/(upcoming|upcomming|future|scheduled)/.test(rawStatus)) {
    return "upcoming";
  }
  if (/(present|live|running|ongoing)/.test(rawStatus)) {
    return "present";
  }

  return "present";
}

function getEventSearchText(eventItem) {
  return [
    eventItem?.id,
    eventItem?.eventId,
    eventItem?.name,
    eventItem?.eventName,
    eventItem?.title,
    eventItem?.venue,
    eventItem?.city,
    eventItem?.locationCity
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getEventId(eventItem) {
  return eventItem?.id ?? eventItem?.eventId ?? "";
}

function getEventName(eventItem) {
  return eventItem?.name ?? eventItem?.eventName ?? eventItem?.title ?? "Untitled Event";
}

function getEventCity(eventItem) {
  return eventItem?.locationCity ?? eventItem?.city ?? "-";
}

function getEventVenue(eventItem) {
  return eventItem?.venue ?? "-";
}

function getEventCountry(eventItem) {
  const country = eventItem?.country ?? "India";
  return String(country)
    .split(" ")
    .filter(Boolean)
    .map((word) => `${word.slice(0, 1).toUpperCase()}${word.slice(1).toLowerCase()}`)
    .join(" ");
}

function getEventDate(eventItem) {
  const eventDate = parseDate(
    eventItem?.startAt ??
      eventItem?.startDate ??
      eventItem?.eventStartDate ??
      eventItem?.eventStart ??
      eventItem?.start_date ??
      eventItem?.start ??
      eventItem?.createdAt
  );

  if (!eventDate) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(eventDate);
}

function getEventStatusLabel(eventItem) {
  const bucket = classifyEvent(eventItem);
  if (bucket === "past") return "Past";
  if (bucket === "upcoming") return "Upcomming";
  return "Present";
}

function EventActionIcon({ type }) {
  if (type === "reports") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z" />
        <path d="M14 2v5h5" />
        <path d="M9 13h6" />
        <path d="M9 17h6" />
      </svg>
    );
  }

  if (type === "analytics") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4 19h16" />
        <path d="M7 16V9" />
        <path d="M12 16V5" />
        <path d="M17 16v-4" />
      </svg>
    );
  }

  if (type === "devices") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="7" y="2" width="10" height="20" rx="2" />
        <path d="M11 18h2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );
}

export default function AdminClient() {
  const router = useRouter();
  const token = useDashboardStore((state) => state.token);
  const setEventMeta = useDashboardStore((state) => state.setEventMeta);
  const setEventDetails = useDashboardStore((state) => state.setEventDetails);
  const [events, setEvents] = useState([]);
  const [openingEventId, setOpeningEventId] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchPlaceholder, setSearchPlaceholder] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const pushGuardState = () => {
      window.history.pushState({ [ADMIN_BACK_GUARD_KEY]: true }, "", window.location.href);
    };

    pushGuardState();
    const onPopState = (event) => {
      if (event.state?.[ADMIN_BACK_GUARD_KEY]) return;
      setShowExitConfirm(true);
      pushGuardState();
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  const handleBackConfirm = () => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem("atomx.portal.token");
      window.localStorage.removeItem("atomx.dashboard.token");
      window.localStorage.removeItem("atomx.portal.reauth");
      const keysToRemove = [];
      for (let i = 0; i < window.localStorage.length; i += 1) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith("atomx.auth.")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => window.localStorage.removeItem(key));
      if (window.sessionStorage) {
        window.sessionStorage.clear();
      }
    } catch (err) {
      console.error("Failed to clear session on exit", err);
    }
    const accessBase = process.env.NEXT_PUBLIC_ACCESS_PORTAL_URL || "/";
    const target = new URL(accessBase, window.location.origin);
    if (target.pathname === ACCESS_FALLBACK_PATH) {
      target.pathname = "/";
    }
    window.location.assign(target.toString());
  };

  useEffect(() => {
    let active = true;
    const loadEvents = async () => {
      setLoading(true);
      setError("");
      try {
        const list = await fetchEventsList({ token });
        if (!active) return;
        setEvents(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Failed to load events", err);
        if (active) {
          setError("Unable to load events.");
          setEvents([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    loadEvents();
    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let pauseTicks = 0;

    const timer = setInterval(() => {
      const phrase = SEARCH_PLACEHOLDERS[phraseIndex];

      if (pauseTicks > 0) {
        pauseTicks -= 1;
        return;
      }

      if (!deleting) {
        charIndex += 1;
        setSearchPlaceholder(phrase.slice(0, charIndex));
        if (charIndex >= phrase.length) {
          deleting = true;
          pauseTicks = 10;
        }
        return;
      }

      charIndex -= 1;
      setSearchPlaceholder(phrase.slice(0, Math.max(charIndex, 0)));
      if (charIndex <= 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % SEARCH_PLACEHOLDERS.length;
        pauseTicks = 3;
      }
    }, 90);

    return () => clearInterval(timer);
  }, []);

  const tabCounts = useMemo(() => {
    const counts = {
      all: events.length,
      past: 0,
      present: 0,
      upcoming: 0
    };

    events.forEach((eventItem) => {
      const bucket = classifyEvent(eventItem);
      counts[bucket] += 1;
    });

    return counts;
  }, [events]);

  const visibleEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return events.filter((eventItem) => {
      const bucket = classifyEvent(eventItem);
      const matchesTab = activeTab === "all" || bucket === activeTab;
      const matchesSearch = !query || getEventSearchText(eventItem).includes(query);
      return matchesTab && matchesSearch;
    });
  }, [activeTab, events, searchQuery]);

  const handleOpenEvent = async (eventId) => {
    if (!eventId) {
      setError("Event details are missing.");
      return;
    }
    const selectedEventId = String(eventId);
    setSubmitting(true);
    setOpeningEventId(selectedEventId);
    setError("");
    try {
      const details = await fetchEventDetails({
        eventId: selectedEventId,
        token
      });
      if (details) {
        setEventDetails(details);
        setEventMeta({
          eventId: details.id ?? selectedEventId,
          eventName: details.name ?? details.eventName ?? "",
          venue: details.venue ?? "",
          city: details.locationCity ?? ""
        });
      }
      const params = new URLSearchParams();
      if (details?.id ?? selectedEventId) params.set("eventId", details?.id ?? selectedEventId);
      if (details?.name) params.set("eventName", details.name);
      if (details?.venue) params.set("venue", details.venue);
      if (details?.locationCity) params.set("city", details.locationCity);
      router.push(`/Config?${params.toString()}`);
    } catch (err) {
      console.error("Failed to load event details", err);
      setError("Unable to load event details.");
    } finally {
      setSubmitting(false);
      setOpeningEventId("");
    }
  };

  const tabs = [
    { id: "all", label: "All", count: tabCounts.all },
    { id: "past", label: "Past", count: tabCounts.past },
    { id: "present", label: "Present", count: tabCounts.present },
    { id: "upcoming", label: "Upcomming", count: tabCounts.upcoming }
  ];
  const contentShellClass = "w-full pr-4 pl-[72px] md:pr-6 md:pl-[88px]";

  return (
    <main className="min-h-screen bg-[color:rgb(var(--color-bg))] pb-10">
      <Header areaLabel="Event List" breadcrumb="Admin" variant="portal" />
      <div className={`${contentShellClass} border-b border-[#d8d8d8] pt-7 pb-3`}>
        <div className="flex items-center justify-between gap-6">
          <div className="flex min-w-0 flex-wrap items-center gap-8">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`relative flex items-center gap-3 pb-3 text-[0.95rem] font-semibold transition ${
                    active ? "text-[#171717]" : "text-[#858585] hover:text-[#333333]"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-[0.68rem] font-semibold ${
                      active
                        ? "bg-[#1f1f1f] text-white"
                        : "bg-white text-[#8c8c8c]"
                    }`}
                  >
                    {tab.count}
                  </span>
                  {active ? (
                    <span className="absolute -bottom-[13px] left-0 right-0 h-[2px] bg-[#e04420]" />
                  ) : null}
                </button>
              );
            })}
          </div>

          <label className="flex w-[360px] max-w-[42vw] items-center gap-3 text-[#8a8a8a]">
            <span className="sr-only">Search events</span>
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-8 min-w-0 flex-1 bg-transparent text-sm font-medium text-[#2f3544] outline-none placeholder:text-[#9b9b9b]"
              placeholder={searchPlaceholder || SEARCH_PLACEHOLDERS[0]}
            />
          </label>
        </div>
      </div>

      <div className={`${contentShellClass} mt-5`}>
        {loading ? (
          <div className="rounded-xl bg-white py-12 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
            <AtomXLoader label="Loading events..." size={56} />
          </div>
        ) : null}

        {error ? (
          <div className="mb-4 rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-500">
            {error}
          </div>
        ) : null}

        {!loading && visibleEvents.length === 0 ? (
          <div className="rounded-xl bg-white px-6 py-12 text-center text-sm font-semibold text-[#777777] shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
            No events found.
          </div>
        ) : null}

        {!loading && visibleEvents.length > 0 ? (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {visibleEvents.map((eventItem) => {
              const eventId = String(getEventId(eventItem));
              const isOpening = openingEventId === eventId;
              const details = [
                { label: "City", value: getEventCity(eventItem) },
                { label: "Venue", value: getEventVenue(eventItem) },
                { label: "Country", value: getEventCountry(eventItem) },
                { label: "Date", value: getEventDate(eventItem) }
              ];

              return (
                <article
                  key={eventId || getEventName(eventItem)}
                  className="w-full rounded-lg bg-white p-2.5 shadow-[0_16px_34px_rgba(18,22,33,0.10)]"
                >
                  <div
                    className="relative overflow-hidden rounded-md bg-slate-200"
                    style={{ aspectRatio: "2.45 / 1" }}
                  >
                    <img
                      src={DEFAULT_EVENT_IMAGE}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                      onError={(event) => {
                        event.currentTarget.src = FALLBACK_EVENT_IMAGE;
                      }}
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-white px-3.5 py-1.5 text-[0.78rem] font-semibold text-[#262626] shadow-[0_8px_16px_rgba(0,0,0,0.08)]">
                      {getEventStatusLabel(eventItem)}
                    </span>
                  </div>

                  <h2 className="mt-3 truncate text-[1rem] font-medium leading-tight text-[#242424]">
                    {getEventName(eventItem)}
                  </h2>

                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                    {details.map((item) => (
                      <div key={`${eventId}-${item.label}`} className="min-w-0">
                        <div className="text-[0.72rem] font-semibold text-[#9a9a9a]">
                          {item.label}
                        </div>
                        <div className="mt-1 min-h-[1.25rem] text-[0.82rem] font-semibold leading-snug text-[#555555]">
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {EVENT_ACTIONS.map((action) => (
                      <button
                        key={action.id}
                        type="button"
                        aria-label={action.label}
                        title={action.label}
                        onClick={() => handleOpenEvent(eventId)}
                        disabled={submitting || !eventId}
                        className="flex h-9 items-center justify-center rounded-md border border-transparent text-[#202020] transition hover:translate-y-[-1px] hover:text-[#e04420] hover:shadow-[0_10px_18px_rgba(224,68,32,0.12)] disabled:cursor-not-allowed disabled:opacity-55"
                        style={{
                          background:
                            "linear-gradient(#fff, #fff) padding-box, linear-gradient(135deg, #f04a35, #5c42f4) border-box"
                        }}
                      >
                        {isOpening && action.id === "open" ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#e04420] border-t-transparent" />
                        ) : (
                          <EventActionIcon type={action.id} />
                        )}
                      </button>
                    ))}
                  </div>
                </article>
              );
            })}
          </section>
        ) : null}
      </div>
      {showExitConfirm ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_24px_50px_rgba(15,23,42,0.22)]">
            <h3 className="text-lg font-semibold text-slate-900">Take Exit?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Do you really want to take exit?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                No
              </button>
              <button
                type="button"
                onClick={handleBackConfirm}
                className="rounded-lg bg-[color:rgb(var(--color-orange))] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_18px_rgb(var(--color-orange)/0.25)] hover:brightness-105"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
