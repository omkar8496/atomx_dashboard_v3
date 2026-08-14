"use client";

import { useEffect, useRef, useState } from "react";
import {
  buildVendorPayload,
  DEFAULT_VENDOR_FORM,
  numericOnly,
  VENDOR_TYPES
} from "./vendorPayload";

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

function EyeIcon({ hidden }) {
  if (hidden) {
    return (
      <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <path d="M1 1l22 22" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
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

function Toggle({ active, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={`flex h-7 w-[54px] shrink-0 items-center rounded-full p-1 transition-all duration-200 ${
        active ? "bg-[linear-gradient(135deg,#E04420,#341CD6)]" : "bg-(--line)"
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

function BoxInput({ value, onChange, type = "text", placeholder = "" }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} className={FIELD_CLASS} />
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
      <input type={show ? "text" : "password"} value={value} onChange={onChange} className={`${FIELD_CLASS} pr-10`} />
      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-(--muted) transition hover:bg-(--chip) hover:text-(--text)"
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
        className="w-full resize-y rounded-[10px] border border-(--line) bg-(--surface) px-3.5 py-2.5 pr-14 text-[13px] font-medium text-(--text) outline-none transition placeholder:text-(--faint) focus:border-(--orange) focus:shadow-[0_0_0_3px_rgba(224,68,32,0.12)]"
      />
      <span className="font-vcr absolute bottom-2.5 right-3 text-[9px] text-(--faint)">
        {value.length}/{maxLength}
      </span>
    </div>
  );
}

function FormRow({ label, children }) {
  return (
    <div className="grid grid-cols-[170px_1fr] items-start gap-4 max-sm:grid-cols-1 max-sm:gap-1.5">
      <span className="pt-2.5 text-right text-[13px] font-medium text-(--muted) max-sm:pt-0 max-sm:text-left">
        {label}
      </span>
      <div>{children}</div>
    </div>
  );
}

function FieldGrid({ children }) {
  return <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">{children}</div>;
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

function FormatSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-[10px] border border-(--line) bg-(--surface) p-1">
      {[
        ["format1", "Default"],
        ["format2", "Format2"]
      ].map(([option, label]) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`h-8 rounded-md text-[12px] font-semibold transition ${
            value === option ? "bg-(--text) text-(--bg)" : "text-(--muted) hover:bg-(--surface2)"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function ToggleRow({ label, children }) {
  return (
    <div className="grid grid-cols-[170px_1fr] items-center gap-4 max-sm:grid-cols-1 max-sm:gap-1.5">
      <span className="text-right text-[13px] font-medium text-(--muted) max-sm:text-left">
        {label}
      </span>
      <div>{children}</div>
    </div>
  );
}

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function PrintIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9V2h12v7" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <path d="M6 14h12v8H6z" />
    </svg>
  );
}

export default function CreateVendorModal({ eventId, onClose, onConfirm }) {
  const [form, setForm] = useState({ ...DEFAULT_VENDOR_FORM });
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
            <div>
              <p className="font-vcr m-0 text-[9px] uppercase tracking-[0.2em] text-(--purple)">
                Vendor Setup
              </p>
              <h2 className="font-chillax m-0 mt-1 text-[clamp(20px,2.4vw,26px)] font-semibold tracking-[-0.01em] text-white">
                Create Vendor
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] border border-white/20 text-white/80 transition hover:border-(--orange) hover:bg-(--orange)"
              aria-label="Close create vendor modal"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto px-7 py-5 max-[640px]:px-4">
          <FormRow label="Vendor Name">
            <BoxInput value={form.vendorName} onChange={(e) => set("vendorName", e.target.value)} />
          </FormRow>

          <FormRow label="Type">
            <TypeDropdown value={form.type} onChange={(value) => set("type", value)} options={VENDOR_TYPES} />
          </FormRow>

          <FormRow label="Rev Share">
            <NumberInput value={form.revShare} onChange={(value) => set("revShare", value)} />
          </FormRow>

          <FormRow label="Tax Details">
            <FieldGrid>
              <FieldGroup label="GSTIN">
                <BoxInput value={form.gstin} onChange={(e) => set("gstin", e.target.value)} />
              </FieldGroup>
              <FieldGroup label="PAN">
                <BoxInput value={form.pan} onChange={(e) => set("pan", e.target.value)} />
              </FieldGroup>
            </FieldGrid>
          </FormRow>

          <FormRow label="Charges">
            <FieldGrid>
              <FieldGroup label="Service Charge">
                <NumberInput value={form.serviceCharge} onChange={(value) => set("serviceCharge", value)} />
              </FieldGroup>
              <FieldGroup label="Service Charge Tax">
                <NumberInput value={form.serviceChargeTax} onChange={(value) => set("serviceChargeTax", value)} />
              </FieldGroup>
            </FieldGrid>
          </FormRow>

          <ToggleRow label="Show Print Details">
            <Toggle active={form.showPrintDetails} onToggle={() => set("showPrintDetails", !form.showPrintDetails)} />
          </ToggleRow>

          {form.showPrintDetails && (
            <div className="space-y-3.5 rounded-[12px] border border-(--line) bg-(--surface2) px-4 py-4">
              <SectionDivider icon={<PrintIcon />} label="Print Details" />

              <FormRow label="Mobile">
                <BoxInput type="tel" value={form.mobile} onChange={(e) => set("mobile", numericOnly(e.target.value))} />
              </FormRow>

              <FormRow label="Address">
                <CharTextarea value={form.address} onChange={(e) => set("address", e.target.value)} maxLength={128} />
              </FormRow>

              <FormRow label="Thank You Note">
                <CharTextarea value={form.thankYouNote} onChange={(e) => set("thankYouNote", e.target.value)} maxLength={128} />
              </FormRow>

              <ToggleRow label="SAC">
                <Toggle active={form.sac} onToggle={() => set("sac", !form.sac)} />
              </ToggleRow>
              {form.sac && (
                <FormRow label="SAC Value">
                  <BoxInput value={form.sacText} onChange={(e) => set("sacText", e.target.value)} />
                </FormRow>
              )}

              <ToggleRow label="Auto Print">
                <Toggle active={form.autoPrint} onToggle={() => set("autoPrint", !form.autoPrint)} />
              </ToggleRow>

              <FormRow label="Max Invoices">
                <NumberInput value={form.maxInvoices} onChange={(value) => set("maxInvoices", value)} />
              </FormRow>

              <ToggleRow label="KOT">
                <Toggle active={form.kot} onToggle={() => set("kot", !form.kot)} />
              </ToggleRow>
              {form.kot && (
                <FormRow label="KOT Count">
                  <NumberInput value={form.kotCount} onChange={(value) => set("kotCount", value)} />
                </FormRow>
              )}

              <ToggleRow label="Invoice Format">
                <FormatSelector value={form.invoiceFormat} onChange={(value) => set("invoiceFormat", value)} />
              </ToggleRow>

              <FormRow label="Re-Print Password">
                <PasswordInput value={form.reprintPassword} onChange={(e) => set("reprintPassword", e.target.value)} />
              </FormRow>
            </div>
          )}

          <SectionDivider icon={<DashboardIcon />} label="Dashboard" />

          <FormRow label="Dashboard Password">
            <PasswordInput value={form.dashboardPassword} onChange={(e) => set("dashboardPassword", e.target.value)} />
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
            onClick={() => onConfirm?.(buildVendorPayload(form, eventId))}
            className="flex h-11 items-center justify-center rounded-[10px] bg-(--text) px-7 text-[13.5px] font-semibold text-(--bg) transition hover:bg-(--orange)"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
