"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { searchDeviceMasterlist } from "../../../lib/dashboardApi";
import { useDashboardStore } from "../../../store/dashboardStore";
import { SearchIcon } from "./ConfigIcons";

const DEVICE_TYPES = [
  "MENU",
  "TICKET MENU",
  "INVOICE",
  "SALE ITEMS",
  "SALE KIOSK",
  "INVENTORY COUNT",
  "PICKUP",
  "CHARGEX",
  "TOPUP CASH",
  "TOPUP CARD",
  "TOPUP COMPLIMENTARY",
  "TOPUP ITEMS",
  "ACCESSX",
  "TOPUP CORPORATE",
  "TOPUP EMPLOYEE",
  "TOPUP SPECIAL",
  "TOPUP KIOSK",
  "TOPUP KIOSK ONLINE",
  "TOPUP KIOSK OFFLINE",
  "TOPUP HOME DELIVERY",
  "TOPUP PICKUP",
  "DISCOUNT COUPON ISSUANCE",
  "RETURN",
  "MERGE",
  "MASTER RETURN",
  "ISSUANCE",
  "STALL INFO SHARING"
];

const PRINTER_OPTIONS = [
  "NONE",
  "WISEPOS+",
  "EZETAP",
  "MF919",
  "MOSAMBEE | DX8000",
  "WORLDLINE",
  "SUNMIPAY",
  "AIPAY",
  "PINELABS",
  "RUGTEK",
  "BT-2INCH",
  "SPRIN-3INCH",
  "SPRIN-2INCH",
  "PANDA-3INCH",
  "USB-3INCH"
];

function CloseIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <svg viewBox="0 0 14 14" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6" />
      <path d="M12 7h.01" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M2.5 4.5 6 8l3.5-3.5" />
    </svg>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="font-vcr mb-1.5 block text-[8.5px] uppercase tracking-[0.16em] text-(--muted)">{label}</span>
      <span className="relative block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full cursor-pointer appearance-none rounded-[10px] border border-(--line) bg-(--surface) px-3.5 pr-9 text-[13px] font-medium uppercase tracking-[0.04em] text-(--text) outline-none transition focus:border-(--orange) focus:shadow-[0_0_0_3px_rgba(224,68,32,0.12)] max-[640px]:h-10"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-(--muted) opacity-60">
          <ChevronIcon />
        </span>
      </span>
    </label>
  );
}

function DetailChip({ label, value }) {
  return (
    <div className="rounded-[10px] border border-(--line) bg-(--surface2) px-3.5 py-2.5">
      <div className="font-vcr text-[7.5px] uppercase tracking-[0.14em] text-(--faint)">{label}</div>
      <div className="mt-1 truncate text-[13px] font-semibold text-(--text)">{value || "-"}</div>
    </div>
  );
}

function SectionDivider() {
  return (
    <div className="flex items-center gap-3 py-3 text-(--faint)">
      <div className="h-px flex-1 bg-(--line2)" />
      <span className="grid h-7 w-7 place-items-center rounded-full border border-(--line) bg-(--surface)">
        <InfoIcon />
      </span>
      <div className="h-px flex-1 bg-(--line2)" />
    </div>
  );
}

function getStallName(stall) {
  return stall?.name ?? stall?.stallName ?? stall?.stall ?? "-";
}

function getVendorName(stall) {
  return stall?.vendorName ?? stall?.vendor?.name ?? stall?.vendor ?? "-";
}

function getStallType(stall) {
  return String(stall?.type ?? stall?.category ?? "-").toUpperCase();
}

function getPayMode(stall) {
  const raw =
    stall?.payOptions ??
    stall?.pay_modes ??
    stall?.payModes ??
    stall?.paymentModes ??
    stall?.payOption;
  if (raw === 0 || raw === "0") return "ONLY NFC";
  if (Array.isArray(raw)) return raw.join(", ").toUpperCase();
  return String(raw || "ONLY NFC").replaceAll(",", ", ").toUpperCase();
}

function getBankMode(stall) {
  return String(stall?.bankOption ?? stall?.bankMode ?? stall?.bank ?? "NONE").toUpperCase();
}

function normalizeDeviceList(list) {
  if (Array.isArray(list)) {
    return list.filter((device) => device !== null && device !== undefined && String(device).trim() !== "");
  }

  if (typeof list === "string") {
    return list
      .split(",")
      .map((device) => device.trim())
      .filter(Boolean);
  }

  if (list === null || list === undefined || list === "") {
    return [];
  }

  return [list];
}

function getStallDevices(stall) {
  const list =
    stall?.devices_list ??
    stall?.device_list ??
    stall?.devicesList ??
    stall?.devices ??
    stall?.device ??
    [];
  return normalizeDeviceList(list);
}

function getDeviceLabel(device) {
  if (device === null || device === undefined) return "-";
  if (typeof device === "string" || typeof device === "number") return String(device);
  return String(
    device.printId ??
      device.deviceId ??
      device.id ??
      device.reference ??
      device.androidId ??
      device.hardwareId ??
      "-"
  );
}

function getDeviceKey(device) {
  if (device === null || device === undefined) return "";
  if (typeof device === "string" || typeof device === "number") return String(device);
  return String(
    device.id ??
      device.printId ??
      device.deviceId ??
      device.reference ??
      device.androidId ??
      device.hardwareId ??
      ""
  );
}

function getDevicePayloadId(device) {
  const value =
    typeof device === "string" || typeof device === "number"
      ? device
      : device?.printId ?? device?.deviceId ?? device?.id ?? device?.reference;
  if (value === null || value === undefined || value === "") return null;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : value;
}

function getStallId(stall) {
  return stall?.id ?? stall?.stallId ?? stall?.stall_id ?? null;
}

function getSearchResultLabel(device) {
  return [device?.printId, device?.description, device?.bank, device?.type].filter(Boolean).join(" | ");
}

function toApiTypeValue(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function toApiPrinterValue(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s*\|\s*/g, "_")
    .replace(/\s+/g, "_");
}

export default function Add_Device({ stall, onClose, onConfirm }) {
  const token = useDashboardStore((state) => state.token);
  const [type, setType] = useState("RETURN");
  const [printer, setPrinter] = useState("WISEPOS+");
  const [query, setQuery] = useState("");
  const [devices, setDevices] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const overlayRef = useRef(null);
  const requestIdRef = useRef(0);
  const stallDevices = useMemo(() => getStallDevices(stall), [stall]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    const search = query.trim();
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;

    if (search.length < 3) {
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
        console.error("Device search failed", searchError);
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

  const addSelectedDevice = (device) => {
    const key = getDeviceKey(device);
    if (!key) return;
    setSelectedDevices((current) => {
      if (current.some((item) => getDeviceKey(item) === key)) return current;
      return [...current, device];
    });
  };

  const removeSelectedDevice = (device) => {
    const key = getDeviceKey(device);
    setSelectedDevices((current) => current.filter((item) => getDeviceKey(item) !== key));
  };

  const handleConfirm = async () => {
    const stallId = getStallId(stall);
    const selectedDeviceIds = selectedDevices
      .map(getDevicePayloadId)
      .filter((deviceId) => deviceId !== null && deviceId !== undefined && deviceId !== "");

    if (!stallId) {
      setSubmitError("Missing stall ID.");
      return;
    }

    if (selectedDeviceIds.length === 0) {
      setSubmitError("Select at least one device.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      await onConfirm?.({
        type: toApiTypeValue(type),
        devices: selectedDeviceIds,
        printer: toApiPrinterValue(printer),
        stallId
      });
    } catch (confirmError) {
      console.error("Add devices failed", confirmError);
      setSubmitError("Unable to add devices.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      onMouseDown={(event) => {
        if (event.target === overlayRef.current) onClose?.();
      }}
      className="fixed inset-0 z-[220] flex items-center justify-center bg-[rgba(12,12,12,0.5)] px-4 py-6 backdrop-blur-[3px] max-[640px]:p-0"
    >
      <div className="flex max-h-[calc(100dvh-48px)] w-full max-w-[820px] flex-col overflow-hidden rounded-[16px] border border-(--line) bg-(--surface) shadow-(--shadowUp) max-[640px]:h-full max-[640px]:max-h-full max-[640px]:rounded-none">
        <div
          className="relative shrink-0 overflow-hidden px-6 py-4 max-[640px]:px-4"
          style={{ background: "linear-gradient(120deg,#1C1C1C 0%,#341CD6 62%,#E04420 130%)" }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{ background: "repeating-linear-gradient(90deg,#fff 0 1px,transparent 1px 46px)" }}
            aria-hidden
          />
          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-vcr text-[9px] uppercase tracking-[0.2em] text-(--purple)">Add Devices</p>
              <h2 className="font-chillax m-0 mt-1 truncate text-[clamp(18px,2.3vw,25px)] font-semibold tracking-[-0.01em] text-white">
                {getStallName(stall)}
              </h2>
              <p className="m-0 mt-1 text-[12px] font-light text-white/70">Vendor: {getVendorName(stall)}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] border border-white/20 text-white/80 transition hover:border-(--orange) hover:bg-(--orange)"
              aria-label="Close add device modal"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 max-[640px]:px-4">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_290px]">
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <SelectField label="Type" value={type} onChange={setType} options={DEVICE_TYPES} />
                <SelectField label="Printer" value={printer} onChange={setPrinter} options={PRINTER_OPTIONS} />
              </div>

              <label className="block">
                <span className="font-vcr mb-1.5 block text-[8.5px] uppercase tracking-[0.16em] text-(--muted)">
                  Devices ({selectedDevices.length})
                </span>
                <div className="flex h-11 items-center gap-2 rounded-[10px] border border-(--line) bg-(--surface) px-3.5 text-(--muted) transition focus-within:border-(--orange) max-[640px]:h-10">
                  <SearchIcon className="h-4 w-4 shrink-0 opacity-60" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Type 3 digits to search"
                    className="h-full min-w-0 flex-1 bg-transparent text-[13px] font-medium text-(--text) outline-none placeholder:text-(--faint)"
                  />
                </div>
              </label>

              {selectedDevices.length > 0 && (
                <div className="flex flex-wrap gap-2 rounded-[12px] border border-(--line) bg-(--surface2) p-2.5">
                  {selectedDevices.map((device) => (
                    <span
                      key={getDeviceKey(device)}
                      className="font-vcr inline-flex h-8 items-center gap-2 rounded-full border border-(--line) bg-(--surface) pl-3 pr-1.5 text-[11px] text-(--text)"
                    >
                      {getDeviceLabel(device)}
                      <button
                        type="button"
                        onClick={() => removeSelectedDevice(device)}
                        className="grid h-5 w-5 place-items-center rounded-full bg-(--text) text-(--bg) transition hover:bg-(--orange)"
                        aria-label={`Remove device ${getDeviceLabel(device)}`}
                      >
                        <CloseIcon className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {query.trim().length >= 3 && (
                <div className="rounded-[12px] border border-(--line) bg-(--surface2) p-3">
                  {loading ? (
                    <p className="m-0 text-[13px] font-medium text-(--muted)">Searching devices…</p>
                  ) : error ? (
                    <p className="m-0 text-[13px] font-semibold text-(--orange)">{error}</p>
                  ) : devices.length ? (
                    <div className="grid max-h-[180px] gap-2 overflow-y-auto pr-1">
                      {devices.map((device, index) => {
                        const key = device?.id ?? device?.printId ?? device?.androidId ?? index;
                        const active = selectedDevices.some((item) => getDeviceKey(item) === getDeviceKey(device));
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => addSelectedDevice(device)}
                            className={`rounded-[10px] border px-3 py-2 text-left text-[13px] font-semibold transition ${
                              active
                                ? "border-(--orange) bg-[rgba(224,68,32,0.06)] text-(--text)"
                                : "border-(--line) bg-(--surface) text-(--muted) hover:border-(--orange)"
                            }`}
                          >
                            <span className="flex items-center justify-between gap-3">
                              <span>{getSearchResultLabel(device) || getDeviceLabel(device)}</span>
                              <span className="font-vcr shrink-0 text-[9px] uppercase tracking-[0.12em] text-(--orange)">
                                {active ? "Selected" : "Add"}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="m-0 text-[13px] font-medium text-(--muted)">No matching devices found.</p>
                  )}
                </div>
              )}

              {submitError && (
                <p className="m-0 rounded-[10px] border border-[rgba(224,68,32,0.25)] bg-[rgba(224,68,32,0.06)] px-3 py-2 text-[12px] font-semibold text-(--orange)">
                  {submitError}
                </p>
              )}
            </div>

            <div className="rounded-[12px] border border-(--line) bg-(--surface) p-4 shadow-(--shadow) max-[640px]:p-3">
              <h3 className="font-chillax m-0 text-[14px] font-semibold text-(--text)">Details</h3>
              <div className="mt-3 grid gap-2">
                <DetailChip label="STALL TYPE" value={getStallType(stall)} />
                <DetailChip label="PAY MODES" value={getPayMode(stall)} />
                <DetailChip label="BANK MODE" value={getBankMode(stall)} />
              </div>
            </div>
          </div>

          <SectionDivider />

          <section>
            <h3 className="font-vcr m-0 text-[10px] uppercase tracking-[0.15em] text-(--muted)">
              Stall Devices ( {stallDevices.length} )
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {stallDevices.length ? (
                stallDevices.map((device, index) => (
                  <span
                    key={`${getDeviceLabel(device)}-${index}`}
                    className="font-vcr rounded-full border border-(--line) bg-(--surface2) px-3.5 py-1.5 text-[11px] text-(--muted)"
                  >
                    {getDeviceLabel(device)}
                  </span>
                ))
              ) : (
                <span className="text-[13px] font-medium text-(--faint)">No stall devices assigned.</span>
              )}
            </div>
          </section>
        </div>

        <div className="flex shrink-0 justify-end gap-2.5 border-t border-(--line) bg-(--surface2) px-6 py-4 max-[640px]:grid max-[640px]:grid-cols-2 max-[640px]:px-4">
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 items-center justify-center rounded-[10px] border border-(--line) bg-(--surface) px-6 text-[13.5px] font-semibold text-(--muted) transition hover:border-(--orange) hover:text-(--orange)"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="flex h-11 items-center justify-center rounded-[10px] bg-(--text) px-8 text-[13.5px] font-semibold text-(--bg) transition hover:bg-(--orange) disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Adding…" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
