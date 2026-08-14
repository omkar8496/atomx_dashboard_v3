"use client";

import { useEffect, useRef, useState } from "react";

const STALL_TYPES = ["TOPUP", "SALE", "ACCESSX", "INVENTORY", "STOCKMASTER", "TABLES"];
const SCAN_MODES = ["NONE", "MENU", "TICKET"];
const PAYMENT_MODE_OPTIONS = ["cash", "card", "coupon"];
const NFC_SETTINGS = ["LOGIC"];
const QR_SETTINGS = ["OFF"];

const DEFAULT_FORM = {
  stallName: "",
  type: "SALE",
  acceptAllModes: false,
  paymentModes: ["cash", "card", "coupon"],
  grnMode: false,
  cashDisabled: false,
  kotLan: false,
  modeInfoMandatory: false,
  scanMode: "NONE",
  showInTapX: false,
  showPrice: false,
  addToCart: false,
  nfcSetting: "LOGIC",
  qrSetting: "OFF",
  locationId: "",
  eventMatchId: "",
  useOnlineTopups: false,
  useInOutLogic: false,
  fetchDetails: false,
  checkOnlineUnique: false,
};

const FIELD_CLASS =
  "h-11 w-full rounded-[10px] border border-(--line) bg-(--surface) px-3.5 text-[13px] font-medium text-(--text) outline-none transition placeholder:text-(--faint) focus:border-(--orange) focus:shadow-[0_0_0_3px_rgba(224,68,32,0.12)] max-[640px]:h-10";

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

function AccessXIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 4 7v6c0 5 3.4 7.4 8 8 4.6-.6 8-3 8-8V7l-8-4Z" />
      <path d="m9 12 2 2 4-5" />
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

function PaymentModeOptions({ selected, onToggle }) {
  return (
    <div className="grid grid-cols-3 gap-2.5 max-sm:grid-cols-1">
      {PAYMENT_MODE_OPTIONS.map((mode) => {
        const active = selected.includes(mode);
        const label = mode.charAt(0).toUpperCase() + mode.slice(1);
        return <SettingChip key={mode} label={label} active={active} onToggle={() => onToggle(mode)} />;
      })}
    </div>
  );
}

function StallDropdown({ value, onChange, options }) {
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

function SettingsGrid({ children }) {
  return <div className="grid grid-cols-2 gap-2.5 max-sm:grid-cols-1">{children}</div>;
}

export default function CreateStallModal({ vendorName = "", vendorType = "", onClose, onConfirm }) {
  const [form, setForm] = useState({ ...DEFAULT_FORM, stallName: vendorName });
  const overlayRef = useRef(null);
  const isAccessXVendor =
    String(vendorType || "").toUpperCase() === "ACCESSX" ||
    String(vendorName || "").toUpperCase() === "ACCESSX";

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const setAcceptAllModes = (value) => {
    setForm((prev) => ({
      ...prev,
      acceptAllModes: value,
      paymentModes: value ? [...PAYMENT_MODE_OPTIONS] : prev.paymentModes,
    }));
  };
  const togglePaymentMode = (mode) => {
    setForm((prev) => {
      const hasMode = prev.paymentModes.includes(mode);
      if (hasMode && prev.paymentModes.length === 1) return prev;
      return {
        ...prev,
        paymentModes: hasMode
          ? prev.paymentModes.filter((item) => item !== mode)
          : [...prev.paymentModes, mode],
      };
    });
  };
  const toggleTapX = () => {
    setForm((prev) => ({
      ...prev,
      showInTapX: !prev.showInTapX,
      showPrice: prev.showInTapX ? false : prev.showPrice,
      addToCart: prev.showInTapX ? false : prev.addToCart,
    }));
  };
  const toggleShowPrice = () => {
    setForm((prev) => ({
      ...prev,
      showPrice: !prev.showPrice,
      addToCart: prev.showPrice ? false : prev.addToCart,
    }));
  };

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
      <div className="flex max-h-[calc(100dvh-48px)] w-full max-w-[760px] flex-col overflow-hidden rounded-[16px] border border-(--line) bg-(--surface) shadow-(--shadowUp) max-[640px]:h-full max-[640px]:max-h-full max-[640px]:rounded-none">
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
              <p className="font-vcr m-0 text-[9px] uppercase tracking-[0.2em] text-(--purple)">Stall Setup</p>
              <h2 className="font-chillax m-0 mt-1 truncate text-[clamp(20px,2.4vw,26px)] font-semibold tracking-[-0.01em] text-white">
                Create Stall{vendorName ? ` for ${vendorName}` : ""}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] border border-white/20 text-white/80 transition hover:border-(--orange) hover:bg-(--orange)"
              aria-label="Close create stall modal"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto px-7 py-5 max-[640px]:px-4">
          <FormRow label="Stall Name">
            <input type="text" value={form.stallName} onChange={(e) => set("stallName", e.target.value)} className={FIELD_CLASS} />
          </FormRow>

          <FormRow label="Type">
            <StallDropdown value={form.type} onChange={(value) => set("type", value)} options={STALL_TYPES} />
          </FormRow>

          <FormRow label="Payment Modes">
            <SegmentedChoice active={form.acceptAllModes} leftLabel="Only NFC" rightLabel="Accept All Modes" onChange={setAcceptAllModes} />
          </FormRow>

          {form.acceptAllModes && (
            <FormRow label="Mode Options">
              <PaymentModeOptions selected={form.paymentModes} onToggle={togglePaymentMode} />
            </FormRow>
          )}

          <FormRow label="Stall Settings">
            <SettingsGrid>
              <SettingChip label="GRN Mode" active={form.grnMode} onToggle={() => set("grnMode", !form.grnMode)} />
              <SettingChip label="Cash Disabled" active={form.cashDisabled} onToggle={() => set("cashDisabled", !form.cashDisabled)} />
              <SettingChip label="KOT LAN" active={form.kotLan} onToggle={() => set("kotLan", !form.kotLan)} />
              <SettingChip label="Mode Info Mandatory" active={form.modeInfoMandatory} onToggle={() => set("modeInfoMandatory", !form.modeInfoMandatory)} />
            </SettingsGrid>
          </FormRow>

          <FormRow label="Scan Mode">
            <StallDropdown value={form.scanMode} onChange={(value) => set("scanMode", value)} options={SCAN_MODES} />
          </FormRow>

          <SectionDivider icon={<TapXIcon />} label="TapX Items" />

          <FormRow label="TapX">
            <SettingsGrid>
              <SettingChip label="Show in TapX" active={form.showInTapX} onToggle={toggleTapX} />
              {form.showInTapX && (
                <SettingChip label="Show Price" active={form.showPrice} onToggle={toggleShowPrice} />
              )}
              {form.showInTapX && form.showPrice && (
                <SettingChip label="Add to Cart" active={form.addToCart} onToggle={() => set("addToCart", !form.addToCart)} />
              )}
            </SettingsGrid>
          </FormRow>

          {isAccessXVendor && (
            <>
              <SectionDivider icon={<AccessXIcon />} label="AccessX Settings" />

              <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                <FormRow label="NFC Setting">
                  <StallDropdown value={form.nfcSetting} onChange={(value) => set("nfcSetting", value)} options={NFC_SETTINGS} />
                </FormRow>
                <FormRow label="QR Setting">
                  <StallDropdown value={form.qrSetting} onChange={(value) => set("qrSetting", value)} options={QR_SETTINGS} />
                </FormRow>
              </div>

              <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                <FormRow label="Location ID">
                  <input type="text" value={form.locationId} onChange={(e) => set("locationId", e.target.value)} className={FIELD_CLASS} />
                </FormRow>
                <FormRow label="Event/Match ID">
                  <input type="text" value={form.eventMatchId} onChange={(e) => set("eventMatchId", e.target.value)} className={FIELD_CLASS} />
                </FormRow>
              </div>

              <FormRow label="Access Controls">
                <SettingsGrid>
                  <SettingChip label="Use Online Topups" active={form.useOnlineTopups} onToggle={() => set("useOnlineTopups", !form.useOnlineTopups)} />
                  <SettingChip label="Use In-Out Logic" active={form.useInOutLogic} onToggle={() => set("useInOutLogic", !form.useInOutLogic)} />
                  <SettingChip label="Fetch Details" active={form.fetchDetails} onToggle={() => set("fetchDetails", !form.fetchDetails)} />
                  <SettingChip label="Check Online Unique" active={form.checkOnlineUnique} onToggle={() => set("checkOnlineUnique", !form.checkOnlineUnique)} />
                </SettingsGrid>
              </FormRow>
            </>
          )}
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
