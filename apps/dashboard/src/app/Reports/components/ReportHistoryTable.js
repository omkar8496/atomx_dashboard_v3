"use client";

import { useMemo } from "react";

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

function EmptyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 3h9l3 3v15H6z" />
      <path d="M14 3v4h4M9 12h6M9 16h4" />
    </svg>
  );
}

function formatReportName(value) {
  const normalized = String(value || "Report")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalized.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getReportTime(report) {
  const value = report?.reportCreatedAt ?? report?.reportUpdatedAt;
  const timestamp = value ? new Date(value).getTime() : 0;
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function StatusBadge({ status }) {
  const normalized = String(status || "unknown").trim().toLowerCase();
  const completed = normalized === "completed";
  const failed = normalized === "failed" || normalized === "error";
  const className = completed
    ? "bg-[#e5f7ef] text-[#177657]"
    : failed
      ? "bg-[#fff0ec] text-(--orange)"
      : "bg-[#eeeafd] text-[#4935b8]";

  return (
    <span className={`font-vcr inline-flex rounded-[6px] px-2 py-1 text-[8.5px] uppercase tracking-[0.1em] ${className}`}>
      {normalized || "unknown"}
    </span>
  );
}

export default function ReportHistoryTable({ reports, loading, error }) {
  const orderedReports = useMemo(
    () => [...reports].sort((left, right) => getReportTime(right) - getReportTime(left)),
    [reports]
  );

  return (
    <section className="overflow-hidden rounded-[15px] border border-(--line) border-l-[3px] border-l-(--orange) bg-(--surface) shadow-(--shadow)">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-(--line2) px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="font-vcr grid h-9 min-w-9 place-items-center rounded-[10px] bg-[linear-gradient(140deg,#e04420,#8b5cf6)] px-2 text-[11px] text-white">
            {String(orderedReports.length).padStart(2, "0")}
          </span>
          <div>
            <h2 className="font-chillax text-[18px] font-semibold text-(--text)">Report History</h2>
            <p className="mt-0.5 text-[11.5px] text-(--faint)">Latest requests appear first.</p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="border-b border-(--line2) bg-[rgba(224,68,32,0.05)] px-4 py-3 text-[12px] font-medium text-(--orange)">
          {error}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[940px] border-collapse text-left">
          <thead className="bg-(--surface2)">
            <tr className="border-b border-(--line2)">
              {["ID", "Report", "Requested By", "Created", "Updated", "Status", "File"].map((heading) => (
                <th key={heading} className="font-vcr px-4 py-3 text-[9px] font-normal uppercase tracking-[0.14em] text-(--faint)">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }, (_, index) => (
                <tr key={index} className="border-b border-(--line2) last:border-b-0">
                  {Array.from({ length: 7 }, (__, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-3.5">
                      <span className="block h-3 animate-pulse rounded-[4px] bg-(--line2)" />
                    </td>
                  ))}
                </tr>
              ))
            ) : orderedReports.length ? (
              orderedReports.map((report, index) => (
                <tr key={report?.reportId ?? `${report?.reportName}-${index}`} className="border-b border-(--line2) transition last:border-b-0 hover:bg-(--surface2)">
                  <td className="px-4 py-3 text-[12px] font-semibold text-(--orange)">
                    #{report?.reportId ?? index + 1}
                  </td>
                  <td className="px-4 py-3">
                    <span className="block max-w-[230px] truncate text-[12.5px] font-semibold text-(--text)" title={report?.reportName || "Report"}>
                      {formatReportName(report?.reportName)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="block max-w-[220px] truncate text-[12px] font-medium text-(--text)">{report?.opName || "-"}</span>
                    <span className="mt-0.5 block max-w-[220px] truncate text-[10.5px] text-(--faint)">{report?.opEmail || "-"}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[11.5px] text-(--muted)">{formatDateTime(report?.reportCreatedAt)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-[11.5px] text-(--muted)">{formatDateTime(report?.reportUpdatedAt)}</td>
                  <td className="px-4 py-3"><StatusBadge status={report?.reportStatus} /></td>
                  <td className="px-4 py-3">
                    {report?.reportLink ? (
                      <a
                        href={report.reportLink}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Download ${formatReportName(report?.reportName)}`}
                        title="Download report"
                        className="grid h-8 w-8 place-items-center rounded-[8px] bg-(--text) text-(--bg) transition hover:bg-(--orange)"
                      >
                        <DownloadIcon />
                      </a>
                    ) : (
                      <button
                        type="button"
                        disabled
                        aria-label="Report file unavailable"
                        title="Report file unavailable"
                        className="grid h-8 w-8 cursor-not-allowed place-items-center rounded-[8px] border border-(--line) text-(--faint) opacity-55"
                      >
                        <DownloadIcon />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <span className="mx-auto grid h-10 w-10 place-items-center rounded-[10px] border border-dashed border-(--line) text-(--faint)">
                    <EmptyIcon />
                  </span>
                  <span className="mt-3 block text-[12.5px] font-medium text-(--muted)">No reports found for this event.</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
