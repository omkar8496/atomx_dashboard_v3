"use client";

export default function TypeSelect() {
  return (
    <div className="rounded-2xl bg-white px-5 py-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center gap-4 text-[#1495ab]">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eaf8fb]">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 2h7l5 5v15a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
            <path d="M14 2v5h5" />
            <path d="M9 13h6" />
          </svg>
        </span>
        <span className="text-base font-semibold uppercase tracking-[0.12em]">
          Type
        </span>
      </div>
      <button
        type="button"
        className="mt-4 flex w-full items-center justify-between rounded-2xl bg-[#f88c43] px-5 py-4 text-left text-base font-semibold text-white shadow-[0_12px_30px_rgba(248,140,67,0.35)]"
      >
        Summary
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </div>
  );
}
