"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import ConfigTransition from "../components/ConfigTransition";
import CEVendor from "./components/C_E_Vendor";
import EditStall from "./components/Edit_Stall";
import { AtomXLoader } from "@atomx/global-components";
import { useDashboardStore } from "../../../store/dashboardStore";
import { fetchStalls, fetchVendors } from "../../../lib/dashboardApi";
import Toast from "../../components/Popups/Toast";

export default function OperationsPage() {
  const token = useDashboardStore((state) => state.token);
  const eventId = useDashboardStore((state) => state.eventMeta?.eventId);
  const cachedVendors = useDashboardStore((state) =>
    eventId ? state.vendorsByEventId?.[eventId] : undefined
  );
  const cachedStalls = useDashboardStore((state) =>
    eventId ? state.stallsByEventId?.[eventId] : undefined
  );
  const setVendorsForEvent = useDashboardStore((state) => state.setVendorsForEvent);
  const setStallsForEvent = useDashboardStore((state) => state.setStallsForEvent);
  const inFlightRef = useRef({ vendors: new Map(), stalls: new Map() });
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [activeVendor, setActiveVendor] = useState(null);
  const [showStallForm, setShowStallForm] = useState(false);
  const [stallModalTitle, setStallModalTitle] = useState("Edit Stall");
  const [stallSeed, setStallSeed] = useState(null);
  const [stallMode, setStallMode] = useState("edit");
  const [vendors, setVendors] = useState(() => cachedVendors || []);
  const [vendorQuery, setVendorQuery] = useState("");
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [vendorsError, setVendorsError] = useState("");
  const [stalls, setStalls] = useState(() => cachedStalls || []);
  const [stallQuery, setStallQuery] = useState("");
  const [stallsLoading, setStallsLoading] = useState(false);
  const [stallsError, setStallsError] = useState("");
  const [toast, setToast] = useState(null);

  const loadVendors = useCallback(
    async (options = {}) => {
      const { force = false } = options;
      if (!token || !eventId) return;
      const requestKey = String(eventId);
      const latestCached = useDashboardStore.getState().vendorsByEventId?.[eventId];
      if (!force && Array.isArray(latestCached)) {
        setVendors(latestCached);
        return;
      }
      if (!force && inFlightRef.current.vendors.has(requestKey)) {
        await inFlightRef.current.vendors.get(requestKey);
        return;
      }
      setVendorsLoading(true);
      setVendorsError("");
      const requestPromise = (async () => {
        try {
          const list = await fetchVendors({ eventId, token, dedupe: !force });
          const normalized = Array.isArray(list) ? list : [];
          setVendors(normalized);
          setVendorsForEvent(eventId, normalized);
        } catch (error) {
          console.error("Failed to load vendors", error);
          setVendors([]);
          setVendorsError("Unable to load vendors.");
        } finally {
          setVendorsLoading(false);
        }
      })();
      inFlightRef.current.vendors.set(requestKey, requestPromise);
      try {
        await requestPromise;
      } finally {
        inFlightRef.current.vendors.delete(requestKey);
      }
    },
    [eventId, token, setVendorsForEvent]
  );

  const loadStalls = useCallback(
    async (options = {}) => {
      const { force = false } = options;
      if (!token || !eventId) return;
      const requestKey = String(eventId);
      const latestCached = useDashboardStore.getState().stallsByEventId?.[eventId];
      if (!force && Array.isArray(latestCached)) {
        setStalls(latestCached);
        return;
      }
      if (!force && inFlightRef.current.stalls.has(requestKey)) {
        await inFlightRef.current.stalls.get(requestKey);
        return;
      }
      setStallsLoading(true);
      setStallsError("");
      const requestPromise = (async () => {
        try {
          const list = await fetchStalls({ eventId, token, dedupe: !force });
          const normalized = Array.isArray(list) ? list : [];
          setStalls(normalized);
          setStallsForEvent(eventId, normalized);
        } catch (error) {
          console.error("Failed to load stalls", error);
          setStalls([]);
          setStallsError("Unable to load stalls.");
        } finally {
          setStallsLoading(false);
        }
      })();
      inFlightRef.current.stalls.set(requestKey, requestPromise);
      try {
        await requestPromise;
      } finally {
        inFlightRef.current.stalls.delete(requestKey);
      }
    },
    [eventId, token, setStallsForEvent]
  );

  useEffect(() => {
    let active = true;
    if (!active) return;
    loadVendors();
    loadStalls();
    return () => {
      active = false;
    };
  }, [loadVendors, loadStalls]);

  useEffect(() => {
    if (Array.isArray(cachedVendors)) {
      setVendors(cachedVendors);
    }
  }, [cachedVendors]);

  useEffect(() => {
    if (Array.isArray(cachedStalls)) {
      setStalls(cachedStalls);
    }
  }, [cachedStalls]);

  const filteredVendors = useMemo(() => {
    const query = vendorQuery.trim().toLowerCase();
    if (!query) return vendors;
    return vendors.filter((vendor) => {
      const name = String(vendor?.name ?? vendor?.vendorName ?? vendor?.title ?? "").toLowerCase();
      return name.includes(query);
    });
  }, [vendors, vendorQuery]);

  const filteredStalls = useMemo(() => {
    const query = stallQuery.trim().toLowerCase();
    if (!query) return stalls;
    return stalls.filter((stall) => {
      const vendorName = String(
        stall?.vendorName ?? stall?.vendor?.name ?? stall?.vendor ?? ""
      ).toLowerCase();
      const stallName = String(
        stall?.name ?? stall?.stallName ?? stall?.stall ?? ""
      ).toLowerCase();
      return vendorName.includes(query) || stallName.includes(query);
    });
  }, [stalls, stallQuery]);

  const getVendorId = (vendor) => vendor?.id ?? vendor?.vendorId ?? "-";
  const getVendorName = (vendor) => vendor?.name ?? vendor?.vendorName ?? vendor?.title ?? "-";
  const getVendorType = (vendor) => vendor?.type ?? vendor?.category ?? "-";
  const getLoginCode = (vendor) => vendor?.id ?? vendor?.vendorId ?? "-";
  const getVendorLink = (vendor) =>
    vendor?.link ?? vendor?.url ?? vendor?.linkUrl ?? vendor?.website ?? "";
  const getStallId = (stall, index) => stall?.id ?? stall?.stallId ?? index + 1;
  const getStallVendor = (stall) =>
    stall?.vendorName ?? stall?.vendor?.name ?? stall?.vendor ?? "-";
  const getStallName = (stall) => stall?.name ?? stall?.stallName ?? stall?.stall ?? "-";
  const getDeviceCount = (stall) => {
    const count =
      stall?.deviceCount ??
      stall?.devicesCount ??
      stall?.devices?.length ??
      stall?.device?.length;
    return typeof count === "number" ? count : 0;
  };
  const LinkIcon = ({ className = "h-4 w-4" }) => (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 007.07 0l2.83-2.83a5 5 0 10-7.07-7.07L11 4" />
      <path d="M14 11a5 5 0 01-7.07 0L4.1 8.17a5 5 0 117.07-7.07L13 2" />
    </svg>
  );

  return (
    <main className="min-h-screen bg-[color:rgb(var(--color-bg))] pb-10">
      <Header
        areaLabel="Configuration"
        breadcrumb={
          <>
            <Link className="text-slate-600 hover:text-[#258d9c]" href="/Config/profile" replace>
              Profile
            </Link>
            <span className="text-slate-400">/</span>
            <Link className="font-semibold text-[#258d9c]" href="/Config/operations" replace>
              Operations
            </Link>
            <span className="text-slate-400">/</span>
            <Link
              href="/Config/role_assign_event"
              className="text-slate-600 hover:text-[#258d9c]"
              replace
            >
              + Operator
            </Link>
          </>
        }
      />
      <ConfigTransition>
        <div className="w-full pr-3 pl-12 md:pr-6 md:pl-16 mt-2">
          <div className="grid gap-6 lg:grid-cols-2 items-stretch">
          <section className="flex h-full flex-col rounded-lg border border-[#e8d9d3] bg-white px-6 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-3 border-b border-[#e7e0dc] pb-4">
              <div className="flex flex-1 items-center gap-3 text-sm text-slate-600">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Search vendor"
                  value={vendorQuery}
                  onChange={(event) => setVendorQuery(event.target.value)}
                  className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveVendor(null);
                    setShowVendorForm(true);
                  }}
                  className="rounded-md bg-[color:rgb(var(--color-orange))] px-3 py-2 text-xs font-semibold text-white shadow-[0_6px_12px_rgb(var(--color-orange)/0.25)]"
                >
                  + Vendor
                </button>
            </div>
            <div className="pt-3">
              <div className="grid grid-cols-[36px_1.6fr_1fr_0.9fr_0.7fr_0.6fr_0.8fr_0.6fr] items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-700">
                <span className="text-left">#</span>
                <span className="flex items-center gap-2 text-left">
                  Name
                  <span className="flex flex-col text-[8px] leading-none text-slate-400">
                    <span>▲</span>
                    <span>▼</span>
                  </span>
                </span>
                <span className="justify-self-center text-center">Type</span>
                <span className="justify-self-center text-center leading-tight">
                  <span className="block">Login</span>
                  <span className="block">Code</span>
                </span>
                <span className="justify-self-center text-center">Items</span>
                <span className="justify-self-center text-center">Link</span>
                <span className="justify-self-center text-center leading-tight">
                  <span className="block">Add</span>
                  <span className="block">Stall</span>
                </span>
                <span className="justify-self-center text-center">Edit</span>
              </div>
              <div className="mt-2 border-t border-[#e7e0dc]" />
              <div className="max-h-[264px] overflow-y-auto divide-y divide-[#e7e0dc] pr-1">
                {vendorsLoading ? (
                  <AtomXLoader label="Loading vendors..." size={52} />
                ) : vendorsError ? (
                  <div className="py-6 text-center text-sm text-rose-500">{vendorsError}</div>
                ) : filteredVendors.length === 0 ? (
                  <div className="py-6 text-center text-sm text-slate-500">No vendors found.</div>
                ) : (
                  filteredVendors.map((vendor, index) => (
                    <div
                      key={vendor?.id ?? vendor?.vendorId ?? `${vendor?.name ?? "vendor"}-${index}`}
                      className="grid min-h-[52px] grid-cols-[36px_1.6fr_1fr_0.9fr_0.7fr_0.6fr_0.8fr_0.6fr] items-center gap-3 py-3 text-[13px] text-slate-600"
                    >
                      <span className="text-slate-500">{index + 1}</span>
                      <span className="font-medium text-slate-600">{getVendorName(vendor)}</span>
                      <span className="justify-self-center text-center text-[11px] font-semibold uppercase text-[#b96b25]">
                        {getVendorType(vendor)}
                      </span>
                      <span className="justify-self-center text-center text-slate-600">
                        {getLoginCode(vendor)}
                      </span>
                      <span className="flex items-center justify-center text-slate-500">
                        <LinkIcon />
                      </span>
                      <span className="flex items-center justify-center text-slate-500">
                        {getVendorLink(vendor) ? (
                          <a
                            href={getVendorLink(vendor)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:text-slate-700"
                            aria-label="Open link"
                          >
                            <LinkIcon />
                          </a>
                        ) : (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-300">
                            <LinkIcon />
                          </span>
                        )}
                      </span>
                      <button
                        type="button"
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:text-slate-700 justify-self-center"
                        aria-label="Add stall"
                        onClick={() => {
                          const vendorId = vendor?.id ?? vendor?.vendorId ?? null;
                          setStallSeed(vendorId ? { vendorId } : null);
                          setStallModalTitle("Add Stall");
                          setStallMode("create");
                          setShowStallForm(true);
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 5v14" />
                          <path d="M5 12h14" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:text-slate-700 justify-self-center"
                        aria-label="Edit"
                        onClick={() => {
                          setActiveVendor(vendor);
                          setShowVendorForm(true);
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className="border-t border-[#e7e0dc]" />
            </div>
          </section>

          <section className="flex h-full flex-col rounded-lg border border-[#e8d9d3] bg-white px-6 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-3 border-b border-[#e7e0dc] pb-4">
              <div className="flex flex-1 items-center gap-3 text-sm text-slate-600">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Search stall"
                  value={stallQuery}
                  onChange={(event) => setStallQuery(event.target.value)}
                  className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>
            <div className="pt-3">
              <div className="grid grid-cols-[64px_1.6fr_1.3fr_1fr_0.9fr_0.6fr] items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-700">
                <span className="text-left">#</span>
                <span className="flex items-center gap-2 text-left">
                  Vendor
                  <span className="flex flex-col text-[8px] leading-none text-slate-400">
                    <span>▲</span>
                    <span>▼</span>
                  </span>
                </span>
                <span className="flex items-center gap-2 text-left">
                  Stall
                  <span className="flex flex-col text-[8px] leading-none text-slate-400">
                    <span>▲</span>
                    <span>▼</span>
                  </span>
                </span>
                <span className="justify-self-center text-center">Devices</span>
                <span className="justify-self-center text-center">Menu</span>
                <span className="justify-self-center text-center">Edit</span>
              </div>
              <div className="mt-2 border-t border-[#e7e0dc]" />
              <div className="max-h-[264px] overflow-y-auto divide-y divide-[#e7e0dc] pr-1">
                {stallsLoading ? (
                  <AtomXLoader label="Loading stalls..." size={52} />
                ) : stallsError ? (
                  <div className="py-6 text-center text-sm text-rose-500">{stallsError}</div>
                ) : filteredStalls.length === 0 ? (
                  <div className="py-6 text-center text-sm text-slate-500">No stalls found.</div>
                ) : (
                  filteredStalls.map((stall, index) => (
                    <div
                      key={stall?.id ?? stall?.stallId ?? `${stall?.name ?? "stall"}-${index}`}
                      className="grid min-h-[52px] grid-cols-[64px_1.6fr_1.3fr_1fr_0.9fr_0.6fr] items-center gap-3 py-3 text-[13px] text-slate-600"
                    >
                      <span className="text-slate-500">{getStallId(stall, index)}</span>
                      <span className="font-medium text-slate-600">{getStallVendor(stall)}</span>
                      <span className="text-slate-600">{getStallName(stall)}</span>
                      <div className="flex items-center justify-center gap-2 text-slate-600">
                        <span className="text-sm font-medium">{getDeviceCount(stall)}</span>
                        <button
                          type="button"
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:text-slate-700"
                          aria-label="Add device"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 5v14" />
                            <path d="M5 12h14" />
                          </svg>
                        </button>
                      </div>
                      <span
                        className="flex items-center justify-center text-slate-500"
                        aria-label="Menu"
                        title="Menu"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="4" y="5" width="16" height="4" rx="1" />
                          <rect x="4" y="11" width="12" height="4" rx="1" />
                        </svg>
                      </span>
                      <button
                        type="button"
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:text-slate-700 justify-self-center"
                        aria-label="Edit"
                        onClick={() => {
                          setStallSeed(stall ?? null);
                          setStallModalTitle("Edit Stall");
                          setStallMode("edit");
                          setShowStallForm(true);
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className="border-t border-[#e7e0dc]" />
            </div>
          </section>
          </div>
        </div>
      </ConfigTransition>
      <Toast
        open={Boolean(toast)}
        title={toast?.title}
        message={toast?.message}
        onClose={() => setToast(null)}
      />
      <CEVendor
        open={showVendorForm}
        onClose={() => {
          setShowVendorForm(false);
          setActiveVendor(null);
        }}
        vendor={activeVendor}
        onSaved={() => loadVendors({ force: true })}
        onToast={(payload) => setToast(payload)}
      />
      <EditStall
        open={showStallForm}
        onClose={() => {
          setShowStallForm(false);
          setStallSeed(null);
          setStallMode("edit");
        }}
        title={stallModalTitle}
        seed={stallSeed}
        mode={stallMode}
        onSaved={() => loadStalls({ force: true })}
        onToast={(payload) => setToast(payload)}
      />
    </main>
  );
}
