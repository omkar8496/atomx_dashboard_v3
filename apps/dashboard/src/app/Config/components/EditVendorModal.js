"use client";

import { useEffect, useRef, useState } from "react";
import {
  buildVendorPayload,
  DEFAULT_VENDOR_FORM,
  numericOnly,
  VENDOR_TYPES
} from "./vendorPayload";

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

function EyeIcon({ hidden }) {
  if (hidden) {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-[17px] w-[17px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <path d="M1 1l22 22" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[17px] w-[17px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function PrintIcon() {
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
      <path d="M6 9V2h12v7" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <path d="M6 14h12v8H6z" />
    </svg>
  );
}

function DashboardIcon() {
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
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
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

function Toggle({ active, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={`flex h-7 w-[54px] shrink-0 items-center rounded-full p-1 transition-all duration-200 ${
        active
          ? "bg-[linear-gradient(135deg,#E04420,#341CD6)] shadow-[0_8px_18px_rgba(52,28,214,0.18)]"
          : "bg-[#dce3ed]"
      }`}
    >
      <span
        className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          active ? "translate-x-[26px]" : "translate-x-0"
        }`}
      />
    </button>
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

function TypeDropdown({ value, onChange, options }) {
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

function BoxInput({ value, onChange, type = "text", placeholder = "" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={FIELD_CLASS}
    />
  );
}

function NumberInput({ value, onChange, placeholder = "" }) {
  return (
    <input
      inputMode="decimal"
      value={value}
      onChange={(event) => onChange(numericOnly(event.target.value))}
      placeholder={placeholder}
      className={FIELD_CLASS}
    />
  );
}

function PasswordInput({ value, onChange }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        className={`${FIELD_CLASS} pr-10`}
      />
      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-[#8b8b8b] transition hover:bg-[#f4f4f4] hover:text-[#1c1c1c]"
        aria-label={show ? "Hide password" : "Show password"}
      >
        <EyeIcon hidden={show} />
      </button>
    </div>
  );
}

function CharTextarea({ value, onChange, maxLength = 128, placeholder = "" }) {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        placeholder={placeholder}
        rows={3}
        className="w-full resize-y rounded-[9px] border border-[#dedede] bg-white px-3.5 py-2.5 pr-14 text-[0.82rem] font-medium text-[#1c1c1c] outline-none transition placeholder:text-[#a8a8a8] focus:border-[#E04420] focus:ring-2 focus:ring-[#E04420]/10"
      />
      <span className="absolute bottom-2.5 right-3 text-[0.64rem] font-medium text-[#a0a0a0]">
        {String(value ?? "").length}/{maxLength}
      </span>
    </div>
  );
}

function FormRow({ label, children }) {
  return (
    <div className="grid grid-cols-[170px_1fr] items-start gap-4 max-sm:grid-cols-1 max-sm:gap-1.5">
      <span className="pt-2.5 text-right text-[0.78rem] font-medium text-[#555555] max-sm:pt-0 max-sm:text-left">
        {label}
      </span>
      <div>{children}</div>
    </div>
  );
}

function FieldGrid({ children }) {
  return <div className="grid grid-cols-3 gap-3 max-md:grid-cols-1">{children}</div>;
}

function SettingsGrid({ children }) {
  return <div className="grid grid-cols-2 gap-2.5 max-sm:grid-cols-1">{children}</div>;
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

function FormatSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-[10px] border border-[#dedede] bg-white p-1">
      {[
        ["format1", "Default"],
        ["format2", "Format2"]
      ].map(([option, label]) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`h-8 rounded-md text-[0.76rem] font-bold transition ${
            value === option
              ? "bg-[#1c1c1c] text-white shadow-[0_8px_16px_rgba(28,28,28,0.14)]"
              : "text-[#666666] hover:bg-[#f6f6f6]"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default function EditVendorModal({ vendor, eventId, onClose, onConfirm }) {
  const vendorName =
    vendor?.name ?? vendor?.vendorName ?? vendor?.title ?? "";
  const vendorType =
    String(vendor?.type ?? vendor?.category ?? "FNB").toUpperCase();

  const [form, setForm] = useState({
    ...DEFAULT_VENDOR_FORM,
    vendorName,
    type: VENDOR_TYPES.includes(vendorType) ? vendorType : "INVENTORY",
    revShare: vendor?.revShare ?? "",
    gstin: vendor?.gstin ?? "",
    pan: vendor?.pan ?? "",
    serviceCharge: vendor?.sc ?? vendor?.serviceCharge ?? "",
    serviceChargeTax: vendor?.scTax ?? vendor?.serviceChargeTax ?? "",
    dashboardPassword: vendor?.password ?? "",
    mobile: vendor?.mobile ?? "",
    address: vendor?.address ?? "",
    thankYouNote: vendor?.thankyouNote ?? vendor?.thankYouNote ?? DEFAULT_VENDOR_FORM.thankYouNote,
    sac: Boolean(vendor?.showSac),
    sacText: vendor?.sac ?? "",
    autoPrint: Boolean(vendor?.autoPrint),
    maxInvoices: vendor?.invoicePrintCount ?? "",
    kot: Boolean(vendor?.kotPrint),
    kotCount: vendor?.kotPrintCount ?? "",
    invoiceFormat: vendor?.printFormat ?? "format1",
    reprintPassword: vendor?.rePrintPassword ?? "",
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
        .edit-vendor-modal {
          box-sizing: border-box;
          max-height: calc(100dvh - 120px);
          display: flex;
          flex-direction: column;
        }

        .edit-vendor-modal--expanded {
          height: calc(100dvh - 120px);
        }

        .edit-vendor-modal__header,
        .edit-vendor-modal__footer {
          flex: 0 0 auto;
        }

        .edit-vendor-modal__footer {
          min-height: 76px;
        }

        .edit-vendor-modal__body {
          min-height: 0;
          overflow-y: auto;
          overscroll-behavior: contain;
          scrollbar-gutter: stable;
        }

        .edit-vendor-modal--expanded .edit-vendor-modal__body {
          flex: 1 1 auto;
          max-height: none;
        }

        .edit-vendor-modal:not(.edit-vendor-modal--expanded)
          .edit-vendor-modal__body {
          max-height: calc(100dvh - 260px);
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

      <div className="w-full max-w-[860px]">
        <div
          className={`edit-vendor-modal relative w-full overflow-hidden rounded-2xl border border-[#D5B7FF]/60 bg-white font-['AtomX_Poppins',sans-serif] shadow-[0_30px_80px_rgba(15,23,42,0.24)] ${
            form.showPrintDetails ? "edit-vendor-modal--expanded" : ""
          }`}
          style={{ fontFamily: '"AtomX Poppins", Poppins, sans-serif' }}
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#E04420,#D5B7FF,#341CD6)]" />

          <div className="edit-vendor-modal__header flex items-center justify-between bg-[linear-gradient(135deg,#1C1C1C_0%,#252525_50%,#341CD6_145%)] px-7 py-4">
            <div className="min-w-0">
              <p className="m-0 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#D5B7FF]">
                Edit Vendor
              </p>
              <h2 className="m-0 mt-0.5 truncate text-[1.08rem] font-bold text-white">
                {vendorName || "Vendor"}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Close edit vendor modal"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="edit-vendor-modal__body space-y-4 px-7 pb-14 pt-5">
            <FormRow label="Vendor Name">
              <BoxInput
                value={form.vendorName}
                onChange={(e) => set("vendorName", e.target.value)}
              />
            </FormRow>

            <FieldGrid>
              <FieldGroup label="Type">
                <TypeDropdown
                  value={form.type}
                  onChange={(value) => set("type", value)}
                  options={VENDOR_TYPES}
                />
              </FieldGroup>
              <FieldGroup label="Rev Share">
                <BoxInput
                  value={form.revShare}
                  onChange={(e) => set("revShare", numericOnly(e.target.value))}
                />
              </FieldGroup>
              <FieldGroup label="GSTIN">
                <BoxInput
                  value={form.gstin}
                  onChange={(e) => set("gstin", e.target.value)}
                />
              </FieldGroup>
              <FieldGroup label="PAN">
                <BoxInput
                  value={form.pan}
                  onChange={(e) => set("pan", e.target.value)}
                />
              </FieldGroup>
              <FieldGroup label="Service Charge">
                <BoxInput
                  value={form.serviceCharge}
                  onChange={(e) => set("serviceCharge", numericOnly(e.target.value))}
                />
              </FieldGroup>
              <FieldGroup label="Service Charge Tax">
                <BoxInput
                  value={form.serviceChargeTax}
                  onChange={(e) => set("serviceChargeTax", numericOnly(e.target.value))}
                />
              </FieldGroup>
            </FieldGrid>

            <FormRow label="Show Print Details">
              <Toggle
                active={form.showPrintDetails}
                onToggle={() => set("showPrintDetails", !form.showPrintDetails)}
              />
            </FormRow>

            {form.showPrintDetails && (
              <div className="space-y-4 rounded-xl border border-[#EBEBEB] bg-[#fbfbfb] px-4 py-4">
                <SectionDivider icon={<PrintIcon />} label="Print Details" />

                <FieldGrid>
                  <FieldGroup label="Mobile">
                    <BoxInput
                      type="tel"
                      value={form.mobile}
                      onChange={(e) => set("mobile", numericOnly(e.target.value))}
                    />
                  </FieldGroup>
                  <FieldGroup label="Address">
                    <CharTextarea
                      value={form.address}
                      onChange={(e) => set("address", e.target.value)}
                      maxLength={128}
                    />
                  </FieldGroup>
                  <FieldGroup label="Thank You Note">
                    <CharTextarea
                      value={form.thankYouNote}
                      onChange={(e) => set("thankYouNote", e.target.value)}
                      maxLength={128}
                    />
                  </FieldGroup>
                </FieldGrid>

                <FormRow label="Print Settings">
                  <SettingsGrid>
                    <SettingChip
                      label="SAC"
                      active={form.sac}
                      onToggle={() => set("sac", !form.sac)}
                    />
                    <SettingChip
                      label="Auto Print"
                      active={form.autoPrint}
                      onToggle={() => set("autoPrint", !form.autoPrint)}
                    />
                    <SettingChip
                      label="KOT"
                      active={form.kot}
                      onToggle={() => set("kot", !form.kot)}
                    />
                  </SettingsGrid>
                </FormRow>

                {form.sac && (
                  <FormRow label="SAC Value">
                    <BoxInput
                      value={form.sacText}
                      onChange={(e) => set("sacText", e.target.value)}
                    />
                  </FormRow>
                )}

                <FieldGrid>
                  <FieldGroup label="Max Invoices">
                    <NumberInput
                      value={form.maxInvoices}
                      onChange={(value) => set("maxInvoices", value)}
                    />
                  </FieldGroup>
                  {form.kot && (
                    <FieldGroup label="KOT Count">
                      <NumberInput
                        value={form.kotCount}
                        onChange={(value) => set("kotCount", value)}
                      />
                    </FieldGroup>
                  )}
                  <FieldGroup label="Re-Print Password">
                    <PasswordInput
                      value={form.reprintPassword}
                      onChange={(e) => set("reprintPassword", e.target.value)}
                    />
                  </FieldGroup>
                </FieldGrid>

                <FormRow label="Invoice Format">
                  <FormatSelector
                    value={form.invoiceFormat}
                    onChange={(value) => set("invoiceFormat", value)}
                  />
                </FormRow>
              </div>
            )}

            <SectionDivider icon={<DashboardIcon />} label="Dashboard" />

            <FormRow label="Dashboard Password">
              <PasswordInput
                value={form.dashboardPassword}
                onChange={(e) => set("dashboardPassword", e.target.value)}
              />
            </FormRow>
          </div>

          <div className="edit-vendor-modal__footer flex items-center justify-end border-t border-[#eeeeee] bg-[#fafafa] px-7 pb-5 pt-4">
            <button
              type="button"
              onClick={() => onConfirm?.(buildVendorPayload(form, eventId))}
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
