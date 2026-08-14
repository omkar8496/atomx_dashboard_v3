"use client";

import { useEffect, useRef, useState } from "react";
import { searchDeviceMasterlist } from "../../../lib/dashboardApi";
import { useDashboardStore } from "../../../store/dashboardStore";
import { ClockIcon, EditIcon, PlusIcon, SearchIcon } from "./DeviceMasterIcons";
import EditDeviceModal from "./EditDeviceModal";
import AddDeviceModal from "./AddDeviceModal";

const GRID_COLS =
  "md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.05fr)_minmax(0,1.5fr)_auto]";

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

function getInitial(device) {
  const title = String(getDeviceTitle(device)).trim();
  return title && title !== "-" ? title.charAt(0).toUpperCase() : "?";
}

function SpecRow({ label, value }) {
  return (
    <div className="flex min-w-0 items-baseline gap-2">
      <span className="font-vcr w-[46px] shrink-0 text-[7.5px] tracking-[0.14em] text-(--faint)">
        {label}
      </span>
      <span className="min-w-0 break-words text-[12.5px] font-medium text-(--text)">
        {value || "-"}
      </span>
    </div>
  );
}

function DeviceRow({ device, index, onEdit }) {
  return (
    <div
      className={`grid grid-cols-1 items-start gap-4 border-b border-(--line2) px-4 py-4 transition-colors duration-150 last:border-b-0 hover:bg-(--surface2) md:gap-[18px] md:px-[16px] ${GRID_COLS}`}
      style={{ animation: `atxRowIn 0.3s both`, animationDelay: `${index * 0.04}s` }}
    >
      {/* DEVICE */}
      <div className="flex min-w-0 items-start gap-3">
        <span className="font-chillax flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px] bg-[linear-gradient(140deg,#e04420,#8b5cf6)] text-[16px] font-semibold leading-none text-white">
          {getInitial(device)}
        </span>
        <div className="min-w-0">
          <div className="font-chillax text-[15.5px] font-semibold leading-[1.3] tracking-[-0.01em] [overflow-wrap:anywhere]">
            {getDeviceTitle(device)}
          </div>
          <div className="font-vcr mt-1 text-[11.5px] text-(--blue) [overflow-wrap:anywhere]">
            {device.hardwareId || "-"}
          </div>
        </div>
      </div>

      {/* IDENTITY */}
      <div className="min-w-0">
        <div className="font-vcr text-[7.5px] tracking-[0.15em] text-(--faint)">S/N</div>
        <div className="mt-1 text-[12.5px] font-semibold [overflow-wrap:anywhere]">
          {getDeviceSerial(device)}
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-(--text) px-2.5 py-1 text-[11px] font-semibold text-(--bg)">
            {device.type || "-"}
          </span>
          <span className="font-vcr text-[10.5px] text-(--muted)">
            ID {device.printId ?? device.id ?? "-"}
          </span>
        </div>
      </div>

      {/* SPECS */}
      <div className="flex min-w-0 flex-col gap-[7px]">
        <SpecRow label="NFC" value={getNfcLabel(device)} />
        <SpecRow label="MODEL" value={device.model} />
        <SpecRow label="BANK" value={device.bank} />
        <div className="mt-0.5 flex flex-wrap items-center gap-2.5 text-(--muted)">
          <ClockIcon className="h-3 w-3 shrink-0 opacity-60" />
          <span className="text-[11.5px] font-light">
            {formatDateTime(device.updatedAt ?? device.createdAt)}
          </span>
          <span className="text-(--line)">|</span>
          <span className="font-vcr text-[10.5px] [overflow-wrap:anywhere]">
            {device.androidId || "-"}
          </span>
        </div>
      </div>

      {/* EDIT */}
      <div className="flex items-start justify-start md:justify-end">
        <button
          type="button"
          onClick={() => onEdit(device)}
          className="grid h-[34px] w-[34px] place-items-center rounded-[9px] border border-(--line) bg-(--surface) text-(--orange) transition duration-150 hover:border-(--orange) hover:bg-[rgba(224,68,32,0.08)]"
          aria-label={`Edit device ${device.hardwareId || getDeviceKey(device, index)}`}
        >
          <EditIcon className="h-[15px] w-[15px]" />
        </button>
      </div>
    </div>
  );
}

export default function DeviceMasterList() {
  const token = useDashboardStore((state) => state.token);
  const [query, setQuery] = useState("");
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingDevice, setEditingDevice] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
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

  const handleDeviceCreated = (createdDevice) => {
    if (createdDevice) {
      setDevices((current) => [createdDevice, ...current]);
    }
    setIsAddOpen(false);
  };

  const hasResults = devices.length > 0;

  return (
    <div className="mx-auto w-full max-w-[1560px] pb-24">
      <style>{`@keyframes atxRowIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>

      {/* Title + primary action */}
      <div className="flex flex-wrap items-end justify-between gap-4 pt-6">
        <div>
          <div className="font-vcr text-[9.5px] tracking-[0.2em] text-(--muted)">
            DEVICES ( {devices.length} )
          </div>
          <h1 className="font-chillax mt-1.5 text-[clamp(26px,3.2vw,38px)] font-semibold leading-[1.05] tracking-[-0.02em] text-(--text)">
            Device Master List
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-[11px] bg-(--text) px-5 text-[13.5px] font-semibold text-(--bg) transition duration-150 hover:bg-(--orange)"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          Add Device
        </button>
      </div>

      {/* Search */}
      <div className="mt-[clamp(16px,2vw,22px)]">
        <label className="flex h-12 items-center gap-3 rounded-[12px] border border-(--line) bg-(--surface) px-[15px] shadow-(--shadow) transition focus-within:border-(--orange)">
          <SearchIcon className="h-4 w-4 shrink-0 text-(--faint)" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search MAC, serial, model, bank"
            className="h-full min-w-0 flex-1 bg-transparent text-[14px] text-(--text) outline-none placeholder:text-(--faint)"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-md text-(--faint) transition hover:bg-(--chip) hover:text-(--text)"
            >
              <svg viewBox="0 0 12 12" className="h-3 w-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none">
                <path d="M3 3l6 6M9 3l-6 6" />
              </svg>
            </button>
          ) : null}
        </label>
      </div>

      {/* Table */}
      <section className="mt-[clamp(14px,1.8vw,20px)] overflow-hidden rounded-[15px] border border-(--line) bg-(--surface) shadow-(--shadow)">
        <div
          className={`hidden border-b border-(--line) bg-(--surface2) px-[16px] py-[13px] md:grid md:items-center md:gap-[18px] ${GRID_COLS}`}
        >
          {["DEVICE", "IDENTITY", "SPECS"].map((label) => (
            <span key={label} className="font-vcr text-[9.5px] tracking-[0.16em] text-(--orange)">
              {label}
            </span>
          ))}
          <span className="font-vcr text-right text-[9.5px] tracking-[0.16em] text-(--orange)">
            EDIT
          </span>
        </div>

        {loading ? (
          <div className="px-6 py-14 text-center text-[13px] font-medium text-(--muted)">
            Searching devices…
          </div>
        ) : error ? (
          <div className="px-6 py-14 text-center text-[13px] font-medium text-(--orange)">
            {error}
          </div>
        ) : hasResults ? (
          devices.map((device, index) => (
            <DeviceRow
              key={getDeviceKey(device, index)}
              device={device}
              index={index}
              onEdit={setEditingDevice}
            />
          ))
        ) : (
          <div className="px-6 py-14 text-center">
            <div className="font-chillax text-[17px] font-medium text-(--text)">
              {query.trim() ? "No device matches" : "Search the device master"}
            </div>
            <div className="mt-1.5 text-[12.5px] text-(--faint)">
              Try a MAC address, serial number or bank code.
            </div>
          </div>
        )}
      </section>

      {editingDevice ? (
        <EditDeviceModal
          device={editingDevice}
          token={token}
          onClose={() => setEditingDevice(null)}
          onSaved={handleDeviceSaved}
        />
      ) : null}

      {isAddOpen ? (
        <AddDeviceModal
          token={token}
          onClose={() => setIsAddOpen(false)}
          onCreated={handleDeviceCreated}
        />
      ) : null}
    </div>
  );
}
