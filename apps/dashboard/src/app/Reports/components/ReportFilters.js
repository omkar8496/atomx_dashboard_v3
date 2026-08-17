"use client";

import { useState } from "react";
import { startReportBuild } from "../../../lib/dashboardApi";

const EVENT_VENDOR_OPTIONS = [
  "Event Report",
  "Vendors",
  "Topup",
  "Sale 1",
  "Ticket",
  "NFC SALE",
  "ACTIVITIES",
  "Taxations Testing",
  "Wallet No.: 3",
  "WORLD LINE",
  "testing vendor",
  "Green Acre Academy Demo",
  "MOTO GP",
  "NAYKA DEMO",
  "Tv",
  "FREQ DEMO",
  "Sale 1",
  "TOP UP",
  "MAUSHI",
  "TOPUP",
  "NUVO",
  "TEST KEVIN",
  "TOP-UP",
  "GLOBAL SCHOOL CANTEEN",
  "TOP UP",
  "Sale",
  "Top Up",
  "BAR ROOM 1",
  "Merchandise",
  "gTopUp",
  "GauravSale",
  "GauravTopup",
  "Vendor_LEVEL_IISER",
  "Test topup",
  "Test sale",
  "Test refund",
  "TABLE DEMO",
  "MONALISA_VENDOR",
  "KUNJAN_vendor",
  "EW topup",
  "EW Sale",
  "AccessX",
  "Ayaz AccessX",
  "kunjan topup testing",
  "Imran accessx",
  "a",
  "Durgesh AccessX",
  "Merchandise",
  "bar inventory",
  "Topup",
  "Top up",
  "Sale",
  "Top up",
  "Topup",
  "Sale",
  "Top up",
  "Sale elsewhere",
  "Sale",
  "Pos",
  "CREW MEAL",
  "topup",
  "sale",
  "TOP UP",
  "SALE",
  "CONFERENCE",
  "Top up",
  "Sale",
  "Refund",
  "Top up",
  "Hill top",
  "PRINTER TEST",
  "Top-up 5% demo",
  "Ashpak top up",
  "Sattlite",
  "atul dairy",
  "RAM RESTAURANT",
  "Topup",
  "Top-Up Ezetap",
  "549 Açai menu",
  "Sale",
  "SALE",
  "top up 01",
  "Bar stock",
  "RAM MERCHANDISE",
  "Pos",
  "Top up",
  "Sale",
  "Tab",
  "Food",
  "Top",
  "Foo",
  "POWER STATION",
  "SALE JWCC TESTING APD",
  "POS Pinelab",
  "Bar 3",
  "Sale",
  "Top Up",
  "Sale",
  "Top up",
  "Comp",
  "Aniket-v",
  "ANIKET-OO",
  "ANIKET-007",
  "Durgesh issuance",
  "Rsc",
  "Topup new new new",
  "andys",
  "aaa$",
  "Topup new new new",
  "Top up return",
  "Topup new new new",
  "7626",
  "Top up",
  "Sales",
  "Sale test",
  "Topup new new new",
  "Sa",
  "Pos pinelabs",
];

const REPORT_TYPE_OPTIONS = [
  "SUMMARY",
  "REDEMPTION-ACCESS SUMMARY",
  "COMP TRANSACTION DUMP",
  "PERSO DUMP",
  "INVENTORY STOCK SUMMARY",
  "STALLS STOCK SUMMARY",
  "ACCESSX DUMP",
  "ACCESSX SUMMARY",
  "WHITELIST PERSONS DUMP",
  "BOOKING ITEMS DUMP",
  "CONSENT DUMP",
];

const DAY_OPTIONS = ["0"];

function createRequestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function DownloadIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 2 4 8 6 2-8 4-2 6-4-8-6-2 8-4Z" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function TypeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CheckBox() {
  return <span className="h-4 w-4 rounded-[4px] border border-(--line) bg-(--surface)" />;
}

function LabelCell({ label, icon = null, withCheck = false }) {
  return (
    <div className="flex h-11 items-center gap-2 text-(--muted) max-[640px]:h-9">
      {withCheck ? <CheckBox /> : icon}
      <span className="font-vcr text-[10px] uppercase tracking-[0.14em]">{label}</span>
    </div>
  );
}

function SelectRow({ label, value, icon, withCheck = false, options = null, onChange = null }) {
  return (
    <div className="grid min-h-[58px] grid-cols-[230px_1fr] items-center gap-4 max-[640px]:min-h-[46px] max-[640px]:grid-cols-[110px_minmax(0,1fr)] max-[640px]:gap-2">
      <LabelCell label={label} icon={icon} withCheck={withCheck} />
      {options ? (
        <div className="relative h-11 max-[640px]:h-10">
          <select
            aria-label={label}
            value={value}
            onChange={onChange}
            className="h-full w-full appearance-none rounded-[10px] border border-(--line) bg-(--surface) px-3.5 pr-11 text-[13px] font-medium text-(--text) outline-none transition hover:border-(--orange) focus:border-(--orange)"
          >
            {options.map((option, index) => (
              <option key={`${option}-${index}`} value={String(index)}>
                {option}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-0 grid w-[42px] place-items-center text-(--muted) opacity-60 max-[640px]:w-7">
            <ChevronIcon />
          </span>
        </div>
      ) : (
        <button
          type="button"
          className="grid h-11 grid-cols-[1fr_42px] items-center rounded-[10px] border border-(--line) bg-(--surface) text-left text-(--text) transition hover:border-(--orange) max-[640px]:h-10 max-[640px]:grid-cols-[1fr_28px]"
        >
          <span className="truncate px-3.5 text-[13px] font-medium">{value}</span>
          <span className="grid place-items-center text-(--muted) opacity-60">
            <ChevronIcon />
          </span>
        </button>
      )}
    </div>
  );
}

function DateRow({ startDate, endDate, onStartDateChange, onEndDateChange }) {
  return (
    <div className="grid min-h-[58px] grid-cols-[230px_minmax(280px,650px)] items-center gap-4 max-[640px]:min-h-[46px] max-[640px]:grid-cols-[110px_minmax(0,1fr)] max-[640px]:gap-2">
      <LabelCell label="Dates" withCheck />
      <div className="grid h-11 grid-cols-[48px_1fr_42px_1fr] items-center overflow-hidden rounded-[10px] border border-(--line) bg-(--surface2) max-[640px]:h-10 max-[640px]:grid-cols-[30px_1fr_20px_1fr]">
        <span className="grid h-full place-items-center text-(--muted) opacity-70">
          <ClockIcon />
        </span>
        <input
          type="date"
          aria-label="Report start date"
          value={startDate}
          max={endDate || undefined}
          onChange={(event) => onStartDateChange(event.target.value)}
          className="min-w-0 bg-transparent px-4 text-center text-[13px] text-(--text) outline-none max-[640px]:px-1"
        />
        <span className="text-center text-[13px] text-(--faint)">-</span>
        <input
          type="date"
          aria-label="Report end date"
          value={endDate}
          min={startDate || undefined}
          onChange={(event) => onEndDateChange(event.target.value)}
          className="min-w-0 bg-transparent px-4 text-center text-[13px] text-(--text) outline-none max-[640px]:px-1"
        />
      </div>
    </div>
  );
}

export default function ReportFilters({ eventId, token, onReportStarted }) {
  const [eventVendorIndex, setEventVendorIndex] = useState("0");
  const [reportTypeIndex, setReportTypeIndex] = useState("0");
  const [dayIndex, setDayIndex] = useState("0");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");

  const handleDownload = async () => {
    if (!startDate || !endDate) {
      setSubmitMessage("");
      setSubmitError("Select both start and end dates.");
      return;
    }

    if (endDate < startDate) {
      setSubmitMessage("");
      setSubmitError("End date cannot be before the start date.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    setSubmitMessage("");

    try {
      const response = await startReportBuild({
        eventId,
        token,
        dates: [startDate, endDate],
        days: [Number(DAY_OPTIONS[Number(dayIndex)] ?? 0)],
        idType: EVENT_VENDOR_OPTIONS[Number(eventVendorIndex)] ?? EVENT_VENDOR_OPTIONS[0],
        type: REPORT_TYPE_OPTIONS[Number(reportTypeIndex)] ?? REPORT_TYPE_OPTIONS[0],
        requestId: createRequestId()
      });

      if (response?.success === false) {
        throw new Error(response?.message || "Unable to start the report.");
      }

      setSubmitMessage(response?.message || "Report generation started.");
      onReportStarted?.(response);
    } catch (error) {
      console.error("Failed to start report build", error);
      setSubmitError(error?.message || "Unable to start the report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-[15px] border border-(--line) border-l-[3px] border-l-(--orange) bg-(--surface) p-4 shadow-(--shadow) max-[640px]:p-3">
      <div className="flex flex-col gap-3 border-b border-(--line2) pb-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="font-vcr grid h-9 w-9 place-items-center rounded-[10px] bg-[linear-gradient(140deg,#e04420,#8b5cf6)] text-[12px] text-white">
            01
          </span>
          <h2 className="font-chillax text-[18px] font-semibold text-(--text)">Filter</h2>
        </div>
        <p className="text-[12.5px] font-light text-(--muted)">Select report scope before downloading.</p>
      </div>

      <div className="grid pt-4 lg:grid-cols-[minmax(620px,920px)_1fr]">
        <div>
          <DateRow
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
          <SelectRow
            label="Days"
            value={dayIndex}
            withCheck
            options={DAY_OPTIONS}
            onChange={(event) => setDayIndex(event.target.value)}
          />
          <SelectRow
            label="Event / Vendor"
            value={eventVendorIndex}
            icon={<CompassIcon />}
            options={EVENT_VENDOR_OPTIONS}
            onChange={(event) => setEventVendorIndex(event.target.value)}
          />
          <SelectRow
            label="Type"
            value={reportTypeIndex}
            icon={<TypeIcon />}
            options={REPORT_TYPE_OPTIONS}
            onChange={(event) => setReportTypeIndex(event.target.value)}
          />

          <div className="mt-3 grid min-h-[48px] grid-cols-[230px_minmax(280px,650px)] items-center gap-4 max-[640px]:min-h-[42px] max-[640px]:grid-cols-[110px_minmax(0,1fr)] max-[640px]:gap-2">
            <span />
            <button
              type="button"
              onClick={handleDownload}
              disabled={submitting || eventId === "" || eventId == null}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-(--text) px-5 text-[13.5px] font-semibold text-(--bg) transition duration-200 hover:bg-(--orange) disabled:cursor-not-allowed disabled:opacity-50"
            >
              <DownloadIcon />
              {submitting ? "Starting..." : "Download"}
            </button>
          </div>

          {submitError || submitMessage ? (
            <div className="grid grid-cols-[230px_minmax(280px,650px)] gap-4 pt-2 max-[640px]:grid-cols-[110px_minmax(0,1fr)] max-[640px]:gap-2">
              <span />
              <p className={`text-[11.5px] font-medium ${submitError ? "text-(--orange)" : "text-[#177657]"}`} role="status">
                {submitError || submitMessage}
              </p>
            </div>
          ) : null}
        </div>
        <div className="hidden lg:block" />
      </div>
    </section>
  );
}
