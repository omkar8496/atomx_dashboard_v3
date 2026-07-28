"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AtomXLoader } from "@atomx/global-components";
import {
  addDevicesToStall,
  createAccessXCategory,
  createStall,
  createVendor,
  fetchAccessXCategories,
  fetchAccessXGateMasters,
  fetchAccessXGates,
  fetchStalls,
  fetchVendors,
  updateAccessXCategory,
  updateVendor
} from "../../../lib/dashboardApi";
import { useDashboardStore } from "../../../store/dashboardStore";
import {
  DeviceIcon,
  EditIcon,
  GridIcon,
  LinkIcon,
  ListIcon,
  PlusIcon,
  SearchIcon
} from "./ConfigIcons";
import CreateStallModal from "./CreateStallModal";
import EditVendorModal from "./EditVendorModal";
import CreateVendorModal from "./CreateVendorModal";
import EditStallModal from "./EditStallModal";
import EditAccessXCategoryModal from "./EditAccessXCategoryModal";
import Access_Gate_Master from "./Access_Gate_Master";
import AddDevice from "./Add_Device";
import { buildCreateStallPayload } from "./stallPayload";

function getVendorId(vendor, index) {
  return vendor?.id ?? vendor?.vendorId ?? index + 1;
}

function getVendorName(vendor) {
  return vendor?.name ?? vendor?.vendorName ?? vendor?.title ?? "-";
}

function getVendorType(vendor) {
  return String(vendor?.type ?? vendor?.category ?? "-").toUpperCase();
}

function getVendorLogin(vendor) {
  return (
    vendor?.loginCode ??
    vendor?.login ??
    vendor?.code ??
    vendor?.password ??
    vendor?.devicePassword ??
    vendor?.id ??
    "-"
  );
}

function getCreateStallVendorId(vendor, index) {
  return (
    vendor?.loginCode ??
    vendor?.login ??
    vendor?.code ??
    vendor?.password ??
    vendor?.vendorId ??
    vendor?.id ??
    index + 1
  );
}

function getVendorLink(vendor) {
  return vendor?.link ?? vendor?.url ?? vendor?.linkUrl ?? vendor?.website ?? "";
}

function getStallId(stall, index) {
  return stall?.id ?? stall?.stallId ?? index + 1;
}

function getStallVendor(stall) {
  return stall?.vendorName ?? stall?.vendor?.name ?? stall?.vendor ?? "-";
}

function getStallName(stall) {
  return stall?.name ?? stall?.stallName ?? stall?.stall ?? "-";
}

function getStallType(stall) {
  return String(stall?.type ?? stall?.category ?? "").trim().toLowerCase();
}

function isStockmasterStall(stall) {
  return getStallType(stall) === "stockmaster";
}

function isTableStall(stall) {
  return getStallType(stall) === "tables";
}

function isAccessXStall(stall) {
  return getStallType(stall) === "accessx";
}

function isGroupedStall(stall) {
  return isStockmasterStall(stall) || isTableStall(stall) || isAccessXStall(stall);
}

function filterStallsBySearch(stallList, query) {
  if (!query) return stallList;
  return stallList.filter((stall, index) =>
    [getStallId(stall, index), getStallVendor(stall), getStallName(stall), getStallType(stall)]
      .join(" ")
      .toLowerCase()
      .includes(query)
  );
}

function normalizeAccessXCategories(response) {
  const categories =
    response?.categories ??
    response?.data?.categories ??
    response?.data ??
    response?.list ??
    [];
  return Array.isArray(categories) ? categories : [];
}

function normalizeAccessXGateMasters(response) {
  const gateMasters =
    response?.gatesmasters ??
    response?.gateMasters ??
    response?.gatesMasters ??
    response?.gatesMaster ??
    response?.masters ??
    response?.gates ??
    response?.data?.gateMasters ??
    response?.data?.gatesmasters ??
    response?.data?.gatesMasters ??
    response?.data?.gatesMaster ??
    response?.data?.masters ??
    response?.data?.gates ??
    response?.data ??
    response?.list ??
    [];
  return Array.isArray(gateMasters) ? gateMasters : [];
}

function getGateMasterName(gate) {
  return gate?.name ?? gate?.gateName ?? gate?.gate_name ?? gate?.title ?? "-";
}

function getCategoryAllowLabel(category) {
  const allowCount = Number(category?.allowCount);
  return allowCount === 0 ? "ALL" : String(allowCount);
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

function getDeviceCount(stall) {
  const devices = normalizeDeviceList(
    stall?.devices_list ??
      stall?.device_list ??
      stall?.devicesList ??
      stall?.devices ??
      stall?.device
  );

  if (devices.length > 0) {
    return devices.length;
  }

  const count =
    stall?.deviceCount ??
    stall?.devicesCount ??
    stall?.devices_count ??
    stall?.device_count;

  return typeof count === "number" ? count : 0;
}

function EmptyState({ children }) {
  return (
    <div className="rounded-lg border border-dashed border-[#dfdfdf] px-4 py-8 text-center text-sm font-semibold text-[#8a8a8a]">
      {children}
    </div>
  );
}

function LoadingState({ label }) {
  return (
    <div className="flex min-h-[118px] items-center justify-center">
      <AtomXLoader label={label} size={46} />
    </div>
  );
}

function ActionButton({ children, label, active = false, as: Component = "button", ...props }) {
  return (
    <Component
      type={Component === "button" ? "button" : undefined}
      aria-label={label}
      title={label}
      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[0.78rem] font-semibold transition max-[640px]:h-[26px] max-[640px]:w-[26px] ${
        active
          ? "bg-[#202020] text-white shadow-[0_8px_14px_rgba(0,0,0,0.16)] hover:bg-[#111111]"
          : "border border-[#e5e5e5] bg-white text-[#686868] hover:border-[#d3c7ff] hover:text-[#202020] hover:shadow-[0_6px_12px_rgba(15,23,42,0.08)]"
      }`}
      {...props}
    >
      {children}
    </Component>
  );
}

function ConfigSearchField({ value, onChange, placeholder }) {
  return (
    <label className="flex min-w-[190px] flex-1 items-center gap-2.5 border-b border-[#cfcfcf] pb-1.5 text-[#9a8df0] max-[640px]:min-w-0">
      <span className="sr-only">{placeholder}</span>
      <SearchIcon className="h-4 w-4 shrink-0" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[0.88rem] font-medium text-[#2f3544] outline-none placeholder:text-[#9aa3b8] max-[640px]:text-[0.78rem]"
      />
    </label>
  );
}

function ConfigPanel({
  title,
  count,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  action,
  children,
  theme = "default"
}) {
  const themes = {
    default: {
      accent: "#E04420",
      border: "#ded4ff",
      badge: "linear-gradient(135deg,#f24a2b,#4b2ee4)"
    },
    stockroom: {
      accent: "#0f8797",
      border: "#9be3ea",
      badge: "linear-gradient(135deg,#0f8797,#341CD6)"
    },
    tables: {
      accent: "#D28A00",
      border: "#f7d28d",
      badge: "linear-gradient(135deg,#E04420,#D28A00)"
    },
    accessx: {
      accent: "#341CD6",
      border: "#c9bbff",
      badge: "linear-gradient(135deg,#A9379E,#341CD6)"
    }
  };
  const palette = themes[theme] || themes.default;

  return (
    <section
      className="rounded-lg border border-l-[3px] bg-white px-4 py-4 shadow-[0_18px_36px_rgba(15,23,42,0.08)] max-[640px]:px-3 max-[640px]:py-3"
      style={{
        borderColor: palette.border,
        borderLeftColor: palette.accent,
        "--config-row-accent-start": palette.accent,
        "--config-row-accent-end": palette.border
      }}
    >
      <div className="flex flex-wrap items-center gap-4 border-b border-[#dfdfdf] pb-3 max-[640px]:gap-3">
        <div className="flex min-w-fit items-center gap-2.5 max-[640px]:gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[0.92rem] font-bold text-white shadow-[0_8px_16px_rgba(85,46,228,0.2)] max-[640px]:h-7 max-[640px]:w-7 max-[640px]:text-[0.78rem]"
            style={{ background: palette.badge }}
          >
            {count}
          </span>
          <h2 className="text-[1.12rem] font-bold leading-none text-[#232323] max-[640px]:text-[1rem]">
            {title}
          </h2>
        </div>
        <ConfigSearchField
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
        />
        {action ? <div className="ml-auto max-[640px]:ml-0 max-[640px]:w-full">{action}</div> : null}
      </div>
      <div className="pt-3">{children}</div>
    </section>
  );
}

function ScrollRows({ children }) {
  return (
    <div className="max-h-[333px] space-y-2.5 overflow-y-auto pr-1 max-[640px]:max-h-[360px] max-[640px]:space-y-2">
      {children}
    </div>
  );
}

function VendorRow({ vendor, index, onAddStall, onEditVendor }) {
  const link = getVendorLink(vendor);

  return (
    <div
      className="rounded-lg border border-transparent p-px"
      style={{
        background:
          "linear-gradient(#fff, #fff) padding-box, linear-gradient(110deg, #ffb7ac, #d5c9ff) border-box"
      }}
    >
      <div className="grid min-h-[54px] grid-cols-[48px_minmax(140px,1.35fr)_minmax(78px,0.55fr)_minmax(78px,0.55fr)_auto] items-center gap-3 rounded-[7px] bg-white px-3 py-2 max-[640px]:grid-cols-[40px_minmax(0,1fr)_auto] max-[640px]:gap-x-2.5 max-[640px]:gap-y-2 max-[640px]:px-2.5 max-[640px]:py-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f7f7f7] text-[0.8rem] font-bold text-[#ef4424] max-[640px]:row-span-2 max-[640px]:h-8 max-[640px]:w-8 max-[640px]:self-start max-[640px]:text-[0.72rem]">
          #{index + 1}
        </span>
        <div className="min-w-0 max-[640px]:col-start-2 max-[640px]:col-end-3">
          <div className="text-[0.58rem] font-bold uppercase tracking-[0.15em] text-[#9d9d9d] max-[640px]:text-[0.52rem]">
            Name
          </div>
          <div className="mt-0.5 truncate text-[0.9rem] font-bold text-[#272727] max-[640px]:text-[0.78rem]">
            {getVendorName(vendor)}
          </div>
        </div>
        <div className="min-w-0 max-[640px]:col-start-3 max-[640px]:row-start-1 max-[640px]:rounded-md max-[640px]:bg-[#fafafa] max-[640px]:px-2 max-[640px]:py-1 max-[640px]:text-right">
          <div className="text-[0.58rem] font-bold uppercase tracking-[0.15em] text-[#9d9d9d] max-[640px]:text-[0.5rem]">
            Type
          </div>
          <div className="mt-0.5 truncate text-[0.84rem] font-bold text-[#272727] max-[640px]:text-[0.72rem]">
            {getVendorType(vendor)}
          </div>
        </div>
        <div className="min-w-0 max-[640px]:hidden">
          <div className="text-[0.58rem] font-bold uppercase tracking-[0.15em] text-[#9d9d9d] max-[640px]:text-[0.5rem]">
            Login
          </div>
          <div className="mt-0.5 truncate text-[0.84rem] font-bold text-[#272727] max-[640px]:text-[0.72rem]">
            {getVendorLogin(vendor)}
          </div>
        </div>
        <div className="flex items-center gap-1.5 border-l border-[#e4e4e4] pl-3 max-[640px]:col-span-3 max-[640px]:justify-between max-[640px]:border-l-0 max-[640px]:border-t max-[640px]:pl-0 max-[640px]:pt-2">
          <div className="hidden min-w-0 max-[640px]:block">
            <span className="mr-1 text-[0.5rem] font-bold uppercase tracking-[0.14em] text-[#9d9d9d]">
              Login
            </span>
            <span className="text-[0.7rem] font-bold text-[#272727]">
              {getVendorLogin(vendor)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
          <ActionButton label="Open items">
            <GridIcon />
          </ActionButton>
          {link ? (
            <ActionButton as="a" href={link} target="_blank" rel="noreferrer" label="Open vendor link">
              <LinkIcon />
            </ActionButton>
          ) : (
            <ActionButton label="No vendor link">
              <LinkIcon />
            </ActionButton>
          )}
          <ActionButton label="Add stall" active onClick={onAddStall}>
            <PlusIcon />
          </ActionButton>
          <ActionButton label="Edit vendor" onClick={onEditVendor}>
            <EditIcon />
          </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function StallRow({ stall, index, onEditStall, onAddDevice }) {
  return (
    <div
      className="rounded-lg border border-transparent p-px"
      style={{
        background:
          "linear-gradient(#fff, #fff) padding-box, linear-gradient(110deg, var(--config-row-accent-start, #ffb7ac), var(--config-row-accent-end, #d5c9ff)) border-box"
      }}
    >
      <div className="grid min-h-[54px] grid-cols-[76px_minmax(110px,1fr)_minmax(110px,1fr)_auto] items-center gap-3 rounded-[7px] bg-white px-3 py-2 max-[640px]:grid-cols-[52px_minmax(0,0.9fr)_minmax(0,1.1fr)] max-[640px]:gap-2 max-[640px]:px-2 max-[640px]:py-2.5">
        <span className="text-[0.9rem] font-bold text-[#ef4424] max-[640px]:text-[0.76rem]">#{getStallId(stall, index)}</span>
        <div className="min-w-0">
          <div className="text-[0.66rem] font-bold text-[#8e8e8e]">Vendor</div>
          <div className="mt-0.5 truncate text-[0.9rem] font-bold text-[#272727] max-[640px]:text-[0.76rem]">
            {getStallVendor(stall)}
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-[0.66rem] font-bold text-[#8e8e8e]">Stall</div>
          <div className="mt-0.5 truncate text-[0.9rem] font-bold text-[#272727] max-[640px]:text-[0.76rem]">
            {getStallName(stall)}
          </div>
        </div>
        <div className="flex min-w-fit items-center gap-1.5 border-l border-[#e4e4e4] pl-3 max-[640px]:col-span-3 max-[640px]:border-l-0 max-[640px]:border-t max-[640px]:pl-0 max-[640px]:pt-2">
          <button
            type="button"
            onClick={onAddDevice}
            className="inline-flex h-7 items-center gap-1.5 rounded-md bg-[#202020] px-2.5 text-[0.78rem] font-bold text-white transition hover:bg-[#E04420]"
            aria-label={`Add device to ${getStallName(stall)}`}
            title="Add device"
          >
            <span>{getDeviceCount(stall)}</span>
            <DeviceIcon />
            <span className="h-4 w-px bg-white/25" />
            <PlusIcon />
          </button>
          <ActionButton label="Open menu">
            <ListIcon />
          </ActionButton>
          <ActionButton label="Edit stall" onClick={onEditStall}>
            <EditIcon />
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

function AccessXCategoryTable({ categories, onEdit }) {
  return (
    <div className="max-h-[333px] overflow-auto rounded-lg border border-[#e8e3f7]">
      <table className="w-full min-w-[430px] border-collapse">
        <thead className="sticky top-0 z-[1] bg-[#f8f6ff]">
          <tr>
            <th className="w-[64px] border-b border-[#e5def8] px-3 py-2 text-left text-[0.58rem] font-bold uppercase tracking-[0.13em] text-[#8d859b]">
              No.
            </th>
            <th className="border-b border-[#e5def8] px-3 py-2 text-left text-[0.58rem] font-bold uppercase tracking-[0.13em] text-[#8d859b]">
              Category
            </th>
            <th className="w-[90px] border-b border-[#e5def8] px-3 py-2 text-left text-[0.58rem] font-bold uppercase tracking-[0.13em] text-[#8d859b]">
              Allow
            </th>
            <th className="w-[64px] border-b border-[#e5def8] px-3 py-2 text-center text-[0.58rem] font-bold uppercase tracking-[0.13em] text-[#8d859b]">
              Edit
            </th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category, index) => (
            <tr key={category?.id ?? `${category?.name}-${index}`} className="group bg-white transition hover:bg-[#fffaf8]">
              <td className="border-b border-[#eeeeee] px-3 py-2.5 text-[0.76rem] font-bold text-[#E04420] last:border-b-0">
                {index + 1}
              </td>
              <td className="border-b border-[#eeeeee] px-3 py-2.5 last:border-b-0">
                <span className="block truncate text-[0.82rem] font-bold text-[#252525]">
                  {category?.name || "-"}
                </span>
              </td>
              <td className="border-b border-[#eeeeee] px-3 py-2.5 last:border-b-0">
                <span className="inline-flex min-w-8 items-center justify-center rounded-md bg-[#f4f1ff] px-2 py-1 text-[0.66rem] font-bold text-[#341CD6]">
                  {getCategoryAllowLabel(category)}
                </span>
              </td>
              <td className="border-b border-[#eeeeee] px-3 py-2.5 text-center last:border-b-0">
                <ActionButton label={`Edit ${category?.name || "category"}`} onClick={() => onEdit(category)}>
                  <EditIcon />
                </ActionButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function VendorConfigurationContent() {
  const token = useDashboardStore((state) => state.token);
  const eventMeta = useDashboardStore((state) => state.eventMeta);
  const eventDetails = useDashboardStore((state) => state.eventDetails);
  const eventId = eventMeta?.eventId ?? eventDetails?.id;
  const eventName =
    eventDetails?.name ??
    eventMeta?.eventName ??
    eventMeta?.name ??
    "";
  const cachedVendors = useDashboardStore((state) =>
    eventId ? state.vendorsByEventId?.[eventId] : undefined
  );
  const cachedStalls = useDashboardStore((state) =>
    eventId ? state.stallsByEventId?.[eventId] : undefined
  );
  const setVendorsForEvent = useDashboardStore((state) => state.setVendorsForEvent);
  const setStallsForEvent = useDashboardStore((state) => state.setStallsForEvent);
  const [vendors, setVendors] = useState(() => cachedVendors || []);
  const [stalls, setStalls] = useState(() => cachedStalls || []);
  const [vendorQuery, setVendorQuery] = useState("");
  const [stallQuery, setStallQuery] = useState("");
  const [categoryQuery, setCategoryQuery] = useState("");
  const [gateMasterQuery, setGateMasterQuery] = useState("");
  const [accessXCategories, setAccessXCategories] = useState([]);
  const [accessXGateMasters, setAccessXGateMasters] = useState([]);
  const [createStallFor, setCreateStallFor] = useState(null);
  const [editVendor, setEditVendor] = useState(null);
  const [showCreateVendor, setShowCreateVendor] = useState(false);
  const [editStall, setEditStall] = useState(null);
  const [addDeviceStall, setAddDeviceStall] = useState(null);
  const [editAccessXCategory, setEditAccessXCategory] = useState(null);
  const [showCreateAccessXCategory, setShowCreateAccessXCategory] = useState(false);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [stallsLoading, setStallsLoading] = useState(false);
  const [accessXCategoriesLoading, setAccessXCategoriesLoading] = useState(false);
  const [accessXGateMastersLoading, setAccessXGateMastersLoading] = useState(false);
  const [vendorsError, setVendorsError] = useState("");
  const [stallsError, setStallsError] = useState("");
  const [accessXCategoriesError, setAccessXCategoriesError] = useState("");
  const [accessXGateMastersError, setAccessXGateMastersError] = useState("");
  const requestedAccessXEventIds = useRef(new Set());
  const activeAccessXEventId = useRef("");

  const loadVendors = useCallback(
    async ({ force = false } = {}) => {
      if (!eventId) return;
      setVendorsLoading(true);
      setVendorsError("");
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
    },
    [eventId, token, setVendorsForEvent]
  );

  const loadStalls = useCallback(
    async ({ force = false } = {}) => {
      if (!eventId) return;
      setStallsLoading(true);
      setStallsError("");
      try {
        const list = await fetchStalls({ eventId, token, dedupe: !force });
        const normalized = Array.isArray(list) ? list : [];
        setStalls(normalized);
        setStallsForEvent(eventId, normalized);
      } catch {
        setStalls([]);
        setStallsError("Unable to load stalls.");
      } finally {
        setStallsLoading(false);
      }
    },
    [eventId, token, setStallsForEvent]
  );

  useEffect(() => {
    loadVendors();
    loadStalls();
  }, [loadVendors, loadStalls]);

  useEffect(() => {
    if (!eventId) return;

    const requestKey = String(eventId);
    if (requestedAccessXEventIds.current.has(requestKey)) return;
    requestedAccessXEventIds.current.add(requestKey);
    activeAccessXEventId.current = requestKey;
    setAccessXCategories([]);
    setAccessXGateMasters([]);
    setAccessXCategoriesError("");
    setAccessXGateMastersError("");
    setAccessXCategoriesLoading(true);
    setAccessXGateMastersLoading(true);

    Promise.allSettled([
      fetchAccessXCategories({ eventId, token }),
      fetchAccessXGateMasters({ eventId, token }),
      fetchAccessXGates({ eventId, token })
    ]).then((results) => {
      if (activeAccessXEventId.current !== requestKey) return;

      const categoryResult = results[0];
      if (categoryResult.status === "fulfilled") {
        setAccessXCategories(normalizeAccessXCategories(categoryResult.value));
      } else {
        setAccessXCategoriesError("Unable to load AccessX categories.");
      }
      setAccessXCategoriesLoading(false);

      const gateMasterResult = results[1];
      if (gateMasterResult.status === "fulfilled") {
        setAccessXGateMasters(normalizeAccessXGateMasters(gateMasterResult.value));
      } else {
        setAccessXGateMastersError("Unable to load Access Gate Masterlist.");
      }
      setAccessXGateMastersLoading(false);

      results.forEach((result, index) => {
        if (result.status === "rejected") {
          const labels = ["categories", "gate masters", "gates"];
          console.error(`Failed to load AccessX ${labels[index]}`, result.reason);
        }
      });
    });
  }, [eventId, token]);

  const filteredVendors = useMemo(() => {
    const query = vendorQuery.trim().toLowerCase();
    if (!query) return vendors;
    return vendors.filter((vendor) =>
      [
        getVendorId(vendor),
        getVendorName(vendor),
        getVendorType(vendor),
        getVendorLogin(vendor)
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [vendorQuery, vendors]);

  const filteredStalls = useMemo(() => {
    const query = stallQuery.trim().toLowerCase();
    const regularStalls = stalls.filter((stall) => !isGroupedStall(stall));
    return filterStallsBySearch(regularStalls, query);
  }, [stallQuery, stalls]);

  const filteredStockrooms = useMemo(() => {
    const query = stallQuery.trim().toLowerCase();
    const stockrooms = stalls.filter(isStockmasterStall);
    return filterStallsBySearch(stockrooms, query);
  }, [stallQuery, stalls]);

  const filteredTableStalls = useMemo(() => {
    const query = stallQuery.trim().toLowerCase();
    const tableStalls = stalls.filter(isTableStall);
    return filterStallsBySearch(tableStalls, query);
  }, [stallQuery, stalls]);

  const filteredAccessXStalls = useMemo(() => {
    const query = stallQuery.trim().toLowerCase();
    const accessXStalls = stalls.filter(isAccessXStall);
    return filterStallsBySearch(accessXStalls, query);
  }, [stallQuery, stalls]);

  const filteredAccessXCategories = useMemo(() => {
    const query = categoryQuery.trim().toLowerCase();
    if (!query) return accessXCategories;
    return accessXCategories.filter((category) =>
      [category?.name, category?.allowCount, category?.position]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [accessXCategories, categoryQuery]);

  const filteredAccessXGateMasters = useMemo(() => {
    const query = gateMasterQuery.trim().toLowerCase();
    if (!query) return accessXGateMasters;
    return accessXGateMasters.filter((gate) =>
      [gate?.id, gate?.gateDay, getGateMasterName(gate)]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [accessXGateMasters, gateMasterQuery]);

  const addVendorButton = (
    <button
      type="button"
      onClick={() => setShowCreateVendor(true)}
      className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#202020] px-4 text-[0.88rem] font-bold text-white shadow-[0_10px_18px_rgba(0,0,0,0.15)] transition hover:bg-[#111111] max-[640px]:w-full max-[640px]:justify-center"
    >
      <PlusIcon className="h-4 w-4" />
      Add Vendor
    </button>
  );

  const addCategoryButton = (
    <button
      type="button"
      onClick={() => setShowCreateAccessXCategory(true)}
      className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#202020] px-3 text-[0.72rem] font-bold text-white shadow-[0_8px_16px_rgba(0,0,0,0.13)] transition hover:bg-[#E04420] max-[640px]:w-full max-[640px]:justify-center"
    >
      <PlusIcon className="h-3.5 w-3.5" />
      Add
    </button>
  );

  const addGateMasterButton = (
    <button
      type="button"
      title="Gate Master create API pending"
      className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#202020] px-3 text-[0.72rem] font-bold text-white shadow-[0_8px_16px_rgba(0,0,0,0.13)] transition hover:bg-[#E04420] max-[640px]:w-full max-[640px]:justify-center"
    >
      <PlusIcon className="h-3.5 w-3.5" />
      Add
    </button>
  );

  if (!eventId) {
    return (
      <ConfigPanel
        title="Vendors"
        count={0}
        searchValue={vendorQuery}
        onSearchChange={setVendorQuery}
        searchPlaceholder="Search vendor"
        action={addVendorButton}
      >
        <EmptyState>Select an event to load configuration.</EmptyState>
      </ConfigPanel>
    );
  }

  return (
    <>
    <div className="space-y-4">
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.38fr)_minmax(390px,1fr)]">
        <ConfigPanel
          title="Vendors"
          count={vendors.length}
          searchValue={vendorQuery}
          onSearchChange={setVendorQuery}
          searchPlaceholder="Search vendor"
          action={addVendorButton}
        >
          <ScrollRows>
            {vendorsLoading ? (
              <LoadingState label="Loading vendors..." />
            ) : vendorsError ? (
              <EmptyState>{vendorsError}</EmptyState>
            ) : filteredVendors.length === 0 ? (
              <EmptyState>No vendors found.</EmptyState>
            ) : (
              filteredVendors.map((vendor, index) => (
                <VendorRow
                  key={vendor?.id ?? vendor?.vendorId ?? `${getVendorName(vendor)}-${index}`}
                  vendor={vendor}
                  index={index}
                  onAddStall={() =>
                    setCreateStallFor({
                      vendorId: getCreateStallVendorId(vendor, index),
                      vendorName: getVendorName(vendor),
                      vendorType: getVendorType(vendor),
                    })
                  }
                  onEditVendor={() => setEditVendor(vendor)}
                />
              ))
            )}
          </ScrollRows>
        </ConfigPanel>

        <ConfigPanel
          title="Stall"
          count={stalls.filter((stall) => !isGroupedStall(stall)).length}
          searchValue={stallQuery}
          onSearchChange={setStallQuery}
          searchPlaceholder="Search stall"
        >
          <ScrollRows>
            {stallsLoading ? (
              <LoadingState label="Loading stalls..." />
            ) : stallsError ? (
              <EmptyState>{stallsError}</EmptyState>
            ) : filteredStalls.length === 0 ? (
              <EmptyState>No stalls found.</EmptyState>
            ) : (
              filteredStalls.map((stall, index) => (
                <StallRow
                  key={stall?.id ?? stall?.stallId ?? `${getStallName(stall)}-${index}`}
                  stall={stall}
                  index={index}
                  onAddDevice={() => setAddDeviceStall(stall)}
                  onEditStall={() => setEditStall(stall)}
                />
              ))
            )}
          </ScrollRows>
        </ConfigPanel>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-2">
        <div className="space-y-4">
          <ConfigPanel
            title="Stockroom"
            count={stalls.filter(isStockmasterStall).length}
            searchValue={stallQuery}
            onSearchChange={setStallQuery}
            searchPlaceholder="Search stockroom"
            theme="stockroom"
          >
            <ScrollRows>
              {stallsLoading ? (
                <LoadingState label="Loading stockrooms..." />
              ) : stallsError ? (
                <EmptyState>{stallsError}</EmptyState>
              ) : filteredStockrooms.length === 0 ? (
                <EmptyState>No stockrooms found.</EmptyState>
              ) : (
                filteredStockrooms.map((stall, index) => (
                  <StallRow
                    key={stall?.id ?? stall?.stallId ?? `${getStallName(stall)}-${index}`}
                    stall={stall}
                    index={index}
                    onAddDevice={() => setAddDeviceStall(stall)}
                    onEditStall={() => setEditStall(stall)}
                  />
                ))
              )}
            </ScrollRows>
          </ConfigPanel>

          <ConfigPanel
            title="Tables"
            count={stalls.filter(isTableStall).length}
            searchValue={stallQuery}
            onSearchChange={setStallQuery}
            searchPlaceholder="Search tables"
            theme="tables"
          >
            <ScrollRows>
              {stallsLoading ? (
                <LoadingState label="Loading tables..." />
              ) : stallsError ? (
                <EmptyState>{stallsError}</EmptyState>
              ) : filteredTableStalls.length === 0 ? (
                <EmptyState>No table stalls found.</EmptyState>
              ) : (
                filteredTableStalls.map((stall, index) => (
                  <StallRow
                    key={stall?.id ?? stall?.stallId ?? `${getStallName(stall)}-${index}`}
                    stall={stall}
                    index={index}
                    onAddDevice={() => setAddDeviceStall(stall)}
                    onEditStall={() => setEditStall(stall)}
                  />
                ))
              )}
            </ScrollRows>
          </ConfigPanel>
        </div>

        <div className="space-y-4">
          <ConfigPanel
            title="AccessX"
            count={stalls.filter(isAccessXStall).length}
            searchValue={stallQuery}
            onSearchChange={setStallQuery}
            searchPlaceholder="Search AccessX"
            theme="accessx"
          >
            <ScrollRows>
              {stallsLoading ? (
                <LoadingState label="Loading AccessX..." />
              ) : stallsError ? (
                <EmptyState>{stallsError}</EmptyState>
              ) : filteredAccessXStalls.length === 0 ? (
                <EmptyState>No AccessX stalls found.</EmptyState>
              ) : (
                filteredAccessXStalls.map((stall, index) => (
                  <StallRow
                    key={stall?.id ?? stall?.stallId ?? `${getStallName(stall)}-${index}`}
                    stall={stall}
                    index={index}
                    onAddDevice={() => setAddDeviceStall(stall)}
                    onEditStall={() => setEditStall(stall)}
                  />
                ))
              )}
            </ScrollRows>
          </ConfigPanel>

          <ConfigPanel
            title="AccessX Categories"
            count={accessXCategories.length}
            searchValue={categoryQuery}
            onSearchChange={setCategoryQuery}
            searchPlaceholder="Search category"
            action={addCategoryButton}
            theme="accessx"
          >
            {accessXCategoriesLoading ? (
              <LoadingState label="Loading categories..." />
            ) : accessXCategoriesError ? (
              <EmptyState>{accessXCategoriesError}</EmptyState>
            ) : filteredAccessXCategories.length === 0 ? (
              <EmptyState>No AccessX categories found.</EmptyState>
            ) : (
              <AccessXCategoryTable
                categories={filteredAccessXCategories}
                onEdit={setEditAccessXCategory}
              />
            )}
          </ConfigPanel>

          <ConfigPanel
            title="Access_Gate_Master"
            count={accessXGateMasters.length}
            searchValue={gateMasterQuery}
            onSearchChange={setGateMasterQuery}
            searchPlaceholder="Search gate"
            action={addGateMasterButton}
            theme="accessx"
          >
            {accessXGateMastersLoading ? (
              <LoadingState label="Loading gate masterlist..." />
            ) : accessXGateMastersError ? (
              <EmptyState>{accessXGateMastersError}</EmptyState>
            ) : filteredAccessXGateMasters.length === 0 ? (
              <EmptyState>No gate masters found.</EmptyState>
            ) : (
              <Access_Gate_Master gates={filteredAccessXGateMasters} />
            )}
          </ConfigPanel>
        </div>
      </div>
    </div>

    {editStall && (
      <EditStallModal
        stall={editStall}
        onClose={() => setEditStall(null)}
        onConfirm={(data) => {
          console.log("Edit stall", data);
          setEditStall(null);
        }}
      />
    )}

    {editAccessXCategory && (
      <EditAccessXCategoryModal
        category={editAccessXCategory}
        onClose={() => setEditAccessXCategory(null)}
        onConfirm={async (data) => {
          const numericEventId = Number(eventId);
          const payload = {
            allowCount: data.allowCount,
            eventId: Number.isNaN(numericEventId) ? eventId : numericEventId,
            id: editAccessXCategory.id,
            name: data.name,
            description: editAccessXCategory.description ?? null,
            externalLink: editAccessXCategory.externalLink ?? null,
            position: data.position,
            qrLogicDiscountId: data.qrLogicDiscountId,
            qrLogicIssuerId: data.qrLogicIssuerId,
            qrLogicSectorId: data.qrLogicSectorId,
            qrLogicTicketType: data.qrLogicTicketType,
            qrLogicTktAccred: data.qrLogicTktAccred,
            status: editAccessXCategory.status ?? "active"
          };

          try {
            const response = await updateAccessXCategory({ token, category: payload });
            const updatedCategory =
              response?.category ??
              response?.data?.category ??
              response?.data ??
              payload;
            setAccessXCategories((current) =>
              current.map((category) =>
                category?.id === editAccessXCategory?.id
                  ? { ...category, ...payload, ...updatedCategory }
                  : category
              )
            );
            setEditAccessXCategory(null);
          } catch (error) {
            console.error("Edit AccessX category failed", error);
            throw error;
          }
        }}
      />
    )}

    {showCreateAccessXCategory && (
      <EditAccessXCategoryModal
        category={null}
        mode="create"
        onClose={() => setShowCreateAccessXCategory(false)}
        onConfirm={async (data) => {
          const numericEventId = Number(eventId);
          const payload = {
            allowCount: data.allowCount,
            eventId: Number.isNaN(numericEventId) ? eventId : numericEventId,
            name: data.name.trim(),
            description: eventName || null,
            externalLink: data.name.trim(),
            qrLogicDiscountId: data.qrLogicDiscountId,
            qrLogicIssuerId: data.qrLogicIssuerId,
            qrLogicSectorId: data.qrLogicSectorId,
            qrLogicTicketType: data.qrLogicTicketType,
            qrLogicTktAccred: data.qrLogicTktAccred
          };

          try {
            const response = await createAccessXCategory({ token, category: payload });
            try {
              const refreshed = await fetchAccessXCategories({
                eventId,
                token,
                dedupe: false
              });
              setAccessXCategories(normalizeAccessXCategories(refreshed));
            } catch (refreshError) {
              console.error("Reload AccessX categories failed", refreshError);
              const createdCategory =
                response?.category ??
                response?.data?.category ??
                response?.data ??
                payload;
              setAccessXCategories((current) => [
                ...current,
                { ...payload, ...createdCategory }
              ]);
            }
            setShowCreateAccessXCategory(false);
          } catch (error) {
            console.error("Create AccessX category failed", error);
            throw error;
          }
        }}
      />
    )}

    {addDeviceStall && (
      <AddDevice
        stall={addDeviceStall}
        onClose={() => setAddDeviceStall(null)}
        onConfirm={async (payload) => {
          try {
            await addDevicesToStall({ token, payload });
            setAddDeviceStall(null);
            loadStalls({ force: true });
          } catch (error) {
            console.error("Add devices to stall failed", error);
            throw error;
          }
        }}
      />
    )}

    {showCreateVendor && (
      <CreateVendorModal
        eventId={eventId}
        onClose={() => setShowCreateVendor(false)}
        onConfirm={async (data) => {
          try {
            await createVendor({ token, vendor: data });
            setShowCreateVendor(false);
            loadVendors({ force: true });
          } catch (error) {
            console.error("Create vendor failed", error);
          }
        }}
      />
    )}

    {editVendor && (
      <EditVendorModal
        vendor={editVendor}
        eventId={eventId}
        onClose={() => setEditVendor(null)}
        onConfirm={async (data) => {
          try {
            await updateVendor({
              vendorId: getVendorId(editVendor),
              token,
              payload: data
            });
            setEditVendor(null);
            loadVendors({ force: true });
          } catch (error) {
            console.error("Edit vendor failed", error);
          }
        }}
      />
    )}

    {createStallFor && (
      <CreateStallModal
        vendorName={createStallFor.vendorName}
        vendorType={createStallFor.vendorType}
        onClose={() => setCreateStallFor(null)}
        onConfirm={async (data) => {
          try {
            const payload = buildCreateStallPayload(data, createStallFor.vendorId);
            await createStall({ token, stall: payload });
            setCreateStallFor(null);
            loadStalls({ force: true });
          } catch (error) {
            console.error("Create stall failed", error);
          }
        }}
      />
    )}
    </>
  );
}
