"use client";

const FIELD_CLASS =
  "h-11 w-full min-w-0 rounded-[10px] border border-(--line) bg-(--surface) px-3.5 text-[13px] font-medium text-(--text) outline-none transition placeholder:text-(--faint) focus:border-(--orange) focus:shadow-[0_0_0_3px_rgba(224,68,32,0.12)] max-[640px]:h-10";

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

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 12 12"
      className="pointer-events-none absolute right-3.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-(--muted) opacity-50"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M2.5 4.5 6 8l3.5-3.5" />
    </svg>
  );
}

export function SectionCard({ index, title, description, children, className = "" }) {
  return (
    <section
      className={`min-w-0 rounded-[15px] border border-(--line) border-l-[3px] border-l-(--orange) bg-(--surface) p-4 shadow-(--shadow) max-[640px]:p-3 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2.5 border-b border-(--line2) pb-3">
        {index ? (
          <span className="font-vcr grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[linear-gradient(140deg,#e04420,#8b5cf6)] text-[12px] text-white">
            {index}
          </span>
        ) : null}
        <div className="min-w-0">
          <h2 className="font-chillax m-0 text-[18px] font-semibold tracking-[-0.01em] text-(--text) max-[640px]:text-[16px]">
            {title}
          </h2>
          {description ? (
            <p className="m-0 mt-0.5 text-[12.5px] font-light text-(--muted) max-[640px]:text-[11.5px]">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      <div className="pt-3.5 max-[640px]:pt-3">{children}</div>
    </section>
  );
}

export function SubPanel({ label, children, className = "" }) {
  return (
    <div className={`rounded-[12px] border border-(--line2) bg-(--surface2) p-3.5 max-[640px]:p-3 ${className}`}>
      <p className="font-vcr mb-3 text-[8.5px] uppercase tracking-[0.16em] text-(--muted) max-[640px]:mb-2.5">
        {label}
      </p>
      {children}
    </div>
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
    <label className="block min-w-0">
      <span className="font-vcr mb-1.5 block text-[8.5px] uppercase tracking-[0.16em] text-(--muted)">
        {label}
      </span>
      <span className="relative flex items-center">
        <input
          type={type}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          className={`${FIELD_CLASS} ${icon ? "pr-10" : ""}`}
        />
        {icon ? (
          <span className="pointer-events-none absolute right-3.5 text-(--muted) opacity-60">{icon}</span>
        ) : null}
      </span>
    </label>
  );
}

export function SelectField({
  label,
  value = "Select Printer",
  onChange,
  options = ["Select Printer", "sprin_3", "USB Printer", "Network Printer"]
}) {
  return (
    <label className="block min-w-0">
      <span className="font-vcr mb-1.5 block text-[8.5px] uppercase tracking-[0.16em] text-(--muted)">
        {label}
      </span>
      <span className="relative block">
        <select
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          className={`${FIELD_CLASS} cursor-pointer appearance-none pr-9`}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronIcon />
      </span>
    </label>
  );
}

export function Toggle({ on = true, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      className={`flex h-7 w-[54px] shrink-0 items-center rounded-full p-1 transition-all duration-200 max-[640px]:h-6 max-[640px]:w-[46px] ${
        on ? "bg-[linear-gradient(135deg,#E04420,#341CD6)]" : "bg-(--line)"
      }`}
    >
      <span
        className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 max-[640px]:h-4 max-[640px]:w-4 ${
          on ? "translate-x-[26px] max-[640px]:translate-x-[22px]" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export function SettingRow({ label, checked = true, onToggle, children = null }) {
  return (
    <div className="flex min-h-[42px] items-center justify-between gap-4 border-b border-(--line2) py-2 last:border-b-0 max-[640px]:min-h-[38px] max-[640px]:gap-2">
      <span className="min-w-0 text-[12.5px] font-semibold text-(--text) max-[640px]:text-[11.5px]">
        {label}
      </span>
      {children || <Toggle on={checked} onToggle={onToggle} />}
    </div>
  );
}

export function UploadBox() {
  return (
    <div className="grid min-h-[135px] place-items-center rounded-[12px] border border-dashed border-[rgba(224,68,32,0.4)] bg-[rgba(224,68,32,0.04)] px-4 py-5 text-center max-[640px]:min-h-[104px] max-[640px]:px-3 max-[640px]:py-4">
      <div className="flex flex-col items-center justify-center">
        <span className="grid h-11 w-11 place-items-center rounded-[13px] bg-[linear-gradient(140deg,#e04420,#8b5cf6)] text-white max-[640px]:h-9 max-[640px]:w-9">
          <UploadIcon className="h-[19px] w-[19px] max-[640px]:h-4 max-[640px]:w-4" />
        </span>
        <p className="font-chillax mt-3 text-[14.5px] font-semibold text-(--text) max-[640px]:mt-2 max-[640px]:text-[13px]">
          Upload event poster
        </p>
        <p className="font-vcr mt-2 text-[8.5px] uppercase tracking-[0.16em] text-(--faint) max-[640px]:mt-1.5">
          Drag and drop or browse media
        </p>
      </div>
    </div>
  );
}

export function TopupRow({ index, cash, token, onCashChange, onTokenChange }) {
  return (
    <div className="grid grid-cols-[42px_minmax(0,1fr)_minmax(0,1fr)] items-end gap-3 max-[640px]:grid-cols-[28px_minmax(0,1fr)_minmax(0,1fr)] max-[640px]:gap-2">
      <span className="font-vcr pb-3.5 text-[12px] text-(--orange) max-[640px]:pb-3 max-[640px]:text-[10.5px]">
        #{index}
      </span>
      <div className="min-w-0">
        <Field label="Cash" value={cash} onChange={onCashChange} />
      </div>
      <div className="min-w-0">
        <Field label="Token" value={token} onChange={onTokenChange} />
      </div>
    </div>
  );
}
