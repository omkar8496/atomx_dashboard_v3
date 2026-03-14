"use client";

export default function FilterRow({ label, icon }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center gap-4 text-[color:rgb(var(--color-teal))]">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eaf8fb]">
          {icon}
        </span>
        <span className="text-base font-semibold uppercase tracking-[0.12em]">
          {label}
        </span>
      </div>
      <div className="h-9 w-16 rounded-full bg-slate-200" />
    </div>
  );
}
