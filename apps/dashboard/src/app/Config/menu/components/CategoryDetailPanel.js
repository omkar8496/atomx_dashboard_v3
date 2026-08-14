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

function GstDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-10 items-center gap-1.5 rounded-[10px] bg-[linear-gradient(135deg,#E04420,#341CD6)] px-4 text-[13px] font-semibold text-white transition hover:brightness-105"
      >
        {value}
        <ChevronDownIcon />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1.5 w-[90px] overflow-hidden rounded-[10px] border border-(--line) bg-(--surface) shadow-(--shadowUp)">
          {GST_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`block w-full px-3 py-2 text-left text-[13px] font-semibold transition hover:bg-(--surface2) ${
                value === opt ? "text-(--orange)" : "text-(--text)"
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
            <GstDropdown value={category.gst ?? 0} onChange={(val) => onUpdate?.({ gst: val })} />
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
