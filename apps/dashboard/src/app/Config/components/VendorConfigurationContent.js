"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AtomXLoader } from "@atomx/global-components";
import { useRouter } from "next/navigation";
import {
  addDevicesToStall,
  createAccessXCategory,
  createAccessXGateMaster,
  createStall,
  createVendor,
  fetchAccessXCategories,
  fetchAccessXGateMasters,
  fetchAccessXGates,
  fetchStalls,
  fetchVendors,
  updateAccessXCategory,
  updateAccessXGateMaster,
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
import Access_Gate_Config from "./Access_Gate_Config";
import CreateAccessGateMasterModal from "./CreateAccessGateMasterModal";
import EditAccessGateMasterModal from "./EditAccessGateMasterModal";
import EditAccessGateConfigModal from "./EditAccessGateConfigModal";
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

function getStallApiId(stall) {
  return stall?.id ?? stall?.stallId ?? stall?.stall_id ?? null;
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

function normalizeAccessXGates(response) {
  const gates =
    response?.gates ??
    response?.data?.gates ??
    response?.data ??
    response?.list ??
    [];
  return Array.isArray(gates) ? gates : [];
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
    <div className="rounded-[11px] border border-dashed border-(--line) px-4 py-8 text-center text-[13px] font-medium text-(--muted)">
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
      className={`inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] transition ${
        active
          ? "bg-(--text) text-(--bg) hover:bg-(--orange)"
          : "border border-(--line) bg-(--surface) text-(--muted) hover:border-(--orange) hover:text-(--orange)"
      }`}
      {...props}
    >
      {children}
    </Component>
  );
}

function ConfigSearchField({ value, onChange, placeholder }) {
  return (
    <label className="flex min-w-[160px] flex-1 items-center gap-2 border-b border-(--line) pb-1.5 text-(--muted) transition focus-within:border-(--orange) max-[640px]:min-w-0">
      <span className="sr-only">{placeholder}</span>
      <SearchIcon className="h-4 w-4 shrink-0 opacity-60" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[13px] font-medium text-(--text) outline-none placeholder:text-(--faint)"
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
    default: { accent: "#e04420", tile: "linear-gradient(140deg,#e04420,#8b5cf6)" },
    stockroom: { accent: "#00a9f2", tile: "linear-gradient(140deg,#00a9f2,#341cd6)" },
    tables: { accent: "#e08a20", tile: "linear-gradient(140deg,#e04420,#e08a20)" },
    accessx: { accent: "#341cd6", tile: "linear-gradient(140deg,#8b5cf6,#341cd6)" }
  };
  const palette = themes[theme] || themes.default;

  return (
    <section
      className="rounded-[15px] border border-(--line) border-l-[3px] bg-(--surface) px-4 py-4 shadow-(--shadow) max-[640px]:px-3 max-[640px]:py-3"
      style={{ borderLeftColor: palette.accent }}
    >
      <div className="flex flex-wrap items-center gap-3 border-b border-(--line2) pb-3">
        <div className="flex min-w-fit items-center gap-2.5">
          <span
            className="font-vcr flex h-9 w-9 items-center justify-center rounded-[10px] text-[12px] text-white"
            style={{ background: palette.tile }}
          >
            {String(count).padStart(2, "0")}
          </span>
          <h2 className="font-chillax text-[18px] font-semibold tracking-[-0.01em] text-(--text)">
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
      className="rounded-[11px] border border-transparent p-px transition duration-200 hover:shadow-(--shadow)"
      style={{
        background:
          "linear-gradient(var(--surface),var(--surface)) padding-box, linear-gradient(135deg,rgba(224,68,32,.34),rgba(139,92,246,.26) 52%,rgba(0,169,242,.22)) border-box"
      }}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[10px] bg-(--surface) px-3 py-2.5">
        <span className="font-vcr grid h-9 w-9 shrink-0 place-items-center rounded-[9px] bg-(--surface2) text-[12px] text-(--orange)">
          #{index + 1}
        </span>
        <div className="min-w-0 flex-[1_1_140px]">
          <div className="font-vcr text-[7.5px] tracking-[0.15em] text-(--faint)">NAME</div>
          <div className="mt-0.5 truncate text-[13.5px] font-semibold text-(--text)">
            {getVendorName(vendor)}
          </div>
        </div>
        <div className="min-w-0 flex-[1_1_80px]">
          <div className="font-vcr text-[7.5px] tracking-[0.15em] text-(--faint)">TYPE</div>
          <div className="mt-0.5 truncate text-[13px] font-semibold text-(--text)">
            {getVendorType(vendor)}
          </div>
        </div>
        <div className="min-w-0 flex-[1_1_80px] max-[640px]:hidden">
          <div className="font-vcr text-[7.5px] tracking-[0.15em] text-(--faint)">LOGIN</div>
          <div className="font-vcr mt-0.5 truncate text-[12.5px] text-(--muted)">
            {getVendorLogin(vendor)}
          </div>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
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
  );
}

function StallRow({ stall, index, onEditStall, onAddDevice, onOpenMenu }) {
  return (
    <div
      className="rounded-[11px] border border-transparent p-px transition duration-200 hover:shadow-(--shadow)"
      style={{
        background:
          "linear-gradient(var(--surface),var(--surface)) padding-box, linear-gradient(135deg,rgba(224,68,32,.34),rgba(139,92,246,.26) 52%,rgba(0,169,242,.22)) border-box"
      }}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[10px] bg-(--surface) px-3 py-2.5">
        <span className="font-vcr shrink-0 text-[13px] text-(--orange)">#{getStallId(stall, index)}</span>
        <div className="min-w-0 flex-[1_1_100px]">
          <div className="font-vcr text-[7.5px] tracking-[0.15em] text-(--faint)">VENDOR</div>
          <div className="mt-0.5 truncate text-[13px] font-semibold text-(--text)">
            {getStallVendor(stall)}
          </div>
        </div>
        <div className="min-w-0 flex-[1_1_100px]">
          <div className="font-vcr text-[7.5px] tracking-[0.15em] text-(--faint)">STALL</div>
          <div className="mt-0.5 truncate text-[13px] font-semibold text-(--text)">
            {getStallName(stall)}
          </div>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onAddDevice}
            className="inline-flex h-[30px] items-center gap-1.5 rounded-[8px] bg-(--text) px-2.5 text-[12px] font-semibold text-(--bg) transition hover:bg-(--orange)"
            aria-label={`Add device to ${getStallName(stall)}`}
            title="Add device"
          >
            <span className="font-vcr">{getDeviceCount(stall)}</span>
            <DeviceIcon />
            <span className="h-4 w-px bg-white/25" />
            <PlusIcon />
          </button>
          <ActionButton label="Open menu" onClick={onOpenMenu}>
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
    <div className="max-h-[333px] overflow-auto rounded-[11px] border border-(--line)">
      <table className="w-full min-w-[430px] border-collapse">
        <thead className="font-vcr sticky top-0 z-[1] bg-(--surface2)">
          <tr>
            <th className="w-[64px] border-b border-(--line) px-3 py-2.5 text-left text-[9.5px] tracking-[0.15em] text-(--orange)">
              NO.
            </th>
            <th className="border-b border-(--line) px-3 py-2.5 text-left text-[9.5px] tracking-[0.15em] text-(--orange)">
              CATEGORY
            </th>
            <th className="w-[90px] border-b border-(--line) px-3 py-2.5 text-left text-[9.5px] tracking-[0.15em] text-(--orange)">
              ALLOW
            </th>
            <th className="w-[64px] border-b border-(--line) px-3 py-2.5 text-center text-[9.5px] tracking-[0.15em] text-(--orange)">
              EDIT
            </th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category, index) => (
            <tr key={category?.id ?? `${category?.name}-${index}`} className="transition hover:bg-(--surface2)">
              <td className="font-vcr border-b border-(--line2) px-3 py-2.5 text-[12px] text-(--orange)">
                {index + 1}
              </td>
              <td className="border-b border-(--line2) px-3 py-2.5">
                <span className="block truncate text-[13px] font-semibold text-(--text)">
                  {category?.name || "-"}
                </span>
              </td>
              <td className="border-b border-(--line2) px-3 py-2.5">
                <span className="font-vcr inline-flex min-w-8 items-center justify-center rounded-[6px] bg-(--chip) px-2 py-1 text-[10px] text-(--blue)">
                  {getCategoryAllowLabel(category)}
                </span>
              </td>
              <td className="border-b border-(--line2) px-3 py-2.5 text-center">
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
  const router = useRouter();
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
  const [gateConfigQuery, setGateConfigQuery] = useState("");
  const [accessXCategories, setAccessXCategories] = useState([]);
  const [accessXGateMasters, setAccessXGateMasters] = useState([]);
  const [accessXGates, setAccessXGates] = useState([]);
  const [createStallFor, setCreateStallFor] = useState(null);
  const [editVendor, setEditVendor] = useState(null);
  const [showCreateVendor, setShowCreateVendor] = useState(false);
  const [editStall, setEditStall] = useState(null);
  const [addDeviceStall, setAddDeviceStall] = useState(null);
  const [editAccessXCategory, setEditAccessXCategory] = useState(null);
  const [showCreateAccessXCategory, setShowCreateAccessXCategory] = useState(false);
  const [showCreateAccessGateMaster, setShowCreateAccessGateMaster] = useState(false);
  const [editAccessGateMaster, setEditAccessGateMaster] = useState(null);
  const [editAccessGateConfig, setEditAccessGateConfig] = useState(null);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [stallsLoading, setStallsLoading] = useState(false);
  const [accessXCategoriesLoading, setAccessXCategoriesLoading] = useState(false);
  const [accessXGateMastersLoading, setAccessXGateMastersLoading] = useState(false);
  const [accessXGatesLoading, setAccessXGatesLoading] = useState(false);
  const [vendorsError, setVendorsError] = useState("");
  const [stallsError, setStallsError] = useState("");
  const [accessXCategoriesError, setAccessXCategoriesError] = useState("");
  const [accessXGateMastersError, setAccessXGateMastersError] = useState("");
  const [accessXGatesError, setAccessXGatesError] = useState("");
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

  const handleOpenStallMenu = useCallback(
    (stall) => {
      const stallId = getStallApiId(stall);
      if (!stallId) {
        console.error("Unable to load stall menu: missing stall ID", stall);
        return;
      }

      const params = new URLSearchParams({
        stallId: String(stallId),
        stallName: getStallName(stall)
      });
      router.push(`/Config/menu?${params.toString()}`);
    },
    [router]
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
    setAccessXGates([]);
    setAccessXCategoriesError("");
    setAccessXGateMastersError("");
    setAccessXGatesError("");
    setAccessXCategoriesLoading(true);
    setAccessXGateMastersLoading(true);
    setAccessXGatesLoading(true);

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

      const gatesResult = results[2];
      if (gatesResult.status === "fulfilled") {
        setAccessXGates(normalizeAccessXGates(gatesResult.value));
      } else {
        setAccessXGatesError("Unable to load Access Gate Config.");
      }
      setAccessXGatesLoading(false);

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

  const filteredAccessXGates = useMemo(() => {
    const query = gateConfigQuery.trim().toLowerCase();
    if (!query) return accessXGates;
    return accessXGates.filter((gate) =>
      [
        gate?.id,
        gate?.gatesmaster_name,
        gate?.category_name,
        gate?.gateId,
        gate?.categoryId
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [accessXGates, gateConfigQuery]);

  const addVendorButton = (
    <button
      type="button"
      onClick={() => setShowCreateVendor(true)}
      className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-(--text) px-4 text-[13.5px] font-semibold text-(--bg) transition hover:bg-(--orange) max-[640px]:w-full max-[640px]:justify-center"
    >
      <PlusIcon className="h-4 w-4" />
      Add Vendor
    </button>
  );

  const addCategoryButton = (
    <button
      type="button"
      onClick={() => setShowCreateAccessXCategory(true)}
      className="inline-flex h-8 items-center gap-1.5 rounded-[8px] bg-(--text) px-3 text-[12px] font-semibold text-(--bg) transition hover:bg-(--orange) max-[640px]:w-full max-[640px]:justify-center"
    >
      <PlusIcon className="h-3.5 w-3.5" />
      Add
    </button>
  );

  const addGateMasterButton = (
    <button
      type="button"
      onClick={() => setShowCreateAccessGateMaster(true)}
      className="inline-flex h-8 items-center gap-1.5 rounded-[8px] bg-(--text) px-3 text-[12px] font-semibold text-(--bg) transition hover:bg-(--orange) max-[640px]:w-full max-[640px]:justify-center"
    >
      <PlusIcon className="h-3.5 w-3.5" />
      Add
    </button>
  );

  const addGateConfigButton = (
    <button
      type="button"
      title="Access Gate Config create API pending"
      className="inline-flex h-8 items-center gap-1.5 rounded-[8px] bg-(--text) px-3 text-[12px] font-semibold text-(--bg) transition hover:bg-(--orange) max-[640px]:w-full max-[640px]:justify-center"
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
                  onOpenMenu={() => handleOpenStallMenu(stall)}
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
                    onOpenMenu={() => handleOpenStallMenu(stall)}
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
                    onOpenMenu={() => handleOpenStallMenu(stall)}
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
                    onOpenMenu={() => handleOpenStallMenu(stall)}
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
              <Access_Gate_Master
                gates={filteredAccessXGateMasters}
                onEdit={setEditAccessGateMaster}
              />
            )}
          </ConfigPanel>

          <ConfigPanel
            title="Access Gate Config"
            count={accessXGates.length}
            searchValue={gateConfigQuery}
            onSearchChange={setGateConfigQuery}
            searchPlaceholder="Search gate or category"
            action={addGateConfigButton}
            theme="accessx"
          >
            {accessXGatesLoading ? (
              <LoadingState label="Loading gate configuration..." />
            ) : accessXGatesError ? (
              <EmptyState>{accessXGatesError}</EmptyState>
            ) : filteredAccessXGates.length === 0 ? (
              <EmptyState>No gate configuration found.</EmptyState>
            ) : (
              <Access_Gate_Config
                gates={filteredAccessXGates}
                onEdit={setEditAccessGateConfig}
              />
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

    {showCreateAccessGateMaster && (
      <CreateAccessGateMasterModal
        onClose={() => setShowCreateAccessGateMaster(false)}
        onConfirm={async ({ name }) => {
          const numericEventId = Number(eventId);
          const payload = {
            name,
            eventId: Number.isNaN(numericEventId) ? eventId : numericEventId,
            gateDay: 1,
            useCatgCounts: 1,
            position: 1,
            hide: 0
          };

          try {
            const response = await createAccessXGateMaster({
              token,
              gateMaster: payload
            });
            try {
              const refreshed = await fetchAccessXGateMasters({
                eventId,
                token,
                dedupe: false
              });
              setAccessXGateMasters(normalizeAccessXGateMasters(refreshed));
            } catch (refreshError) {
              console.error("Reload Access Gate Masterlist failed", refreshError);
              const createdGateMaster =
                response?.gatesmaster ??
                response?.gateMaster ??
                response?.data?.gatesmaster ??
                response?.data?.gateMaster ??
                response?.data ??
                payload;
              setAccessXGateMasters((current) => [
                ...current,
                { ...payload, ...createdGateMaster }
              ]);
            }
            setShowCreateAccessGateMaster(false);
          } catch (error) {
            console.error("Create Access Gate Master failed", error);
            throw error;
          }
        }}
      />
    )}

    {editAccessGateMaster && (
      <EditAccessGateMasterModal
        gateMaster={editAccessGateMaster}
        onClose={() => setEditAccessGateMaster(null)}
        onConfirm={async ({ name, useCatgCounts }) => {
          const numericEventId = Number(eventId);
          const numericPosition = Number(editAccessGateMaster.position);
          const payload = {
            id: editAccessGateMaster.id,
            name,
            eventId: Number.isNaN(numericEventId) ? eventId : numericEventId,
            useCatgCounts,
            position: Number.isNaN(numericPosition)
              ? editAccessGateMaster.position
              : numericPosition
          };

          try {
            const response = await updateAccessXGateMaster({
              token,
              gateMaster: payload
            });
            const updatedGateMaster =
              response?.gatesmaster ??
              response?.gateMaster ??
              response?.data?.gatesmaster ??
              response?.data?.gateMaster ??
              response?.data ??
              payload;
            setAccessXGateMasters((current) =>
              current.map((gateMaster) =>
                gateMaster?.id === editAccessGateMaster?.id
                  ? { ...gateMaster, ...payload, ...updatedGateMaster }
                  : gateMaster
              )
            );
            setEditAccessGateMaster(null);
          } catch (error) {
            console.error("Edit Access Gate Master failed", error);
            throw error;
          }
        }}
      />
    )}

    {editAccessGateConfig && (
      <EditAccessGateConfigModal
        gateConfig={editAccessGateConfig}
        onClose={() => setEditAccessGateConfig(null)}
        onConfirm={async ({ name, useCatgCounts }) => {
          const numericEventId = Number(eventId);
          const numericGateMasterId = Number(editAccessGateConfig.gateId);
          const numericPosition = Number(editAccessGateConfig.gatesmaster_position);
          const gateMasterId = Number.isNaN(numericGateMasterId)
            ? editAccessGateConfig.gateId
            : numericGateMasterId;
          const position = Number.isNaN(numericPosition)
            ? editAccessGateConfig.gatesmaster_position
            : numericPosition;
          const payload = {
            id: gateMasterId,
            name,
            eventId: Number.isNaN(numericEventId) ? eventId : numericEventId,
            useCatgCounts,
            position
          };

          try {
            await updateAccessXGateMaster({
              token,
              gateMaster: payload
            });

            setAccessXGates((current) =>
              current.map((gate) =>
                String(gate?.gateId) === String(gateMasterId)
                  ? {
                      ...gate,
                      gatesmaster_name: name,
                      gatesmaster_useCatgCounts: useCatgCounts,
                      gatesmaster_position: position
                    }
                  : gate
              )
            );
            setAccessXGateMasters((current) =>
              current.map((gateMaster) =>
                String(gateMaster?.id) === String(gateMasterId)
                  ? {
                      ...gateMaster,
                      name,
                      useCatgCounts,
                      position
                    }
                  : gateMaster
              )
            );

            const [gateMastersResult, gatesResult] = await Promise.allSettled([
              fetchAccessXGateMasters({
                eventId,
                token,
                dedupe: false
              }),
              fetchAccessXGates({
                eventId,
                token,
                dedupe: false
              })
            ]);

            if (gateMastersResult.status === "fulfilled") {
              setAccessXGateMasters(
                normalizeAccessXGateMasters(gateMastersResult.value)
              );
            } else {
              console.error(
                "Reload Access Gate Masterlist failed",
                gateMastersResult.reason
              );
            }

            if (gatesResult.status === "fulfilled") {
              setAccessXGates(normalizeAccessXGates(gatesResult.value));
            } else {
              console.error(
                "Reload Access Gate Config failed",
                gatesResult.reason
              );
            }

            setEditAccessGateConfig(null);
          } catch (error) {
            console.error("Edit Access Gate Config failed", error);
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
