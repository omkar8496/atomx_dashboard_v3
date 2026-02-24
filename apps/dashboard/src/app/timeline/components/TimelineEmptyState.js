"use client";

export default function TimelineEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eaf8fb] text-[#1495ab]">
        <svg
          viewBox="0 0 24 24"
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
          <path d="M12 3v2" />
        </svg>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-slate-700">
          No timeline events found
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Events will appear here when available.
        </p>
      </div>
    </div>
  );
}
