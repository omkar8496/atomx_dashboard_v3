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

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6" />
      <path d="M12 7h.01" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#858585] max-[640px]:text-[0.58rem]">{label}</span>
      <span className="relative block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-full appearance-none rounded-lg border border-[#dedede] bg-white px-3.5 pr-10 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#1f1f1f] outline-none transition hover:border-[#D5B7FF] focus:border-[#E04420] focus:ring-3 focus:ring-[#E04420]/10 max-[640px]:h-9 max-[640px]:px-3 max-[640px]:pr-9 max-[640px]:text-[0.68rem]"
        >
          {options.map((option) => (
            <option key={option} value={option} className="bg-white text-[#1c1c1c]">
              {option}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#E04420]">
          <ChevronIcon />
        </span>
      </span>
    </label>
  );
}

function DetailChip({ label, value }) {
  return (
    <div className="rounded-lg border border-[#e7e1ff] bg-[#fbfbfd] px-3.5 py-3">
      <div className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#8b8b8b]">{label}</div>
      <div className="mt-1 truncate text-[0.88rem] font-semibold text-[#252525]">{value || "-"}</div>
    </div>
  );
}

function SectionDivider({ compact = false }) {
  return (
    <div className={`flex items-center gap-3 ${compact ? "py-2" : "py-3"} text-[#8a8a8a]`}>
      <div className="h-px flex-1 bg-[#e3e4ea]" />
      <span className="grid h-7 w-7 place-items-center rounded-full border border-[#ececec] bg-white">
        <InfoIcon />
      </span>
      <div className="h-px flex-1 bg-[#e3e4ea]" />
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
  return [
    device?.printId,
    device?.description,
    device?.bank,
    device?.type
  ]
    .filter(Boolean)
    .join(" | ");
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
      onClick={(event) => {
        if (event.target === overlayRef.current) onClose?.();
      }}
      className="fixed inset-0 z-[220] flex h-dvh items-start justify-center overflow-hidden bg-[#1c1c1c]/45 px-4 pb-10 pt-8 backdrop-blur-[3px] max-[640px]:items-center max-[640px]:px-3 max-[640px]:py-3"
    >
      <style jsx global>{`
        @font-face {
          font-family: "AtomX Add Device Poppins";
          src: url("/shared/fonts/Poppins/Poppins-Regular.ttf") format("truetype");
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: "AtomX Add Device Poppins";
          src: url("/shared/fonts/Poppins/Poppins-SemiBold.ttf") format("truetype");
          font-weight: 600;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: "AtomX Add Device Poppins";
          src: url("/shared/fonts/Poppins/Poppins-Bold.ttf") format("truetype");
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }
        .add-device-modal,
        .add-device-modal * {
          font-family: "AtomX Add Device Poppins", Poppins, sans-serif;
        }

        @media (max-width: 640px) {
          .add-device-modal {
            max-height: calc(100dvh - 24px);
            border-radius: 18px;
          }
        }
      `}</style>

      <div className="add-device-modal flex max-h-[calc(100dvh-72px)] w-full max-w-[820px] flex-col overflow-hidden rounded-xl border border-[#d5b7ff]/70 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.25)] max-[640px]:max-h-[calc(100dvh-24px)]">
        <div className="flex shrink-0 items-start justify-between border-b border-[#ececec] bg-[#1c1c1c] px-6 py-4 text-white max-[640px]:px-4 max-[640px]:py-3">
          <div className="min-w-0">
            <h2 className="m-0 truncate text-[1.12rem] font-semibold tracking-wide max-[640px]:text-[0.92rem]">
              Add Devices to Stall: {getStallName(stall)}
            </h2>
            <p className="m-0 mt-1 text-[0.82rem] font-medium text-white/72 max-[640px]:text-[0.68rem]">
              Vendor: {getVendorName(stall)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-4 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 text-white/75 transition hover:bg-white/10 hover:text-white max-[640px]:h-8 max-[640px]:w-8"
            aria-label="Close add device modal"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 max-[640px]:px-4 max-[640px]:py-4">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_290px]">
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <SelectField label="Type" value={type} onChange={setType} options={DEVICE_TYPES} />
                <SelectField label="Printer" value={printer} onChange={setPrinter} options={PRINTER_OPTIONS} />
              </div>

              <label className="block">
                <span className="mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#858585] max-[640px]:text-[0.58rem]">
                  Devices ({selectedDevices.length})
                </span>
                <div className="flex h-10 items-center gap-2 rounded-lg border border-[#dedede] bg-white px-3.5 text-[#E04420] transition focus-within:border-[#E04420] focus-within:ring-3 focus-within:ring-[#E04420]/10 max-[640px]:h-9 max-[640px]:px-3">
                  <SearchIcon className="h-4 w-4 shrink-0" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Type 3 digits to search"
                    className="h-full min-w-0 flex-1 bg-transparent text-[0.82rem] font-medium text-[#1c1c1c] outline-none placeholder:text-[#9ca3af] max-[640px]:text-[0.72rem]"
                  />
                </div>
              </label>

              {selectedDevices.length > 0 && (
                <div className="flex flex-wrap gap-2 rounded-xl border border-[#efeafc] bg-[#fbfbfd] p-2.5">
                  {selectedDevices.map((device) => (
                    <span
                      key={getDeviceKey(device)}
                      className="inline-flex h-8 items-center gap-2 rounded-full border border-[#ded4ff] bg-white pl-3 pr-1.5 text-[0.76rem] font-bold text-[#252525] shadow-[0_6px_14px_rgba(15,23,42,0.05)]"
                    >
                      {getDeviceLabel(device)}
                      <button
                        type="button"
                        onClick={() => removeSelectedDevice(device)}
                        className="grid h-5 w-5 place-items-center rounded-full bg-[#1c1c1c] text-white transition hover:bg-[#E04420]"
                        aria-label={`Remove device ${getDeviceLabel(device)}`}
                      >
                        <CloseIcon />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {query.trim().length >= 3 && (
                <div className="rounded-xl border border-[#ececec] bg-[#fafafa] p-3">
                  {loading ? (
                    <p className="m-0 text-[0.82rem] font-medium text-[#7b8495]">Searching devices...</p>
                  ) : error ? (
                    <p className="m-0 text-[0.82rem] font-semibold text-[#E04420]">{error}</p>
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
                            className={`rounded-lg border px-3 py-2 text-left text-[0.78rem] font-semibold transition ${
                              active
                                ? "border-[#D5B7FF] bg-[#f6f2ff] text-[#1c1c1c]"
                                : "border-[#e4e4e4] bg-white text-[#4d5565] hover:border-[#d5b7ff]"
                            }`}
                          >
                            <span className="flex items-center justify-between gap-3">
                              <span>{getSearchResultLabel(device) || getDeviceLabel(device)}</span>
                              <span className="shrink-0 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#E04420]">
                                {active ? "Selected" : "Add"}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="m-0 text-[0.82rem] font-medium text-[#7b8495]">No matching devices found.</p>
                  )}
                </div>
              )}

              {submitError && (
                <p className="m-0 rounded-lg bg-[#fff0ec] px-3 py-2 text-[0.78rem] font-semibold text-[#E04420]">
                  {submitError}
                </p>
              )}
            </div>

            <div className="rounded-xl border border-[#eeeeee] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] max-[640px]:p-3">
              <h3 className="m-0 text-[0.82rem] font-semibold text-[#252525] max-[640px]:text-[0.74rem]">Details</h3>
              <div className="mt-3 grid gap-2">
                <DetailChip label="Stall Type" value={getStallType(stall)} />
                <DetailChip label="Pay Modes" value={getPayMode(stall)} />
                <DetailChip label="Bank Mode" value={getBankMode(stall)} />
              </div>
            </div>
          </div>

          <SectionDivider compact />

          <section>
            <h3 className="m-0 text-[0.9rem] font-medium text-[#666666]">
              Stall Devices ( {stallDevices.length} )
            </h3>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {stallDevices.length ? (
                stallDevices.map((device, index) => (
                  <span
                    key={`${getDeviceLabel(device)}-${index}`}
                    className="rounded-full bg-[#8d8d8d] px-4 py-1.5 text-[0.75rem] font-bold text-white"
                  >
                    {getDeviceLabel(device)}
                  </span>
                ))
              ) : (
                <span className="text-[0.82rem] font-medium text-[#8d8d8d]">No stall devices assigned.</span>
              )}
            </div>
          </section>
        </div>

        <div className="flex shrink-0 justify-end border-t border-[#eeeeee] bg-[#fbfbfb] px-6 py-4 max-[640px]:px-4 max-[640px]:py-3">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="h-11 rounded-lg bg-[#1c1c1c] px-8 text-[0.9rem] font-semibold text-white shadow-[0_12px_24px_rgba(28,28,28,0.18)] transition hover:bg-[#E04420] disabled:cursor-not-allowed disabled:opacity-60 max-[640px]:h-9 max-[640px]:px-5 max-[640px]:text-[0.72rem]"
          >
            {submitting ? "Adding..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
