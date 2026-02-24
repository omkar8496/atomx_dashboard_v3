"use client";

export default function SectionHeader({ title, count, actionLabel }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
        {title} {typeof count === "number" ? `(${count})` : ""}
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
  );
}
