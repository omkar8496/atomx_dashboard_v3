"use client";

import { useEffect, useState } from "react";
import {
  fetchEventDetails,
  fetchReportsList,
  fetchVendors
} from "../../../lib/dashboardApi";
import { useDashboardStore } from "../../../store/dashboardStore";
import DownloadReportModal from "./DownloadReportModal";
import ReportCards from "./ReportCards";
import ReportHistoryTable, { isReportGenerating } from "./ReportHistoryTable";

const STATUS_POLL_INTERVAL_MS = 2000;
// Stop polling eventually so a report stuck in a non-terminal status cannot
// keep hitting the API for the life of the session.
const STATUS_POLL_TIMEOUT_MS = 10 * 60 * 1000;

function getReports(response) {
  const candidates = [
    response?.reports,
    response?.data?.reports,
    response?.data,
    response?.list
  ];

  return candidates.find(Array.isArray) ?? [];
}

function DownloadIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

export default function ReportsContent() {
  const token = useDashboardStore((state) => state.token);
  const eventMeta = useDashboardStore((state) => state.eventMeta);
  const eventDetails = useDashboardStore((state) => state.eventDetails);
  const setEventDetails = useDashboardStore((state) => state.setEventDetails);
  const setVendorsForEvent = useDashboardStore((state) => state.setVendorsForEvent);
  const profile = useDashboardStore((state) => state.profile);
  const selectedService = useDashboardStore((state) => state.selectedService);
  const eventId = eventMeta?.eventId ?? eventDetails?.id;
  const cachedVendors = useDashboardStore((state) =>
    eventId ? state.vendorsByEventId?.[eventId] : undefined
  );

  // Role for report access: the service token's ctx wins, then the selected
  // service from the portal handoff, then the token's own type.
  const role = profile?.ctx?.type ?? selectedService ?? profile?.type ?? "";
  const detailsMatchEvent =
    eventId != null && eventId !== "" && String(eventDetails?.id ?? "") === String(eventId);
  const eventDays = detailsMatchEvent ? eventDetails?.days : null;
  const eventName = eventDetails?.name ?? eventMeta?.eventName ?? "";

  const [activeTab, setActiveTab] = useState("overview");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [daysLoading, setDaysLoading] = useState(false);
  const [vendors, setVendors] = useState(() => cachedVendors || []);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [modalType, setModalType] = useState(null);

  const refreshReports = () => {
    if (eventId === "" || eventId == null) return;

    setLoading(true);
    setError("");
    fetchReportsList({ eventId, token, dedupe: false })
      .then((response) => setReports(getReports(response)))
      .catch((requestError) => {
        console.error("Failed to refresh reports", requestError);
        setError(requestError?.message || "Unable to refresh reports.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (eventId === "" || eventId == null) {
      setReports([]);
      setLoading(false);
      setError("Select an event to load its reports.");
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    fetchReportsList({ eventId, token })
      .then((response) => {
        if (!cancelled) setReports(getReports(response));
      })
      .catch((requestError) => {
        console.error("Failed to load reports", requestError);
        if (!cancelled) {
          setReports([]);
          setError(requestError?.message || "Unable to load reports.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [eventId, token]);

  // Report day options come from the event's own `days` list, so details must be
  // loaded for the current event before the day picker can be populated.
  useEffect(() => {
    if (eventId === "" || eventId == null || detailsMatchEvent) return undefined;

    let cancelled = false;
    setDaysLoading(true);

    fetchEventDetails({ eventId, token })
      .then((details) => {
        if (!cancelled && details) setEventDetails(details);
      })
      .catch((requestError) => {
        console.error("Failed to load event details for report days", requestError);
      })
      .finally(() => {
        if (!cancelled) setDaysLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [detailsMatchEvent, eventId, setEventDetails, token]);

  // Vendor reports need the event's vendor list for the Event / Vendor selector.
  useEffect(() => {
    if (eventId === "" || eventId == null) {
      setVendors([]);
      return undefined;
    }

    if (cachedVendors?.length) {
      setVendors(cachedVendors);
      return undefined;
    }

    let cancelled = false;
    setVendorsLoading(true);

    fetchVendors({ eventId, token })
      .then((list) => {
        if (cancelled) return;
        const normalized = Array.isArray(list) ? list : [];
        setVendors(normalized);
        setVendorsForEvent(eventId, normalized);
      })
      .catch((requestError) => {
        console.error("Failed to load vendors for reports", requestError);
        if (!cancelled) setVendors([]);
      })
      .finally(() => {
        if (!cancelled) setVendorsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cachedVendors, eventId, setVendorsForEvent, token]);

  // While any request is still generating, re-check the list every 2s so the
  // spinner turns into a download link on its own.
  const hasPendingReports = reports.some((report) => isReportGenerating(report));

  useEffect(() => {
    if (!hasPendingReports || eventId === "" || eventId == null) return undefined;

    let cancelled = false;
    let inFlight = false;
    const startedAt = Date.now();

    const intervalId = window.setInterval(async () => {
      if (cancelled || inFlight) return;
      // Don't poll a background tab.
      if (typeof document !== "undefined" && document.hidden) return;
      if (Date.now() - startedAt > STATUS_POLL_TIMEOUT_MS) {
        window.clearInterval(intervalId);
        return;
      }

      inFlight = true;
      try {
        const response = await fetchReportsList({ eventId, token, dedupe: false });
        if (!cancelled) setReports(getReports(response));
      } catch (requestError) {
        console.error("Failed to poll report status", requestError);
      } finally {
        inFlight = false;
      }
    }, STATUS_POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [eventId, hasPendingReports, token]);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "downloads", label: "Downloads", count: reports.length }
  ];

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-chillax text-[clamp(24px,3vw,32px)] font-semibold leading-[1.05] tracking-[-0.02em] text-(--text)">
            Reports
          </h1>
          <p className="mt-2 text-[13.5px] font-light text-(--muted)">
            Generate and download event, vendor, and summary reports.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalType("")}
          disabled={eventId === "" || eventId == null}
          className="inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-[10px] bg-(--text) px-5 text-[13.5px] font-semibold text-(--bg) transition hover:bg-(--orange) disabled:cursor-not-allowed disabled:opacity-55"
        >
          <DownloadIcon />
          Download report
        </button>
      </div>

      <div className="mt-[clamp(16px,2vw,22px)] flex gap-1 border-b border-(--line)">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-current={isActive ? "page" : undefined}
              className={`flex cursor-pointer items-center gap-2 border-b-2 px-3.5 pb-2.5 pt-2 text-[13px] transition ${
                isActive
                  ? "border-(--orange) font-semibold text-(--text)"
                  : "border-transparent font-normal text-(--muted) hover:text-(--text)"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined ? (
                <span
                  className={`font-vcr rounded-[6px] px-1.5 py-0.5 text-[9.5px] tracking-[0.06em] ${
                    isActive ? "bg-(--text) text-(--bg)" : "bg-(--chip) text-(--faint)"
                  }`}
                >
                  {String(tab.count).padStart(2, "0")}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-[clamp(16px,2vw,22px)]">
        {activeTab === "overview" ? (
          <ReportCards role={role} onSelectReport={(type) => setModalType(type)} />
        ) : (
          <ReportHistoryTable reports={reports} loading={loading} error={error} />
        )}
      </div>

      {modalType !== null ? (
        <DownloadReportModal
          eventId={eventId}
          eventName={eventName}
          token={token}
          role={role}
          initialType={modalType}
          eventDays={eventDays}
          daysLoading={daysLoading}
          vendors={vendors}
          vendorsLoading={vendorsLoading}
          onClose={() => setModalType(null)}
          onSubmitted={refreshReports}
          onViewDownloads={() => setActiveTab("downloads")}
        />
      ) : null}
    </>
  );
}
