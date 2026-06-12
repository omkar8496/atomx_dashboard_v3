"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AtomXLoader } from "@atomx/global-components";
import { createStall, createVendor, fetchStalls, fetchVendors, updateVendor } from "../../../lib/dashboardApi";
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

function getDeviceCount(stall) {
  const count =
    stall?.deviceCount ??
    stall?.devicesCount ??
    stall?.devices?.length ??
    stall?.device?.length;
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
      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[0.78rem] font-semibold transition ${
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
    <label className="flex min-w-[190px] flex-1 items-center gap-2.5 border-b border-[#cfcfcf] pb-1.5 text-[#9a8df0]">
      <span className="sr-only">{placeholder}</span>
      <SearchIcon className="h-4 w-4 shrink-0" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[0.88rem] font-medium text-[#2f3544] outline-none placeholder:text-[#9aa3b8]"
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
  children
}) {
  return (
    <section className="rounded-lg border border-[#ded4ff] border-l-[3px] border-l-[#ed4522] bg-white px-4 py-4 shadow-[0_18px_36px_rgba(15,23,42,0.08)]">
      <div className="flex flex-wrap items-center gap-4 border-b border-[#dfdfdf] pb-3">
        <div className="flex min-w-fit items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#f24a2b,#4b2ee4)] text-[0.92rem] font-bold text-white shadow-[0_8px_16px_rgba(85,46,228,0.2)]">
            {count}
          </span>
          <h2 className="text-[1.12rem] font-bold leading-none text-[#232323]">
            {title}
          </h2>
        </div>
        <ConfigSearchField
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
        />
        {action ? <div className="ml-auto">{action}</div> : null}
      </div>
      <div className="pt-3">{children}</div>
    </section>
  );
}

function ScrollRows({ children }) {
  return (
    <div className="max-h-[333px] space-y-2.5 overflow-y-auto pr-1">
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
      <div className="grid min-h-[54px] grid-cols-[48px_minmax(140px,1.35fr)_minmax(78px,0.55fr)_minmax(78px,0.55fr)_auto] items-center gap-3 rounded-[7px] bg-white px-3 py-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f7f7f7] text-[0.8rem] font-bold text-[#ef4424]">
          #{index + 1}
        </span>
        <div className="min-w-0">
          <div className="text-[0.58rem] font-bold uppercase tracking-[0.15em] text-[#9d9d9d]">
            Name
          </div>
          <div className="mt-0.5 truncate text-[0.9rem] font-bold text-[#272727]">
            {getVendorName(vendor)}
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-[0.58rem] font-bold uppercase tracking-[0.15em] text-[#9d9d9d]">
            Type
          </div>
          <div className="mt-0.5 truncate text-[0.84rem] font-bold text-[#272727]">
            {getVendorType(vendor)}
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-[0.58rem] font-bold uppercase tracking-[0.15em] text-[#9d9d9d]">
            Login
          </div>
          <div className="mt-0.5 truncate text-[0.84rem] font-bold text-[#272727]">
            {getVendorLogin(vendor)}
          </div>
        </div>
        <div className="flex items-center gap-1.5 border-l border-[#e4e4e4] pl-3">
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

function StallRow({ stall, index, onEditStall }) {
  return (
    <div
      className="rounded-lg border border-transparent p-px"
      style={{
        background:
          "linear-gradient(#fff, #fff) padding-box, linear-gradient(110deg, #ffb7ac, #d5c9ff) border-box"
      }}
    >
      <div className="grid min-h-[54px] grid-cols-[76px_minmax(110px,1fr)_minmax(110px,1fr)_auto] items-center gap-3 rounded-[7px] bg-white px-3 py-2">
        <span className="text-[0.9rem] font-bold text-[#ef4424]">#{getStallId(stall, index)}</span>
        <div className="min-w-0">
          <div className="text-[0.66rem] font-bold text-[#8e8e8e]">Vendor</div>
          <div className="mt-0.5 truncate text-[0.9rem] font-bold text-[#272727]">
            {getStallVendor(stall)}
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-[0.66rem] font-bold text-[#8e8e8e]">Stall</div>
          <div className="mt-0.5 truncate text-[0.9rem] font-bold text-[#272727]">
            {getStallName(stall)}
          </div>
        </div>
        <div className="flex items-center gap-1.5 border-l border-[#e4e4e4] pl-3">
          <div className="inline-flex h-7 items-center gap-1.5 rounded-md bg-[#202020] px-2.5 text-[0.78rem] font-bold text-white">
            <span>{getDeviceCount(stall)}</span>
            <DeviceIcon />
            <span className="h-4 w-px bg-white/25" />
            <PlusIcon />
          </div>
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

export default function VendorConfigurationContent() {
  const token = useDashboardStore((state) => state.token);
  const eventMeta = useDashboardStore((state) => state.eventMeta);
  const eventDetails = useDashboardStore((state) => state.eventDetails);
  const eventId = eventMeta?.eventId ?? eventDetails?.id;
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
  const [createStallFor, setCreateStallFor] = useState(null);
  const [editVendor, setEditVendor] = useState(null);
  const [showCreateVendor, setShowCreateVendor] = useState(false);
  const [editStall, setEditStall] = useState(null);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [stallsLoading, setStallsLoading] = useState(false);
  const [vendorsError, setVendorsError] = useState("");
  const [stallsError, setStallsError] = useState("");

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
    const regularStalls = stalls.filter((stall) => !isStockmasterStall(stall));
    if (!query) return regularStalls;
    return regularStalls.filter((stall, index) =>
      [getStallId(stall, index), getStallVendor(stall), getStallName(stall)]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [stallQuery, stalls]);

  const filteredStockrooms = useMemo(() => {
    const query = stallQuery.trim().toLowerCase();
    const stockrooms = stalls.filter(isStockmasterStall);
    if (!query) return stockrooms;
    return stockrooms.filter((stall, index) =>
      [getStallId(stall, index), getStallVendor(stall), getStallName(stall), getStallType(stall)]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [stallQuery, stalls]);

  const addVendorButton = (
    <button
      type="button"
      onClick={() => setShowCreateVendor(true)}
      className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#202020] px-4 text-[0.88rem] font-bold text-white shadow-[0_10px_18px_rgba(0,0,0,0.15)] transition hover:bg-[#111111]"
    >
      <PlusIcon className="h-4 w-4" />
      Add Vendor
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

      <div className="space-y-4">
        <ConfigPanel
          title="Stall"
          count={stalls.filter((stall) => !isStockmasterStall(stall)).length}
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
                  onEditStall={() => setEditStall(stall)}
                />
              ))
            )}
          </ScrollRows>
        </ConfigPanel>

        <ConfigPanel
          title="Stockroom"
          count={stalls.filter(isStockmasterStall).length}
          searchValue={stallQuery}
          onSearchChange={setStallQuery}
          searchPlaceholder="Search stockroom"
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
                  onEditStall={() => setEditStall(stall)}
                />
              ))
            )}
          </ScrollRows>
        </ConfigPanel>
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
