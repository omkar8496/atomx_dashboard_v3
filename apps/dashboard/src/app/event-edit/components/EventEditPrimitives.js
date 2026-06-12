"use client";

export function SearchIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function UploadIcon({ className = "h-7 w-7" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4v12" />
      <path d="m7 9 5-5 5 5" />
      <path d="M5 20h14" />
    </svg>
  );
}

export function CalendarIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </svg>
  );
}

export function SectionCard({ title, description, children, className = "" }) {
  return (
    <section className={`rounded-lg border border-[#e8e8e8] border-l-[3px] border-l-[#E04420] bg-white p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)] ${className}`}>
      <div className="mb-4">
        <h2 className="text-[1.1rem] font-medium leading-none text-[#1f1f1f]">{title}</h2>
        {description ? (
          <p className="mt-3 text-[0.78rem] font-normal text-[#888888]">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function Field({
  label,
  value = "",
  onChange,
  placeholder = "",
  type = "text",
  icon = null
}) {
  return (
    <label className="block">
      <span className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#858585]">
        {label}
      </span>
      <span className="mt-2 flex h-10 items-center rounded-md border border-[#dedede] bg-[#fbfbfb] px-3 text-[0.78rem] font-semibold text-[#858585] transition focus-within:border-[#E04420] focus-within:ring-2 focus-within:ring-[#E04420]/10">
        <input
          type={type}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-[#1f1f1f] outline-none placeholder:text-[#9a9a9a]"
        />
        {icon ? <span className="text-[#1f1f1f]">{icon}</span> : null}
      </span>
    </label>
  );
}

export function SelectField({ label, value = "Select Printer", onChange, options = ["Select Printer", "sprin_3", "USB Printer", "Network Printer"] }) {
  return (
    <label className="block">
      <span className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#858585]">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        className="mt-2 flex h-10 w-full rounded-md border border-[#dedede] bg-[#fbfbfb] px-3 text-[0.78rem] font-semibold text-[#1f1f1f] outline-none transition focus:border-[#E04420] focus:ring-2 focus:ring-[#E04420]/10"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Toggle({ on = true, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      className={`relative inline-flex h-[22px] w-[44px] shrink-0 items-center rounded-full shadow-[0_8px_18px_rgba(52,28,214,0.16)] ${
        on ? "bg-[linear-gradient(135deg,#E04420,#341CD6)]" : "bg-[#dfe4ee]"
      }`}
    >
      <span className={`h-[18px] w-[18px] rounded-full bg-white shadow transition-transform ${on ? "translate-x-[23px]" : "translate-x-0.5"}`} />
    </button>
  );
}

export function SettingRow({ label, checked = true, onToggle, children = null }) {
  return (
    <div className="flex min-h-[38px] items-center justify-between gap-4 border-b border-[#eeeeee] py-2 last:border-b-0">
      <span className="text-[0.78rem] font-semibold text-[#3f3f3f]">{label}</span>
      {children || <Toggle on={checked} onToggle={onToggle} />}
    </div>
  );
}

export function UploadBox() {
  return (
    <div className="grid min-h-[135px] place-items-center rounded-md border border-dashed border-[#ff9b89] bg-[#fff9f8] px-4 py-5 text-center">
      <div className="flex flex-col items-center justify-center text-[#E04420]">
        <UploadIcon className="h-7 w-7" />
        <p className="mt-3 text-[0.86rem] font-bold text-[#1f1f1f]">Upload event poster</p>
        <p className="mt-3 text-[0.76rem] font-normal text-[#888888]">Drag and drop or browse media</p>
      </div>
    </div>
  );
}

export function TopupRow({ index, cash, token, onCashChange, onTokenChange }) {
  return (
    <div className="grid grid-cols-[52px_1fr_1fr] items-end gap-3">
      <span className="pb-3 text-[0.95rem] font-bold text-[#0f8797]">#{index}</span>
      <Field label="Cash" value={cash} onChange={onCashChange} />
      <Field label="Token" value={token} onChange={onTokenChange} />
    </div>
  );
}
