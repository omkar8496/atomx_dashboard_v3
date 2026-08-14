"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AtomXLoader } from "@atomx/global-components";
import { fetchPersoDevices, removePersoDevice } from "../../../lib/dashboardApi";
import { useDashboardStore } from "../../../store/dashboardStore";
import AddPersoDeviceModal from "./AddPersoDeviceModal";

const COLUMNS = [
  { key: "rowNumber", label: "#", sortable: false, className: "" },
  { key: "device", label: "DEVICE", sortable: true, className: "" },
  { key: "mac", label: "MAC", sortable: true, className: "" },
  { key: "type", label: "TYPE", sortable: true, className: "" },
  { key: "addedAt", label: "ADDED AT", sortable: true, className: "" },
  { key: "status", label: "STATUS", sortable: false, className: "" },
  { key: "action", label: "ADD / REMOVE", sortable: false, className: "text-right" }
];

const GRID_TEMPLATE = "44px 1.1fr 1.4fr 1fr 1.3fr 0.9fr 96px";

function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 opacity-50" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="7" cy="7" r="4.6" />
      <path d="M10.5 10.5 14 14" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
      <path d="M7 2.6v8.8M2.6 7h8.8" />
    </svg>
  );
}

function RemoveIcon() {
  return (
    <svg viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
    </svg>
  );
}

function SortArrows({ active, dir }) {
  return (
    <svg width="9" height="11" viewBox="0 0 9 11" fill="currentColor" className="shrink-0">
      <path d="M4.5 0l3 3.4h-6z" opacity={active && dir === 1 ? "1" : "0.3"} />
      <path d="M4.5 11l-3-3.4h6z" opacity={active && dir === -1 ? "1" : "0.3"} />
    </svg>
  );
}

function formatPersoDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-GB", {
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
}

function normalizePersoDevice(device, index) {
  const status = String(device?.status ?? "-").toLowerCase();

  return {
    key: `${device?.id ?? device?.device ?? "perso"}-${index}`,
    id: device?.id ?? index + 1,
    rowNumber: index + 1,
    device: device?.device ?? "-",
    mac: device?.device_mac ?? "-",
    type: device?.device_type ?? "-",
    addedAt: formatPersoDate(device?.created_at),
    status
  };
}

function PersoStatusBadge({ status }) {
  const normalizedStatus = String(status ?? "-").toLowerCase();
  const isInactive = normalizedStatus === "inactive";

  return (
    <span
      className={`font-vcr inline-flex items-center rounded-full px-2.5 py-1 text-[9px] tracking-[0.12em] ${
        isInactive ? "bg-(--chip) text-(--faint)" : "bg-[rgba(0,169,242,0.1)] text-[#0284c7]"
      }`}
    >
      {(normalizedStatus || "-").toUpperCase()}
    </span>
  );
}

function PersoEmptyState({ message }) {
  return (
    <div className="rounded-[11px] border border-dashed border-(--line) px-4 py-8 text-center text-sm font-medium text-(--muted)">
      {message}
    </div>
  );
}

function PersoLoadingState() {
  return (
    <div className="grid min-h-[120px] place-items-center">
      <AtomXLoader label="Loading perso devices..." size={46} />
    </div>
  );
}

function PersoMobileCard({ item, onRemove, isRemoving }) {
  const isInactive = item.status === "inactive";

  return (
    <div
      className="rounded-[12px] border border-transparent p-[11px] shadow-(--shadow)"
      style={{
        background:
          "linear-gradient(var(--surface),var(--surface)) padding-box, linear-gradient(135deg,rgba(224,68,32,0.32),rgba(139,92,246,0.24)) border-box"
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-vcr text-[7.5px] tracking-[0.15em] text-(--faint)">DEVICE</p>
          <p className="font-chillax mt-1 text-[15px] font-semibold">{item.device}</p>
        </div>
        <PersoStatusBadge status={item.status} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="min-w-0">
          <p className="font-vcr text-[7.5px] tracking-[0.14em] text-(--faint)">MAC</p>
          <p className="font-vcr mt-1 truncate text-[12px] text-(--muted)">{item.mac}</p>
        </div>
        <div>
          <p className="font-vcr text-[7.5px] tracking-[0.14em] text-(--faint)">TYPE</p>
          <p className="mt-1 text-[12.5px] font-semibold">{item.type}</p>
        </div>
        <div className="col-span-2">
          <p className="font-vcr text-[7.5px] tracking-[0.14em] text-(--faint)">ADDED AT</p>
          <p className="font-vcr mt-1 text-[11.5px]">{item.addedAt}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onRemove(item)}
        disabled={isInactive || isRemoving}
        className="mt-3 inline-flex h-8 items-center gap-2 rounded-[8px] border border-(--line) px-3 text-[11px] font-semibold text-(--muted) transition hover:border-(--orange) hover:text-(--orange) disabled:cursor-not-allowed disabled:opacity-45"
        aria-label={`Remove perso device ${item.device}`}
      >
        <RemoveIcon />
        {isRemoving ? "Removing..." : isInactive ? "Inactive" : "Remove"}
      </button>
    </div>
  );
}

export default function PersoDevicesTable() {
  const token = useDashboardStore((state) => state.token);
  const eventMeta = useDashboardStore((state) => state.eventMeta);
  const eventDetails = useDashboardStore((state) => state.eventDetails);
  const eventId = eventMeta?.eventId ?? eventDetails?.id;
  const [query, setQuery] = useState("");
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [sort, setSort] = useState({ key: "rowNumber", dir: 1 });

  const loadPersoDevices = useCallback(async () => {
    if (!eventId) {
      setDevices([]);
      setLoadError("");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError("");

    try {
      const persoDevices = await fetchPersoDevices({ eventId, token });
      setDevices(Array.isArray(persoDevices) ? persoDevices.map(normalizePersoDevice) : []);
    } catch (error) {
      console.error("Failed to load perso devices", error);
      setDevices([]);
      setLoadError("Unable to load perso devices.");
    } finally {
      setIsLoading(false);
    }
  }, [eventId, token]);

  useEffect(() => {
    loadPersoDevices();
  }, [loadPersoDevices]);

  const handleRemoveDevice = useCallback(async (item) => {
    if (!eventId || !item?.id || item.status === "inactive") {
      return;
    }

    setRemovingId(item.id);
    setActionError("");

    try {
      await removePersoDevice({ eventId, token, id: item.id });
      setDevices((currentDevices) =>
        currentDevices.map((device) =>
          device.id === item.id ? { ...device, status: "inactive" } : device
        )
      );
      await loadPersoDevices();
    } catch (error) {
      console.error("Failed to remove perso device", error);
      setActionError("Unable to mark perso device inactive.");
    } finally {
      setRemovingId(null);
    }
  }, [eventId, loadPersoDevices, token]);

  const toggleSort = (key) => {
    setSort((current) =>
      current.key === key ? { key, dir: -current.dir } : { key, dir: 1 }
    );
  };

  const filteredDevices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const base = !normalizedQuery
      ? devices
      : devices.filter((item) =>
          [item.id, item.device, item.mac, item.type, item.addedAt, item.status]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(normalizedQuery))
        );

    const { key, dir } = sort;
    return [...base].sort((a, b) => {
      const av = key === "rowNumber" ? Number(a.rowNumber) : a[key];
      const bv = key === "rowNumber" ? Number(b.rowNumber) : b[key];
      if (av > bv) return dir;
      if (av < bv) return -dir;
      return 0;
    });
  }, [devices, query, sort]);

  const renderDesktopRows = () => {
    if (!eventId) return <PersoEmptyState message="Select an event to load perso devices." />;
    if (isLoading) return <PersoLoadingState />;
    if (loadError) return <PersoEmptyState message={loadError} />;
    if (filteredDevices.length === 0) return <PersoEmptyState message="No perso devices found." />;

    return (
      <div className="overflow-x-auto px-[15px] pb-[15px]">
        <div className="min-w-[640px]">
          <div
            className="grid gap-2.5 border-b border-(--line) px-2 pb-2.5"
            style={{ gridTemplateColumns: GRID_TEMPLATE }}
          >
            {COLUMNS.map((col) => {
              const active = sort.key === col.key;
              return (
                <button
                  key={col.key}
                  type="button"
                  onClick={() => col.sortable && toggleSort(col.key)}
                  className={`font-vcr flex items-center gap-1.5 whitespace-nowrap text-[9.5px] tracking-[0.15em] text-(--orange) ${
                    col.className
                  } ${col.sortable ? "cursor-pointer" : "cursor-default"}`}
                >
                  <span>{col.label}</span>
                  {col.sortable ? <SortArrows active={active} dir={sort.dir} /> : null}
                </button>
              );
            })}
          </div>

          <div className="max-h-[360px] overflow-y-auto [scrollbar-color:var(--line)_transparent] [scrollbar-width:thin]">
            {filteredDevices.map((item) => (
              <div
                key={item.key}
                className={`grid items-center gap-2.5 border-b border-(--line2) px-2 py-[11px] transition-colors duration-150 hover:bg-(--surface2) ${
                  item.status === "inactive" ? "opacity-70" : ""
                }`}
                style={{ gridTemplateColumns: GRID_TEMPLATE }}
              >
                <div className="font-vcr text-[12px] text-(--muted)">{item.rowNumber}</div>
                <div className="truncate text-[13.5px] font-semibold">{item.device}</div>
                <div className="font-vcr truncate text-[12px] text-(--muted)">{item.mac}</div>
                <div className="text-[13.5px] text-(--muted)">{item.type}</div>
                <div className="font-vcr whitespace-nowrap text-[11.5px]">{item.addedAt}</div>
                <div>
                  <PersoStatusBadge status={item.status} />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveDevice(item)}
                    disabled={item.status === "inactive" || removingId === item.id}
                    className="grid h-[30px] w-[30px] place-items-center rounded-[8px] border border-(--line) text-(--muted) transition hover:border-(--orange) hover:text-(--orange) disabled:cursor-not-allowed disabled:opacity-45"
                    aria-label={`Remove perso device ${item.device}`}
                  >
                    <RemoveIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderMobileRows = () => {
    if (!eventId) return <PersoEmptyState message="Select an event to load perso devices." />;
    if (isLoading) return <PersoLoadingState />;
    if (loadError) return <PersoEmptyState message={loadError} />;
    if (filteredDevices.length === 0) return <PersoEmptyState message="No perso devices found." />;

    return filteredDevices.map((item) => (
      <PersoMobileCard
        key={item.key}
        item={item}
        onRemove={handleRemoveDevice}
        isRemoving={removingId === item.id}
      />
    ));
  };

  return (
    <section className="mt-[clamp(14px,1.8vw,20px)] overflow-hidden rounded-[14px] border border-(--line) border-l-[3px] border-l-(--orange) bg-(--surface) shadow-(--shadow)">
      <div className="flex flex-wrap items-center gap-3 px-[15px] py-[14px]">
        <span className="font-vcr grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[10px] bg-[linear-gradient(140deg,#e04420,#8b5cf6)] text-[13px] text-white">
          {devices.length}
        </span>
        <div className="min-w-0">
          <h2 className="font-chillax text-[18px] font-semibold tracking-[-0.01em]">Perso Devices</h2>
          <p className="font-vcr mt-0.5 text-[9px] tracking-[0.15em] text-(--muted)">
            PERSO DEVICES ({devices.length})
          </p>
        </div>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[10px] bg-(--text) px-[18px] text-[13px] font-semibold text-(--bg) transition hover:bg-(--orange) max-[640px]:w-full"
        >
          <PlusIcon />
          Add Device
        </button>
      </div>

      <div className="px-[15px] pb-3">
        <label className="flex h-11 items-center gap-2.5 rounded-[11px] border border-(--line) bg-(--surface2) px-3.5 text-(--muted) focus-within:border-(--orange)">
          <span className="sr-only">Search perso device</span>
          <SearchIcon />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search Device"
            className="h-full min-w-0 flex-1 bg-transparent text-[13px] text-(--text) outline-none placeholder:text-(--faint)"
          />
        </label>
      </div>

      {actionError ? (
        <p className="mx-[15px] mb-2 rounded-[10px] border border-[rgba(224,68,32,0.25)] bg-[rgba(224,68,32,0.06)] px-3 py-2 text-[12px] font-semibold text-(--orange)">
          {actionError}
        </p>
      ) : null}

      <div className="hidden md:block">{renderDesktopRows()}</div>

      <div className="grid max-h-[510px] gap-2.5 overflow-y-auto px-[15px] pb-[15px] [scrollbar-color:var(--line)_transparent] [scrollbar-width:thin] md:hidden">
        {renderMobileRows()}
      </div>

      {isAddModalOpen ? (
        <AddPersoDeviceModal
          eventId={eventId}
          token={token}
          onClose={() => setIsAddModalOpen(false)}
          onAdded={loadPersoDevices}
        />
      ) : null}
    </section>
  );
}
