"use client";

import { DownloadIcon, PlusIcon, CloudUploadIcon, SaveIcon } from "./MenuIcons";

function Toggle({ active, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-all duration-200 ${
        active ? "bg-[linear-gradient(135deg,#E04420,#341CD6)]" : "bg-(--line)"
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
  onAddCategory,
  onSave,
  saving = false,
  hasUnsavedChanges = false
}) {
  // Sticks directly under the fixed 58px page header. z-35 keeps it above the
  // item-row dropdowns (z-30) and below the header itself (z-40).
  return (
    <div
      style={{ top: "58px" }}
      className="sticky z-[35] flex flex-wrap items-center gap-3 rounded-[15px] border border-(--line) border-l-[3px] border-l-(--orange) bg-(--surface) px-4 py-3 shadow-(--shadow)"
    >
      <span className="font-chillax shrink-0 text-[15px] font-semibold text-(--text)">
        {stallName} <span className="text-(--orange)">MENU</span>
      </span>

      <div className="h-5 w-px shrink-0 bg-(--line)" />

      <div className="flex items-center gap-2 text-[12.5px] font-semibold text-(--muted)">
        <span className="shrink-0">Inactive Categories:</span>
        <Toggle active={inactiveCategories} onToggle={onToggleInactiveCategories} />
      </div>

      <div className="flex-1" />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onDownload}
          className="flex h-9 items-center gap-1.5 rounded-[8px] border border-(--line) bg-(--surface) px-3 text-[12.5px] font-semibold text-(--muted) transition hover:border-(--orange) hover:text-(--orange)"
        >
          <DownloadIcon className="h-3.5 w-3.5" />
          Download
        </button>

        <button
          type="button"
          className="flex h-9 items-center gap-1.5 rounded-[8px] bg-[linear-gradient(135deg,#E04420,#341CD6)] px-3 text-[12.5px] font-semibold text-white transition hover:brightness-105"
        >
          <CloudUploadIcon className="h-3.5 w-3.5" />
          Menu
        </button>

        <button
          type="button"
          onClick={onAddCategory}
          className="flex h-9 items-center gap-1.5 rounded-[8px] border border-(--line) bg-(--surface) px-3 text-[12.5px] font-semibold text-(--muted) transition hover:border-(--orange) hover:text-(--orange)"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          Category
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          title={hasUnsavedChanges ? "You have unsaved changes" : "Everything is saved"}
          className={`flex h-9 cursor-pointer items-center gap-1.5 rounded-[8px] px-3 text-[12.5px] font-semibold text-(--bg) transition hover:bg-(--orange) disabled:cursor-not-allowed disabled:opacity-55 ${
            // Turns orange the moment anything is edited, back to black on save.
            hasUnsavedChanges ? "bg-(--orange)" : "bg-(--text)"
          }`}
        >
          {saving ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <SaveIcon className="h-3.5 w-3.5" />
          )}
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
