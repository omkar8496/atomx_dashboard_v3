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
        active
          ? "bg-[linear-gradient(135deg,#E04420,#341CD6)] shadow-[0_8px_16px_rgba(52,28,214,0.14)]"
          : "bg-[#dce3ed]"
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
        className="flex h-9 items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,#E04420,#341CD6)] px-4 text-[0.82rem] font-bold text-white shadow-[0_8px_16px_rgba(52,28,214,0.16)] transition hover:brightness-105"
      >
        {value}
        <ChevronDownIcon />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1.5 w-[90px] overflow-hidden rounded-lg border border-[#eeeeee] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.12)]">
          {GST_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`block w-full px-3 py-2 text-left text-[0.82rem] font-semibold transition hover:bg-[#fff5ec] ${
                value === opt
                  ? "text-[#E04420]"
                  : "text-[#333333]"
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
    <div className="border-b border-[#f0f0f0] bg-white px-5 py-4">
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)_minmax(0,1.35fr)]">

        {/* NAME */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#777777]">
            <GearIcon className="h-3.5 w-3.5 text-[#E04420]" />
            <span>NAME</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-[#dedede] bg-[#fafafa] px-3 py-2 transition focus-within:border-[#E04420] focus-within:ring-2 focus-within:ring-[#E04420]/10">
              <GearIcon className="h-3.5 w-3.5 shrink-0 text-[#c6c6c6]" />
              <input
                type="text"
                value={category.name}
                onChange={(e) => onUpdate?.({ name: e.target.value })}
                placeholder="Category name"
                className="min-w-0 flex-1 bg-transparent text-[0.86rem] font-medium text-[#1C1C1C] outline-none placeholder:text-[#9a9a9a]"
              />
            </div>
            <Toggle
              active={category.active}
              onToggle={() => onUpdate?.({ active: !category.active })}
            />
          </div>
        </div>

        {/* VAT */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#777777]">
            <GearIcon className="h-3.5 w-3.5 text-[#E04420]" />
            <span>VAT</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex w-[86px] items-center gap-1.5 rounded-lg border border-[#dedede] bg-[#fafafa] px-2.5 py-2 transition focus-within:border-[#E04420] focus-within:ring-2 focus-within:ring-[#E04420]/10">
              <GearIcon className="h-3.5 w-3.5 shrink-0 text-[#c6c6c6]" />
              <input
                type="number"
                value={category.vat ?? 0}
                onChange={(e) => onUpdate?.({ vat: Number(e.target.value) })}
                min={0}
                className="w-full min-w-0 bg-transparent text-[0.86rem] font-medium text-[#1C1C1C] outline-none"
              />
            </div>
            <button
              type="button"
              className="rounded-full bg-[#1C1C1C] px-4 py-2 text-[0.78rem] font-bold text-white shadow-[0_8px_16px_rgba(28,28,28,0.14)] transition hover:bg-[#E04420]"
            >
              Apply
            </button>
          </div>
        </div>

        {/* GST */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#777777]">
            <GearIcon className="h-3.5 w-3.5 text-[#E04420]" />
            <span>GST</span>
          </div>
          <div className="flex items-center gap-2">
            <GstDropdown
              value={category.gst ?? 0}
              onChange={(val) => onUpdate?.({ gst: val })}
            />
            <button
              type="button"
              onClick={() => onUpdate?.({ gstInclusive: !category.gstInclusive })}
              className="flex h-9 items-center gap-1 rounded-full bg-[#1C1C1C] px-4 text-[0.78rem] font-bold text-white shadow-[0_8px_16px_rgba(28,28,28,0.14)] transition hover:bg-[#E04420]"
            >
              {category.gstInclusive ? "INCLU" : "EXCLU"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
