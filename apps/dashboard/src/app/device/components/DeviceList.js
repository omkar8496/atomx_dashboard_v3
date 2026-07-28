"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AtomXLoader } from "@atomx/global-components";
import { fetchEventDevices } from "../../../lib/dashboardApi";
import { useDashboardStore } from "../../../store/dashboardStore";

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

function formatDeviceDate(value) {
  if (!value) {
    return { short: "-", full: "-" };
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const fallback = String(value);
    return {
      short: fallback.length > 18 ? `${fallback.slice(0, 18)}...` : fallback,
      full: fallback
    };
  }

  const formatted = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  })
    .format(date)
    .replace(",", "");

  return {
    short: formatted.length > 18 ? `${formatted.slice(0, 18)}...` : formatted,
    full: formatted
  };
}

function formatDeviceType(value) {
  const type = String(value || "-").trim();
  if (!type || type === "-") return "-";
  return type.replace(/-/g, "_").toUpperCase();
}

function normalizeDevice(device, index) {
  const printId = device?.devices_main_printId ?? device?.printId ?? device?.device_id ?? "-";
  const loginAt = formatDeviceDate(device?.device_last_login_at);
  const closedAt = formatDeviceDate(device?.device_day_closed_at ?? device?.device_event_closed_at);
  const closed = Boolean(device?.device_day_closed || device?.device_event_closed);
  const printer = String(device?.device_printer || "").trim();

  return {
    key: `${device?.devices_main_id ?? device?.device_id ?? printId ?? "device"}-${index}`,
    id: device?.devices_main_id ?? device?.device_id ?? index + 1,
    code: String(printId ?? "-"),
    type: formatDeviceType(device?.device_type),
    vendorTag: printer && printer.toLowerCase() !== "none" ? printer : "",
    stall: device?.stall_name ?? "-",
    stallFull: device?.stall_name ?? "-",
    vendor: device?.vendor_name ?? "-",
    loginAt: loginAt.short,
    loginAtFull: loginAt.full,
    version: device?.device_latest_app_version ?? "-",
    closedAt: closedAt.full,
    closed,
    status: device?.device_status ?? "-",
    hardwareId: device?.devices_main_hardwareId ?? "",
    mainType: device?.devices_main_type ?? "",
    stallId: device?.device_stall ?? "",
    deviceId: device?.device_id ?? ""
  };
}

function DeviceEmptyState({ message }) {
  return (
    <div className="grid min-h-[150px] place-items-center pt-3 text-center text-[0.8rem] font-medium text-[#8e98ad]">
      {message}
    </div>
  );
}

function DeviceLoadingState() {
  return (
    <div className="grid min-h-[150px] place-items-center pt-3">
      <AtomXLoader label="Loading devices..." />
    </div>
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
  const token = useDashboardStore((state) => state.token);
  const eventMeta = useDashboardStore((state) => state.eventMeta);
  const eventDetails = useDashboardStore((state) => state.eventDetails);
  const eventId = eventMeta?.eventId ?? eventDetails?.id;
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const loadDevices = useCallback(async () => {
    if (!eventId) {
      setDevices([]);
      setLoadError("");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError("");

    try {
      const eventDevices = await fetchEventDevices({ eventId, token });
      setDevices(Array.isArray(eventDevices) ? eventDevices.map(normalizeDevice) : []);
    } catch (error) {
      console.error("Failed to load event devices", error);
      setDevices([]);
      setLoadError("Unable to load devices.");
    } finally {
      setIsLoading(false);
    }
  }, [eventId, token]);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  const filteredDevices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return devices;

    return devices.filter((device) =>
      [
        device.id,
        device.code,
        device.type,
        device.vendorTag,
        device.stall,
        device.vendor,
        device.loginAt,
        device.version,
        device.closedAt,
        device.status,
        device.hardwareId,
        device.mainType,
        device.stallId,
        device.deviceId
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery))
    );
  }, [devices, query]);

  const renderDeviceContent = () => {
    if (!eventId) {
      return <DeviceEmptyState message="Select an event to load devices." />;
    }

    if (isLoading) {
      return <DeviceLoadingState />;
    }

    if (loadError) {
      return <DeviceEmptyState message={loadError} />;
    }

    if (filteredDevices.length === 0) {
      return <DeviceEmptyState message="No devices found." />;
    }

    if (viewMode === "grid") {
      return (
        <div className="max-h-[535px] overflow-y-auto pr-1 pt-3 [scrollbar-width:thin] [scrollbar-color:#d5b7ff_transparent]">
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {filteredDevices.map((device) => (
              <DeviceCard key={device.key} device={device} />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="max-h-[420px] overflow-y-auto pr-1 pt-3 [scrollbar-width:thin] [scrollbar-color:#d5b7ff_transparent]">
        <div>
          {filteredDevices.map((device) => (
            <DeviceRow key={device.key} device={device} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="rounded-xl border border-[#ded4ff] border-l-[4px] border-l-[#E04420] bg-white p-3.5 shadow-[0_18px_52px_rgba(15,23,42,0.09)]">
      <div className="flex flex-col gap-3 border-b border-[#e5e5e5] pb-2.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[linear-gradient(135deg,#E04420_0%,#A9379E_48%,#341CD6_100%)] text-[0.8rem] font-bold text-white shadow-[0_10px_22px_rgba(52,28,214,0.20)]">
            {devices.length}
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

      {renderDeviceContent()}
    </section>
  );
}
