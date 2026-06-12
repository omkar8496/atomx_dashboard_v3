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
  "h-10 w-full rounded-[9px] border border-[#dedede] bg-white px-3.5 text-[0.82rem] font-medium text-[#1c1c1c] outline-none transition placeholder:text-[#a8a8a8] focus:border-[#E04420] focus:ring-2 focus:ring-[#E04420]/10 disabled:cursor-not-allowed disabled:bg-[#f6f6f6] disabled:text-[#9a9a9a]";

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
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function TapXIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
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
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
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
        className="flex h-10 w-full items-center justify-between rounded-full bg-[linear-gradient(135deg,#E04420,#341CD6)] px-4 text-[0.82rem] font-semibold tracking-[0.08em] text-white shadow-[0_10px_22px_rgba(52,28,214,0.22)] transition hover:brightness-105"
      >
        <span>{value}</span>
        <ChevronIcon />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-[#eadfff] bg-white shadow-[0_16px_38px_rgba(15,23,42,0.14)]">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={`block w-full px-4 py-2.5 text-left text-[0.78rem] font-semibold tracking-[0.08em] transition hover:bg-[#fff4ef] ${
                value === option ? "text-[#E04420]" : "text-[#1c1c1c]"
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
    onChange(
      value.includes(option)
        ? value.filter((item) => item !== option)
        : [...value, option]
    );
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex min-h-10 w-full items-center gap-2 rounded-[10px] border border-[#dedede] bg-white px-3 text-left text-[#1c1c1c] transition hover:border-[#D5B7FF] focus:border-[#E04420] focus:outline-none focus:ring-2 focus:ring-[#E04420]/10"
      >
        <div className="flex flex-1 flex-wrap gap-1.5 py-1.5">
          {value.length === 0 ? (
            <span className="text-[0.78rem] font-medium text-[#9a9a9a]">
              Select modes
            </span>
          ) : (
            value.map((option) => (
              <span
                key={option}
                className="flex items-center gap-1 rounded-full bg-[#fff4ef] px-2.5 py-0.5 text-[0.68rem] font-semibold text-[#E04420]"
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
                  className="text-[#E04420]/75 hover:text-[#E04420]"
                >
                  x
                </span>
              </span>
            ))
          )}
        </div>
        <ChevronIcon />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-[#eadfff] bg-white shadow-[0_16px_38px_rgba(15,23,42,0.14)]">
          {MODE_OPTIONS.map((option) => {
            const checked = value.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => toggle(option)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[0.78rem] font-semibold transition hover:bg-[#fff4ef]"
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                    checked
                      ? "border-[#E04420] bg-[#E04420] text-white"
                      : "border-[#cfd6e2] bg-[#f7f8fb] text-transparent"
                  }`}
                >
                  <CheckIcon />
                </span>
                <span className={checked ? "text-[#E04420]" : "text-[#1c1c1c]"}>
                  {option}
                </span>
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
    <div className="grid h-10 grid-cols-2 overflow-hidden rounded-full border border-[#e5e5e5] bg-[#f6f7fb] p-1">
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`rounded-full px-3 text-[0.76rem] font-semibold transition ${
          !active
            ? "bg-white text-[#E04420] shadow-sm"
            : "text-[#666666] hover:text-[#1c1c1c]"
        }`}
      >
        {leftLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`rounded-full px-3 text-[0.76rem] font-semibold transition ${
          active
            ? "bg-[linear-gradient(135deg,#E04420,#341CD6)] text-white shadow-[0_8px_16px_rgba(52,28,214,0.16)]"
            : "text-[#666666] hover:text-[#1c1c1c]"
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
      className={`flex h-10 items-center justify-between gap-3 rounded-[10px] border px-3.5 text-left transition ${
        active
          ? "border-[#D5B7FF] bg-[#fff7f3] text-[#1c1c1c] shadow-[0_8px_18px_rgba(52,28,214,0.08)]"
          : "border-[#e3e3e3] bg-white text-[#555555] hover:border-[#D5B7FF]"
      }`}
    >
      <span className="truncate text-[0.76rem] font-semibold">{label}</span>
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
          active
            ? "border-[#E04420] bg-[#E04420] text-white"
            : "border-[#cfd6e2] bg-[#f7f8fb] text-transparent"
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
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#E04420]/25 to-[#D5B7FF]/45" />
      <span className="flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#777777]">
        {icon}
        {label}
      </span>
      <div className="h-px flex-1 bg-gradient-to-r from-[#D5B7FF]/45 via-[#E04420]/25 to-transparent" />
    </div>
  );
}

function FormRow({ label, children }) {
  return (
    <div className="grid grid-cols-[170px_1fr] items-center gap-4 max-sm:grid-cols-1 max-sm:gap-1.5">
      <span className="text-right text-[0.78rem] font-medium text-[#555555] max-sm:text-left">
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
      <div className="mb-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#888888]">
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
      className="flex h-10 w-full items-center gap-3 rounded-[10px] border border-dashed border-[#D5B7FF] bg-[#fffafd] px-3.5 text-[0.78rem] font-semibold text-[#555555] transition hover:border-[#E04420] hover:text-[#E04420]"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      {preview ? (
        <img
          src={preview}
          alt="Stall banner preview"
          className="h-7 w-12 rounded-md border border-[#dedede] object-cover"
        />
      ) : (
        <span className="text-[#E04420]">
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
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose?.();
      }}
      className="fixed inset-0 z-[200] flex h-dvh items-start justify-center overflow-hidden overscroll-none bg-[#1c1c1c]/45 px-4 pb-20 pt-10 backdrop-blur-[3px]"
    >
      <style jsx global>{`
        .edit-stall-modal {
          box-sizing: border-box;
          max-height: calc(100dvh - 120px);
          display: flex;
          flex-direction: column;
        }

        .edit-stall-modal__header,
        .edit-stall-modal__footer {
          flex: 0 0 auto;
        }

        .edit-stall-modal__footer {
          min-height: 76px;
        }

        .edit-stall-modal__body {
          min-height: 0;
          max-height: calc(100dvh - 260px);
          overflow-y: auto;
          overscroll-behavior: contain;
          scrollbar-gutter: stable;
          flex: 0 1 auto;
        }

        @font-face {
          font-family: "AtomX Poppins";
          src: url("/shared/fonts/Poppins/Poppins-Regular.ttf") format("truetype");
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: "AtomX Poppins";
          src: url("/shared/fonts/Poppins/Poppins-SemiBold.ttf") format("truetype");
          font-weight: 600;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: "AtomX Poppins";
          src: url("/shared/fonts/Poppins/Poppins-Bold.ttf") format("truetype");
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }
      `}</style>

      <div className="w-full max-w-[820px]">
        <div
          className="edit-stall-modal relative w-full overflow-hidden rounded-2xl border border-[#D5B7FF]/60 bg-white font-['AtomX_Poppins',sans-serif] shadow-[0_30px_80px_rgba(15,23,42,0.24)]"
          style={{ fontFamily: '"AtomX Poppins", Poppins, sans-serif' }}
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#E04420,#D5B7FF,#341CD6)]" />

          <div className="edit-stall-modal__header flex items-center justify-between bg-[linear-gradient(135deg,#1C1C1C_0%,#252525_50%,#341CD6_145%)] px-7 py-4">
            <div className="min-w-0">
              <p className="m-0 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#D5B7FF]">
                Edit Stall
              </p>
              <h2 className="m-0 mt-0.5 truncate text-[1.08rem] font-bold text-white">
                {form.stallName || "Stall"}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Close edit stall modal"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="edit-stall-modal__body space-y-4 px-7 pb-14 pt-5">
            <FieldGrid>
              <FieldGroup label="Vendor">
                <input
                  type="text"
                  value={form.vendorName}
                  onChange={() => {}}
                  disabled
                  className={FIELD_CLASS}
                />
              </FieldGroup>
              <FieldGroup label="Stall Name">
                <input
                  type="text"
                  value={form.stallName}
                  onChange={(e) => set("stallName", e.target.value)}
                  className={FIELD_CLASS}
                />
              </FieldGroup>
              <FieldGroup label="Stall Banner">
                <ImageUploadRow />
              </FieldGroup>
              <FieldGroup label="Type">
                <Dropdown
                  value={form.type}
                  onChange={(value) => set("type", value)}
                  options={STALL_TYPES}
                />
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
              <ModeOptionsDropdown
                value={form.modeOptions}
                onChange={(value) => set("modeOptions", value)}
              />
            </FormRow>

            <FormRow label="Stall Settings">
              <SettingsGrid>
                <SettingChip
                  label="GRN Mode"
                  active={form.grnMode}
                  onToggle={() => set("grnMode", !form.grnMode)}
                />
                <SettingChip
                  label="Cash Disabled"
                  active={form.cashDisabled}
                  onToggle={() => set("cashDisabled", !form.cashDisabled)}
                />
                <SettingChip
                  label="KOT LAN"
                  active={form.kotLan}
                  onToggle={() => set("kotLan", !form.kotLan)}
                />
                <SettingChip
                  label="Mode Info Mandatory"
                  active={form.modeInfoMandatory}
                  onToggle={() => set("modeInfoMandatory", !form.modeInfoMandatory)}
                />
              </SettingsGrid>
            </FormRow>

            <FieldGrid>
              <FieldGroup label="Bank Payment">
                <Dropdown
                  value={form.bankPayment}
                  onChange={(value) => set("bankPayment", value)}
                  options={BANK_PAYMENTS}
                />
              </FieldGroup>
              <FieldGroup label="Scan Mode">
                <Dropdown
                  value={form.scanMode}
                  onChange={(value) => set("scanMode", value)}
                  options={SCAN_MODES}
                />
              </FieldGroup>
              <FieldGroup label="Device Menu View">
                <Dropdown
                  value={form.deviceMenuView}
                  onChange={(value) => set("deviceMenuView", value)}
                  options={DEVICE_VIEWS}
                />
              </FieldGroup>
            </FieldGrid>

            <SectionDivider icon={<TapXIcon />} label="TapX Items" />

            <FormRow label="TapX">
              <SettingsGrid>
                <SettingChip
                  label="Show in TapX"
                  active={form.showInTapX}
                  onToggle={() => set("showInTapX", !form.showInTapX)}
                />
              </SettingsGrid>
            </FormRow>
          </div>

          <div className="edit-stall-modal__footer flex items-center justify-end border-t border-[#eeeeee] bg-[#fafafa] px-7 pb-5 pt-4">
            <button
              type="button"
              onClick={() => onConfirm?.(form)}
              className="h-10 rounded-lg bg-[#1C1C1C] px-6 text-[0.8rem] font-bold text-white shadow-[0_12px_24px_rgba(28,28,28,0.22)] transition hover:bg-[#E04420] hover:shadow-[0_14px_28px_rgba(224,68,32,0.26)]"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
