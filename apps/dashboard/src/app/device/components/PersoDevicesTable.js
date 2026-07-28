"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AtomXLoader } from "@atomx/global-components";
import { fetchPersoDevices, removePersoDevice } from "../../../lib/dashboardApi";
import { useDashboardStore } from "../../../store/dashboardStore";
import AddPersoDeviceModal from "./AddPersoDeviceModal";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function RemoveIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function SortIcon() {
  return (
    <span className="inline-flex flex-col gap-0.5 text-[#c8ced8]" aria-hidden="true">
      <svg viewBox="0 0 10 6" className="h-1.5 w-2.5" fill="currentColor">
        <path d="M5 0 10 6H0z" />
      </svg>
      <svg viewBox="0 0 10 6" className="h-1.5 w-2.5" fill="currentColor">
        <path d="M5 6 0 0h10z" />
      </svg>
    </span>
  );
}

function TableHead({ children, sortable = true }) {
  return (
    <th className="px-4 py-3 text-left text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-[#E04420]/70">
      <span className="inline-flex items-center gap-1.5">
        {children}
        {sortable ? <SortIcon /> : null}
      </span>
    </th>
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
      className={`rounded-full px-2.5 py-1 text-[0.62rem] font-bold uppercase ${
        isInactive
          ? "bg-[#f4f4f4] text-[#8b8b8b]"
          : "bg-[#e4f6ff] text-[#0285bf]"
      }`}
    >
      {normalizedStatus || "-"}
    </span>
  );
}

function PersoEmptyState({ message }) {
  return (
    <div className="rounded-lg border border-dashed border-[#dfdfdf] px-4 py-8 text-center text-sm font-semibold text-[#8a8a8a]">
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
    <article className="rounded-lg border border-transparent p-px"
      style={{
        background:
          "linear-gradient(#fff, #fff) padding-box, linear-gradient(110deg, #ffb7ac, #d5c9ff) border-box"
      }}
    >
      <div className="rounded-[7px] bg-white p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.56rem] font-bold uppercase tracking-[0.15em] text-[#929292]">Device</p>
            <p className="mt-1 text-[0.92rem] font-semibold text-[#202020]">{item.device}</p>
          </div>
          <PersoStatusBadge status={item.status} />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="min-w-0">
            <p className="text-[0.56rem] font-bold uppercase tracking-[0.12em] text-[#929292]">MAC</p>
            <p className="mt-1 truncate text-[0.72rem] font-semibold text-[#657391]">{item.mac}</p>
          </div>
          <div>
            <p className="text-[0.56rem] font-bold uppercase tracking-[0.12em] text-[#929292]">Type</p>
            <p className="mt-1 text-[0.72rem] font-semibold text-[#202020]">{item.type}</p>
          </div>
          <div className="col-span-2">
            <p className="text-[0.56rem] font-bold uppercase tracking-[0.12em] text-[#929292]">Added At</p>
            <p className="mt-1 text-[0.72rem] font-semibold text-[#202020]">{item.addedAt}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onRemove(item)}
          disabled={isInactive || isRemoving}
          className="mt-3 inline-flex h-8 items-center gap-2 rounded-lg border border-[#e6e6e6] bg-white px-3 text-[0.68rem] font-bold text-[#6d6d6d] transition hover:border-[#E04420] hover:text-[#E04420] disabled:cursor-not-allowed disabled:opacity-45"
          aria-label={`Remove perso device ${item.device}`}
        >
          <RemoveIcon />
          {isRemoving ? "Removing..." : isInactive ? "Inactive" : "Remove"}
        </button>
      </div>
    </article>
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

  const filteredDevices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return devices;

    return devices.filter((item) =>
      [item.id, item.device, item.mac, item.type, item.addedAt, item.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery))
    );
  }, [devices, query]);

  const renderDesktopRows = () => {
    if (!eventId) {
      return <PersoEmptyState message="Select an event to load perso devices." />;
    }

    if (isLoading) {
      return <PersoLoadingState />;
    }

    if (loadError) {
      return <PersoEmptyState message={loadError} />;
    }

    if (filteredDevices.length === 0) {
      return <PersoEmptyState message="No perso devices found." />;
    }

    return (
      <div className="max-h-[334px] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#d5b7ff_transparent]">
        <table className="min-w-[920px] w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-white">
            <tr className="border-b border-[#e5e9f0]">
              <TableHead sortable={false}>#</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>MAC</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Added At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead sortable={false}>Add / Remove</TableHead>
            </tr>
          </thead>
          <tbody>
            {filteredDevices.map((item) => (
              <tr key={item.key} className={`border-b border-[#edf0f5] transition hover:bg-[#fbfbff] ${item.status === "inactive" ? "opacity-70" : ""}`}>
                <td className="px-4 py-3 text-[0.76rem] font-medium text-[#777777]">{item.rowNumber}</td>
                <td className="px-4 py-3 text-[0.78rem] font-semibold text-[#4d4d4d]">{item.device}</td>
                <td className="px-4 py-3 text-[0.78rem] font-medium text-[#6f7480]">{item.mac}</td>
                <td className="px-4 py-3 text-[0.78rem] font-medium text-[#6f7480]">{item.type}</td>
                <td className="px-4 py-3 text-[0.78rem] font-medium text-[#6f7480]">{item.addedAt}</td>
                <td className="px-4 py-3">
                  <PersoStatusBadge status={item.status} />
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => handleRemoveDevice(item)}
                    disabled={item.status === "inactive" || removingId === item.id}
                    className="grid h-7 w-7 place-items-center rounded-md border border-[#e5e5e5] bg-white text-[#686868] transition hover:border-[#E04420] hover:text-[#E04420] disabled:cursor-not-allowed disabled:opacity-45"
                    aria-label={`Remove perso device ${item.device}`}
                  >
                    <RemoveIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderMobileRows = () => {
    if (!eventId) {
      return <PersoEmptyState message="Select an event to load perso devices." />;
    }

    if (isLoading) {
      return <PersoLoadingState />;
    }

    if (loadError) {
      return <PersoEmptyState message={loadError} />;
    }

    if (filteredDevices.length === 0) {
      return <PersoEmptyState message="No perso devices found." />;
    }

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
    <section className="mt-4 rounded-xl border border-[#ded4ff] border-l-[4px] border-l-[#E04420] bg-white p-3.5 shadow-[0_18px_52px_rgba(15,23,42,0.09)]">
      <div className="flex flex-col gap-3 border-b border-[#e5e5e5] pb-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-fit items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[linear-gradient(135deg,#E04420_0%,#A9379E_48%,#341CD6_100%)] text-[0.8rem] font-bold text-white shadow-[0_10px_22px_rgba(52,28,214,0.20)]">
            {devices.length}
          </span>
          <div>
            <h2 className="text-[0.98rem] font-semibold text-[#1f1f1f]">Perso Devices</h2>
            <p className="mt-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#8f8f8f]">
              Perso devices ({devices.length})
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[#202020] px-3 text-[0.76rem] font-bold text-white shadow-[0_8px_16px_rgba(15,23,42,0.14)] transition hover:bg-[#E04420] max-[640px]:w-full"
        >
          <PlusIcon />
          Add Device
        </button>
      </div>

      <label className="mt-3 flex h-9 w-full items-center gap-2.5 rounded-lg border border-[#dfe3ea] bg-white px-3 text-[#8f80ff] transition focus-within:border-[#E04420] focus-within:ring-2 focus-within:ring-[#E04420]/10">
        <span className="sr-only">Search perso device</span>
        <SearchIcon />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search Device"
          className="h-full min-w-0 flex-1 bg-transparent text-[0.78rem] font-normal text-[#1f2937] outline-none placeholder:text-[#8e98ad]"
        />
      </label>

      {actionError ? (
        <p className="mt-2 rounded-lg border border-[#ffd4cc] bg-[#fff7f5] px-3 py-2 text-[0.72rem] font-semibold text-[#E04420]">
          {actionError}
        </p>
      ) : null}

      <div className="hidden overflow-x-auto pt-3 md:block">
        {renderDesktopRows()}
      </div>

      <div className="grid max-h-[510px] gap-2.5 overflow-y-auto pr-1 pt-3 [scrollbar-width:thin] [scrollbar-color:#d5b7ff_transparent] md:hidden">
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
