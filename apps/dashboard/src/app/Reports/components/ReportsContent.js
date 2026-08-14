"use client";

import { useEffect, useState } from "react";
import { fetchReportsList } from "../../../lib/dashboardApi";
import { useDashboardStore } from "../../../store/dashboardStore";
import ReportFilters from "./ReportFilters";
import ReportHistoryTable from "./ReportHistoryTable";

function getReports(response) {
  const candidates = [
    response?.reports,
    response?.data?.reports,
    response?.data,
    response?.list
  ];

  return candidates.find(Array.isArray) ?? [];
}

export default function ReportsContent() {
  const token = useDashboardStore((state) => state.token);
  const eventMeta = useDashboardStore((state) => state.eventMeta);
  const eventDetails = useDashboardStore((state) => state.eventDetails);
  const eventId = eventMeta?.eventId ?? eventDetails?.id;
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <div className="space-y-[clamp(14px,1.8vw,20px)]">
      <ReportFilters />
      <ReportHistoryTable reports={reports} loading={loading} error={error} />
    </div>
  );
}
