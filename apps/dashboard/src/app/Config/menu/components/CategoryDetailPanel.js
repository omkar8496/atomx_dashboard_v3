"use client";

import { useEffect, useRef, useState } from "react";
import { GearIcon, ChevronDownIcon } from "./MenuIcons";

const GST_OPTIONS = [0, 5, 12, 18, 28];

function Toggle({ active, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={`flex h-7 w-14 shrink-0 items-center rounded-full p-1 transition-all duration-200 ${
        active ? "bg-[linear-gradient(135deg,#E04420,#341CD6)]" : "bg-(--line)"
      }`}
    >
      <span
        className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          active ? "translate-x-7" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function clampGst(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.min(Math.max(numeric, 0), 100);
}

// Any percentage can be typed; the standard slabs remain as quick presets.
function GstField({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(String(value ?? 0));
  const ref = useRef(null);

  useEffect(() => {
    setDraft(String(value ?? 0));
  }, [value]);

  useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const commit = (raw) => {
    const next = clampGst(raw === "" ? 0 : raw);
    setDraft(String(next));
    onChange(next);
  };

  return (
    <div ref={ref} className="relative">
      <div className="flex h-10 items-center rounded-[10px] border border-(--line) bg-(--surface2) pl-2.5 transition focus-within:border-(--orange)">
        <input
          type="number"
          inputMode="decimal"
          min={0}
          max={100}
          step="any"
          value={draft}
          aria-label="GST percentage"
          onChange={(e) => setDraft(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit(e.currentTarget.value);
            }
          }}
          className="w-[52px] min-w-0 bg-transparent text-[13px] font-semibold text-(--text) outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span className="pr-1 text-[12.5px] font-semibold text-(--muted)">%</span>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Choose a standard GST slab"
          aria-expanded={open}
          className="grid h-full w-8 cursor-pointer place-items-center rounded-r-[9px] border-l border-(--line) text-(--muted) transition hover:text-(--orange)"
        >
          <ChevronDownIcon />
        </button>
      </div>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1.5 w-[104px] overflow-hidden rounded-[10px] border border-(--line) bg-(--surface) shadow-(--shadowUp)">
          {GST_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                commit(opt);
                setOpen(false);
              }}
              className={`block w-full cursor-pointer px-3 py-2 text-left text-[13px] font-semibold transition hover:bg-(--surface2) ${
                Number(value) === opt ? "text-(--orange)" : "text-(--text)"
              }`}
            >
              {opt}%
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryDetailPanel({ category, onUpdate }) {
  if (!category) return null;

  return (
    <div className="border-b border-(--line2) bg-(--surface) px-5 py-4">
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)_minmax(0,1.35fr)]">
        {/* NAME */}
        <div className="flex flex-col gap-3">
          <div className="font-vcr flex items-center gap-2 text-[8.5px] uppercase tracking-[0.18em] text-(--muted)">
            <GearIcon className="h-3.5 w-3.5 text-(--orange)" />
            <span>NAME</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-1 items-center gap-2 rounded-[10px] border border-(--line) bg-(--surface2) px-3 py-2.5 transition focus-within:border-(--orange)">
              <GearIcon className="h-3.5 w-3.5 shrink-0 text-(--faint)" />
              <input
                type="text"
                value={category.name}
                onChange={(e) => onUpdate?.({ name: e.target.value })}
                placeholder="Category name"
                className="min-w-0 flex-1 bg-transparent text-[13px] font-medium text-(--text) outline-none placeholder:text-(--faint)"
              />
            </div>
            <Toggle active={category.active} onToggle={() => onUpdate?.({ active: !category.active })} />
          </div>
        </div>

        {/* VAT */}
        <div className="flex flex-col gap-3">
          <div className="font-vcr flex items-center gap-2 text-[8.5px] uppercase tracking-[0.18em] text-(--muted)">
            <GearIcon className="h-3.5 w-3.5 text-(--orange)" />
            <span>VAT</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex w-[86px] items-center gap-1.5 rounded-[10px] border border-(--line) bg-(--surface2) px-2.5 py-2.5 transition focus-within:border-(--orange)">
              <GearIcon className="h-3.5 w-3.5 shrink-0 text-(--faint)" />
              <input
                type="number"
                value={category.vat ?? 0}
                onChange={(e) => onUpdate?.({ vat: Number(e.target.value) })}
                min={0}
                className="w-full min-w-0 bg-transparent text-[13px] font-medium text-(--text) outline-none"
              />
            </div>
            <button
              type="button"
              className="rounded-[10px] bg-(--text) px-4 py-2.5 text-[12.5px] font-semibold text-(--bg) transition hover:bg-(--orange)"
            >
              Apply
            </button>
          </div>
        </div>

        {/* GST */}
        <div className="flex flex-col gap-3">
          <div className="font-vcr flex items-center gap-2 text-[8.5px] uppercase tracking-[0.18em] text-(--muted)">
            <GearIcon className="h-3.5 w-3.5 text-(--orange)" />
            <span>GST</span>
          </div>
          <div className="flex items-center gap-2">
            <GstField value={category.gst ?? 0} onChange={(val) => onUpdate?.({ gst: val })} />
            <button
              type="button"
              onClick={() => onUpdate?.({ gstInclusive: !category.gstInclusive })}
              className="flex h-10 items-center gap-1 rounded-[10px] bg-(--text) px-4 text-[12.5px] font-semibold text-(--bg) transition hover:bg-(--orange)"
            >
              {category.gstInclusive ? "INCLU" : "EXCLU"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
