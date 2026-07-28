"use client";

import { useEffect, useRef, useState } from "react";
import { searchDeviceMasterlist } from "../../../lib/dashboardApi";
import { useDashboardStore } from "../../../store/dashboardStore";
import { ClockIcon, EditIcon, PlusIcon, SearchIcon } from "./DeviceMasterIcons";
import EditDeviceModal from "./EditDeviceModal";

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function getDeviceKey(device, index) {
  return device?.id ?? device?.printId ?? device?.androidId ?? device?.hardwareId ?? index;
}

function getDeviceTitle(device) {
  return device?.description ?? device?.androidId ?? device?.model ?? "-";
}

function getDeviceSerial(device) {
  return device?.reference ?? device?.serial ?? device?.serialNumber ?? "-";
}

function getNfcLabel(device) {
  if (device?.nfcType) return device.nfcType;
  if (device?.hasNfc === 1 || device?.hasNfc === true) return "enabled";
  if (device?.hasNfc === 0 || device?.hasNfc === false) return "none";
  return "-";
}

function DeviceMeta({ label, value }) {
  return (
    <span className="inline-flex items-center gap-1 border-r border-[#d9dde8] pr-3 last:border-r-0 last:pr-0 max-[640px]:pr-2">
      <span className="font-bold text-[#252525]">{label}:</span>
      <span className="text-[#7b7f89]">{value || "-"}</span>
    </span>
  );
}

function DeviceRow({ device, index, onEdit }) {
  return (
    <article className="group grid gap-4 border-b border-[#e1e4ec] px-4 py-5 last:border-b-0 md:grid-cols-[1fr_160px] md:px-6 max-[640px]:gap-3 max-[640px]:px-3 max-[640px]:py-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3 max-[640px]:gap-2">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[9px] bg-[linear-gradient(135deg,#E04420_0%,#A9379E_48%,#341CD6_100%)] text-[1.4rem] font-bold leading-none text-white shadow-[0_12px_28px_rgba(52,28,214,0.24)] max-[640px]:h-8 max-[640px]:w-8 max-[640px]:rounded-md max-[640px]:text-[1rem]">
            {device.status === "active" ? "A" : "0"}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3 text-[1.22rem] font-medium text-[#282828] max-[640px]:gap-2 max-[640px]:text-[0.9rem]">
              <span className="break-all">{device.hardwareId || "-"}</span>
              <span className="hidden h-8 w-px bg-[#d9dde8] sm:inline-block" aria-hidden />
              <span>{getDeviceTitle(device)}</span>
            </div>
          </div>
        </div>

        <div className="mt-3 text-[0.98rem] text-[#8a8a8a] max-[640px]:mt-2 max-[640px]:text-[0.74rem]">
          <span className="font-bold text-[#1f1f1f]">S/N:</span>{" "}
          <span>{getDeviceSerial(device)}</span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.86rem] max-[640px]:mt-2.5 max-[640px]:gap-x-2 max-[640px]:gap-y-1.5 max-[640px]:text-[0.68rem]">
          <span className="rounded-full bg-[#34363b] px-3 py-1 text-[0.68rem] font-bold tracking-wide text-white max-[640px]:px-2 max-[640px]:py-0.5 max-[640px]:text-[0.56rem]">
            {device.type || "-"}
          </span>
          <DeviceMeta label="ID" value={device.printId ?? device.id} />
          <DeviceMeta label="NFC" value={getNfcLabel(device)} />
          <DeviceMeta label="MODEL" value={device.model} />
          <DeviceMeta label="BANK" value={device.bank} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-[0.92rem] text-[#8a8f9b] max-[640px]:mt-2.5 max-[640px]:gap-2 max-[640px]:text-[0.68rem]">
          <span className="inline-flex items-center gap-1.5">
            <ClockIcon />
            <span>{formatDateTime(device.updatedAt ?? device.createdAt)}</span>
          </span>
          <span className="h-5 w-px bg-[#d9dde8]" aria-hidden />
          <span>{device.androidId || "-"}</span>
        </div>
      </div>

      <div className="flex items-start justify-between gap-3 md:justify-end">
        <span className="text-[0.78rem] font-semibold uppercase tracking-[0.24em] text-[#a8adba] md:hidden max-[640px]:text-[0.64rem]">
          #{index + 1}
        </span>
        <button
          type="button"
          onClick={() => onEdit(device)}
          className="grid h-10 w-10 place-items-center rounded-lg border border-[#ded4ff] bg-white text-[#E04420] shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition duration-200 hover:-translate-y-0.5 hover:border-[#E04420] hover:text-[#341CD6] hover:shadow-[0_14px_32px_rgba(52,28,214,0.18)] max-[640px]:h-8 max-[640px]:w-8 max-[640px]:rounded-md"
          aria-label={`Edit device ${device.hardwareId || getDeviceKey(device, index)}`}
        >
          <EditIcon className="h-4.5 w-4.5" />
        </button>
      </div>
    </article>
  );
}

export default function DeviceMasterList() {
  const token = useDashboardStore((state) => state.token);
  const [query, setQuery] = useState("");
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingDevice, setEditingDevice] = useState(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const search = query.trim();
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;

    if (!search) {
      setDevices([]);
      setLoading(false);
      setError("");
      return undefined;
    }

    setLoading(true);
    setError("");

    const timeoutId = window.setTimeout(async () => {
      try {
        const list = await searchDeviceMasterlist({ search, token, dedupe: false });
        if (requestId === requestIdRef.current) {
          setDevices(Array.isArray(list) ? list : []);
        }
      } catch (searchError) {
        console.error("Failed to search master devices", searchError);
        if (requestId === requestIdRef.current) {
          setDevices([]);
          setError("Unable to search devices.");
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [query, token]);

  const handleDeviceSaved = (updatedDevice) => {
    const updatedKey = getDeviceKey(updatedDevice);
    setDevices((current) =>
      current.map((device, index) =>
        getDeviceKey(device, index) === updatedKey
          ? { ...device, ...updatedDevice }
          : device
      )
    );
    setEditingDevice(null);
  };

  return (
    <section className="rounded-xl border border-[#ded4ff] border-l-[4px] border-l-[#E04420] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.12)] max-[640px]:rounded-lg">
      <div className="flex flex-col gap-4 border-b border-[#e4e6ee] px-5 py-5 lg:px-6 max-[640px]:gap-3 max-[640px]:px-3 max-[640px]:py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[0.78rem] font-medium uppercase tracking-[0.18em] text-[#8b8f99] max-[640px]:text-[0.58rem] max-[640px]:tracking-[0.14em]">
              Devices <span className="tracking-normal">( {devices.length} )</span>
            </p>
            <h1 className="mt-1 text-[1.9rem] font-bold leading-tight text-[#111827] max-[640px]:text-[1.25rem]">
              Device Master List
            </h1>
          </div>
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#1c1c1c] px-5 text-[0.9rem] font-semibold text-white shadow-[0_16px_30px_rgba(28,28,28,0.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#E04420] max-[640px]:h-9 max-[640px]:px-3 max-[640px]:text-[0.72rem]"
          >
            <PlusIcon className="h-4 w-4" />
            Add Device
          </button>
        </div>

        <label className="flex h-11 items-center gap-3 rounded-md border border-[#d6dbe7] bg-white px-4 text-[#8c96a8] focus-within:border-[#E04420] focus-within:ring-4 focus-within:ring-[#E04420]/10 max-[640px]:h-9 max-[640px]:gap-2 max-[640px]:px-3">
          <SearchIcon className="h-4.5 w-4.5 shrink-0 max-[640px]:h-3.5 max-[640px]:w-3.5" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by print ID, bank, description, or type"
            className="h-full min-w-0 flex-1 bg-transparent text-[0.95rem] font-medium text-[#1f2937] outline-none placeholder:text-[#a4acbb] max-[640px]:text-[0.72rem]"
          />
        </label>
      </div>

      <div className="grid grid-cols-[1fr_160px] border-b border-[#dfe3ed] px-4 py-4 text-[1.05rem] font-medium uppercase tracking-[0.12em] text-[#E04420] md:px-6 max-[640px]:grid-cols-1 max-[640px]:px-3 max-[640px]:py-2.5 max-[640px]:text-[0.82rem] max-[640px]:tracking-[0.1em]">
        <span>Device</span>
        <span className="hidden text-right md:block">Edit</span>
      </div>

      <div className="max-h-[calc(100vh-285px)] overflow-y-auto">
        {loading ? (
          <div className="px-6 py-14 text-center text-[0.95rem] font-medium text-[#7b8495] max-[640px]:px-3 max-[640px]:py-8 max-[640px]:text-[0.72rem]">
            Searching devices...
          </div>
        ) : error ? (
          <div className="px-6 py-14 text-center text-[0.95rem] font-medium text-[#E04420] max-[640px]:px-3 max-[640px]:py-8 max-[640px]:text-[0.72rem]">
            {error}
          </div>
        ) : devices.length ? (
          devices.map((device, index) => (
            <DeviceRow
              key={getDeviceKey(device, index)}
              device={device}
              index={index}
              onEdit={setEditingDevice}
            />
          ))
        ) : query.trim() ? (
          <div className="px-6 py-14 text-center text-[0.95rem] font-medium text-[#7b8495] max-[640px]:px-3 max-[640px]:py-8 max-[640px]:text-[0.72rem]">
            No devices found.
          </div>
        ) : (
          <div className="px-6 py-14 text-center text-[0.95rem] font-medium text-[#7b8495] max-[640px]:px-3 max-[640px]:py-8 max-[640px]:text-[0.72rem]">
            Search by print ID, bank, description, or type to load master devices.
          </div>
        )}
      </div>

      {editingDevice ? (
        <EditDeviceModal
          device={editingDevice}
          token={token}
          onClose={() => setEditingDevice(null)}
          onSaved={handleDeviceSaved}
        />
      ) : null}
    </section>
  );
}
