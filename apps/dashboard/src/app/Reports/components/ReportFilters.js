"use client";

function DownloadIcon({ className = "h-4.5 w-4.5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 2 4 8 6 2-8 4-2 6-4-8-6-2 8-4Z" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function TypeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  return <span className="h-[16px] w-[16px] rounded-[4px] border border-[#9ca3af] bg-white" />;
}

function LabelCell({ label, icon = null, withCheck = false }) {
  return (
    <div className="flex h-10 items-center gap-2 text-[#0f8797]">
      {withCheck ? <CheckBox /> : icon}
      <span className="text-[0.8rem] font-bold capitalize tracking-[-0.01em]">{label}</span>
    </div>
  );
}

function SelectRow({ label, value, icon, withCheck = false }) {
  return (
    <div className="grid min-h-[58px] grid-cols-[230px_1fr] items-center gap-4">
      <LabelCell label={label} icon={icon} withCheck={withCheck} />
      <button
        type="button"
        className="grid h-10 grid-cols-[1fr_42px] items-center rounded-lg text-left text-[#1f1f1f]"
      >
        <span className="text-center text-[0.96rem] font-normal">{value}</span>
        <span className="grid place-items-center text-[#1f1f1f]">
          <ChevronIcon />
        </span>
      </button>
    </div>
  );
}

function DateRow() {
  return (
    <div className="grid min-h-[58px] grid-cols-[230px_minmax(280px,650px)] items-center gap-4">
      <LabelCell label="Dates" withCheck />
      <div className="grid h-10 grid-cols-[48px_1fr_42px_1fr] items-center overflow-hidden rounded-lg border border-[#e0e0e0] bg-[#fbfbfb]">
        <span className="grid h-full place-items-center text-[#8a95aa]">
          <ClockIcon />
        </span>
        <input readOnly placeholder="Start" className="min-w-0 bg-transparent px-4 text-center text-[0.82rem] outline-none placeholder:text-[#a7afbe]" />
        <span className="text-center text-[0.9rem] text-[#8a95aa]">-</span>
        <input readOnly placeholder="End" className="min-w-0 bg-transparent px-4 text-center text-[0.82rem] outline-none placeholder:text-[#a7afbe]" />
      </div>
    </div>
  );
}

export default function ReportFilters() {
  return (
    <section className="rounded-xl border border-[#ded4ff] border-l-[4px] border-l-[#E04420] bg-white p-4 shadow-[0_18px_52px_rgba(15,23,42,0.09)]">
      <div className="flex flex-col gap-3 border-b border-[#e5e5e5] pb-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[linear-gradient(135deg,#E04420_0%,#A9379E_48%,#341CD6_100%)] text-[0.8rem] font-bold text-white shadow-[0_10px_22px_rgba(52,28,214,0.20)]">
            01
          </span>
          <h2 className="text-[1.05rem] font-semibold text-[#1f1f1f]">Filter</h2>
        </div>
        <p className="text-[0.82rem] font-normal text-[#8b8b8b]">
          Select report scope before downloading.
        </p>
      </div>

      <div className="grid pt-4 lg:grid-cols-[minmax(620px,920px)_1fr]">
        <div>
          <DateRow />
          <SelectRow label="Days" value="Select Day" withCheck />
          <SelectRow label="Event / Vendor" value="Event Report" icon={<CompassIcon />} />
          <SelectRow label="Type" value="SUMMARY" icon={<TypeIcon />} />

          <div className="mt-3 grid min-h-[48px] grid-cols-[230px_minmax(280px,650px)] items-center gap-4">
            <span />
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center gap-3 rounded-lg bg-[#1c1c1c] px-5 text-[0.9rem] font-semibold text-white shadow-[0_12px_24px_rgba(28,28,28,0.12)] transition duration-200 hover:bg-[#E04420]"
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
