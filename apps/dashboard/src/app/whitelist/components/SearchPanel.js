"use client";

export default function SearchPanel() {
  return (
    <div className="rounded-3xl bg-gradient-to-r from-[#16b3a3] to-[#0b8f85] px-6 py-6 text-white shadow-[0_16px_40px_rgba(11,143,133,0.35)]">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4">
        <div className="flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3 text-slate-700 shadow-sm">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 text-[#0b8f85]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            type="text"
            placeholder="Search by NAME / BOOKING-ID / AWB / CARD ID"
            className="w-full border-0 bg-transparent text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
        <button
          type="button"
          className="rounded-xl bg-[#0b8f85] px-8 py-2 text-sm font-semibold shadow hover:brightness-105"
        >
          Search
        </button>
      </div>
    </div>
  );
}
