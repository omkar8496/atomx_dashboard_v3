"use client";

function DownloadIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 2 4 8 6 2-8 4-2 6-4-8-6-2 8-4Z" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function TypeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CheckBox() {
  return <span className="h-4 w-4 rounded-[4px] border border-(--line) bg-(--surface)" />;
}

function LabelCell({ label, icon = null, withCheck = false }) {
  return (
    <div className="flex h-11 items-center gap-2 text-(--muted) max-[640px]:h-9">
      {withCheck ? <CheckBox /> : icon}
      <span className="font-vcr text-[10px] uppercase tracking-[0.14em]">{label}</span>
    </div>
  );
}

function SelectRow({ label, value, icon, withCheck = false }) {
  return (
    <div className="grid min-h-[58px] grid-cols-[230px_1fr] items-center gap-4 max-[640px]:min-h-[46px] max-[640px]:grid-cols-[110px_minmax(0,1fr)] max-[640px]:gap-2">
      <LabelCell label={label} icon={icon} withCheck={withCheck} />
      <button
        type="button"
        className="grid h-11 grid-cols-[1fr_42px] items-center rounded-[10px] border border-(--line) bg-(--surface) text-left text-(--text) transition hover:border-(--orange) max-[640px]:h-10 max-[640px]:grid-cols-[1fr_28px]"
      >
        <span className="truncate px-3.5 text-[13px] font-medium">{value}</span>
        <span className="grid place-items-center text-(--muted) opacity-60">
          <ChevronIcon />
        </span>
      </button>
    </div>
  );
}

function DateRow() {
  return (
    <div className="grid min-h-[58px] grid-cols-[230px_minmax(280px,650px)] items-center gap-4 max-[640px]:min-h-[46px] max-[640px]:grid-cols-[110px_minmax(0,1fr)] max-[640px]:gap-2">
      <LabelCell label="Dates" withCheck />
      <div className="grid h-11 grid-cols-[48px_1fr_42px_1fr] items-center overflow-hidden rounded-[10px] border border-(--line) bg-(--surface2) max-[640px]:h-10 max-[640px]:grid-cols-[30px_1fr_20px_1fr]">
        <span className="grid h-full place-items-center text-(--muted) opacity-70">
          <ClockIcon />
        </span>
        <input readOnly placeholder="Start" className="min-w-0 bg-transparent px-4 text-center text-[13px] outline-none placeholder:text-(--faint) max-[640px]:px-1" />
        <span className="text-center text-[13px] text-(--faint)">-</span>
        <input readOnly placeholder="End" className="min-w-0 bg-transparent px-4 text-center text-[13px] outline-none placeholder:text-(--faint) max-[640px]:px-1" />
      </div>
    </div>
  );
}

export default function ReportFilters() {
  return (
    <section className="rounded-[15px] border border-(--line) border-l-[3px] border-l-(--orange) bg-(--surface) p-4 shadow-(--shadow) max-[640px]:p-3">
      <div className="flex flex-col gap-3 border-b border-(--line2) pb-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="font-vcr grid h-9 w-9 place-items-center rounded-[10px] bg-[linear-gradient(140deg,#e04420,#8b5cf6)] text-[12px] text-white">
            01
          </span>
          <h2 className="font-chillax text-[18px] font-semibold text-(--text)">Filter</h2>
        </div>
        <p className="text-[12.5px] font-light text-(--muted)">Select report scope before downloading.</p>
      </div>

      <div className="grid pt-4 lg:grid-cols-[minmax(620px,920px)_1fr]">
        <div>
          <DateRow />
          <SelectRow label="Days" value="Select Day" withCheck />
          <SelectRow label="Event / Vendor" value="Event Report" icon={<CompassIcon />} />
          <SelectRow label="Type" value="SUMMARY" icon={<TypeIcon />} />

          <div className="mt-3 grid min-h-[48px] grid-cols-[230px_minmax(280px,650px)] items-center gap-4 max-[640px]:min-h-[42px] max-[640px]:grid-cols-[110px_minmax(0,1fr)] max-[640px]:gap-2">
            <span />
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-(--text) px-5 text-[13.5px] font-semibold text-(--bg) transition duration-200 hover:bg-(--orange)"
            >
              <DownloadIcon />
              Download
            </button>
          </div>
        </div>
        <div className="hidden lg:block" />
      </div>
    </section>
  );
}
