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
const EVENT_ACTIONS = [
  { id: "open", label: "Open dashboard" },
  { id: "reports", label: "Reports" },
  // { id: "analytics", label: "Analytics" },
  { id: "devices", label: "Devices" }
];

const STATUS_STYLES = {
  past: {
    a: "#3a3a38",
    b: "#1c1c1c",
    badgeBg: "rgba(255,255,255,0.9)",
    badgeFg: "#1c1c1c",
    dot: "#9b9a97",
    pulse: false,
    border: "linear-gradient(135deg,rgba(28,28,28,.22),rgba(28,28,28,.07))"
  },
  present: {
    a: "#e04420",
    b: "#341cd6",
    badgeBg: "rgba(224,68,32,0.92)",
    badgeFg: "#fff",
    dot: "#fff",
    pulse: true,
    border: "linear-gradient(135deg,rgba(224,68,32,.65),rgba(52,28,214,.35))"
  },
  upcoming: {
    a: "#341cd6",
    b: "#00a9f2",
    badgeBg: "rgba(52,28,214,0.9)",
    badgeFg: "#fff",
    dot: "#00a9f2",
    pulse: false,
    border: "linear-gradient(135deg,rgba(52,28,214,.5),rgba(0,169,242,.22))"
  }
};

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

function posterBackground(status, id) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.present;
  const seed = Number(String(id).replace(/\D/g, "")) || 0;
  const rot = 110 + (seed % 7) * 14;
  return `linear-gradient(${rot}deg, ${style.a}, ${style.b})`;
}

function EventActionIcon({ type }) {
  if (type === "reports") {
    return (
      <svg viewBox="0 0 16 16" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4 1.9h4.9L12.1 5.1v9H4z" />
        <path d="M8.9 1.9v3.2h3.2" />
        <path d="M6.1 8.7h4M6.1 11.1h2.9" />
      </svg>
    );
  }
  if (type === "analytics") {
    return (
      <svg viewBox="0 0 16 16" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden>
        <path d="M2.3 13.4h11.4" />
        <path d="M4.6 13.4V7.2M8 13.4V3.4M11.4 13.4V9.4" />
      </svg>
    );
  }
  if (type === "devices") {
    return (
      <svg viewBox="0 0 16 16" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="4.4" y="1.9" width="7.2" height="12.2" rx="1.4" />
        <path d="M6.6 4.4h2.8M6.8 11.7h2.4" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" className="h-[15px] w-[15px]" fill="currentColor" aria-hidden>
      <rect x="2" y="2" width="5" height="6.6" rx="1.2" />
      <rect x="9" y="2" width="5" height="4.2" rx="1.2" opacity=".55" />
      <rect x="2" y="10.2" width="5" height="3.8" rx="1.2" opacity=".55" />
      <rect x="9" y="7.8" width="5" height="6.2" rx="1.2" />
    </svg>
  );
}

function EventPoster({ eventItem, status }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.present;
  const id = String(getEventId(eventItem));
  const words = getEventName(eventItem)
    .toUpperCase()
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 3);

  return (
    <div
      className="relative overflow-hidden border-b border-(--line2)"
      style={{ aspectRatio: "16 / 9", background: posterBackground(status, id) }}
    >
      <svg className="pointer-events-none absolute -right-6 -top-8 h-[150%] w-auto opacity-70" viewBox="0 0 300 300" fill="none" aria-hidden>
        {[0, 1, 2].map((ring) => (
          <circle
            key={ring}
            cx="230"
            cy="70"
            r={60 + ring * 42}
            stroke="#fff"
            strokeOpacity={0.16 - ring * 0.04}
            strokeWidth="1.5"
          />
        ))}
      </svg>

      <div className="relative flex h-full flex-col justify-between p-3">
        <div className="flex items-start justify-between">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 backdrop-blur"
            style={{ background: style.badgeBg, color: style.badgeFg }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: style.dot, animation: style.pulse ? "atxLive 1.4s ease-in-out infinite" : undefined }}
            />
            <span className="font-vcr text-[9px] tracking-[0.14em]">{status.toUpperCase()}</span>
          </span>
          <span className="font-vcr rounded-[7px] bg-[rgba(28,28,28,0.62)] px-2 py-1.5 text-[9px] tracking-[0.12em] text-[#ebebeb] backdrop-blur">
            #{id || "—"}
          </span>
        </div>

        <div>
          <span className="mb-2 block h-1 w-10 rounded-full bg-white/85" />
          {words.map((word, index) => (
            <div
              key={`${word}-${index}`}
              className="text-[22px] font-bold uppercase leading-[1.02] tracking-[-0.01em] text-white"
              style={{ opacity: 1 - index * 0.22 }}
            >
              {word}
            </div>
          ))}
          <div className="font-vcr mt-2 text-[9px] tracking-[0.24em] text-white/60">
            ATOMX · {String(getEventCity(eventItem)).toUpperCase()}
          </div>
        </div>
      </div>
    </div>
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
    { id: "upcoming", label: "Upcoming", count: tabCounts.upcoming }
  ];
  const shellClass = "mx-auto w-full max-w-[1680px] px-[clamp(16px,3vw,32px)]";

  return (
    <main className="min-h-screen bg-(--bg) pb-24">
      <style>{`@keyframes atxLive{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.7)}}@keyframes atxCardIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>
      <Header areaLabel="Event List" variant="portal" hideNav />

      <div className="sticky top-[58px] z-30 border-b border-(--line) bg-(--bg) pt-3">
        <div className={`${shellClass} flex flex-wrap items-center gap-4`}>
          <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex shrink-0 items-center gap-2 border-b-2 px-3.5 pb-2.5 pt-2 text-[13px] transition ${
                    active
                      ? "border-(--orange) font-semibold text-(--text)"
                      : "border-transparent font-normal text-(--muted) hover:text-(--text)"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`font-vcr rounded-[6px] px-1.5 py-0.5 text-[9.5px] tracking-[0.06em] ${
                      active ? "bg-(--text) text-(--bg)" : "bg-(--chip) text-(--faint)"
                    }`}
                  >
                    {String(tab.count).padStart(2, "0")}
                  </span>
                </button>
              );
            })}
          </div>

          <label className="mb-3 flex h-[38px] min-w-[210px] items-center gap-2 rounded-[11px] border border-(--line) bg-(--surface) px-3 text-(--muted) focus-within:border-(--orange)">
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 opacity-50" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
              <circle cx="7" cy="7" r="4.6" />
              <path d="M10.5 10.5 14 14" />
            </svg>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-full min-w-0 flex-1 bg-transparent text-[12.5px] text-(--text) outline-none placeholder:text-(--faint)"
              placeholder={searchPlaceholder || SEARCH_PLACEHOLDERS[0]}
            />
          </label>
        </div>
      </div>

      <div className={`${shellClass} pt-[clamp(18px,2.5vw,26px)]`}>
        {loading ? (
          <div className="rounded-[15px] border border-(--line) bg-(--surface) py-12 shadow-(--shadow)">
            <AtomXLoader label="Loading events..." size={56} />
          </div>
        ) : null}

        {error ? (
          <div className="mb-4 rounded-[10px] border border-[rgba(224,68,32,0.25)] bg-[rgba(224,68,32,0.06)] px-4 py-3 text-sm font-medium text-(--orange)">
            {error}
          </div>
        ) : null}

        {!loading && visibleEvents.length === 0 ? (
          <div className="rounded-[16px] border border-dashed border-(--line) px-6 py-14 text-center">
            <div className="font-chillax text-[19px] font-medium text-(--text)">No events match</div>
            <div className="mt-1.5 text-[12.5px] text-(--faint)">Try a different tab or clear the search.</div>
          </div>
        ) : null}

        {!loading && visibleEvents.length > 0 ? (
          <section
            className="grid gap-[clamp(12px,1.1vw,16px)]"
            style={{ gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,250px),1fr))" }}
          >
            {visibleEvents.map((eventItem, index) => {
              const eventId = String(getEventId(eventItem));
              const bucket = classifyEvent(eventItem);
              const isOpening = openingEventId === eventId;
              const meta = [
                { label: "CITY", value: getEventCity(eventItem) },
                { label: "VENUE", value: getEventVenue(eventItem) },
                { label: "COUNTRY", value: getEventCountry(eventItem) },
                { label: "DATE", value: getEventDate(eventItem) }
              ];
              const theme = STATUS_STYLES[bucket] ?? STATUS_STYLES.present;

              return (
                <article
                  key={eventId || getEventName(eventItem)}
                  className="flex flex-col overflow-hidden rounded-[15px] border border-transparent shadow-(--shadow) transition-shadow duration-200 hover:shadow-(--shadowUp)"
                  style={{
                    background: `linear-gradient(var(--surface),var(--surface)) padding-box, ${theme.border} border-box`,
                    animation: "atxCardIn 0.35s both",
                    animationDelay: `${index * 0.035}s`
                  }}
                >
                  <EventPoster eventItem={eventItem} status={bucket} />

                  <div className="px-[14px] pt-[14px]">
                    <div className="font-chillax truncate text-[15.5px] font-medium tracking-[-0.01em]">
                      {getEventName(eventItem)}
                    </div>
                  </div>

                  <div className="mx-[14px] mt-2.5 grid grid-cols-2 gap-px overflow-hidden rounded-[9px] border border-(--line2) bg-(--line2)">
                    {meta.map((item) => (
                      <div key={item.label} className="min-w-0 bg-(--surface2) px-[9px] py-[7px]">
                        <div className="font-vcr text-[7.5px] tracking-[0.15em] text-(--faint)">{item.label}</div>
                        <div className="mt-0.5 truncate text-[12.5px] font-medium">{item.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto grid grid-cols-4 gap-1.5 px-[14px] pb-[14px] pt-[11px]">
                    {EVENT_ACTIONS.map((action) => (
                      <button
                        key={action.id}
                        type="button"
                        aria-label={action.label}
                        title={action.label}
                        onClick={() => handleOpenEvent(eventId)}
                        disabled={submitting || !eventId || action.id === "analytics"}
                        className="flex h-8 items-center justify-center rounded-[9px] border border-(--line) bg-(--surface) text-(--muted) transition hover:border-(--orange) hover:bg-(--chip) hover:text-(--orange) disabled:cursor-not-allowed disabled:opacity-55"
                      >
                        {isOpening && action.id === "open" ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-(--orange) border-t-transparent" />
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
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(12,12,12,0.5)] p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-(--line) bg-(--surface) p-5 text-(--text) shadow-(--shadowUp)">
            <h3 className="font-chillax text-lg font-semibold">Take Exit?</h3>
            <p className="mt-2 text-sm text-(--muted)">Do you really want to take exit?</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="rounded-[10px] border border-(--line) px-4 py-2 text-sm font-semibold text-(--muted) transition hover:border-(--orange) hover:text-(--orange)"
              >
                No
              </button>
              <button
                type="button"
                onClick={handleBackConfirm}
                className="rounded-[10px] bg-(--text) px-4 py-2 text-sm font-semibold text-(--bg) transition hover:bg-(--orange)"
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
