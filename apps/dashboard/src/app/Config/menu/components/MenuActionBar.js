"use client";

import { DownloadIcon, PlusIcon, CloudUploadIcon, SaveIcon } from "./MenuIcons";

function Toggle({ active, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-all duration-200 ${
        active
          ? "bg-[linear-gradient(135deg,#E04420,#341CD6)] shadow-[0_8px_16px_rgba(52,28,214,0.14)]"
          : "bg-[#dce3ed]"
      }`}
    >
      <span
        className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          active ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function MenuActionBar({
  stallName = "Stall",
  inactiveCategories,
  onToggleInactiveCategories,
  onDownload,
  onAddCategory
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[#ded4ff] border-l-[3px] border-l-[#E04420] bg-white px-4 py-3 shadow-[0_18px_36px_rgba(15,23,42,0.08)]">
      <span className="shrink-0 text-[0.9rem] font-bold text-[#232323]">
        {stallName}{" "}
        <span className="text-[#E04420]">MENU</span>
      </span>

      <div className="h-5 w-px shrink-0 bg-[#e5e5e5]" />

      <div className="flex items-center gap-2 text-[0.82rem] font-semibold text-[#555555]">
        <span className="shrink-0">Inactive Categories:</span>
        <Toggle active={inactiveCategories} onToggle={onToggleInactiveCategories} />
      </div>

      <div className="flex-1" />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onDownload}
          className="flex h-8 items-center gap-1.5 rounded-md border border-[#e5e5e5] bg-white px-3 text-[0.78rem] font-semibold text-[#555555] transition hover:border-[#D5B7FF] hover:text-[#202020] hover:shadow-[0_6px_12px_rgba(15,23,42,0.08)]"
        >
          <DownloadIcon className="h-3.5 w-3.5" />
          Download
        </button>

        <button
          type="button"
          className="flex h-8 items-center gap-1.5 rounded-md bg-[linear-gradient(135deg,#E04420,#341CD6)] px-3 text-[0.78rem] font-semibold text-white shadow-[0_8px_16px_rgba(52,28,214,0.18)] transition hover:brightness-105"
        >
          <CloudUploadIcon className="h-3.5 w-3.5" />
          Menu
        </button>

        <button
          type="button"
          onClick={onAddCategory}
          className="flex h-8 items-center gap-1.5 rounded-md border border-[#e5e5e5] bg-white px-3 text-[0.78rem] font-semibold text-[#555555] transition hover:border-[#E04420] hover:text-[#E04420] hover:shadow-[0_6px_12px_rgba(15,23,42,0.08)]"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          Category
        </button>

        <button
          type="button"
          className="flex h-8 items-center gap-1.5 rounded-md bg-[#202020] px-3 text-[0.78rem] font-semibold text-white transition hover:bg-[#111111]"
        >
          <SaveIcon className="h-3.5 w-3.5" />
          Save
        </button>
      </div>
    </div>
  );
}
