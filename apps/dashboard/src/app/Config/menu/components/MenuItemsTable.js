"use client";

import { useEffect, useRef, useState } from "react";
import {
  PlusIcon,
  SearchIcon,
  BarcodeIcon,
  ImageUploadIcon,
  ChevronDownIcon,
  TagIcon,
  CloudUploadIcon,
  DownloadIcon,
  GripVerticalIcon
} from "./MenuIcons";

const ITEM_TYPES = ["FOOD", "BEVERAGE", "NON-FOOD", "COMBO", "OTHER"];
const ITEM_TAGS = ["VEG", "NON-VEG", "VEGAN", "SPICY", "GLUTEN-FREE"];

const INPUT_CLASS =
  "rounded-[8px] border border-(--line) bg-(--surface) px-2.5 py-1.5 text-[13px] font-medium text-(--text) outline-none transition placeholder:text-(--faint) focus:border-(--orange) focus:shadow-[0_0_0_3px_rgba(224,68,32,0.12)]";

const SUB_INPUT_CLASS =
  "font-vcr rounded-[8px] border border-(--line) bg-(--surface2) px-2.5 py-1.5 text-[11px] uppercase tracking-[0.06em] text-(--muted) outline-none transition placeholder:text-(--faint) focus:border-(--orange) focus:shadow-[0_0_0_3px_rgba(224,68,32,0.12)]";

const TH_CLASS = "font-vcr pb-2.5 pr-3 text-[9.5px] tracking-[0.15em] text-(--orange)";

function SmallToggle({ active, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 ${
        active ? "bg-[linear-gradient(135deg,#E04420,#341CD6)]" : "bg-(--line)"
      }`}
    >
      <span
        className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          active ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function TypeDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex h-7 items-center gap-1 rounded-full bg-(--orange) px-2.5 text-[11px] font-semibold text-white transition hover:brightness-105"
      >
        <span className="max-w-[68px] truncate">{value}</span>
        <ChevronDownIcon className="h-3 w-3 shrink-0" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-[110px] overflow-hidden rounded-[10px] border border-(--line) bg-(--surface) shadow-(--shadowUp)">
          {ITEM_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => { onChange(type); setOpen(false); }}
              className={`block w-full px-3 py-2 text-left text-[12.5px] font-semibold transition hover:bg-(--surface2) ${
                value === type ? "text-(--orange)" : "text-(--text)"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TagsDropdown({ value = [], onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const label = value.length > 0 ? value[0] : "Select";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex h-7 items-center gap-1 rounded-full bg-(--orange) px-2.5 text-[11px] font-semibold text-white transition hover:brightness-105"
      >
        <span className="max-w-[60px] truncate">{label}</span>
        <ChevronDownIcon className="h-3 w-3 shrink-0" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-[140px] overflow-hidden rounded-[10px] border border-(--line) bg-(--surface) shadow-(--shadowUp)">
          {ITEM_TAGS.map((tag) => {
            const checked = value.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  onChange(checked ? value.filter((t) => t !== tag) : [...value, tag]);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12.5px] font-semibold transition hover:bg-(--surface2)"
              >
                <span
                  className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
                    checked ? "border-(--orange) bg-(--orange)" : "border-(--line)"
                  }`}
                >
                  {checked && (
                    <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  )}
                </span>
                <span className={checked ? "text-(--orange)" : "text-(--text)"}>{tag}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ItemRow({
  item,
  onUpdate,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging,
  dropPosition
}) {
  return (
    <tbody
      onDragOver={(event) => onDragOver(event, item.id)}
      onDrop={(event) => onDrop(event, item.id)}
      className={`transition-opacity ${isDragging ? "opacity-45" : "opacity-100"}`}
    >
      <tr className={`border-b border-(--line2) ${dropPosition === "before" ? "border-t-2 border-t-(--orange)" : ""}`}>
        <td className="py-3 pr-3">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              draggable
              onDragStart={(event) => onDragStart(event, item.id)}
              onDragEnd={onDragEnd}
              className="flex h-8 w-7 shrink-0 cursor-grab items-center justify-center rounded-md text-(--faint) transition hover:bg-(--chip) hover:text-(--orange) active:cursor-grabbing"
              aria-label={`Reorder ${item.name || "item"}`}
              title="Drag to reorder"
            >
              <GripVerticalIcon className="h-4 w-4" />
            </button>
            <input
              type="text"
              value={item.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="item name"
              className={`w-[150px] ${INPUT_CLASS}`}
            />
          </div>
        </td>
        <td className="py-3 pr-3">
          <input type="number" value={item.price} onChange={(e) => onUpdate({ price: Number(e.target.value) })} className={`w-16 ${INPUT_CLASS}`} />
        </td>
        <td className="py-3 pr-3">
          <input type="number" value={item.happy ?? 0} onChange={(e) => onUpdate({ happy: Number(e.target.value) })} className={`w-16 ${INPUT_CLASS}`} />
        </td>
        <td className="py-3 pr-3">
          <input type="text" value={item.hsn ?? ""} onChange={(e) => onUpdate({ hsn: e.target.value })} className={`w-20 ${INPUT_CLASS}`} />
        </td>
        <td className="py-3 pr-3">
          <input type="text" value={item.barcode ?? ""} onChange={(e) => onUpdate({ barcode: e.target.value })} placeholder="barcode" className={`w-24 ${INPUT_CLASS}`} />
        </td>
        <td className="py-3 pr-3">
          <input type="text" value={item.epc ?? ""} onChange={(e) => onUpdate({ epc: e.target.value })} placeholder="epc" className={`w-24 ${INPUT_CLASS}`} />
        </td>
        <td className="py-3 pr-3">
          <TypeDropdown value={item.type ?? "FOOD"} onChange={(val) => onUpdate({ type: val })} />
        </td>
        <td className="py-3 pr-3">
          <TagsDropdown value={item.tags ?? []} onChange={(val) => onUpdate({ tags: val })} />
        </td>
        <td className="py-3 pr-3">
          <SmallToggle active={item.active} onToggle={() => onUpdate({ active: !item.active })} />
        </td>
        <td className="py-3">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-dashed border-(--line) bg-(--surface) text-(--faint) transition hover:border-(--orange) hover:text-(--orange)"
            aria-label="Upload image"
          >
            <ImageUploadIcon className="h-4 w-4" />
          </button>
        </td>
      </tr>

      <tr className={`border-b border-(--line2) ${dropPosition === "after" ? "border-b-2 border-b-(--orange)" : ""}`}>
        <td colSpan={10} className="pb-3 pt-0">
          <div className="flex flex-wrap items-center gap-2 pl-1">
            <input type="text" value={item.supplierCode ?? ""} onChange={(e) => onUpdate({ supplierCode: e.target.value })} placeholder="SUPPLIER CODE" className={`w-[130px] ${SUB_INPUT_CLASS}`} />
            <input type="text" value={item.groupId ?? ""} onChange={(e) => onUpdate({ groupId: e.target.value })} placeholder="GROUP-ID" className={`w-[100px] ${SUB_INPUT_CLASS}`} />
            <input type="text" value={item.variant ?? ""} onChange={(e) => onUpdate({ variant: e.target.value })} placeholder="VARIANT" className={`w-[100px] ${SUB_INPUT_CLASS}`} />
            <input type="text" value={item.colour ?? ""} onChange={(e) => onUpdate({ colour: e.target.value })} placeholder="COLOUR" className={`w-[100px] ${SUB_INPUT_CLASS}`} />
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[rgba(224,68,32,0.08)] text-(--orange) transition hover:bg-[rgba(224,68,32,0.14)]"
              aria-label="Upload item image"
            >
              <ImageUploadIcon className="h-5 w-5" />
            </button>
          </div>
        </td>
      </tr>
    </tbody>
  );
}

export default function MenuItemsTable({
  items,
  onItemUpdate,
  onReorderItems,
  onAddItem,
  inactiveItems,
  onToggleInactiveItems
}) {
  const [search, setSearch] = useState("");
  const [draggedItemId, setDraggedItemId] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  const filtered = (items ?? []).filter(
    (item) => !search || item.name.toLowerCase().includes(search.toLowerCase())
  );

  const clearDragState = () => {
    setDraggedItemId(null);
    setDropTarget(null);
  };

  const handleDragStart = (event, itemId) => {
    setDraggedItemId(itemId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(itemId));
  };

  const handleDragOver = (event, itemId) => {
    event.preventDefault();
    if (draggedItemId == null || draggedItemId === itemId) {
      setDropTarget(null);
      return;
    }

    event.dataTransfer.dropEffect = "move";
    const bounds = event.currentTarget.getBoundingClientRect();
    const placement = event.clientY < bounds.top + bounds.height / 2 ? "before" : "after";
    setDropTarget({ itemId, placement });
  };

  const handleDrop = (event, targetId) => {
    event.preventDefault();
    const rawSourceId = event.dataTransfer.getData("text/plain");
    const sourceItem = (items ?? []).find((item) => String(item.id) === rawSourceId);
    const sourceId = sourceItem?.id ?? draggedItemId;
    const placement = dropTarget?.itemId === targetId ? dropTarget.placement : "before";

    if (sourceId != null && sourceId !== targetId) {
      onReorderItems?.(sourceId, targetId, placement);
    }
    clearDragState();
  };

  return (
    <div className="flex flex-col">
      {/* Items action bar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-(--line2) px-5 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onAddItem}
            className="flex h-9 items-center gap-1.5 rounded-[8px] bg-(--text) px-3 text-[12.5px] font-semibold text-(--bg) transition hover:bg-(--orange)"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            ITEM
          </button>

          <div className="flex items-center gap-2 text-[12.5px] font-semibold text-(--muted)">
            Inactive Items:
            <button
              type="button"
              onClick={onToggleInactiveItems}
              aria-pressed={inactiveItems}
              className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 ${
                inactiveItems ? "bg-[linear-gradient(135deg,#E04420,#341CD6)]" : "bg-(--line)"
              }`}
            >
              <span
                className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  inactiveItems ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <button
            type="button"
            className="flex h-9 items-center gap-1.5 rounded-[8px] bg-(--text) px-3 text-[12.5px] font-semibold text-(--bg) transition hover:bg-(--orange)"
          >
            <TagIcon className="h-3.5 w-3.5" />
            SET TYPE
          </button>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-9 items-center gap-1.5 rounded-[8px] bg-[linear-gradient(135deg,#E04420,#341CD6)] px-3 text-[12.5px] font-semibold text-white transition hover:brightness-105"
          >
            <CloudUploadIcon className="h-3.5 w-3.5" />
            Menu
          </button>
          <button
            type="button"
            className="flex h-9 items-center gap-1.5 rounded-[8px] border border-(--orange) bg-(--surface) px-3 text-[12.5px] font-semibold text-(--orange) transition hover:bg-[rgba(224,68,32,0.06)]"
          >
            <DownloadIcon className="h-3.5 w-3.5" />
            Sample
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-5 py-3">
        <div className="flex items-center gap-2.5 rounded-[10px] border border-(--line) bg-(--surface) px-3 py-2.5 transition focus-within:border-(--orange)">
          <SearchIcon className="h-4 w-4 shrink-0 text-(--muted) opacity-60" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Items"
            className="min-w-0 flex-1 bg-transparent text-[13px] font-medium text-(--text) outline-none placeholder:text-(--faint)"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto px-5 pb-5">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-(--line)">
              <th className={TH_CLASS}>ITEM</th>
              <th className={TH_CLASS}>PRICE</th>
              <th className={TH_CLASS}>HAPPY</th>
              <th className={TH_CLASS}>HSN</th>
              <th className="pb-2.5 pr-3">
                <BarcodeIcon className="h-4 w-4 text-(--orange)" />
              </th>
              <th className="pb-2.5 pr-3">
                <div className="font-vcr flex items-center gap-1 text-[9.5px] tracking-[0.15em] text-(--orange)">
                  <BarcodeIcon className="h-4 w-4" />
                  EPC
                </div>
              </th>
              <th className={TH_CLASS}>TYPE</th>
              <th className={TH_CLASS}>TAGS</th>
              <th className={TH_CLASS}>STATUS</th>
              <th className="font-vcr pb-2.5 text-[9.5px] tracking-[0.15em] text-(--orange)">IMAGE</th>
            </tr>
          </thead>
          {filtered.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={10} className="py-12 text-center text-[13px] font-medium text-(--muted)">
                  No items found. Click <span className="text-(--orange)">+ ITEM</span> to add one.
                </td>
              </tr>
            </tbody>
          ) : (
            filtered.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                onUpdate={(updates) => onItemUpdate?.(item.id, updates)}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={clearDragState}
                isDragging={draggedItemId === item.id}
                dropPosition={dropTarget?.itemId === item.id ? dropTarget.placement : null}
              />
            ))
          )}
        </table>
      </div>
    </div>
  );
}
