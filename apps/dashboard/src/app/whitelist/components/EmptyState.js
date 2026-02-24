"use client";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#fff5e8] text-[#f88c43]">
        <svg
          viewBox="0 0 24 24"
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="7" y="3" width="10" height="18" rx="2" />
          <path d="M9 7h6" />
          <path d="M9 11h6" />
          <path d="M9 15h6" />
        </svg>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-slate-700">No users found</h3>
        <p className="mt-2 text-sm text-slate-500">
          Try searching with different criteria
        </p>
      </div>
    </div>
  );
}
