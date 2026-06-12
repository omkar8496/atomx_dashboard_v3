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
  DownloadIcon
} from "./MenuIcons";

const ITEM_TYPES = ["FOOD", "BEVERAGE", "NON-FOOD", "COMBO", "OTHER"];
const ITEM_TAGS = ["VEG", "NON-VEG", "VEGAN", "SPICY", "GLUTEN-FREE"];

function SmallToggle({ active, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 ${
        active ? "bg-[linear-gradient(135deg,#E04420,#341CD6)]" : "bg-[#dce3ed]"
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
        className="flex h-7 items-center gap-1 rounded-full bg-[#E04420] px-2.5 text-[0.68rem] font-bold text-white transition hover:brightness-105"
      >
        <span className="max-w-[68px] truncate">{value}</span>
        <ChevronDownIcon className="h-3 w-3 shrink-0" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-[110px] overflow-hidden rounded-lg border border-[#eeeeee] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.12)]">
          {ITEM_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => { onChange(type); setOpen(false); }}
              className={`block w-full px-3 py-2 text-left text-[0.75rem] font-semibold transition hover:bg-[#fff5ec] ${
                value === type ? "text-[#E04420]" : "text-[#333333]"
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
        className="flex h-7 items-center gap-1 rounded-full bg-[#E04420] px-2.5 text-[0.68rem] font-bold text-white transition hover:brightness-105"
      >
        <span className="max-w-[60px] truncate">{label}</span>
        <ChevronDownIcon className="h-3 w-3 shrink-0" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-[140px] overflow-hidden rounded-lg border border-[#eeeeee] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.12)]">
          {ITEM_TAGS.map((tag) => {
            const checked = value.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  onChange(checked ? value.filter((t) => t !== tag) : [...value, tag]);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[0.75rem] font-semibold transition hover:bg-[#fff5ec]"
              >
                <span
                  className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
                    checked
                      ? "border-[#E04420] bg-[#E04420]"
                      : "border-[#cfd6e2]"
                  }`}
                >
                  {checked && (
                    <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  )}
                </span>
                <span className={checked ? "text-[#E04420]" : "text-[#333333]"}>
                  {tag}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ItemRow({ item, onUpdate }) {
  return (
    <>
      <tr className="border-b border-[#f3f3f3]">
        {/* Item name */}
        <td className="py-3 pr-3">
          <input
            type="text"
            value={item.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="item name"
            className="w-[150px] rounded-md border border-[#dedede] bg-white px-2.5 py-1.5 text-[0.82rem] font-medium text-[#1C1C1C] outline-none focus:border-[#E04420] focus:ring-2 focus:ring-[#E04420]/10 transition"
          />
        </td>
        {/* Price */}
        <td className="py-3 pr-3">
          <input
            type="number"
            value={item.price}
            onChange={(e) => onUpdate({ price: Number(e.target.value) })}
            className="w-16 rounded-md border border-[#dedede] bg-white px-2.5 py-1.5 text-[0.82rem] font-medium text-[#1C1C1C] outline-none focus:border-[#E04420] focus:ring-2 focus:ring-[#E04420]/10 transition"
          />
        </td>
        {/* Happy */}
        <td className="py-3 pr-3">
          <input
            type="number"
            value={item.happy ?? 0}
            onChange={(e) => onUpdate({ happy: Number(e.target.value) })}
            className="w-16 rounded-md border border-[#dedede] bg-white px-2.5 py-1.5 text-[0.82rem] font-medium text-[#1C1C1C] outline-none focus:border-[#E04420] focus:ring-2 focus:ring-[#E04420]/10 transition"
          />
        </td>
        {/* HSN */}
        <td className="py-3 pr-3">
          <input
            type="text"
            value={item.hsn ?? ""}
            onChange={(e) => onUpdate({ hsn: e.target.value })}
            className="w-20 rounded-md border border-[#dedede] bg-white px-2.5 py-1.5 text-[0.82rem] font-medium text-[#1C1C1C] outline-none focus:border-[#E04420] focus:ring-2 focus:ring-[#E04420]/10 transition"
          />
        </td>
        {/* Barcode */}
        <td className="py-3 pr-3">
          <input
            type="text"
            value={item.barcode ?? ""}
            onChange={(e) => onUpdate({ barcode: e.target.value })}
            placeholder="barcode"
            className="w-24 rounded-md border border-[#dedede] bg-white px-2.5 py-1.5 text-[0.82rem] font-medium text-[#1C1C1C] outline-none focus:border-[#E04420] focus:ring-2 focus:ring-[#E04420]/10 transition"
          />
        </td>
        {/* EPC */}
        <td className="py-3 pr-3">
          <input
            type="text"
            value={item.epc ?? ""}
            onChange={(e) => onUpdate({ epc: e.target.value })}
            placeholder="epc"
            className="w-24 rounded-md border border-[#dedede] bg-white px-2.5 py-1.5 text-[0.82rem] font-medium text-[#1C1C1C] outline-none focus:border-[#E04420] focus:ring-2 focus:ring-[#E04420]/10 transition"
          />
        </td>
        {/* Type */}
        <td className="py-3 pr-3">
          <TypeDropdown
            value={item.type ?? "FOOD"}
            onChange={(val) => onUpdate({ type: val })}
          />
        </td>
        {/* Tags */}
        <td className="py-3 pr-3">
          <TagsDropdown
            value={item.tags ?? []}
            onChange={(val) => onUpdate({ tags: val })}
          />
        </td>
        {/* Status */}
        <td className="py-3 pr-3">
          <SmallToggle active={item.active} onToggle={() => onUpdate({ active: !item.active })} />
        </td>
        {/* Image */}
        <td className="py-3">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-dashed border-[#cfd6e2] bg-white text-[#9a9a9a] transition hover:border-[#E04420] hover:text-[#E04420]"
            aria-label="Upload image"
          >
            <ImageUploadIcon className="h-4 w-4" />
          </button>
        </td>
      </tr>

      {/* Sub-row: extra fields */}
      <tr className="border-b border-[#f3f3f3]">
        <td colSpan={10} className="pb-3 pt-0">
          <div className="flex flex-wrap items-center gap-2 pl-1">
            <input
              type="text"
              value={item.supplierCode ?? ""}
              onChange={(e) => onUpdate({ supplierCode: e.target.value })}
              placeholder="SUPPLIER CODE"
              className="w-[130px] rounded-md border border-[#dedede] bg-[#fafafa] px-2.5 py-1.5 text-[0.75rem] font-medium uppercase tracking-[0.06em] text-[#666666] placeholder:text-[#9a9a9a] outline-none focus:border-[#E04420] focus:ring-2 focus:ring-[#E04420]/10 transition"
            />
            <input
              type="text"
              value={item.groupId ?? ""}
              onChange={(e) => onUpdate({ groupId: e.target.value })}
              placeholder="GROUP-ID"
              className="w-[100px] rounded-md border border-[#dedede] bg-[#fafafa] px-2.5 py-1.5 text-[0.75rem] font-medium uppercase tracking-[0.06em] text-[#666666] placeholder:text-[#9a9a9a] outline-none focus:border-[#E04420] focus:ring-2 focus:ring-[#E04420]/10 transition"
            />
            <input
              type="text"
              value={item.variant ?? ""}
              onChange={(e) => onUpdate({ variant: e.target.value })}
              placeholder="VARIANT"
              className="w-[100px] rounded-md border border-[#dedede] bg-[#fafafa] px-2.5 py-1.5 text-[0.75rem] font-medium uppercase tracking-[0.06em] text-[#666666] placeholder:text-[#9a9a9a] outline-none focus:border-[#E04420] focus:ring-2 focus:ring-[#E04420]/10 transition"
            />
            <input
              type="text"
              value={item.colour ?? ""}
              onChange={(e) => onUpdate({ colour: e.target.value })}
              placeholder="COLOUR"
              className="w-[100px] rounded-md border border-[#dedede] bg-[#fafafa] px-2.5 py-1.5 text-[0.75rem] font-medium uppercase tracking-[0.06em] text-[#666666] placeholder:text-[#9a9a9a] outline-none focus:border-[#E04420] focus:ring-2 focus:ring-[#E04420]/10 transition"
            />
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff4ef] text-[#E04420] transition hover:bg-[#ffe6dc]"
              aria-label="Upload item image"
            >
              <ImageUploadIcon className="h-5 w-5" />
            </button>
          </div>
        </td>
      </tr>
    </>
  );
}

export default function MenuItemsTable({
  items,
  onItemUpdate,
  onAddItem,
  inactiveItems,
  onToggleInactiveItems
}) {
  const [search, setSearch] = useState("");

  const filtered = (items ?? []).filter(
    (item) => !search || item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col">
      {/* Items action bar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-[#f0f0f0] px-5 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onAddItem}
            className="flex h-8 items-center gap-1.5 rounded-md bg-[#1C1C1C] px-3 text-[0.78rem] font-bold text-white transition hover:bg-[#E04420]"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            ITEM
          </button>

          <div className="flex items-center gap-2 text-[0.78rem] font-semibold text-[#555555]">
            Inactive Items:
            <button
              type="button"
              onClick={onToggleInactiveItems}
              aria-pressed={inactiveItems}
              className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 ${
                inactiveItems ? "bg-[linear-gradient(135deg,#E04420,#341CD6)]" : "bg-[#dce3ed]"
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
            className="flex h-8 items-center gap-1.5 rounded-md bg-[#1C1C1C] px-3 text-[0.78rem] font-bold text-white transition hover:bg-[#E04420]"
          >
            <TagIcon className="h-3.5 w-3.5" />
            SET TYPE
          </button>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-8 items-center gap-1.5 rounded-md bg-[linear-gradient(135deg,#E04420,#341CD6)] px-3 text-[0.78rem] font-bold text-white shadow-[0_8px_16px_rgba(52,28,214,0.16)] transition hover:brightness-105"
          >
            <CloudUploadIcon className="h-3.5 w-3.5" />
            Menu
          </button>
          <button
            type="button"
            className="flex h-8 items-center gap-1.5 rounded-md border border-[#E04420] bg-white px-3 text-[0.78rem] font-bold text-[#E04420] transition hover:bg-[#fff4ef]"
          >
            <DownloadIcon className="h-3.5 w-3.5" />
            Sample
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-5 py-3">
        <div className="flex items-center gap-2.5 rounded-lg border border-[#dedede] bg-white px-3 py-2.5 transition focus-within:border-[#E04420] focus-within:ring-2 focus-within:ring-[#E04420]/10">
          <SearchIcon className="h-4 w-4 shrink-0 text-[#9a9a9a]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Items"
            className="min-w-0 flex-1 bg-transparent text-[0.84rem] font-medium text-[#1C1C1C] outline-none placeholder:text-[#9a9a9a]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto px-5 pb-5">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-[#e8e8e8]">
              <th className="pb-2.5 pr-3 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#9d9d9d]">
                Item
              </th>
              <th className="pb-2.5 pr-3 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#9d9d9d]">
                Price
              </th>
              <th className="pb-2.5 pr-3 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#9d9d9d]">
                Happy
              </th>
              <th className="pb-2.5 pr-3 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#9d9d9d]">
                HSN
              </th>
              <th className="pb-2.5 pr-3">
                <BarcodeIcon className="h-4 w-4 text-[#9d9d9d]" />
              </th>
              <th className="pb-2.5 pr-3">
                <div className="flex items-center gap-1 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#9d9d9d]">
                  <BarcodeIcon className="h-4 w-4" />
                  EPC
                </div>
              </th>
              <th className="pb-2.5 pr-3 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#9d9d9d]">
                Type
              </th>
              <th className="pb-2.5 pr-3 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#9d9d9d]">
                TAGS
              </th>
              <th className="pb-2.5 pr-3 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#9d9d9d]">
                Status
              </th>
              <th className="pb-2.5 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#9d9d9d]">
                Image
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="py-12 text-center text-[0.85rem] font-semibold text-[#9a9a9a]"
                >
                  No items found. Click{" "}
                  <span className="text-[#E04420]">+ ITEM</span> to add one.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  onUpdate={(updates) => onItemUpdate?.(item.id, updates)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
