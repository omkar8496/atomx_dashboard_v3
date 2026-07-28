"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { addPersoDevices, searchDeviceMasterlist } from "../../../lib/dashboardApi";

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function getDeviceKey(device) {
  return String(device?.id ?? device?.printId ?? device?.androidId ?? device?.hardwareId ?? "");
}

function getDevicePayloadId(device) {
  const id = Number(device?.id);
  return Number.isFinite(id) ? id : null;
}

function getDeviceLabel(device) {
  return String(device?.printId ?? device?.id ?? device?.description ?? "-");
}

function getDeviceMeta(device) {
  return [device?.description, device?.hardwareId, device?.bank, device?.type]
    .filter(Boolean)
    .join(" | ");
}

function SelectedDevicePill({ device, onRemove }) {
  return (
    <span className="inline-flex h-8 items-center gap-2 rounded-full border border-[#ded4ff] bg-white pl-3 pr-1.5 text-[0.74rem] font-bold text-[#252525] shadow-[0_6px_14px_rgba(15,23,42,0.05)] max-[640px]:h-7 max-[640px]:text-[0.64rem]">
      {getDeviceLabel(device)}
      <button
        type="button"
        onClick={() => onRemove(device)}
        className="grid h-5 w-5 place-items-center rounded-full bg-[#1c1c1c] text-white transition hover:bg-[#E04420] max-[640px]:h-4.5 max-[640px]:w-4.5"
        aria-label={`Remove device ${getDeviceLabel(device)}`}
      >
        <CloseIcon />
      </button>
    </span>
  );
}

export default function AddPersoDeviceModal({ eventId, token, onClose, onAdded }) {
  const overlayRef = useRef(null);
  const requestIdRef = useRef(0);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setResults([]);
      setIsSearching(false);
      setSearchError("");
      return undefined;
    }

    setIsSearching(true);
    setSearchError("");

    const timeoutId = window.setTimeout(async () => {
      try {
        const list = await searchDeviceMasterlist({ search, token, dedupe: false });
        if (requestId === requestIdRef.current) {
          setResults(Array.isArray(list) ? list : []);
        }
      } catch (error) {
        console.error("Perso device search failed", error);
        if (requestId === requestIdRef.current) {
          setResults([]);
          setSearchError("Unable to search devices.");
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setIsSearching(false);
        }
      }
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [query, token]);

  const selectedIds = useMemo(
    () =>
      selectedDevices
        .map(getDevicePayloadId)
        .filter((deviceId) => deviceId !== null && deviceId !== undefined),
    [selectedDevices]
  );

  const addDevice = (device) => {
    const key = getDeviceKey(device);
    if (!key) return;

    setSelectedDevices((current) => {
      if (current.some((item) => getDeviceKey(item) === key)) return current;
      return [...current, device];
    });
    setSubmitError("");
  };

  const removeDevice = (device) => {
    const key = getDeviceKey(device);
    setSelectedDevices((current) => current.filter((item) => getDeviceKey(item) !== key));
  };

  const handleConfirm = async () => {
    if (!eventId) {
      setSubmitError("Missing event.");
      return;
    }

    if (selectedIds.length === 0) {
      setSubmitError("Select at least one device.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      await addPersoDevices({ eventId, token, devices: selectedIds });
      await onAdded?.();
      onClose?.();
    } catch (error) {
      console.error("Add perso devices failed", error);
      setSubmitError("Unable to add selected devices.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={(event) => {
        if (event.target === overlayRef.current) onClose?.();
      }}
      className="fixed inset-0 z-[230] flex h-dvh items-center justify-center overflow-hidden bg-[#1c1c1c]/45 px-4 py-8 backdrop-blur-[3px] max-[640px]:px-3 max-[640px]:py-3"
    >
      <div className="flex max-h-[calc(100dvh-64px)] w-full max-w-[760px] flex-col overflow-hidden rounded-xl border border-[#d5b7ff]/70 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.25)] max-[640px]:max-h-[calc(100dvh-24px)]">
        <div className="flex shrink-0 items-start justify-between border-b border-[#ececec] bg-[#1c1c1c] px-6 py-4 text-white max-[640px]:px-4 max-[640px]:py-3">
          <div className="min-w-0">
            <p className="m-0 text-[0.62rem] font-bold uppercase tracking-[0.24em] text-[#D5B7FF] max-[640px]:text-[0.52rem]">
              Perso Setup
            </p>
            <h2 className="m-0 mt-1 truncate text-[1.14rem] font-semibold tracking-wide max-[640px]:text-[0.92rem]">
              Add Perso Device
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-4 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 text-white/75 transition hover:bg-white/10 hover:text-white max-[640px]:h-8 max-[640px]:w-8"
            aria-label="Close add perso device modal"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 max-[640px]:px-4 max-[640px]:py-4">
          <label className="block">
            <span className="mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#858585] max-[640px]:text-[0.58rem]">
              Devices ({selectedDevices.length})
            </span>
            <div className="flex h-11 items-center gap-2 rounded-lg border border-[#dedede] bg-white px-3.5 text-[#E04420] transition focus-within:border-[#E04420] focus-within:ring-3 focus-within:ring-[#E04420]/10 max-[640px]:h-9 max-[640px]:px-3">
              <SearchIcon />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Type 3 digits to search"
                className="h-full min-w-0 flex-1 bg-transparent text-[0.82rem] font-medium text-[#1c1c1c] outline-none placeholder:text-[#9ca3af] max-[640px]:text-[0.72rem]"
              />
            </div>
          </label>

          {selectedDevices.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2 rounded-xl border border-[#efeafc] bg-[#fbfbfd] p-2.5">
              {selectedDevices.map((device) => (
                <SelectedDevicePill key={getDeviceKey(device)} device={device} onRemove={removeDevice} />
              ))}
            </div>
          ) : null}

          {query.trim().length >= 3 ? (
            <div className="mt-3 rounded-xl border border-[#ececec] bg-[#fafafa] p-3">
              {isSearching ? (
                <p className="m-0 text-[0.82rem] font-medium text-[#7b8495]">Searching devices...</p>
              ) : searchError ? (
                <p className="m-0 text-[0.82rem] font-semibold text-[#E04420]">{searchError}</p>
              ) : results.length ? (
                <div className="grid max-h-[230px] gap-2 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:#d5b7ff_transparent]">
                  {results.map((device, index) => {
                    const key = getDeviceKey(device) || `${device?.printId ?? "device"}-${index}`;
                    const selected = selectedDevices.some((item) => getDeviceKey(item) === getDeviceKey(device));
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => addDevice(device)}
                        className={`rounded-lg border px-3 py-2 text-left transition ${
                          selected
                            ? "border-[#D5B7FF] bg-[#f6f2ff]"
                            : "border-[#e4e4e4] bg-white hover:border-[#d5b7ff]"
                        }`}
                      >
                        <span className="flex items-start justify-between gap-3">
                          <span className="min-w-0">
                            <span className="block truncate text-[0.82rem] font-semibold text-[#252525] max-[640px]:text-[0.7rem]">
                              {getDeviceLabel(device)}
                            </span>
                            <span className="mt-0.5 block truncate text-[0.68rem] font-medium text-[#7b8495] max-[640px]:text-[0.6rem]">
                              {getDeviceMeta(device) || "Device master record"}
                            </span>
                          </span>
                          <span className="shrink-0 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#E04420] max-[640px]:text-[0.58rem]">
                            {selected ? "Selected" : "Add"}
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
          ) : (
            <p className="m-0 mt-3 text-[0.72rem] font-medium text-[#8d8d8d]">
              Enter at least 3 characters to search master devices.
            </p>
          )}

          {submitError ? (
            <p className="m-0 mt-3 rounded-lg bg-[#fff0ec] px-3 py-2 text-[0.78rem] font-semibold text-[#E04420]">
              {submitError}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 justify-end border-t border-[#eeeeee] bg-[#fbfbfb] px-6 py-4 max-[640px]:px-4 max-[640px]:py-3">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="h-11 rounded-lg bg-[#1c1c1c] px-8 text-[0.9rem] font-semibold text-white shadow-[0_12px_24px_rgba(28,28,28,0.18)] transition hover:bg-[#E04420] disabled:cursor-not-allowed disabled:opacity-60 max-[640px]:h-9 max-[640px]:px-5 max-[640px]:text-[0.72rem]"
          >
            {isSubmitting ? "Adding..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
