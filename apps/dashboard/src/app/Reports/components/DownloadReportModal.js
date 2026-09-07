"use client";

import { useEffect, useMemo, useState } from "react";
import { startReportBuild } from "../../../lib/dashboardApi";
import DateRangeCalendar, { formatRangeLabel } from "./DateRangeCalendar";
import { getAccessibleReports, getReportByType } from "./reportCatalogue";

const EVENT_REPORT_VALUE = "event";
const VENDOR_VALUE_PREFIX = "vendor:";
const EVENT_ID_TYPE = "event";
const VENDOR_ID_TYPE = "vendor";

function parseEventDays(value) {
  const rawDays = Array.isArray(value) ? value : String(value ?? "").split(",");
  return rawDays
    .map((day) => String(day ?? "").trim())
    .filter(Boolean)
    .filter((day, index, list) => list.indexOf(day) === index);
}

function toDayPayloadValue(day) {
  const numericDay = Number(day);
  return Number.isNaN(numericDay) ? day : numericDay;
}

function getVendorId(vendor) {
  return vendor?.id ?? vendor?.vendorId ?? vendor?.vendor_id ?? null;
}

function getVendorName(vendor) {
  return vendor?.name ?? vendor?.vendorName ?? vendor?.vendor_name ?? vendor?.title ?? "Unnamed vendor";
}

function createRequestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function CloseIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <svg viewBox="0 0 14 14" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
    </svg>
  );
}

function CheckIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
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

function ChevronIcon({ className = "h-2.5 w-2.5" }) {
  return (
    <svg viewBox="0 0 12 12" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
      <path d="M2.5 4.5 6 8l3.5-3.5" />
    </svg>
  );
}

function ScopeToggle({ checked, onSelect, label, disabled = false }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      disabled={disabled}
      onClick={onSelect}
      className={`flex cursor-pointer items-center gap-2 rounded-[9px] border px-3 py-2 text-[12.5px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 ${
        checked
          ? "border-(--orange) bg-[rgba(224,68,32,0.06)] text-(--text)"
          : "border-(--line) bg-(--surface) text-(--muted) hover:border-(--orange)"
      }`}
    >
      <span
        className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${
          checked ? "border-(--orange)" : "border-(--line)"
        }`}
      >
        {checked ? <span className="h-2 w-2 rounded-full bg-(--orange)" /> : null}
      </span>
      {label}
    </button>
  );
}

function Section({ index, title, hint, children }) {
  return (
    <section className="rounded-[12px] border border-(--line2) bg-(--surface2) p-3.5">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="font-vcr grid h-7 w-7 shrink-0 place-items-center rounded-[8px] bg-[linear-gradient(140deg,#e04420,#8b5cf6)] text-[10px] text-white">
          {index}
        </span>
        <div className="min-w-0">
          <h3 className="font-chillax m-0 text-[14px] font-semibold text-(--text)">{title}</h3>
          {hint ? <p className="m-0 mt-0.5 text-[11.5px] font-light text-(--muted)">{hint}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export default function DownloadReportModal({
  eventId,
  eventName,
  token,
  role,
  initialType = "",
  eventDays,
  daysLoading = false,
  vendors = [],
  vendorsLoading = false,
  onClose,
  onSubmitted,
  onViewDownloads
}) {
  const reports = useMemo(() => getAccessibleReports(role), [role]);
  const dayOptions = useMemo(() => parseEventDays(eventDays), [eventDays]);

  const [scopeMode, setScopeMode] = useState("dates");
  const [range, setRange] = useState({ startDate: "", endDate: "" });
  const [dayValue, setDayValue] = useState(() => dayOptions[0] ?? "");
  const [eventVendorValue, setEventVendorValue] = useState(EVENT_REPORT_VALUE);
  const [reportType, setReportType] = useState(
    () => (getReportByType(initialType) ? initialType : reports[0]?.type ?? "")
  );
  const [typeOpen, setTypeOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const isDaysMode = scopeMode === "days";
  const selectedReport = getReportByType(reportType);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !submitting) onClose?.();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, submitting]);

  // Nothing to switch to when the event exposes no days.
  useEffect(() => {
    if (isDaysMode && dayOptions.length === 0) setScopeMode("dates");
  }, [dayOptions, isDaysMode]);

  useEffect(() => {
    setDayValue((current) => (dayOptions.includes(current) ? current : dayOptions[0] ?? ""));
  }, [dayOptions]);

  const vendorOptions = useMemo(
    () =>
      vendors
        .map((vendor) => ({ id: getVendorId(vendor), name: getVendorName(vendor) }))
        .filter((vendor) => vendor.id !== null && vendor.id !== ""),
    [vendors]
  );

  const selectedVendor = useMemo(() => {
    if (!eventVendorValue.startsWith(VENDOR_VALUE_PREFIX)) return null;
    const vendorId = eventVendorValue.slice(VENDOR_VALUE_PREFIX.length);
    return vendorOptions.find((vendor) => String(vendor.id) === vendorId) ?? null;
  }, [eventVendorValue, vendorOptions]);

  const handleStartDownload = async () => {
    if (!reportType) {
      setError("Select a report type.");
      return;
    }
    if (isDaysMode) {
      if (!dayValue) {
        setError("Select a day.");
        return;
      }
    } else {
      if (!range.startDate || !range.endDate) {
        setError("Select a start and end date.");
        return;
      }
      if (range.endDate < range.startDate) {
        setError("End date cannot be before the start date.");
        return;
      }
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await startReportBuild({
        eventId,
        token,
        // Exactly one scope goes on the wire.
        ...(isDaysMode
          ? { days: [toDayPayloadValue(dayValue)] }
          : { dates: [range.startDate, range.endDate] }),
        id: selectedVendor ? selectedVendor.id : eventId,
        idType: selectedVendor ? VENDOR_ID_TYPE : EVENT_ID_TYPE,
        type: reportType,
        requestId: createRequestId()
      });

      if (response?.success === false) {
        throw new Error(response?.message || "Unable to start the report.");
      }

      setSuccess({
        name: selectedReport?.name ?? reportType,
        target: selectedVendor ? selectedVendor.name : eventName || `Event ${eventId}`,
        scope: isDaysMode ? `Day ${dayValue}` : formatRangeLabel(range.startDate, range.endDate),
        message: response?.message || ""
      });
      onSubmitted?.(response);
    } catch (requestError) {
      console.error("Failed to start report build", requestError);
      setError(requestError?.message || "Unable to start the report.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSuccess(null);
    setError("");
    setRange({ startDate: "", endDate: "" });
  };

  return (
    <div
      className="fixed inset-0 z-[240] flex items-center justify-center bg-[rgba(12,12,12,0.5)] px-4 py-6 backdrop-blur-[3px] max-[820px]:p-0"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Download report"
        className="flex max-h-[calc(100dvh-48px)] w-[820px] max-w-full flex-col overflow-hidden rounded-[16px] border border-(--line) bg-(--surface) shadow-(--shadowUp) max-[820px]:h-full max-[820px]:max-h-full max-[820px]:rounded-none"
      >
        {/* Banner */}
        <div
          className="relative flex shrink-0 items-start gap-3 px-[clamp(16px,2vw,24px)] py-[clamp(14px,1.8vw,20px)] text-[#ebebeb]"
          style={{ background: "linear-gradient(135deg,#1C1C1C 0%,#241C4A 74%,#341CD6 155%)" }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{ background: "repeating-linear-gradient(90deg,#fff 0 1px,transparent 1px 34px)" }}
            aria-hidden
          />
          <div className="relative min-w-0 flex-1">
            <div className="font-vcr text-[9px] tracking-[0.2em] text-(--purple)">REPORTS</div>
            <h2 className="font-chillax mt-1.5 text-[clamp(20px,2.4vw,26px)] font-semibold leading-[1.05] tracking-[-0.02em] text-white">
              Download report
            </h2>
            <p className="mt-1.5 text-[12px] font-light text-white/70">
              Choose the period, the event or vendor, and the report you need.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            className="relative grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-[9px] border border-white/20 text-[#ebebeb] transition hover:border-(--orange) hover:bg-(--orange) disabled:opacity-50"
          >
            <CloseIcon />
          </button>
        </div>

        {success ? (
          <div className="min-h-0 flex-1 overflow-y-auto px-[clamp(16px,2vw,24px)] py-[clamp(18px,2.4vw,28px)]">
            <div className="mx-auto max-w-[460px] text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[linear-gradient(140deg,#e04420,#8b5cf6)] text-white">
                <CheckIcon className="h-6 w-6" />
              </span>
              <h3 className="font-chillax mt-4 text-[20px] font-semibold text-(--text)">
                Request submitted successfully
              </h3>
              <p className="mt-2 text-[13px] font-light leading-[1.5] text-(--muted)">
                Your report generation request has been submitted. It will appear in Downloads and
                the file link shows up there once the report is ready.
              </p>
              <div className="mt-4 rounded-[12px] border border-(--line2) bg-(--surface2) p-3.5 text-left">
                {[
                  ["REPORT", success.name],
                  ["FOR", success.target],
                  ["PERIOD", success.scope]
                ].map(([label, value]) => (
                  <div key={label} className="flex items-baseline justify-between gap-3 border-b border-(--line2) py-1.5 last:border-b-0">
                    <span className="font-vcr text-[8.5px] uppercase tracking-[0.16em] text-(--faint)">{label}</span>
                    <span className="min-w-0 truncate text-[12.5px] font-semibold text-(--text)">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex h-11 cursor-pointer items-center justify-center rounded-[10px] border border-(--line) bg-(--surface) px-5 text-[13.5px] font-semibold text-(--muted) transition hover:border-(--orange) hover:text-(--orange)"
                >
                  Download another
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onViewDownloads?.();
                    onClose?.();
                  }}
                  className="flex h-11 cursor-pointer items-center justify-center rounded-[10px] bg-(--text) px-5 text-[13.5px] font-semibold text-(--bg) transition hover:bg-(--orange)"
                >
                  View downloads
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto px-[clamp(16px,2vw,24px)] py-[clamp(16px,2vw,22px)]">
              <Section index="01" title="Period" hint="Pick a date range or a single event day - one or the other.">
                <div
                  role="radiogroup"
                  aria-label="Report period type"
                  className="mb-3 flex flex-wrap gap-2"
                >
                  <ScopeToggle
                    checked={!isDaysMode}
                    onSelect={() => setScopeMode("dates")}
                    label="Date range"
                  />
                  <ScopeToggle
                    checked={isDaysMode}
                    onSelect={() => setScopeMode("days")}
                    disabled={dayOptions.length === 0}
                    label={daysLoading ? "Days (loading...)" : "Event day"}
                  />
                </div>

                {isDaysMode ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {dayOptions.map((day) => {
                      const isSelected = String(day) === String(dayValue);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => setDayValue(day)}
                          className={`font-vcr flex h-10 cursor-pointer items-center justify-between rounded-[10px] border px-3.5 text-[12px] transition ${
                            isSelected
                              ? "border-(--orange) bg-[rgba(224,68,32,0.06)] text-(--text)"
                              : "border-(--line) bg-(--surface) text-(--muted) hover:border-(--orange)"
                          }`}
                        >
                          <span>{day}</span>
                          {isSelected ? <CheckIcon className="h-3.5 w-3.5 text-(--orange)" /> : null}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <DateRangeCalendar
                    startDate={range.startDate}
                    endDate={range.endDate}
                    onChange={setRange}
                  />
                )}
              </Section>

              <Section index="02" title="Event / Vendor" hint="Run the report for the whole event or a single vendor.">
                <div className="relative">
                  <select
                    aria-label="Event or vendor"
                    value={eventVendorValue}
                    onChange={(event) => setEventVendorValue(event.target.value)}
                    className="h-11 w-full cursor-pointer appearance-none rounded-[10px] border border-(--line) bg-(--surface) px-3.5 pr-9 text-[13px] font-medium text-(--text) outline-none transition hover:border-(--orange) focus:border-(--orange)"
                  >
                    <option value={EVENT_REPORT_VALUE}>
                      Event report{eventName ? ` - ${eventName}` : ""}
                    </option>
                    <optgroup label="Vendors">
                      {vendorOptions.length ? (
                        vendorOptions.map((vendor) => (
                          <option key={vendor.id} value={`${VENDOR_VALUE_PREFIX}${vendor.id}`}>
                            {vendor.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          {vendorsLoading ? "Loading vendors..." : "No vendors found"}
                        </option>
                      )}
                    </optgroup>
                  </select>
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-(--muted) opacity-50">
                    <ChevronIcon />
                  </span>
                </div>
              </Section>

              <Section index="03" title="Report type" hint="Only the reports your role can run are listed.">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setTypeOpen((current) => !current)}
                    disabled={reports.length === 0}
                    aria-haspopup="listbox"
                    aria-expanded={typeOpen}
                    className="flex h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-[10px] border border-(--line) bg-(--surface) px-3.5 text-left text-[13px] font-medium text-(--text) transition hover:border-(--orange) disabled:cursor-not-allowed disabled:bg-(--surface2)"
                  >
                    <span className="truncate">
                      {selectedReport?.name ?? (reports.length ? "Select report" : "No reports available")}
                    </span>
                    <span className="shrink-0 text-(--muted) opacity-60">
                      <ChevronIcon />
                    </span>
                  </button>

                  {typeOpen ? (
                    <div
                      role="listbox"
                      className="absolute left-0 right-0 top-[calc(100%+6px)] z-10 max-h-[240px] overflow-y-auto rounded-[10px] border border-(--line) bg-(--surface) py-1 shadow-(--shadowUp)"
                    >
                      {reports.map((report) => (
                        <button
                          key={report.type}
                          type="button"
                          role="option"
                          aria-selected={report.type === reportType}
                          onClick={() => {
                            setReportType(report.type);
                            setTypeOpen(false);
                          }}
                          className={`block w-full cursor-pointer px-3 py-2 text-left transition hover:bg-(--surface2) ${
                            report.type === reportType ? "bg-(--chip)" : ""
                          }`}
                        >
                          <span
                            className={`block truncate text-[12.5px] ${
                              report.type === reportType
                                ? "font-semibold text-(--orange)"
                                : "font-medium text-(--text)"
                            }`}
                          >
                            {report.name}
                          </span>
                          <span className="mt-0.5 block truncate text-[11px] font-light text-(--muted)">
                            {report.description}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                {selectedReport ? (
                  <p className="mt-2.5 border-l-2 border-(--orange) pl-2.5 text-[11.5px] font-light leading-[1.45] text-(--muted)">
                    {selectedReport.description}
                  </p>
                ) : null}
              </Section>

              {error ? (
                <p className="rounded-[10px] border border-[rgba(224,68,32,0.25)] bg-[rgba(224,68,32,0.06)] px-3 py-2 text-[12.5px] font-semibold text-(--orange)">
                  {error}
                </p>
              ) : null}
            </div>

            <div className="flex shrink-0 items-center gap-2.5 border-t border-(--line) bg-(--surface2) px-[clamp(16px,2vw,24px)] py-3">
              <span className="font-vcr hidden text-[9px] uppercase tracking-[0.14em] text-(--faint) sm:block">
                {isDaysMode ? `Day ${dayValue || "-"}` : formatRangeLabel(range.startDate, range.endDate)}
              </span>
              <div className="ml-auto grid w-full grid-cols-2 gap-2.5 sm:flex sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="flex h-11 cursor-pointer items-center justify-center rounded-[10px] border border-(--line) bg-(--surface) px-5 text-[13.5px] font-semibold text-(--muted) transition hover:border-(--orange) hover:text-(--orange) disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartDownload}
                  disabled={submitting || eventId === "" || eventId == null}
                  className="flex h-11 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-[10px] bg-(--text) px-6 text-[13.5px] font-semibold text-(--bg) transition hover:bg-(--orange) disabled:cursor-not-allowed disabled:opacity-55"
                >
                  <DownloadIcon />
                  {submitting ? "Starting..." : "Start Download"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
