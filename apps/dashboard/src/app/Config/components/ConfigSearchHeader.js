"use client";

export default function ConfigSearchHeader({ placeholder, actionLabel }) {
  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 text-slate-400"
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
            placeholder={placeholder}
            className="w-full border-0 bg-transparent text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        {actionLabel ? (
          <button
            type="button"
            className="rounded-xl bg-[#f88c43] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_12px_30px_rgba(248,140,67,0.35)]"
          >
            + {actionLabel}
          </button>
        ) : null}
      </div>
      <div className="mt-3 h-px bg-slate-200/70" />
    </div>
  );
}
