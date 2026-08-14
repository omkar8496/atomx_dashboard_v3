"use client";

import { useEffect, useRef, useState } from "react";

const STALL_TYPES = ["SALE", "STOCKROOM", "BAR", "FOOD", "BEVERAGE", "KITCHEN"];
const SCAN_MODES = ["NONE", "BARCODE", "QR", "NFC", "RFID", "MENU"];
const DEVICE_VIEWS = ["GRID VIEW", "LIST VIEW"];
const BANK_PAYMENTS = ["NONE", "MSWIPE", "PAYTM", "RAZORPAY", "STRIPE"];
const MODE_OPTIONS = ["CASH", "CARD", "UPI", "COUPON", "NFC", "WALLET"];

const DEFAULT_FORM = {
  stallName: "",
  vendorName: "",
  type: "SALE",
  acceptAllModes: false,
  modeOptions: ["CASH", "CARD", "UPI", "COUPON"],
  grnMode: false,
  cashDisabled: false,
  bankPayment: "MSWIPE",
  kotLan: false,
  modeInfoMandatory: false,
  scanMode: "NONE",
  deviceMenuView: "GRID VIEW",
  showInTapX: false,
};

const FIELD_CLASS =
  "h-11 w-full rounded-[10px] border border-(--line) bg-(--surface) px-3.5 text-[13px] font-medium text-(--text) outline-none transition placeholder:text-(--faint) focus:border-(--orange) focus:shadow-[0_0_0_3px_rgba(224,68,32,0.12)] disabled:cursor-not-allowed disabled:bg-(--surface2) disabled:text-(--faint) max-[640px]:h-10";

function getStallName(stall) {
  return stall?.name ?? stall?.stallName ?? stall?.stall ?? "";
}

function getStallVendor(stall) {
  return stall?.vendorName ?? stall?.vendor?.name ?? stall?.vendor ?? "";
}

function getStallType(stall) {
  return String(stall?.type ?? "SALE").toUpperCase();
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function TapXIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v4" />
      <path d="M12 17v4" />
      <path d="M3 12h4" />
      <path d="M17 12h4" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}

function Dropdown({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-11 w-full items-center justify-between rounded-[10px] bg-[linear-gradient(135deg,#E04420,#341CD6)] px-4 text-[13px] font-semibold tracking-[0.06em] text-white transition hover:brightness-105 max-[640px]:h-10"
      >
        <span>{value}</span>
        <ChevronIcon />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-full overflow-hidden rounded-[11px] border border-(--line) bg-(--surface) shadow-(--shadowUp)">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={`block w-full px-4 py-2.5 text-left text-[13px] font-semibold tracking-[0.04em] transition hover:bg-(--surface2) ${
                value === option ? "text-(--orange)" : "text-(--text)"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ModeOptionsDropdown({ value = [], onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const toggle = (option) => {
    onChange(value.includes(option) ? value.filter((item) => item !== option) : [...value, option]);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex min-h-11 w-full items-center gap-2 rounded-[10px] border border-(--line) bg-(--surface) px-3 text-left text-(--text) transition hover:border-(--orange) focus:border-(--orange) focus:outline-none"
      >
        <div className="flex flex-1 flex-wrap gap-1.5 py-1.5">
          {value.length === 0 ? (
            <span className="text-[13px] font-medium text-(--faint)">Select modes</span>
          ) : (
            value.map((option) => (
              <span
                key={option}
                className="font-vcr flex items-center gap-1 rounded-full bg-[rgba(224,68,32,0.08)] px-2.5 py-0.5 text-[10px] text-(--orange)"
              >
                {option}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(option);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      toggle(option);
                    }
                  }}
                  className="text-(--orange)/70 hover:text-(--orange)"
                >
                  ×
                </span>
              </span>
            ))
          )}
        </div>
        <ChevronIcon />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-full overflow-hidden rounded-[11px] border border-(--line) bg-(--surface) shadow-(--shadowUp)">
          {MODE_OPTIONS.map((option) => {
            const checked = value.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => toggle(option)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13px] font-semibold transition hover:bg-(--surface2)"
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                    checked ? "border-(--orange) bg-(--orange) text-white" : "border-(--line) bg-(--surface2) text-transparent"
                  }`}
                >
                  <CheckIcon />
                </span>
                <span className={checked ? "text-(--orange)" : "text-(--text)"}>{option}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SegmentedChoice({ active, leftLabel, rightLabel, onChange }) {
  return (
    <div className="grid h-11 grid-cols-2 overflow-hidden rounded-full border border-(--line) bg-(--surface2) p-1 max-[640px]:h-10">
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`rounded-full px-3 text-[12.5px] font-semibold transition ${
          !active ? "bg-(--surface) text-(--orange) shadow-sm" : "text-(--muted) hover:text-(--text)"
        }`}
      >
        {leftLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`rounded-full px-3 text-[12.5px] font-semibold transition ${
          active ? "bg-[linear-gradient(135deg,#E04420,#341CD6)] text-white" : "text-(--muted) hover:text-(--text)"
        }`}
      >
        {rightLabel}
      </button>
    </div>
  );
}

function SettingChip({ label, active, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={`flex h-11 items-center justify-between gap-3 rounded-[10px] border px-3.5 text-left transition max-[640px]:h-10 ${
        active
          ? "border-(--orange) bg-[rgba(224,68,32,0.06)] text-(--text)"
          : "border-(--line) bg-(--surface) text-(--muted) hover:border-(--orange)"
      }`}
    >
      <span className="truncate text-[12.5px] font-semibold">{label}</span>
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
          active ? "border-(--orange) bg-(--orange) text-white" : "border-(--line) bg-(--surface2) text-transparent"
        }`}
      >
        <CheckIcon />
      </span>
    </button>
  );
}

function SectionDivider({ icon, label }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-(--orange)/25 to-(--purple)/40" />
      <span className="font-vcr flex items-center gap-1.5 text-[9px] uppercase tracking-[0.16em] text-(--muted)">
        {icon}
        {label}
      </span>
      <div className="h-px flex-1 bg-gradient-to-r from-(--purple)/40 via-(--orange)/25 to-transparent" />
    </div>
  );
}

function FormRow({ label, children }) {
  return (
    <div className="grid grid-cols-[170px_1fr] items-center gap-4 max-sm:grid-cols-1 max-sm:gap-1.5">
      <span className="text-right text-[13px] font-medium text-(--muted) max-sm:text-left">
        {label}
      </span>
      <div>{children}</div>
    </div>
  );
}

function FieldGrid({ children }) {
  return <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">{children}</div>;
}

function FieldGroup({ label, children }) {
  return (
    <div>
      <div className="font-vcr mb-1.5 text-[8.5px] uppercase tracking-[0.16em] text-(--muted)">
        {label}
      </div>
      {children}
    </div>
  );
}

function SettingsGrid({ children }) {
  return <div className="grid grid-cols-2 gap-2.5 max-sm:grid-cols-1">{children}</div>;
}

function ImageUploadRow() {
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  };

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="flex h-11 w-full items-center gap-3 rounded-[10px] border border-dashed border-(--line) bg-(--surface2) px-3.5 text-[13px] font-semibold text-(--muted) transition hover:border-(--orange) hover:text-(--orange)"
    >
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Stall banner preview" className="h-7 w-12 rounded-md border border-(--line) object-cover" />
      ) : (
        <span className="text-(--orange)">
          <ImageIcon />
        </span>
      )}
      <span>{preview ? "Change Image" : "Upload Image"}</span>
    </button>
  );
}

export default function EditStallModal({ stall, onClose, onConfirm }) {
  const [form, setForm] = useState({
    ...DEFAULT_FORM,
    stallName: getStallName(stall),
    vendorName: getStallVendor(stall),
    type: getStallType(stall),
  });
  const overlayRef = useRef(null);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handler);
    };
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose?.();
      }}
      className="fixed inset-0 z-[200] flex items-center justify-center overscroll-none bg-[rgba(12,12,12,0.5)] px-4 py-6 backdrop-blur-[3px] max-[640px]:p-0"
    >
      <div className="flex max-h-[calc(100dvh-48px)] w-full max-w-[820px] flex-col overflow-hidden rounded-[16px] border border-(--line) bg-(--surface) shadow-(--shadowUp) max-[640px]:h-full max-[640px]:max-h-full max-[640px]:rounded-none">
        <div
          className="relative shrink-0 overflow-hidden px-7 py-4 max-[640px]:px-4"
          style={{ background: "linear-gradient(120deg,#1C1C1C 0%,#341CD6 62%,#E04420 130%)" }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{ background: "repeating-linear-gradient(90deg,#fff 0 1px,transparent 1px 46px)" }}
            aria-hidden
          />
          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-vcr m-0 text-[9px] uppercase tracking-[0.2em] text-(--purple)">Edit Stall</p>
              <h2 className="font-chillax m-0 mt-1 truncate text-[clamp(20px,2.4vw,26px)] font-semibold tracking-[-0.01em] text-white">
                {form.stallName || "Stall"}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] border border-white/20 text-white/80 transition hover:border-(--orange) hover:bg-(--orange)"
              aria-label="Close edit stall modal"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-7 py-5 max-[640px]:px-4">
          <FieldGrid>
            <FieldGroup label="Vendor">
              <input type="text" value={form.vendorName} onChange={() => {}} disabled className={FIELD_CLASS} />
            </FieldGroup>
            <FieldGroup label="Stall Name">
              <input type="text" value={form.stallName} onChange={(e) => set("stallName", e.target.value)} className={FIELD_CLASS} />
            </FieldGroup>
            <FieldGroup label="Stall Banner">
              <ImageUploadRow />
            </FieldGroup>
            <FieldGroup label="Type">
              <Dropdown value={form.type} onChange={(value) => set("type", value)} options={STALL_TYPES} />
            </FieldGroup>
          </FieldGrid>

          <FormRow label="Payment Modes">
            <SegmentedChoice
              active={form.acceptAllModes}
              leftLabel="Only NFC"
              rightLabel="Accept All Modes"
              onChange={(value) => set("acceptAllModes", value)}
            />
          </FormRow>

          <FormRow label="Mode Options">
            <ModeOptionsDropdown value={form.modeOptions} onChange={(value) => set("modeOptions", value)} />
          </FormRow>

          <FormRow label="Stall Settings">
            <SettingsGrid>
              <SettingChip label="GRN Mode" active={form.grnMode} onToggle={() => set("grnMode", !form.grnMode)} />
              <SettingChip label="Cash Disabled" active={form.cashDisabled} onToggle={() => set("cashDisabled", !form.cashDisabled)} />
              <SettingChip label="KOT LAN" active={form.kotLan} onToggle={() => set("kotLan", !form.kotLan)} />
              <SettingChip label="Mode Info Mandatory" active={form.modeInfoMandatory} onToggle={() => set("modeInfoMandatory", !form.modeInfoMandatory)} />
            </SettingsGrid>
          </FormRow>

          <FieldGrid>
            <FieldGroup label="Bank Payment">
              <Dropdown value={form.bankPayment} onChange={(value) => set("bankPayment", value)} options={BANK_PAYMENTS} />
            </FieldGroup>
            <FieldGroup label="Scan Mode">
              <Dropdown value={form.scanMode} onChange={(value) => set("scanMode", value)} options={SCAN_MODES} />
            </FieldGroup>
            <FieldGroup label="Device Menu View">
              <Dropdown value={form.deviceMenuView} onChange={(value) => set("deviceMenuView", value)} options={DEVICE_VIEWS} />
            </FieldGroup>
          </FieldGrid>

          <SectionDivider icon={<TapXIcon />} label="TapX Items" />

          <FormRow label="TapX">
            <SettingsGrid>
              <SettingChip label="Show in TapX" active={form.showInTapX} onToggle={() => set("showInTapX", !form.showInTapX)} />
            </SettingsGrid>
          </FormRow>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2.5 border-t border-(--line) bg-(--surface2) px-7 py-4 max-[640px]:grid max-[640px]:grid-cols-2 max-[640px]:px-4">
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 items-center justify-center rounded-[10px] border border-(--line) bg-(--surface) px-6 text-[13.5px] font-semibold text-(--muted) transition hover:border-(--orange) hover:text-(--orange)"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm?.(form)}
            className="flex h-11 items-center justify-center rounded-[10px] bg-(--text) px-7 text-[13.5px] font-semibold text-(--bg) transition hover:bg-(--orange)"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
