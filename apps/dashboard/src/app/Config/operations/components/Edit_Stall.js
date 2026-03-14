"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDashboardStore } from "../../../../store/dashboardStore";
import { createStall } from "../../../../lib/dashboardApi";
import { useFormAutosave } from "../../../../lib/useFormAutosave";

const BANK_OPTIONS = [
  "MSWIPE",
  "SUNMIPAY",
  "EZETAP",
  "MOSAMBEE",
  "WORLDLINE",
  "AIRPAY",
  "PINELABS",
  "UTAP"
];

const SCAN_OPTIONS = ["NONE", "MENU", "TICKET"];

const STALL_TYPE_OPTIONS = [
  { label: "Topup", value: "topup" },
  { label: "Sale", value: "sale" },
  { label: "AccessX", value: "accessx" },
  { label: "Inventory", value: "inventory" },
  { label: "Stockmaster", value: "stockmaster" },
  { label: "Tables", value: "tables" }
];

export default function EditStall({
  open,
  onClose,
  title = "Edit Stall",
  seed,
  mode = "edit",
  onSaved,
  onToast
}) {
  const [animateIn, setAnimateIn] = useState(false);
  const token = useDashboardStore((state) => state.token);
  const profile = useDashboardStore((state) => state.profile);
  const eventId = useDashboardStore((state) => state.eventMeta?.eventId);
  const [stallType, setStallType] = useState("sale");
  const [bankPayment, setBankPayment] = useState(BANK_OPTIONS[0]);
  const [scanMode, setScanMode] = useState(SCAN_OPTIONS[0]);
  const [paymentMode, setPaymentMode] = useState("ALL");
  const [modeOptions, setModeOptions] = useState(["Card", "UPI", "Cash"]);
  const [toggles, setToggles] = useState({
    grn: false,
    cashDisabled: false,
    kotLan: false,
    modeInfo: false,
    sms: false,
    tapx: false
  });
  const [saving, setSaving] = useState(false);
  const formRef = useRef(null);
  const draftAppliedRef = useRef(false);
  const stallId = seed?.id ?? seed?.stallId ?? null;
  const draftKey = useMemo(() => {
    if (!eventId) return null;
    const userKey = profile?.id ?? profile?.sub ?? profile?.email ?? "anon";
    const stallKey = stallId ?? "new";
    return `dashboard:stall:${userKey}:${eventId}:${stallKey}`;
  }, [eventId, profile, stallId]);

  useEffect(() => {
    if (!open) return;
    setAnimateIn(false);
    const timer = setTimeout(() => setAnimateIn(true), 20);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const initialType = String(seed?.type ?? seed?.stallType ?? "sale").toLowerCase();
    setStallType(initialType);
    setBankPayment(BANK_OPTIONS[0]);
    setScanMode(SCAN_OPTIONS[0]);
  }, [open, seed]);

  useEffect(() => {
    draftAppliedRef.current = false;
  }, [stallId, open]);

  if (!open) return null;

  const toggleModeOption = (option) => {
    setModeOptions((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  };

  const toggleSwitch = (key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getFormValues = useCallback(() => {
    const form = formRef.current;
    if (!form) return {};
    const data = new FormData(form);
    const values = {};
    for (const [key, value] of data.entries()) {
      values[key] = String(value ?? "");
    }
    values.paymentMode = paymentMode;
    values.modeOptions = modeOptions.join(",");
    values.stallType = stallType;
    values.bankPayment = bankPayment;
    values.scanMode = scanMode;
    Object.entries(toggles).forEach(([key, value]) => {
      values[`toggle.${key}`] = value ? "1" : "0";
    });
    return values;
  }, [bankPayment, modeOptions, paymentMode, scanMode, stallType, toggles]);

  const applyDraftToForm = useCallback((values) => {
    const form = formRef.current;
    if (!form || !values) return;
    const escapeName = (name) => {
      if (typeof CSS !== "undefined" && CSS.escape) {
        return CSS.escape(name);
      }
      return name.replace(/\"/g, '\\"');
    };

    Object.entries(values).forEach(([name, value]) => {
      if (
        name.startsWith("toggle.") ||
        name === "paymentMode" ||
        name === "modeOptions" ||
        name === "stallType" ||
        name === "bankPayment" ||
        name === "scanMode"
      ) {
        return;
      }
      const selector = `[name=\"${escapeName(name)}\"]`;
      const nodes = form.querySelectorAll(selector);
      nodes.forEach((node) => {
        if (node.type === "checkbox" || node.type === "radio") {
          node.checked = value === "1" || value === "true";
        } else {
          node.value = String(value);
        }
        node.dispatchEvent(new Event("input", { bubbles: true }));
        node.dispatchEvent(new Event("change", { bubbles: true }));
      });
    });
  }, []);

  const { clearDraft } = useFormAutosave({
    formRef,
    draftKey,
    enabled: open,
    getValues: getFormValues,
    watch: [
      paymentMode,
      modeOptions.join(","),
      stallType,
      bankPayment,
      scanMode,
      JSON.stringify(toggles)
    ],
    onRestore: (values) => {
      if (draftAppliedRef.current) return;
      if (!values) return;
      if (values.paymentMode) setPaymentMode(values.paymentMode);
      if (values.modeOptions) {
        setModeOptions(values.modeOptions.split(",").filter(Boolean));
      }
      if (values.stallType) setStallType(values.stallType);
      if (values.bankPayment) setBankPayment(values.bankPayment);
      if (values.scanMode) setScanMode(values.scanMode);
      const nextToggles = { ...toggles };
      Object.keys(nextToggles).forEach((key) => {
        if (values[`toggle.${key}`] !== undefined) {
          nextToggles[key] = values[`toggle.${key}`] === "1" || values[`toggle.${key}`] === "true";
        }
      });
      setToggles(nextToggles);
      applyDraftToForm(values);
      draftAppliedRef.current = true;
    }
  });

  const handleSubmit = async () => {
    if (saving) return;
    if (mode !== "create") {
      onClose?.();
      return;
    }
    const vendorId =
      seed?.vendorId ??
      seed?.vendor?.id ??
      seed?.vendorId ??
      1931;
    const payload = {
      vendorId,
      type: stallType || "sale"
    };
    setSaving(true);
    try {
      await createStall({ token, stall: payload });
      onToast?.({
        title: "Stall Added",
        message: "Stall created successfully."
      });
      clearDraft();
      onSaved?.();
      onClose?.();
    } catch (error) {
      console.error("Failed to create stall", error);
      onToast?.({
        title: "Stall Error",
        message: "Unable to create stall."
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-6 transition-opacity duration-300 ${
        animateIn ? "opacity-100" : "opacity-0"
      }`}
    >
      <form
        ref={formRef}
        onSubmit={(event) => event.preventDefault()}
        className={`w-full max-w-3xl rounded-xl border border-[#e8d9d3] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)] transition-all duration-300 ${
          animateIn ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#e7e0dc] px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:text-slate-700"
            aria-label="Close"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-4">
          <div className="rounded-lg border border-slate-200 bg-[#f8fbfd] p-3">
            <h3 className="text-sm font-bold text-slate-700">Basics Details</h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Vendor Name
                <input
                  type="text"
                  maxLength={50}
                  name="vendorName"
                  className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
                  placeholder="Vendor"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Stall Name
                <input
                  type="text"
                  maxLength={50}
                  name="stallName"
                  className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
                  placeholder="Stall"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-600 md:col-span-2">
                Stall Banner
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2 text-sm text-slate-500">
                  <span>Upload image</span>
                  <button
                    type="button"
                    className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600"
                  >
                    Browse
                  </button>
                </div>
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Type
                <select
                  name="stallType"
                  className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
                  value={stallType}
                  onChange={(event) => setStallType(event.target.value)}
                >
                  {STALL_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-700">Payments</h3>
              <div className="flex rounded-full border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setPaymentMode("NFC")}
                  className={`rounded-full px-4 py-1 text-xs font-semibold transition ${
                    paymentMode === "NFC" ? "bg-[color:rgb(var(--color-teal))] text-white" : "text-slate-500"
                  }`}
                >
                  Only NFC
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode("ALL")}
                  className={`rounded-full px-4 py-1 text-xs font-semibold transition ${
                    paymentMode === "ALL" ? "bg-[color:rgb(var(--color-teal))] text-white" : "text-slate-500"
                  }`}
                >
                  Accept All Mode
                </button>
              </div>
            </div>

            {paymentMode === "ALL" && (
              <div className="mt-3 flex items-center gap-4">
                <span className="text-sm font-semibold text-slate-600">Payments Mode :</span>
                <div className="flex flex-nowrap gap-2">
                  {["Card", "UPI", "Cash"].map((option) => {
                    const active = modeOptions.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => toggleModeOption(option)}
                        className={`rounded-full border px-4 py-1 text-xs font-semibold transition ${
                          active
                            ? "border-[color:rgb(var(--color-teal))] bg-[color:rgb(var(--color-teal))] text-white"
                            : "border-slate-200 text-slate-500"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-3 grid gap-3">
              <label className="flex items-center justify-between gap-4 text-sm text-slate-600">
                <span className="font-semibold">Bank Payment :</span>
                <select
                  name="bankPayment"
                  value={bankPayment}
                  onChange={(event) => setBankPayment(event.target.value)}
                  className="flex-1 border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
                >
                  {BANK_OPTIONS.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>

              <label className="flex items-center justify-between gap-4 text-sm text-slate-600">
                <span className="font-semibold">Scan Mode :</span>
                <select
                  name="scanMode"
                  value={scanMode}
                  onChange={(event) => setScanMode(event.target.value)}
                  className="flex-1 border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
                >
                  {SCAN_OPTIONS.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <h3 className="text-sm font-bold text-slate-700">Controls</h3>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {[
                { key: "grn", label: "GRN Mode" },
                { key: "cashDisabled", label: "Cash Disabled" },
                { key: "kotLan", label: "KOT LAN" },
                { key: "modeInfo", label: "Mode Info Mandatory" }
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleSwitch(item.key)}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600"
                >
                  {item.label}
                  <span
                    className={`relative h-5 w-10 rounded-full transition ${
                      toggles[item.key] ? "bg-[color:rgb(var(--color-teal))]" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
                        toggles[item.key] ? "left-5" : "left-1"
                      }`}
                    />
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
              {[
                { key: "sms", label: "Send SMS" },
                { key: "tapx", label: "Show in TapX" }
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleSwitch(item.key)}
                  className="flex items-center gap-3 text-sm text-slate-600"
                >
                  {item.label}
                  <span
                    className={`relative h-5 w-10 rounded-full transition ${
                      toggles[item.key] ? "bg-[color:rgb(var(--color-teal))]" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
                        toggles[item.key] ? "left-5" : "left-1"
                      }`}
                    />
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="rounded-md bg-[color:rgb(var(--color-teal))] px-4 py-2 text-sm font-semibold text-white shadow-[0_6px_12px_rgb(var(--color-teal)/0.25)]"
            >
              {saving ? "Saving..." : "Confirm"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
