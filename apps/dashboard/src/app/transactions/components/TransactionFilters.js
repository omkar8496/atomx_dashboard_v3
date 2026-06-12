"use client";

const FILTER_ROWS = [
  [
    { label: "Type", value: "Select Type", kind: "select" },
    { label: "Status", value: "Select Status", kind: "select" }
  ],
  [
    { label: "Vendors", value: "Select Vendor", kind: "select" },
    { label: "Stalls", value: "Select Stall", kind: "select" }
  ],
  [
    { label: "Mobile", value: "Card", kind: "input" },
    { label: "Card ID", value: "Card", kind: "input" }
  ],
  [
    { label: "TXN-ID", value: "TXN-ID", kind: "input" },
    { label: "Receipt", value: "Receipt", kind: "input" }
  ],
  [
    { label: "Device", value: "Device", kind: "input" },
    { label: "Search", value: "", kind: "search" }
  ]
];

function SearchIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function DownloadIcon({ className = "h-4.5 w-4.5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </svg>
  );
}

function EventIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3v18" />
    </svg>
  );
}

function SelectArrow() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#1c1c1c]" fill="currentColor" aria-hidden>
      <path d="M7 9.5h10L12 15z" />
    </svg>
  );
}

function FieldShell({ field }) {
  if (field.kind === "search") {
    return (
      <button
        type="button"
        className="flex h-12 items-center justify-center gap-3 rounded-lg bg-[#1c1c1c] px-5 text-[0.86rem] font-semibold text-white shadow-[0_10px_22px_rgba(28,28,28,0.12)] transition duration-200 hover:bg-[#E04420]"
      >
        <SearchIcon />
        Search
      </button>
    );
  }

  return (
    <label className="grid h-12 grid-cols-[170px_1fr] items-center overflow-hidden rounded-lg border border-[#e6e6e6] bg-white shadow-[0_8px_20px_rgba(15,23,42,0.025)]">
      <span className="flex h-full items-center gap-3 border-r border-[#e5e5e5] px-3">
        <span className="h-[18px] w-[18px] rounded-md border border-[#d5d8df] bg-white shadow-[0_3px_8px_rgba(15,23,42,0.04)]" />
        <span className="text-[0.7rem] font-bold uppercase tracking-[0.02em] text-[#0f8797]">
          {field.label}
        </span>
      </span>
      <span className="flex min-w-0 items-center justify-between gap-3 px-4">
        <input
          type="text"
          readOnly
          value={field.kind === "select" ? field.value : ""}
          placeholder={field.kind === "select" ? undefined : field.value}
          className={`min-w-0 flex-1 bg-transparent text-[0.82rem] font-semibold outline-none ${
            field.kind === "select" ? "text-[#1f1f1f]" : "text-[#1f1f1f] placeholder:text-[#a2aabc]"
          }`}
        />
        {field.kind === "select" ? <SelectArrow /> : null}
      </span>
    </label>
  );
}

function DateRangeField() {
  return (
    <div className="grid h-12 grid-cols-[170px_48px_1fr_56px_1fr] items-center overflow-hidden rounded-lg border border-[#e6e6e6] bg-white shadow-[0_8px_20px_rgba(15,23,42,0.025)]">
      <span className="flex h-full items-center gap-3 border-r border-[#e5e5e5] px-3">
        <span className="h-[18px] w-[18px] rounded-md border border-[#d5d8df] bg-white shadow-[0_3px_8px_rgba(15,23,42,0.04)]" />
        <span className="text-[0.7rem] font-bold uppercase text-[#0f8797]">Dates</span>
      </span>
      <span className="grid h-full place-items-center border-r border-[#e5e5e5] text-[#1c1c1c]">
        <CalendarIcon />
      </span>
      <input readOnly placeholder="Start" className="min-w-0 bg-transparent px-5 text-center text-[0.92rem] font-normal text-[#1f1f1f] outline-none placeholder:text-[#8d8d8d]" />
      <span className="text-center text-[1rem] text-[#9aa3b4]">-</span>
      <input readOnly placeholder="End" className="min-w-0 bg-transparent px-5 text-center text-[0.92rem] font-normal text-[#1f1f1f] outline-none placeholder:text-[#8d8d8d]" />
    </div>
  );
}

export function DownloadDumpButton({ variant = "light" }) {
  const isDark = variant === "dark";
  return (
    <button
      type="button"
      className={`inline-flex h-10 items-center justify-center gap-3 rounded-lg px-5 text-[0.86rem] font-semibold shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition duration-200 ${
        isDark
          ? "bg-[#1c1c1c] text-white hover:bg-[#E04420]"
          : "border border-[#e3e3e3] bg-white text-[#1f1f1f] hover:border-[#E04420] hover:text-[#E04420]"
      }`}
    >
      <DownloadIcon />
      Download Dump
    </button>
  );
}

export default function TransactionFilters() {
  return (
    <>
      <section className="rounded-xl border border-[#ded4ff] border-l-[4px] border-l-[#E04420] bg-white p-4 shadow-[0_18px_52px_rgba(15,23,42,0.09)]">
        <div className="flex flex-col gap-3 border-b border-[#e5e5e5] pb-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[linear-gradient(135deg,#E04420_0%,#A9379E_48%,#341CD6_100%)] text-[0.8rem] font-bold text-white shadow-[0_10px_22px_rgba(52,28,214,0.20)]">
              01
            </span>
            <h2 className="text-[1.05rem] font-semibold text-[#1f1f1f]">Filter</h2>
          </div>

          <div className="inline-flex h-10 items-center gap-3 rounded-full border border-[#e5e5e5] bg-white px-5 shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
            <EventIcon />
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[#0f8797]">
              Event
            </span>
            <span className="text-[0.8rem] font-bold uppercase text-[#1f1f1f]">
              AtomX Test
            </span>
          </div>
        </div>

        <div className="pt-4">
          <DateRangeField />
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {FILTER_ROWS.flat().map((field) => (
              <FieldShell key={field.label} field={field} />
            ))}
          </div>
        </div>
      </section>

      <section className="mt-3 flex flex-col gap-3 rounded-xl border border-[#ded4ff] border-l-[4px] border-l-[#E04420] bg-white px-4 py-3 shadow-[0_16px_45px_rgba(15,23,42,0.08)] md:flex-row md:items-center md:justify-between">
        <span className="text-[0.82rem] font-normal text-[#777777]">List (0)</span>
        <p className="text-center text-[0.82rem] font-normal text-[#8b96aa]">
          No transactions to show. Apply filters and search to load results.
        </p>
        <DownloadDumpButton variant="dark" />
      </section>
    </>
  );
}
