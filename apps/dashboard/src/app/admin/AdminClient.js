"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import { AtomXLoader } from "@atomx/global-components";
import { useDashboardStore } from "../../store/dashboardStore";
import { fetchEventDetails, fetchEventsList } from "../../lib/dashboardApi";

const ACCESS_FALLBACK_PATH = "/access";
const ADMIN_BACK_GUARD_KEY = "__atomxAdminBackGuard";

export default function AdminClient() {
  const router = useRouter();
  const setEventMeta = useDashboardStore((state) => state.setEventMeta);
  const setEventDetails = useDashboardStore((state) => state.setEventDetails);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showExitConfirm, setShowExitConfirm] = useState(false);

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
        const list = await fetchEventsList({});
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
  }, []);

  const options = useMemo(() => {
    return events.map((eventItem) => {
      const id = eventItem?.id ?? eventItem?.eventId ?? "";
      const name = eventItem?.name ?? eventItem?.eventName ?? eventItem?.title ?? "Event";
      return {
        id: String(id),
        label: `${id} - ${name}`
      };
    });
  }, [events]);

  const handleSelect = async () => {
    if (!selectedEventId) {
      setError("Select an event to continue.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const details = await fetchEventDetails({
        eventId: selectedEventId
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
      router.push(`/Config/operations?${params.toString()}`);
    } catch (err) {
      console.error("Failed to load event details", err);
      setError("Unable to load event details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[color:rgb(var(--color-bg))] pb-10">
      <Header areaLabel="Admin" breadcrumb="Admin" />
      <div className="w-full pr-3 pl-12 md:pr-6 md:pl-16 mt-2">
        <div className="rounded-lg border border-[#e8d9d3] bg-white px-6 py-6 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
          <div className="text-sm font-semibold text-slate-700">Select Event</div>
          {loading && options.length === 0 ? (
            <AtomXLoader label="Loading events..." size={56} className="mt-4" />
          ) : (
            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
              <select
                className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[color:rgb(var(--color-teal))] focus:outline-none"
                value={selectedEventId}
                onChange={(event) => setSelectedEventId(event.target.value)}
                disabled={loading}
              >
                <option value="">Select an event</option>
                {options.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleSelect}
                disabled={loading || submitting || !selectedEventId}
                className="rounded-md bg-[color:rgb(var(--color-teal))] px-4 py-2 text-sm font-semibold text-white shadow-[0_6px_12px_rgb(var(--color-teal)/0.25)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Opening..." : "Continue"}
              </button>
            </div>
          )}
          {error ? (
            <div className="mt-3 text-sm text-rose-500">{error}</div>
          ) : null}
        </div>
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
