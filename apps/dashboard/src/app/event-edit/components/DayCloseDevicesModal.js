"use client";

import { useEffect, useMemo, useState } from "react";

const COLUMNS = [
  { key: "device", label: "DEVICE" },
  { key: "type", label: "TYPE" },
  { key: "mac", label: "MAC" },
  { key: "lastLoginAt", label: "TIMESTAMPS" }
];

function formatTimestamp(value) {
  if (!value) return "NA";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function normalizeDevice(device, index) {
  return {
    key: `${device?.device ?? device?.hardwareId ?? "device"}-${index}`,
    device: device?.device ?? "-",
    type: device?.deviceType ?? "-",
    model: device?.model ?? "-",
    mac: device?.hardwareId ?? "-",
    androidId: device?.androidId ?? "-",
    lastLoginAt: device?.lastLoginAt ?? null,
    dayClosedAt: device?.dayClosedAt ?? null
  };
}

function CloseIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <svg viewBox="0 0 14 14" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
    </svg>
  );
}

function SearchIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function SortArrows({ active, direction }) {
  return (
    <svg width="9" height="11" viewBox="0 0 9 11" fill="currentColor" className="shrink-0" aria-hidden>
      <path d="M4.5 0l3 3.4h-6z" opacity={active && direction === 1 ? "1" : "0.3"} />
      <path d="M4.5 11l-3-3.4h6z" opacity={active && direction === -1 ? "1" : "0.3"} />
    </svg>
  );
}

export default function DayCloseDevicesModal({
  devices = [],
  loadError = "",
  eventName = "",
  closing = false,
  onClose,
  onConfirm
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ key: "device", direction: 1 });

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !closing) onClose?.();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closing, onClose]);

  const rows = useMemo(() => devices.map(normalizeDevice), [devices]);

  const visibleRows = useMemo(() => {
    const search = query.trim().toLowerCase();
    const filtered = search
      ? rows.filter((row) =>
          [row.device, row.type, row.model, row.mac, row.androidId]
            .map((value) => String(value ?? "").toLowerCase())
            .join(" ")
            .includes(search)
        )
      : rows;

    const sorted = [...filtered].sort((left, right) => {
      const a = left[sort.key];
      const b = right[sort.key];
      if (sort.key === "lastLoginAt") {
        return ((a ? new Date(a).getTime() : 0) - (b ? new Date(b).getTime() : 0)) * sort.direction;
      }
      return String(a ?? "").localeCompare(String(b ?? ""), undefined, { numeric: true }) * sort.direction;
    });

    return sorted;
  }, [query, rows, sort]);

  const toggleSort = (key) => {
    setSort((current) =>
      current.key === key ? { key, direction: current.direction * -1 } : { key, direction: 1 }
    );
  };

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center bg-[rgba(12,12,12,0.5)] px-4 py-6 backdrop-blur-[3px] max-[820px]:p-0"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !closing) onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Devices still open"
        className="flex max-h-[calc(100dvh-48px)] w-[980px] max-w-full flex-col overflow-hidden rounded-[16px] border border-(--line) bg-(--surface) shadow-(--shadowUp) max-[820px]:h-full max-[820px]:max-h-full max-[820px]:rounded-none"
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
            <div className="font-vcr text-[9px] tracking-[0.2em] text-(--purple)">DAY CLOSE</div>
            <h2 className="font-chillax mt-1.5 text-[clamp(20px,2.4vw,26px)] font-semibold leading-[1.05] tracking-[-0.02em] text-white">
              {loadError ? "Open devices unknown" : "Devices still open"}
            </h2>
            <p className="mt-1.5 text-[12px] font-light text-white/70">
              {loadError
                ? "The open-device check could not be completed. Proceed only if you are sure."
                : `Kindly close all devices to proceed with day close${eventName ? ` for ${eventName}` : ""}.`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={closing}
            aria-label="Close"
            className="relative grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-[9px] border border-white/20 text-[#ebebeb] transition hover:border-(--orange) hover:bg-(--orange) disabled:opacity-50"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-[clamp(16px,2vw,24px)] py-[clamp(14px,1.8vw,20px)]">
          {loadError ? (
            <p className="rounded-[10px] border border-[rgba(224,68,32,0.25)] bg-[rgba(224,68,32,0.06)] px-3.5 py-2.5 text-[12.5px] font-semibold text-(--orange)">
              {loadError}
            </p>
          ) : (
            <>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <span className="font-vcr grid h-9 min-w-9 shrink-0 place-items-center rounded-[10px] bg-[linear-gradient(140deg,#e04420,#8b5cf6)] px-2 text-[12px] text-white">
                  {String(rows.length).padStart(2, "0")}
                </span>
                <label className="flex h-11 min-w-[240px] flex-1 items-center gap-2.5 rounded-[10px] border border-(--line) bg-(--surface) px-3.5 text-(--muted) transition focus-within:border-(--orange) focus-within:shadow-[0_0_0_3px_rgba(224,68,32,0.12)] max-[640px]:h-10">
                  <SearchIcon className="h-4 w-4 shrink-0 opacity-60" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search device, type, model, MAC"
                    className="h-full min-w-0 flex-1 bg-transparent text-[13px] font-medium text-(--text) outline-none placeholder:text-(--faint)"
                  />
                </label>
              </div>

              <div className="overflow-x-auto rounded-[12px] border border-(--line)">
                <table className="w-full min-w-[720px] border-collapse text-left">
                  <thead className="bg-(--surface2)">
                    <tr className="border-b border-(--line2)">
                      {COLUMNS.map((column) => (
                        <th key={column.key} className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => toggleSort(column.key)}
                            className="font-vcr inline-flex cursor-pointer items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-(--faint) transition hover:text-(--orange)"
                          >
                            {column.label}
                            <SortArrows active={sort.key === column.key} direction={sort.direction} />
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.length ? (
                      visibleRows.map((row) => (
                        <tr
                          key={row.key}
                          className="border-b border-(--line2) transition last:border-b-0 hover:bg-(--surface2)"
                        >
                          <td className="px-4 py-3">
                            <span className="font-chillax text-[15px] font-semibold text-(--text)">
                              {row.device}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-[12.5px] font-semibold text-(--text)">{row.type}</div>
                            <div className="mt-0.5 text-[11.5px] font-light text-(--muted)">{row.model}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-vcr text-[11.5px] text-(--blue) [overflow-wrap:anywhere]">
                              {row.mac}
                            </div>
                            <div className="font-vcr mt-0.5 text-[10.5px] text-(--faint) [overflow-wrap:anywhere]">
                              {row.androidId}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-baseline gap-2">
                              <span className="font-vcr shrink-0 text-[8.5px] uppercase tracking-[0.14em] text-(--orange)">
                                Login
                              </span>
                              <span className="text-[12px] font-medium text-(--text)">
                                {formatTimestamp(row.lastLoginAt)}
                              </span>
                            </div>
                            <div className="mt-1 flex items-baseline gap-2">
                              <span className="font-vcr shrink-0 text-[8.5px] uppercase tracking-[0.14em] text-[#0284c7]">
                                Closed
                              </span>
                              <span className="text-[12px] font-medium text-(--muted)">
                                {formatTimestamp(row.dayClosedAt)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={COLUMNS.length} className="px-4 py-10 text-center text-[13px] font-medium text-(--muted)">
                          No devices match this search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2.5 border-t border-(--line) bg-(--surface2) px-[clamp(16px,2vw,24px)] py-3">
          <span className="font-vcr hidden text-[9px] uppercase tracking-[0.14em] text-(--faint) sm:block">
            {loadError ? "Check unavailable" : `${rows.length} device(s) still open`}
          </span>
          <div className="ml-auto grid w-full grid-cols-2 gap-2.5 sm:flex sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={closing}
              className="flex h-11 cursor-pointer items-center justify-center rounded-[10px] border border-(--line) bg-(--surface) px-5 text-[13.5px] font-semibold text-(--muted) transition hover:border-(--orange) hover:text-(--orange) disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={closing}
              className="flex h-11 cursor-pointer items-center justify-center whitespace-nowrap rounded-[10px] bg-(--orange) px-6 text-[13.5px] font-semibold text-white transition hover:bg-(--text) hover:text-(--bg) disabled:cursor-not-allowed disabled:opacity-55"
            >
              {closing ? "Closing..." : "Day Close"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
