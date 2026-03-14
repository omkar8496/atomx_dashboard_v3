"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import { useDashboardStore } from "../../store/dashboardStore";
import { fetchEventDetails, fetchEventsList } from "../../lib/dashboardApi";

export default function AdminClient() {
  const router = useRouter();
  const token = useDashboardStore((state) => state.token);
  const setEventMeta = useDashboardStore((state) => state.setEventMeta);
  const setEventDetails = useDashboardStore((state) => state.setEventDetails);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [queryToken, setQueryToken] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token") || "";
    if (tokenParam) {
      setQueryToken(tokenParam);
    }
  }, []);

  const authToken = token || queryToken || "";

  useEffect(() => {
    if (!authToken) return;
    let active = true;
    const loadEvents = async () => {
      setLoading(true);
      setError("");
      try {
        const list = await fetchEventsList({ token: authToken });
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
  }, [authToken]);

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
    if (!authToken) {
      setError("Missing access token.");
      return;
    }
    if (!selectedEventId) {
      setError("Select an event to continue.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const details = await fetchEventDetails({
        eventId: selectedEventId,
        token: authToken
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
      if (authToken) params.set("token", authToken);
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
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
            <select
              className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[color:rgb(var(--color-teal))] focus:outline-none"
              value={selectedEventId}
              onChange={(event) => setSelectedEventId(event.target.value)}
              disabled={loading || !authToken}
            >
              <option value="">
                {loading ? "Loading events..." : "Select an event"}
              </option>
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
          {error ? (
            <div className="mt-3 text-sm text-rose-500">{error}</div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
