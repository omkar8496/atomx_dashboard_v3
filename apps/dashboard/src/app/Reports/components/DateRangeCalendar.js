"use client";

import { useMemo, useState } from "react";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function pad(value) {
  return String(value).padStart(2, "0");
}

export function toISODate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Parsed as a local date so the calendar never drifts a day on UTC conversion.
export function parseISODate(value) {
  if (!value) return null;
  const [year, month, day] = String(value).split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatRangeLabel(startDate, endDate) {
  const start = parseISODate(startDate);
  const end = parseISODate(endDate);
  const fmt = (date) =>
    new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
  if (start && end) return `${fmt(start)} - ${fmt(end)}`;
  if (start) return `${fmt(start)} - select end date`;
  return "Select a date range";
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, count) {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

function sameDay(a, b) {
  return Boolean(a && b) && toISODate(a) === toISODate(b);
}

function buildMonthCells(monthStart) {
  const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: monthStart.getDay() }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(monthStart.getFullYear(), monthStart.getMonth(), day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function ArrowIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M10 3.5 5.5 8l4.5 4.5" />
    </svg>
  );
}

function MonthGrid({ monthStart, start, previewEnd, onPick, onHover }) {
  const today = new Date();
  const cells = useMemo(() => buildMonthCells(monthStart), [monthStart]);
  const monthLabel = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(monthStart);

  return (
    <div className="min-w-0">
      <div className="font-chillax mb-2 text-center text-[13.5px] font-semibold text-(--text)">
        {monthLabel}
      </div>
      <div className="grid grid-cols-7">
        {WEEKDAYS.map((day, index) => (
          <div
            key={`${day}-${index}`}
            className="font-vcr pb-1.5 text-center text-[8.5px] tracking-[0.1em] text-(--faint)"
          >
            {day}
          </div>
        ))}
        {cells.map((date, index) => {
          if (!date) return <span key={`empty-${index}`} className="h-8" />;

          const isStart = sameDay(date, start);
          const isEnd = sameDay(date, previewEnd);
          const inRange =
            start && previewEnd && date > start && date < previewEnd;
          const isToday = sameDay(date, today);
          const isEdge = isStart || isEnd;

          return (
            <button
              key={toISODate(date)}
              type="button"
              onClick={() => onPick(date)}
              onMouseEnter={() => onHover(date)}
              aria-label={toISODate(date)}
              aria-pressed={isEdge}
              className={`h-8 cursor-pointer text-[12px] font-medium transition ${
                isEdge
                  ? "bg-(--orange) font-semibold text-white"
                  : inRange
                    ? "bg-[rgba(224,68,32,0.12)] text-(--text)"
                    : "text-(--text) hover:bg-(--chip)"
              } ${isStart ? "rounded-l-[8px]" : ""} ${isEnd ? "rounded-r-[8px]" : ""} ${
                !isEdge && !inRange ? "rounded-[8px]" : ""
              } ${isToday && !isEdge ? "outline outline-1 -outline-offset-1 outline-(--orange)" : ""}`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function DateRangeCalendar({ startDate, endDate, onChange }) {
  const start = parseISODate(startDate);
  const end = parseISODate(endDate);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(start ?? new Date()));
  const [hoverDate, setHoverDate] = useState(null);

  // While picking the end date the hovered day previews the range.
  const previewEnd = end ?? (start && hoverDate && hoverDate > start ? hoverDate : null);

  const handlePick = (date) => {
    // No start yet, or a complete range: begin a new one.
    if (!start || (start && end)) {
      onChange({ startDate: toISODate(date), endDate: "" });
      setHoverDate(null);
      return;
    }
    if (date < start) {
      onChange({ startDate: toISODate(date), endDate: "" });
      return;
    }
    onChange({ startDate: toISODate(start), endDate: toISODate(date) });
    setHoverDate(null);
  };

  const applyPreset = (days) => {
    const endOfRange = new Date();
    const startOfRange = new Date();
    startOfRange.setDate(endOfRange.getDate() - (days - 1));
    onChange({ startDate: toISODate(startOfRange), endDate: toISODate(endOfRange) });
    setViewMonth(startOfMonth(startOfRange));
    setHoverDate(null);
  };

  return (
    <div className="rounded-[12px] border border-(--line) bg-(--surface) p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setViewMonth((current) => addMonths(current, -1))}
          aria-label="Previous month"
          className="grid h-7 w-7 cursor-pointer place-items-center rounded-[8px] border border-(--line) text-(--muted) transition hover:border-(--orange) hover:text-(--orange)"
        >
          <ArrowIcon />
        </button>
        <span className="font-vcr text-[9px] uppercase tracking-[0.16em] text-(--faint)">
          {formatRangeLabel(startDate, endDate)}
        </span>
        <button
          type="button"
          onClick={() => setViewMonth((current) => addMonths(current, 1))}
          aria-label="Next month"
          className="grid h-7 w-7 cursor-pointer place-items-center rounded-[8px] border border-(--line) text-(--muted) transition hover:border-(--orange) hover:text-(--orange)"
        >
          <ArrowIcon className="h-3.5 w-3.5 rotate-180" />
        </button>
      </div>

      <div
        className="grid gap-x-5 gap-y-3 md:grid-cols-2"
        onMouseLeave={() => setHoverDate(null)}
      >
        <MonthGrid
          monthStart={viewMonth}
          start={start}
          previewEnd={previewEnd}
          onPick={handlePick}
          onHover={setHoverDate}
        />
        <div className="hidden md:block">
          <MonthGrid
            monthStart={addMonths(viewMonth, 1)}
            start={start}
            previewEnd={previewEnd}
            onPick={handlePick}
            onHover={setHoverDate}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-(--line2) pt-2.5">
        {[
          { label: "Last 7 days", days: 7 },
          { label: "Last 30 days", days: 30 },
          { label: "Last 90 days", days: 90 }
        ].map((preset) => (
          <button
            key={preset.days}
            type="button"
            onClick={() => applyPreset(preset.days)}
            className="cursor-pointer rounded-[8px] border border-(--line) px-2.5 py-1.5 text-[11.5px] font-medium text-(--muted) transition hover:border-(--orange) hover:text-(--orange)"
          >
            {preset.label}
          </button>
        ))}
        {startDate || endDate ? (
          <button
            type="button"
            onClick={() => onChange({ startDate: "", endDate: "" })}
            className="ml-auto cursor-pointer rounded-[8px] px-2.5 py-1.5 text-[11.5px] font-semibold text-(--orange) transition hover:bg-[rgba(224,68,32,0.06)]"
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}
