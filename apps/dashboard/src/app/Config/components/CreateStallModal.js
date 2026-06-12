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
  "h-10 w-full rounded-[9px] border border-[#dedede] bg-white px-3.5 text-[0.82rem] font-medium text-[#1c1c1c] outline-none transition placeholder:text-[#a8a8a8] focus:border-[#E04420] focus:ring-2 focus:ring-[#E04420]/10";

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

function AccessXIcon() {
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
      <path d="M12 3 4 7v6c0 5 3.4 7.4 8 8 4.6-.6 8-3 8-8V7l-8-4Z" />
      <path d="m9 12 2 2 4-5" />
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

function PaymentModeOptions({ selected, onToggle }) {
  return (
    <div className="grid grid-cols-3 gap-2.5 max-sm:grid-cols-1">
      {PAYMENT_MODE_OPTIONS.map((mode) => {
        const active = selected.includes(mode);
        const label = mode.charAt(0).toUpperCase() + mode.slice(1);
        return (
          <SettingChip
            key={mode}
            label={label}
            active={active}
            onToggle={() => onToggle(mode)}
          />
        );
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
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose?.();
      }}
      className="fixed inset-0 z-[200] flex h-dvh items-start justify-center overflow-hidden overscroll-none bg-[#1c1c1c]/45 px-4 pb-20 pt-10 backdrop-blur-[3px]"
    >
      <style jsx global>{`
        .create-stall-modal {
          box-sizing: border-box;
          max-height: calc(100dvh - 120px);
          display: flex;
          flex-direction: column;
        }

        .create-stall-modal__header,
        .create-stall-modal__footer {
          flex: 0 0 auto;
        }

        .create-stall-modal__footer {
          min-height: 76px;
        }

        .create-stall-modal__body {
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

      <div className="w-full max-w-[760px]">
        <div
          className="create-stall-modal relative w-full overflow-hidden rounded-2xl border border-[#D5B7FF]/60 bg-white font-['AtomX_Poppins',sans-serif] shadow-[0_30px_80px_rgba(15,23,42,0.24)]"
          style={{ fontFamily: '"AtomX Poppins", Poppins, sans-serif' }}
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#E04420,#D5B7FF,#341CD6)]" />

          <div className="create-stall-modal__header flex items-center justify-between bg-[linear-gradient(135deg,#1C1C1C_0%,#252525_50%,#341CD6_145%)] px-7 py-4">
            <div className="min-w-0">
              <p className="m-0 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#D5B7FF]">
                Stall Setup
              </p>
              <h2 className="m-0 mt-0.5 truncate text-[1.08rem] font-bold text-white">
                Create Stall{vendorName ? ` for ${vendorName}` : ""}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Close create stall modal"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="create-stall-modal__body space-y-3.5 px-7 pb-14 pt-5">
            <FormRow label="Stall Name">
              <input
                type="text"
                value={form.stallName}
                onChange={(e) => set("stallName", e.target.value)}
                className={FIELD_CLASS}
              />
            </FormRow>

            <FormRow label="Type">
              <StallDropdown
                value={form.type}
                onChange={(value) => set("type", value)}
                options={STALL_TYPES}
              />
            </FormRow>

            <FormRow label="Payment Modes">
              <SegmentedChoice
                active={form.acceptAllModes}
                leftLabel="Only NFC"
                rightLabel="Accept All Modes"
                onChange={setAcceptAllModes}
              />
            </FormRow>

            {form.acceptAllModes && (
              <FormRow label="Mode Options">
                <PaymentModeOptions
                  selected={form.paymentModes}
                  onToggle={togglePaymentMode}
                />
              </FormRow>
            )}

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

            <FormRow label="Scan Mode">
              <StallDropdown
                value={form.scanMode}
                onChange={(value) => set("scanMode", value)}
                options={SCAN_MODES}
              />
            </FormRow>

            <SectionDivider icon={<TapXIcon />} label="TapX Items" />

            <FormRow label="TapX">
              <SettingsGrid>
                <SettingChip
                  label="Show in TapX"
                  active={form.showInTapX}
                  onToggle={toggleTapX}
                />
                {form.showInTapX && (
                  <SettingChip
                    label="Show Price"
                    active={form.showPrice}
                    onToggle={toggleShowPrice}
                  />
                )}
                {form.showInTapX && form.showPrice && (
                  <SettingChip
                    label="Add to Cart"
                    active={form.addToCart}
                    onToggle={() => set("addToCart", !form.addToCart)}
                  />
                )}
              </SettingsGrid>
            </FormRow>

            {isAccessXVendor && (
              <>
                <SectionDivider icon={<AccessXIcon />} label="AccessX Settings" />

                <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                  <FormRow label="NFC Setting">
                    <StallDropdown
                      value={form.nfcSetting}
                      onChange={(value) => set("nfcSetting", value)}
                      options={NFC_SETTINGS}
                    />
                  </FormRow>
                  <FormRow label="QR Setting">
                    <StallDropdown
                      value={form.qrSetting}
                      onChange={(value) => set("qrSetting", value)}
                      options={QR_SETTINGS}
                    />
                  </FormRow>
                </div>

                <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                  <FormRow label="Location ID">
                    <input
                      type="text"
                      value={form.locationId}
                      onChange={(e) => set("locationId", e.target.value)}
                      className={FIELD_CLASS}
                    />
                  </FormRow>
                  <FormRow label="Event/Match ID">
                    <input
                      type="text"
                      value={form.eventMatchId}
                      onChange={(e) => set("eventMatchId", e.target.value)}
                      className={FIELD_CLASS}
                    />
                  </FormRow>
                </div>

                <FormRow label="Access Controls">
                  <SettingsGrid>
                    <SettingChip
                      label="Use Online Topups"
                      active={form.useOnlineTopups}
                      onToggle={() => set("useOnlineTopups", !form.useOnlineTopups)}
                    />
                    <SettingChip
                      label="Use In-Out Logic"
                      active={form.useInOutLogic}
                      onToggle={() => set("useInOutLogic", !form.useInOutLogic)}
                    />
                    <SettingChip
                      label="Fetch Details"
                      active={form.fetchDetails}
                      onToggle={() => set("fetchDetails", !form.fetchDetails)}
                    />
                    <SettingChip
                      label="Check Online Unique"
                      active={form.checkOnlineUnique}
                      onToggle={() => set("checkOnlineUnique", !form.checkOnlineUnique)}
                    />
                  </SettingsGrid>
                </FormRow>
              </>
            )}

          </div>

          <div className="create-stall-modal__footer flex items-center justify-end border-t border-[#eeeeee] bg-[#fafafa] px-7 pb-5 pt-4">
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
