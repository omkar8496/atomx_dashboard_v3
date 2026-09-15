"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchStalls, fetchStallItems } from "../../../../lib/dashboardApi";
import { SearchIcon } from "./MenuIcons";

// Only stalls of this type contribute items to the sample catalogue.
const GENERIC_STALL_TYPE = "generic-items";

function asText(value) {
  return value == null ? "" : String(value).trim();
}

function stallType(stall) {
  return asText(stall?.type ?? stall?.category).toLowerCase();
}

function stallId(stall) {
  return stall?.id ?? stall?.stallId ?? stall?.stall_id ?? null;
}

function stallName(stall) {
  return asText(stall?.name ?? stall?.stallName ?? stall?.stall) || "Stall";
}

function responseArray(response, key) {
  const candidates = [
    response?.[key],
    response?.data?.[key],
    response?.result?.[key],
    response?.data?.data?.[key]
  ];
  return candidates.find(Array.isArray) ?? [];
}

// Items come back either flat with a categoryId or nested inside categories,
// so both shapes are flattened and labelled with their category name.
function flattenStallItems(response, stall) {
  const categories = responseArray(response, "categories");
  const nested = responseArray(response, "menu");
  const groups = categories.length > 0 ? categories : nested;
  const categoryNames = new Map(
    groups.map((group) => [String(group?.id), asText(group?.name)])
  );

  const flat = responseArray(response, "items");
  const fromGroups = groups.flatMap((group) =>
    (Array.isArray(group?.items) ? group.items : []).map((item) => ({
      item,
      categoryName: asText(group?.name)
    }))
  );
  const rows = flat.length > 0
    ? flat.map((item) => ({
        item,
        categoryName: categoryNames.get(String(item?.categoryId)) ?? ""
      }))
    : fromGroups;

  return rows
    .filter(({ item }) => asText(item?.name))
    .map(({ item, categoryName }) => ({
      key: `${stallId(stall)}-${item?.id ?? asText(item?.name)}-${asText(item?.variant)}`,
      stallId: stallId(stall),
      stallName: stallName(stall),
      categoryName,
      name: asText(item?.name),
      price: Number(item?.price) || 0,
      mrp: Number(item?.mrp) || 0,
      type: asText(item?.type).toUpperCase(),
      variant: asText(item?.variant),
      barcode: asText(item?.barcode),
      supplierCode: asText(item?.supplierCode)
    }));
}

// Loads every item held by the event's Generic-Items stalls, once. The result
// is kept for the life of the page so reopening the popup costs nothing; only
// Refresh goes back to the network.
export function useSampleItems({ eventId, token }) {
  const [items, setItems] = useState([]);
  const [stallCount, setStallCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const inFlight = useRef(false);

  const load = useCallback(
    async ({ force = false } = {}) => {
      if (!eventId) {
        setError("Event ID is unavailable.");
        setLoaded(true);
        return;
      }
      if (inFlight.current) return;
      if (loaded && !force) return;

      inFlight.current = true;
      setLoading(true);
      setError("");
      try {
        const stalls = await fetchStalls({ eventId, token, dedupe: !force });
        const generic = (Array.isArray(stalls) ? stalls : []).filter(
          (stall) => stallType(stall) === GENERIC_STALL_TYPE && stallId(stall) != null
        );
        setStallCount(generic.length);

        const responses = await Promise.all(
          generic.map((stall) =>
            fetchStallItems({ stallId: stallId(stall), token, dedupe: !force })
              .then((response) => flattenStallItems(response, stall))
              .catch((stallError) => {
                console.error(
                  `Unable to load items for Generic-Items stall ${stallId(stall)}`,
                  stallError
                );
                return [];
              })
          )
        );

        setItems(responses.flat());
        setLoaded(true);
      } catch (loadError) {
        console.error("Unable to load Generic-Items stalls", loadError);
        setItems([]);
        setStallCount(0);
        setError("Unable to load sample items.");
        setLoaded(true);
      } finally {
        inFlight.current = false;
        setLoading(false);
      }
    },
    [eventId, token, loaded]
  );

  const refresh = useCallback(() => load({ force: true }), [load]);

  return { items, stallCount, loading, error, loaded, load, refresh };
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
    </svg>
  );
}

function RefreshIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

export default function SampleItemsPopup({ open, onClose, catalogue }) {
  const { items, stallCount, loading, error, refresh } = catalogue;
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const groups = useMemo(() => {
    const term = search.trim().toLowerCase();
    const matched = term
      ? items.filter((item) =>
          [item.name, item.variant, item.barcode, item.supplierCode, item.categoryName]
            .join(" ")
            .toLowerCase()
            .includes(term)
        )
      : items;

    const byStall = new Map();
    for (const item of matched) {
      const bucket = byStall.get(item.stallName) ?? [];
      bucket.push(item);
      byStall.set(item.stallName, bucket);
    }
    return [...byStall.entries()];
  }, [items, search]);

  if (!open) return null;

  const matchedCount = groups.reduce((total, [, rows]) => total + rows.length, 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sample items"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
      className="fixed inset-0 z-[200] flex items-center justify-center overscroll-none bg-[rgba(12,12,12,0.5)] px-4 py-6 backdrop-blur-[3px] max-[640px]:p-0"
    >
      <div className="flex max-h-[calc(100dvh-48px)] w-full max-w-[720px] flex-col overflow-hidden rounded-[16px] border border-(--line) bg-(--surface) shadow-(--shadowUp) max-[640px]:h-full max-[640px]:max-h-full max-[640px]:rounded-none">
        <div
          className="relative shrink-0 overflow-hidden px-6 py-4 max-[640px]:px-4"
          style={{ background: "linear-gradient(120deg,#1C1C1C 0%,#341CD6 62%,#E04420 130%)" }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-vcr text-[10px] tracking-[0.18em] text-white/70">SAMPLE ITEMS</p>
              <h2 className="mt-1 truncate text-[17px] font-semibold text-white">
                Generic-Items catalogue
              </h2>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={refresh}
                disabled={loading}
                className="flex h-8 items-center gap-1.5 rounded-[8px] border border-white/30 px-2.5 text-[12px] font-semibold text-white transition hover:bg-white/15 disabled:opacity-50"
              >
                <RefreshIcon />
                {loading ? "Refreshing…" : "Refresh"}
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-white/30 text-white transition hover:bg-white/15"
              >
                <CloseIcon />
              </button>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-b border-(--line2) px-5 py-3">
          <div className="flex items-center gap-2.5 rounded-[10px] border border-(--line) bg-(--surface) px-3 py-2.5 transition focus-within:border-(--orange)">
            <SearchIcon className="h-4 w-4 shrink-0 text-(--muted) opacity-60" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search sample items"
              className="min-w-0 flex-1 bg-transparent text-[13px] font-medium text-(--text) outline-none placeholder:text-(--faint)"
            />
          </div>
          <p className="mt-2 text-[11.5px] font-medium text-(--muted)">
            {loading
              ? "Loading…"
              : `${matchedCount} item${matchedCount === 1 ? "" : "s"} from ${stallCount} Generic-Items stall${stallCount === 1 ? "" : "s"}`}
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {loading && items.length === 0 ? (
            <p className="py-10 text-center text-[13px] font-medium text-(--muted)">
              Loading sample items…
            </p>
          ) : error ? (
            <p className="py-10 text-center text-[13px] font-semibold text-(--orange)">{error}</p>
          ) : groups.length === 0 ? (
            <p className="py-10 text-center text-[13px] font-medium text-(--muted)">
              {items.length === 0
                ? "No Generic-Items stall has any items yet."
                : "No item matches this search."}
            </p>
          ) : (
            <div className="flex flex-col gap-5">
              {groups.map(([group, rows]) => (
                <div key={group}>
                  <p className="font-vcr mb-2 text-[9.5px] tracking-[0.15em] text-(--orange)">
                    {group.toUpperCase()}
                  </p>
                  <div className="overflow-hidden rounded-[12px] border border-(--line)">
                    {rows.map((row, index) => (
                      <div
                        key={row.key}
                        className={`flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2.5 ${
                          index === 0 ? "" : "border-t border-(--line2)"
                        }`}
                      >
                        <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-(--text)">
                          {row.name}
                        </span>
                        {row.variant ? (
                          <span className="font-vcr rounded-full bg-(--chip) px-2 py-0.5 text-[10px] tracking-[0.08em] text-(--muted)">
                            {row.variant}
                          </span>
                        ) : null}
                        {row.type ? (
                          <span className="rounded-full bg-(--orange) px-2 py-0.5 text-[10.5px] font-semibold text-white">
                            {row.type}
                          </span>
                        ) : null}
                        <span className="font-vcr text-[11px] text-(--muted)">
                          {row.barcode || "—"}
                        </span>
                        <span className="w-16 text-right text-[13px] font-semibold text-(--text)">
                          {row.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
