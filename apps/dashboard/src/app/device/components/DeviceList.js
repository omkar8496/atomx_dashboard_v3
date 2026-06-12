"use client";

import { useMemo, useState } from "react";

const DEVICES = [
  {
    id: 1,
    code: "888",
    type: "CARD",
    vendorTag: "wisepos+",
    stall: "TOPUP CARD M...",
    stallFull: "TOPUP CARD MSWIPE",
    vendor: "Topup",
    loginAt: "2025-07-28 15:...",
    loginAtFull: "2025-07-28 15:01:16",
    version: "5.58",
    closedAt: "2025-07-28 18:20:04",
    closed: true
  },
  {
    id: 2,
    code: "1002",
    type: "CARD",
    vendorTag: "",
    stall: "TOPUP CARD M...",
    stallFull: "TOPUP CARD MSWIPE",
    vendor: "Topup",
    loginAt: "2025-07-28 15:...",
    loginAtFull: "2025-07-28 15:01:16",
    version: "5.58",
    closedAt: "-",
    closed: false
  },
  {
    id: 3,
    code: "1050",
    type: "CARD",
    vendorTag: "",
    stall: "TOPUP CARD",
    stallFull: "TOPUP CARD",
    vendor: "Topup",
    loginAt: "2025-07-13 23:...",
    loginAtFull: "2025-07-13 23:05:42",
    version: "5.57",
    closedAt: "-",
    closed: false
  },
  {
    id: 4,
    code: "1096",
    type: "ACCESSX",
    vendorTag: "",
    stall: "AccessX",
    stallFull: "AccessX",
    vendor: "AccessX",
    loginAt: "2025-03-12 14:...",
    loginAtFull: "2025-03-12 14:38:10",
    version: "5.33",
    closedAt: "-",
    closed: false
  },
  {
    id: 5,
    code: "1099",
    type: "MENU",
    vendorTag: "",
    stall: "DEMO SALE",
    stallFull: "DEMO SALE",
    vendor: "Sale",
    loginAt: "2025-06-04 15:...",
    loginAtFull: "2025-06-04 15:13:53",
    version: "4.90",
    closedAt: "-",
    closed: false
  },
  {
    id: 6,
    code: "1114",
    type: "ITEM_SALE",
    vendorTag: "",
    stall: "BEER",
    stallFull: "BEER",
    vendor: "Sale",
    loginAt: "2025-06-24 13:...",
    loginAtFull: "2025-06-24 13:21:29",
    version: "5.57",
    closedAt: "-",
    closed: false
  }
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function PhoneIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
      <path d="M10 5h4" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M3 6h.01" />
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function DeviceCard({ device }) {
  return (
    <article className="min-h-[248px] rounded-lg border border-[#efb9d9] bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.035)] transition duration-200 hover:-translate-y-0.5 hover:border-[#ded4ff] hover:shadow-[0_16px_30px_rgba(52,28,214,0.09)]">
      <div className="flex items-start justify-between">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[linear-gradient(135deg,#E04420_0%,#A9379E_48%,#341CD6_100%)] text-white shadow-[0_10px_22px_rgba(52,28,214,0.20)]">
            <PhoneIcon className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0">
            <p className="text-[0.68rem] font-semibold text-[#8f80ff]">#{device.id}</p>
            <p className="truncate text-[1rem] font-normal leading-tight text-[#202020]">
              {device.code}
            </p>
          </div>
        </div>
        <span className="text-[#7d8aa3]">
          <LockIcon />
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="rounded-full border border-[#9bd9ff] bg-[#f3fbff] px-2.5 py-1 text-[0.62rem] font-bold text-[#0a9cac]">
          {device.type}
        </span>
        {device.vendorTag ? (
          <span className="rounded-full border border-[#ffc3b7] bg-white px-2.5 py-1 text-[0.62rem] font-bold text-[#E04420]">
            {device.vendorTag}
          </span>
        ) : null}
      </div>

      <div className="mt-3 border-t border-[#e5e5e5] pt-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div className="min-w-0">
            <p className="text-[0.62rem] font-bold uppercase text-[#929292]">Stall</p>
            <p className="truncate text-[0.74rem] font-bold text-[#657391]">{device.stall}</p>
          </div>
          <div className="min-w-0">
            <p className="text-[0.62rem] font-bold uppercase text-[#929292]">Vendor</p>
            <p className="truncate text-[0.74rem] font-bold text-[#657391]">{device.vendor}</p>
          </div>
          <div className="min-w-0">
            <p className="text-[0.62rem] font-bold uppercase text-[#929292]">Login At</p>
            <p className="truncate text-[0.74rem] font-bold text-[#202020]">{device.loginAt}</p>
          </div>
          <div className="min-w-0">
            <p className="text-[0.62rem] font-bold uppercase text-[#929292]">Version</p>
            <p className="truncate text-[0.74rem] font-bold text-[#202020]">{device.version}</p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.62rem] font-bold uppercase text-[#929292]">Closed At</p>
          <p className="truncate text-[0.74rem] font-bold text-[#202020]">{device.closedAt}</p>
        </div>
        <span
          className={`rounded-lg px-3 py-2 text-[0.68rem] font-bold ${
            device.closed ? "bg-[#e4f6ff] text-[#0285bf]" : "bg-[#ffe9e4] text-[#E04420]"
          }`}
        >
          {device.closed ? "YES" : "NO"}
        </span>
      </div>
    </article>
  );
}

function DeviceRow({ device }) {
  return (
    <article className="grid min-h-[68px] grid-cols-1 items-center gap-3 border-b border-[#e5e5e5] px-1 py-2.5 last:border-b-0 lg:grid-cols-[230px_46px_210px_1fr_0.75fr_1.1fr_0.5fr_1.05fr_66px]">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[linear-gradient(135deg,#E04420_0%,#A9379E_48%,#341CD6_100%)] text-white shadow-[0_8px_18px_rgba(52,28,214,0.18)]">
          <PhoneIcon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[0.62rem] font-semibold leading-tight text-[#8f80ff]">#{device.id}</p>
          <p className="truncate text-[0.9rem] font-normal leading-tight text-[#202020]">
            {device.code}
          </p>
        </div>
      </div>

      <button
        type="button"
        className="grid h-7 w-7 place-items-center rounded-lg border border-[#e2e2e2] bg-white text-[#777777] shadow-[0_7px_16px_rgba(15,23,42,0.035)] transition duration-200 hover:border-[#E04420] hover:text-[#E04420]"
        aria-label={`Edit device ${device.code}`}
      >
        <EditIcon />
      </button>

      <div className="flex flex-wrap gap-1.5">
        <span className="rounded-full border border-[#9bd9ff] bg-[#f3fbff] px-2 py-0.5 text-[0.58rem] font-bold text-[#0a9cac]">
          {device.type}
        </span>
        {device.vendorTag ? (
          <span className="rounded-full border border-[#ffc3b7] bg-white px-2 py-0.5 text-[0.58rem] font-bold text-[#E04420]">
            {device.vendorTag}
          </span>
        ) : null}
      </div>

      <div className="min-w-0">
        <p className="text-[0.56rem] font-bold uppercase text-[#929292]">Stall</p>
        <p className="truncate text-[0.72rem] font-bold text-[#202020]">{device.stallFull || device.stall}</p>
      </div>
      <div className="min-w-0">
        <p className="text-[0.56rem] font-bold uppercase text-[#929292]">Vendor</p>
        <p className="truncate text-[0.72rem] font-bold text-[#202020]">{device.vendor}</p>
      </div>
      <div className="min-w-0">
        <p className="text-[0.56rem] font-bold uppercase text-[#929292]">Login At</p>
        <p className="truncate text-[0.72rem] font-bold text-[#202020]">{device.loginAtFull || device.loginAt}</p>
      </div>
      <div className="min-w-0">
        <p className="text-[0.56rem] font-bold uppercase text-[#929292]">Version</p>
        <p className="truncate text-[0.72rem] font-bold text-[#202020]">{device.version}</p>
      </div>
      <div className="min-w-0">
        <p className="text-[0.56rem] font-bold uppercase text-[#929292]">Closed At</p>
        <p className="truncate text-[0.72rem] font-bold text-[#657391]">{device.closedAt}</p>
      </div>
      <span
        className={`justify-self-start rounded-lg px-2.5 py-1.5 text-[0.62rem] font-bold lg:justify-self-end ${
          device.closed ? "bg-[#e4f6ff] text-[#0285bf]" : "bg-[#ffe9e4] text-[#E04420]"
        }`}
      >
        {device.closed ? "YES" : "NO"}
      </span>
    </article>
  );
}

export default function DeviceList() {
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState("list");

  const filteredDevices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return DEVICES;

    return DEVICES.filter((device) =>
      [
        device.id,
        device.code,
        device.type,
        device.vendorTag,
        device.stall,
        device.vendor,
        device.loginAt,
        device.version,
        device.closedAt
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery))
    );
  }, [query]);

  return (
    <section className="rounded-xl border border-[#ded4ff] border-l-[4px] border-l-[#E04420] bg-white p-3.5 shadow-[0_18px_52px_rgba(15,23,42,0.09)]">
      <div className="flex flex-col gap-3 border-b border-[#e5e5e5] pb-2.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[linear-gradient(135deg,#E04420_0%,#A9379E_48%,#341CD6_100%)] text-[0.8rem] font-bold text-white shadow-[0_10px_22px_rgba(52,28,214,0.20)]">
            6
          </span>
          <h2 className="text-[0.98rem] font-semibold text-[#1f1f1f]">Device List</h2>
        </div>

        <label className="flex h-8 w-full items-center gap-3 border-b border-[#cfcfcf] px-1 text-[#8f80ff] focus-within:border-[#E04420] lg:max-w-[70%]">
          <SearchIcon />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search Device"
            className="h-full min-w-0 flex-1 bg-transparent text-[0.78rem] font-normal text-[#1f2937] outline-none placeholder:text-[#8e98ad]"
          />
        </label>

        <div className="inline-flex h-9 w-fit items-center rounded-lg border border-[#e2e2e2] bg-white p-1 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`grid h-7 w-7 place-items-center rounded-md transition ${
              viewMode === "grid" ? "bg-[#1c1c1c] text-white" : "text-[#777777] hover:bg-[#f5f5f5]"
            }`}
            aria-label="Grid view"
          >
            <GridIcon />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`grid h-7 w-7 place-items-center rounded-md transition ${
              viewMode === "list" ? "bg-[#1c1c1c] text-white" : "text-[#777777] hover:bg-[#f5f5f5]"
            }`}
            aria-label="List view"
          >
            <ListIcon />
          </button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid gap-2.5 pt-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {filteredDevices.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      ) : (
        <div className="pt-3">
          {filteredDevices.map((device) => (
            <DeviceRow key={device.id} device={device} />
          ))}
        </div>
      )}
    </section>
  );
}
