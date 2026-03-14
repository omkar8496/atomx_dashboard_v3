"use client";

export default function SectionHeader({ title, count, actionLabel }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-700">
          {title}
        </div>
        {typeof count === "number" ? (
          <span className="rounded-full bg-[#eaf8fb] px-3 py-1 text-xs font-semibold text-[color:rgb(var(--color-teal))]">
            {count}
          </span>
        ) : null}
      </div>
      {actionLabel ? (
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl bg-[color:rgb(var(--color-orange))] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_12px_30px_rgb(var(--color-orange)/0.35)]"
        >
          <span className="text-sm">+</span>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
