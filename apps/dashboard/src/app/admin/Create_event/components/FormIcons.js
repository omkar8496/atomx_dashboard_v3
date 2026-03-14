"use client";

export const IconBadge = ({ children }) => (
  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:rgb(var(--color-bg))] text-[color:rgb(var(--color-teal))]">
    {children}
  </span>
);

export const IconLabel = ({ icon, label }) => (
  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
    <IconBadge>{icon}</IconBadge>
    <span>{label}</span>
  </div>
);

export const TogglePill = ({ active, label, icon, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center gap-4 rounded-full border px-4 py-3 text-sm font-semibold transition-all duration-200 ${
      active
        ? "border-[color:rgb(var(--color-teal))] bg-[#f0fbfd] text-[#0f6d7c]"
        : "border-slate-200 bg-white text-slate-600 hover:border-[color:rgb(var(--color-teal)/0.4)]"
    }`}
  >
    <span
      className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition ${
        active ? "bg-[color:rgb(var(--color-teal))] text-white" : "bg-slate-100 text-slate-400"
      }`}
    >
      {icon}
    </span>
    <span className="text-left">{label}</span>
  </button>
);

export const SwitchRow = ({ active, label, onClick, icon }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm font-semibold transition-all duration-200 ${
      active
        ? "border-[color:rgb(var(--color-teal))] bg-[#f0fbfd] text-[#0f6d7c]"
        : "border-slate-200 bg-white text-slate-600 hover:border-[color:rgb(var(--color-teal)/0.4)]"
    }`}
  >
    <span className="flex items-center gap-3">
      {icon ? (
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition ${
            active ? "bg-[color:rgb(var(--color-teal)/0.15)] text-[color:rgb(var(--color-teal))]" : "bg-slate-100 text-slate-400"
          }`}
        >
          {icon}
        </span>
      ) : null}
      <span>{label}</span>
    </span>
    <span
      className={`flex h-7 w-7 items-center justify-center rounded-full border transition-all ${
        active
          ? "border-[color:rgb(var(--color-teal))] bg-[color:rgb(var(--color-teal))] text-white"
        : "border-slate-300 bg-white text-slate-400"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 12l4 4 8-8" />
      </svg>
    </span>
  </button>
);
