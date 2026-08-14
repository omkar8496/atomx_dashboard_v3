"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AtomXLoader } from "@atomx/global-components";
import { fetchEventDevices } from "../../../lib/dashboardApi";
import { useDashboardStore } from "../../../store/dashboardStore";

function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 opacity-50" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="7" cy="7" r="4.6" />
      <path d="M10.5 10.5 14 14" />
    </svg>
  );
}

function DeviceGlyph({ className = "h-3.5 w-3.5" }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4.4" y="1.9" width="7.2" height="12.2" rx="1.4" />
      <path d="M6.8 11.9h2.4" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.4" y="7" width="9.2" height="6.6" rx="1.4" />
      <path d="M5.6 7V5.2a2.4 2.4 0 0 1 4.8 0V7" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11.2 2.4l2.4 2.4-8 8H3.2v-2.4z" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor">
      <rect x="2.4" y="2.4" width="4.6" height="4.6" rx="1.1" />
      <rect x="9" y="2.4" width="4.6" height="4.6" rx="1.1" />
      <rect x="2.4" y="9" width="4.6" height="4.6" rx="1.1" />
      <rect x="9" y="9" width="4.6" height="4.6" rx="1.1" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M5.4 4.4h8.2M5.4 8h8.2M5.4 11.6h8.2M2.6 4.4h.01M2.6 8h.01M2.6 11.6h.01" />
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
    <div className="grid min-h-[150px] place-items-center px-4 py-8 text-center text-[13px] font-medium text-(--muted)">
      {message}
    </div>
  );
}

function DeviceLoadingState() {
  return (
    <div className="grid min-h-[150px] place-items-center py-6">
      <AtomXLoader label="Loading devices..." />
    </div>
  );
}

function ModeTag({ value }) {
  return (
    <span className="font-vcr inline-flex items-center whitespace-nowrap rounded-full border border-[rgba(0,169,242,0.4)] bg-[rgba(0,169,242,0.09)] px-2.5 py-1 text-[9px] tracking-[0.1em] text-[#0284c7]">
      {value}
    </span>
  );
}

function ProviderTag({ value }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-full border border-[rgba(224,68,32,0.4)] bg-[rgba(224,68,32,0.08)] px-2.5 py-1 text-[10.5px] font-semibold text-(--orange)">
      {value}
    </span>
  );
}

function ClosedBadge({ closed }) {
  return (
    <span
      className={`font-vcr flex items-center justify-center rounded-[8px] px-[13px] py-[5px] text-[10px] tracking-[0.1em] ${
        closed ? "bg-[rgba(0,169,242,0.11)] text-[#0284c7]" : "bg-[rgba(224,68,32,0.09)] text-(--orange)"
      }`}
    >
      {closed ? "YES" : "NO"}
    </span>
  );
}

function MetaField({ label, value }) {
  return (
    <div className="min-w-0 flex-1 basis-[88px]">
      <div className="font-vcr whitespace-nowrap text-[7.5px] tracking-[0.15em] text-(--faint)">{label}</div>
      <div className="mt-0.5 truncate text-[12.5px] font-semibold">{value || "-"}</div>
    </div>
  );
}

function DeviceCard({ device }) {
  return (
    <div
      className="flex flex-col gap-[9px] rounded-[12px] border border-transparent p-[11px] shadow-(--shadow) transition-shadow duration-200 hover:shadow-(--shadowUp)"
      style={{
        background:
          "linear-gradient(var(--surface),var(--surface)) padding-box, linear-gradient(135deg,rgba(224,68,32,0.34),rgba(139,92,246,0.26) 52%,rgba(0,169,242,0.22)) border-box"
      }}
    >
      <div className="flex min-w-0 items-center gap-[11px]">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-[linear-gradient(140deg,#e04420,#8b5cf6)] text-white">
          <DeviceGlyph />
        </span>
        <div className="min-w-0">
          <div className="font-vcr text-[9.5px] tracking-[0.08em] text-(--blue)">#{device.id}</div>
          <div className="font-chillax mt-0.5 truncate text-[15px] font-semibold tracking-[-0.01em]">{device.code}</div>
        </div>
        <span className="ml-auto text-(--faint)">
          <LockIcon />
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-[7px] border-b border-(--line2) pb-[11px]">
        <ModeTag value={device.type} />
        <ProviderTag value={device.vendorTag} />
      </div>

      <div className="flex flex-wrap gap-3">
        <MetaField label="STALL" value={device.stall} />
        <MetaField label="VENDOR" value={device.vendor} />
        <MetaField label="LOGIN AT" value={device.loginAt} />
        <MetaField label="VERSION" value={device.version} />
      </div>

      <div className="flex items-center justify-between gap-[10px]">
        <div className="min-w-0">
          <div className="font-vcr text-[7.5px] tracking-[0.15em] text-(--faint)">CLOSED AT</div>
          <div className="mt-0.5 truncate text-[12.5px] font-semibold">{device.closedAt}</div>
        </div>
        <ClosedBadge closed={device.closed} />
      </div>
    </div>
  );
}

function DeviceRow({ device }) {
  return (
    <div className="flex flex-wrap items-center gap-[14px] border-b border-(--line2) px-1.5 py-[11px] last:border-b-0 transition-colors duration-150 hover:bg-(--surface2)">
      <div className="flex min-w-0 shrink-0 basis-[210px] items-center gap-[11px]">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-[linear-gradient(140deg,#e04420,#8b5cf6)] text-white">
          <DeviceGlyph />
        </span>
        <div className="min-w-0">
          <div className="font-vcr text-[9.5px] tracking-[0.08em] text-(--blue)">#{device.id}</div>
          <div className="font-chillax mt-0.5 truncate text-[15px] font-semibold tracking-[-0.01em]">{device.code}</div>
        </div>
        <button
          type="button"
          className="ml-auto grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[8px] border border-(--line) text-(--muted) transition hover:border-(--orange) hover:text-(--orange)"
          aria-label={`Edit device ${device.code}`}
        >
          <EditIcon />
        </button>
      </div>

      <div className="flex shrink-0 basis-[220px] flex-wrap items-center gap-[7px]">
        <ModeTag value={device.type} />
        <ProviderTag value={device.vendorTag} />
      </div>

      <div className="flex min-w-0 flex-1 basis-[340px] flex-wrap gap-3">
        <MetaField label="STALL" value={device.stallFull || device.stall} />
        <MetaField label="VENDOR" value={device.vendor} />
        <MetaField label="LOGIN AT" value={device.loginAtFull || device.loginAt} />
        <MetaField label="VERSION" value={device.version} />
        <MetaField label="CLOSED AT" value={device.closedAt} />
      </div>

      <ClosedBadge closed={device.closed} />
    </div>
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
        <div
          className="grid gap-3 px-[15px] pb-[15px] pt-1 [grid-template-columns:repeat(auto-fill,minmax(min(100%,198px),1fr))]"
        >
          {filteredDevices.map((device) => (
            <DeviceCard key={device.key} device={device} />
          ))}
        </div>
      );
    }

    return (
      <div className="max-h-[520px] overflow-y-auto px-[15px] pb-3 [scrollbar-color:var(--line)_transparent] [scrollbar-width:thin]">
        {filteredDevices.map((device) => (
          <DeviceRow key={device.key} device={device} />
        ))}
      </div>
    );
  };

  return (
    <section className="mt-[clamp(16px,2vw,22px)] overflow-hidden rounded-[14px] border border-(--line) border-l-[3px] border-l-(--orange) bg-(--surface) shadow-(--shadow)">
      <div className="flex flex-wrap items-center gap-3 px-[15px] py-[14px]">
        <span className="font-vcr grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[10px] bg-[linear-gradient(140deg,#e04420,#8b5cf6)] text-[13px] text-white">
          {devices.length}
        </span>
        <h2 className="font-chillax whitespace-nowrap text-[18px] font-semibold tracking-[-0.01em]">Device List</h2>

        <label className="flex min-w-[150px] flex-1 items-center gap-2.5 border-b border-(--line) px-0.5 pb-[7px] text-(--muted) focus-within:border-(--orange)">
          <SearchIcon />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search Device"
            className="h-full min-w-0 flex-1 bg-transparent text-[13px] text-(--text) outline-none placeholder:text-(--faint)"
          />
        </label>

        <div className="flex shrink-0 gap-[3px] rounded-[11px] border border-(--line) bg-(--surface2) p-[3px]">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`grid h-[30px] w-[34px] place-items-center rounded-[8px] transition ${
              viewMode === "grid" ? "bg-(--text) text-(--bg)" : "text-(--muted)"
            }`}
            aria-label="Card view"
          >
            <GridIcon />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`grid h-[30px] w-[34px] place-items-center rounded-[8px] transition ${
              viewMode === "list" ? "bg-(--text) text-(--bg)" : "text-(--muted)"
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
