"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDashboardStore } from "../../../../store/dashboardStore";
import { createVendor, updateVendor } from "../../../../lib/dashboardApi";
import { useFormAutosave } from "../../../../lib/useFormAutosave";

export default function CEVendor({ open, onClose, vendor, onSaved, onToast }) {
  const [animateIn, setAnimateIn] = useState(false);
  const [isMounted, setIsMounted] = useState(open);
  const [showPassword, setShowPassword] = useState(false);
  const [showPrintDetails, setShowPrintDetails] = useState(false);
  const [showSac, setShowSac] = useState(false);
  const [showKot, setShowKot] = useState(false);
  const [autoPrint, setAutoPrint] = useState(false);
  const [invoiceDefault, setInvoiceDefault] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef(null);
  const initialValuesRef = useRef(null);
  const draftAppliedRef = useRef(false);
  const token = useDashboardStore((state) => state.token);
  const eventId = useDashboardStore((state) => state.eventMeta?.eventId);
  const profile = useDashboardStore((state) => state.profile);
  const vendorId = vendor?.id ?? vendor?.vendorId ?? null;
  const isEdit = Boolean(vendorId);
  const draftKey = useMemo(() => {
    if (!eventId) return null;
    const userKey = profile?.id ?? profile?.sub ?? profile?.email ?? "anon";
    const vendorKey = vendorId ?? "new";
    return `dashboard:vendor:${userKey}:${eventId}:${vendorKey}`;
  }, [eventId, profile, vendorId]);

  useEffect(() => {
    if (open) {
      setIsMounted(true);
      setAnimateIn(false);
      const timer = setTimeout(() => setAnimateIn(true), 20);
      return () => clearTimeout(timer);
    }
    if (!open && isMounted) {
      setAnimateIn(false);
      const timer = setTimeout(() => setIsMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open, isMounted]);

  useEffect(() => {
    if (!open) return;
    setShowPrintDetails(
      Boolean(
        vendor?.showSac ||
          vendor?.autoPrint ||
          vendor?.kotPrint ||
          vendor?.mobile ||
          vendor?.address ||
          vendor?.thankyouNote ||
          vendor?.rePrintPassword ||
          vendor?.sac ||
          vendor?.invoicePrintCount ||
          vendor?.kotPrintCount ||
          vendor?.printFormat
      )
    );
    setShowSac(Boolean(vendor?.showSac));
    setAutoPrint(Boolean(vendor?.autoPrint));
    setShowKot(Boolean(vendor?.kotPrint));
    setInvoiceDefault(
      !vendor?.printFormat || String(vendor.printFormat).toLowerCase() === "format1"
    );
    if (vendor) {
      initialValuesRef.current = {
        name: String(vendor?.name ?? ""),
        type: String(vendor?.type ?? "fnb").toLowerCase(),
        gstin: String(vendor?.gstin ?? ""),
        pan: String(vendor?.pan ?? ""),
        sc: Number(vendor?.sc ?? 0),
        scTax: Number(vendor?.scTax ?? 0),
        revShare: Number(vendor?.revShare ?? 0),
        password: String(vendor?.password ?? "1234"),
        mobile: String(vendor?.mobile ?? ""),
        address: String(vendor?.address ?? ""),
        thankyouNote: String(vendor?.thankyouNote ?? "Thank You for using AtomX POS"),
        rePrintPassword: String(vendor?.rePrintPassword ?? "2026"),
        sac: String(vendor?.sac ?? ""),
        invoicePrintCount: Number(vendor?.invoicePrintCount ?? 0),
        kotPrintCount: Number(vendor?.kotPrintCount ?? 0),
        showSac: Boolean(vendor?.showSac),
        autoPrint: Boolean(vendor?.autoPrint),
        kotPrint: Boolean(vendor?.kotPrint),
        printFormat:
          String(vendor?.printFormat ?? "format1").toLowerCase() === "format2"
            ? "format2"
            : "format1"
      };
    } else {
      initialValuesRef.current = null;
    }
  }, [open, vendor]);

  useEffect(() => {
    draftAppliedRef.current = false;
  }, [vendorId, open]);

  const getFieldValue = (formData, name, fallback = "") => {
    const value = formData.get(name);
    if (value === null || value === undefined) return fallback;
    const normalized = String(value).trim();
    return normalized === "" ? fallback : normalized;
  };

  const getRawValue = (formData, name) => {
    const value = formData.get(name);
    if (value === null || value === undefined) return "";
    return String(value).trim();
  };

  const addIfProvided = (target, key, rawValue) => {
    if (rawValue === "") return;
    const asNumber = Number(rawValue);
    target[key] = Number.isNaN(asNumber) ? rawValue : asNumber;
  };

  const normalizeText = (value) => String(value ?? "").trim();
  const normalizeType = (value) => String(value ?? "fnb").toLowerCase();
  const normalizeNumber = (value) => {
    const parsed = Number(value ?? 0);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const getFormValues = useCallback(() => {
    const form = formRef.current;
    if (!form) return {};
    const data = new FormData(form);
    const values = {};
    for (const [key, value] of data.entries()) {
      values[key] = String(value ?? "");
    }
    values.showSac = showSac ? "1" : "0";
    values.autoPrint = autoPrint ? "1" : "0";
    values.kotPrint = showKot ? "1" : "0";
    values.printFormat = invoiceDefault ? "format1" : "format2";
    values.showPrintDetails = showPrintDetails ? "1" : "0";
    return values;
  }, [autoPrint, invoiceDefault, showKot, showPrintDetails, showSac]);

  const applyDraftToForm = useCallback((values) => {
    const form = formRef.current;
    if (!form || !values || typeof values !== "object" || Array.isArray(values)) return;
    const escapeName = (name) => {
      if (typeof CSS !== "undefined" && CSS.escape) {
        return CSS.escape(name);
      }
      return name.replace(/\"/g, '\\"');
    };

    Object.entries(values).forEach(([name, value]) => {
      if (
        name === "showSac" ||
        name === "autoPrint" ||
        name === "kotPrint" ||
        name === "printFormat" ||
        name === "showPrintDetails"
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

  const toBool = (value) => value === "1" || value === "true";

  const { clearDraft } = useFormAutosave({
    formRef,
    draftKey,
    enabled: open,
    getValues: getFormValues,
    watch: [showSac, autoPrint, showKot, invoiceDefault, showPrintDetails],
    onRestore: (values) => {
      if (draftAppliedRef.current) return;
      if (!values || typeof values !== "object" || Array.isArray(values)) return;
      setShowPrintDetails(toBool(values.showPrintDetails));
      setShowSac(toBool(values.showSac));
      setAutoPrint(toBool(values.autoPrint));
      setShowKot(toBool(values.kotPrint));
      setInvoiceDefault(String(values.printFormat || "format1").toLowerCase() !== "format2");
      applyDraftToForm(values);
      draftAppliedRef.current = true;
    }
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!eventId) {
      return;
    }
    const formData = new FormData(formRef.current);

    if (isEdit) {
      const initial = initialValuesRef.current || {};
      const changes = {};

      const currentType = normalizeType(getRawValue(formData, "type") || initial.type);
      if (currentType !== normalizeType(initial.type)) {
        changes.type = currentType;
      }

      const currentName = normalizeText(getRawValue(formData, "name"));
      if (currentName !== normalizeText(initial.name)) {
        changes.name = currentName;
      }

      const currentGstin = normalizeText(getRawValue(formData, "gstin"));
      if (currentGstin !== normalizeText(initial.gstin)) {
        changes.gstin = currentGstin;
      }

      const currentPan = normalizeText(getRawValue(formData, "pan"));
      if (currentPan !== normalizeText(initial.pan)) {
        changes.pan = currentPan;
      }

      const currentSc = normalizeNumber(getRawValue(formData, "sc"));
      if (currentSc !== normalizeNumber(initial.sc)) {
        changes.sc = currentSc;
      }

      const currentScTax = normalizeNumber(getRawValue(formData, "scTax"));
      if (currentScTax !== normalizeNumber(initial.scTax)) {
        changes.scTax = currentScTax;
      }

      const currentRevShare = normalizeNumber(getRawValue(formData, "revShare"));
      if (currentRevShare !== normalizeNumber(initial.revShare)) {
        changes.revShare = currentRevShare;
      }

      const currentPassword = normalizeText(getRawValue(formData, "password"));
      if (currentPassword !== normalizeText(initial.password)) {
        changes.password = currentPassword;
      }

      const currentMobile = normalizeText(getRawValue(formData, "mobile"));
      if (currentMobile !== normalizeText(initial.mobile)) {
        changes.mobile = currentMobile;
      }

      const currentAddress = normalizeText(getRawValue(formData, "address"));
      if (currentAddress !== normalizeText(initial.address)) {
        changes.address = currentAddress;
      }

      const currentThankyou = normalizeText(getRawValue(formData, "thankyouNote"));
      if (currentThankyou !== normalizeText(initial.thankyouNote)) {
        changes.thankyouNote = currentThankyou;
      }

      const currentReprint = normalizeText(getRawValue(formData, "rePrintPassword"));
      if (currentReprint !== normalizeText(initial.rePrintPassword)) {
        changes.rePrintPassword = currentReprint;
      }

      const currentSac = normalizeText(getRawValue(formData, "sac"));
      if (currentSac !== normalizeText(initial.sac)) {
        changes.sac = currentSac;
      }

      const currentInvoiceCount = normalizeNumber(getRawValue(formData, "invoicePrintCount"));
      if (currentInvoiceCount !== normalizeNumber(initial.invoicePrintCount)) {
        changes.invoicePrintCount = currentInvoiceCount;
      }

      const currentKotCount = normalizeNumber(getRawValue(formData, "kotPrintCount"));
      if (currentKotCount !== normalizeNumber(initial.kotPrintCount)) {
        changes.kotPrintCount = currentKotCount;
      }

      if (showSac !== Boolean(initial.showSac)) {
        changes.showSac = showSac ? 1 : 0;
      }
      if (autoPrint !== Boolean(initial.autoPrint)) {
        changes.autoPrint = autoPrint ? 1 : 0;
      }
      if (showKot !== Boolean(initial.kotPrint)) {
        changes.kotPrint = showKot ? 1 : 0;
      }

      const currentFormat = invoiceDefault ? "format1" : "format2";
      if (currentFormat !== normalizeText(initial.printFormat)) {
        changes.printFormat = currentFormat;
      }

      if (Object.keys(changes).length === 0) {
        onClose?.();
        return;
      }

      setIsSubmitting(true);
      try {
        await updateVendor({
          vendorId,
          token,
          payload: {
            eventId: Number(eventId),
            vendor: changes
          }
        });
        onToast?.({
          title: "Vendor Update",
          message: "Vendor details updated"
        });
        clearDraft();
        onSaved?.();
        onClose?.();
      } catch (error) {
        console.error("Failed to update vendor", error);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    const vendorPayload = {
      eventId: Number(eventId),
      type: getFieldValue(formData, "type", "fnb").toLowerCase(),
      password: getFieldValue(formData, "password", "1234"),
      rePrintPassword: getFieldValue(formData, "rePrintPassword", "2026"),
      thankyouNote: getFieldValue(
        formData,
        "thankyouNote",
        "Thank You for using AtomX POS"
      ),
      address: getFieldValue(formData, "address", " ")
    };

    const nameValue = getRawValue(formData, "name");
    addIfProvided(vendorPayload, "name", nameValue);

    const gstinValue = getRawValue(formData, "gstin");
    addIfProvided(vendorPayload, "gstin", gstinValue);

    const panValue = getRawValue(formData, "pan");
    addIfProvided(vendorPayload, "pan", panValue);

    const scValue = getRawValue(formData, "sc");
    addIfProvided(vendorPayload, "sc", scValue);

    const scTaxValue = getRawValue(formData, "scTax");
    addIfProvided(vendorPayload, "scTax", scTaxValue);

    const revShareValue = getRawValue(formData, "revShare");
    addIfProvided(vendorPayload, "revShare", revShareValue);

    const mobileValue = getRawValue(formData, "mobile");
    addIfProvided(vendorPayload, "mobile", mobileValue);

    const sacValue = getRawValue(formData, "sac");
    addIfProvided(vendorPayload, "sac", sacValue);

    const invoicePrintCountValue = getRawValue(formData, "invoicePrintCount");
    addIfProvided(vendorPayload, "invoicePrintCount", invoicePrintCountValue);

    const kotPrintCountValue = getRawValue(formData, "kotPrintCount");
    addIfProvided(vendorPayload, "kotPrintCount", kotPrintCountValue);

    if (showSac) {
      vendorPayload.showSac = 1;
    }
    if (autoPrint) {
      vendorPayload.autoPrint = 1;
    }
    if (showKot) {
      vendorPayload.kotPrint = 1;
    }
    if (!invoiceDefault) {
      vendorPayload.printFormat = "format2";
    }

    setIsSubmitting(true);
    try {
      await createVendor({ token, vendor: vendorPayload });
      formRef.current?.reset?.();
      setShowPrintDetails(false);
      setShowSac(false);
      setShowKot(false);
      setAutoPrint(false);
      setInvoiceDefault(true);
      onToast?.({
        title: "Vendor Created",
        message: "Vendor created successfully"
      });
      clearDraft();
      onSaved?.();
      onClose?.();
    } catch (error) {
      console.error("Failed to create vendor", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-6 transition-opacity duration-300 ${
        animateIn ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`w-full max-w-2xl max-h-[85vh] rounded-xl border border-[#e8d9d3] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)] transition-all duration-300 flex flex-col ${
          animateIn ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#e7e0dc] px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-800">Create Vendor</h2>
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

        <form
          ref={formRef}
          id="vendor-form"
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-4 px-6 py-4 overflow-y-auto min-h-0"
        >
          <div className="rounded-lg border border-slate-200 bg-[#f8fbfd] p-3">
            <h3 className="text-sm font-bold text-slate-700">Basics Details</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Vendor Name
                <input
                  type="text"
                  maxLength={50}
                  name="name"
                  defaultValue={vendor?.name ?? vendor?.vendorName ?? ""}
                  className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
                  placeholder="Enter vendor name"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Type
                <select
                  name="type"
                  defaultValue={String(vendor?.type ?? "fnb").toLowerCase()}
                  className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
                >
                  <option value="fnb">FNB</option>
                  <option value="pass">PASS</option>
                  <option value="ticket">TICKET</option>
                  <option value="sale">SALE</option>
                  <option value="inventory">INVENTORY</option>
                  <option value="tables">TABLES</option>
                  <option value="accessx">ACCESSX</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-600">
                GSTIN
                <input
                  type="text"
                  maxLength={50}
                  name="gstin"
                  defaultValue={vendor?.gstin ?? ""}
                  className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
                  placeholder="Enter GSTIN"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-600">
                PAN
                <input
                  type="text"
                  maxLength={50}
                  name="pan"
                  defaultValue={vendor?.pan ?? ""}
                  className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
                  placeholder="Enter PAN"
                />
              </label>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <h3 className="text-sm font-bold text-slate-700">Charges</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Service Charges
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  maxLength={50}
                  name="sc"
                  defaultValue={vendor?.sc ?? ""}
                  className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
                  placeholder="1.00"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Service Charge TAX
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  maxLength={50}
                  name="scTax"
                  defaultValue={vendor?.scTax ?? ""}
                  className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
                  placeholder="1.00"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Rev Share
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  maxLength={50}
                  name="revShare"
                  defaultValue={vendor?.revShare ?? ""}
                  className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
                  placeholder="1.00"
                />
              </label>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <h3 className="text-sm font-bold text-slate-700">Dashboard Password</h3>
            <div className="mt-3">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  maxLength={50}
                  name="password"
                  defaultValue={vendor?.password ?? "1234"}
                  className="w-full border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 3l18 18" />
                      <path d="M10.6 10.6a2 2 0 012.8 2.8" />
                      <path d="M9.9 5.1A10.3 10.3 0 0112 5c6 0 10 7 10 7a16.8 16.8 0 01-3 3.6" />
                      <path d="M6.6 6.6A16.7 16.7 0 002 12s4 7 10 7a9.7 9.7 0 004.3-1" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
            <button
              type="button"
              onClick={() => setShowPrintDetails((prev) => !prev)}
              className="flex items-center gap-3 text-sm text-slate-600"
            >
              Show Print Details
              <span
                className={`relative h-5 w-10 rounded-full transition ${
                  showPrintDetails ? "bg-[color:rgb(var(--color-teal))]" : "bg-slate-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
                    showPrintDetails ? "left-5" : "left-1"
                  }`}
                />
              </span>
            </button>
          </div>

          {showPrintDetails && (
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <h3 className="text-sm font-bold text-slate-700">Print Details</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-slate-600">
                  Mobile
                  <input
                    type="number"
                    inputMode="numeric"
                    name="mobile"
                    defaultValue={vendor?.mobile ?? ""}
                    className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
                    placeholder="Enter mobile"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-slate-600">
                  Address
                  <input
                    type="text"
                    maxLength={128}
                    name="address"
                    defaultValue={vendor?.address ?? ""}
                    className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
                    placeholder="Enter address"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-slate-600 md:col-span-2">
                  Thank You Note
                  <input
                    type="text"
                    maxLength={128}
                    name="thankyouNote"
                    defaultValue={
                      vendor?.thankyouNote ?? "Thank You for using AtomX POS"
                    }
                    className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
                    placeholder="Enter note"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-slate-600 md:col-span-2">
                  Re-print Password
                  <input
                    type="password"
                    name="rePrintPassword"
                    defaultValue={vendor?.rePrintPassword ?? ""}
                    className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
                    placeholder="Password"
                  />
                </label>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSac((prev) => !prev)}
                    className="flex items-center justify-between gap-3 text-sm text-slate-600"
                  >
                    SAC
                    <span
                      className={`relative h-5 w-10 rounded-full transition ${
                        showSac ? "bg-[color:rgb(var(--color-teal))]" : "bg-slate-200"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
                          showSac ? "left-5" : "left-1"
                        }`}
                      />
                    </span>
                  </button>
                  {showSac && (
                    <input
                      type="text"
                      name="sac"
                      defaultValue={vendor?.sac ?? ""}
                      className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
                      placeholder="Enter SAC"
                    />
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setAutoPrint((prev) => !prev)}
                    className="flex items-center justify-between gap-3 text-sm text-slate-600"
                  >
                    Auto Print
                    <span
                      className={`relative h-5 w-10 rounded-full transition ${
                        autoPrint ? "bg-[color:rgb(var(--color-teal))]" : "bg-slate-200"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
                          autoPrint ? "left-5" : "left-1"
                        }`}
                      />
                    </span>
                  </button>
                </div>

                <label className="flex flex-col gap-2 text-sm text-slate-600">
                  Max Invoice
                  <input
                    type="number"
                    inputMode="numeric"
                    name="invoicePrintCount"
                    defaultValue={vendor?.invoicePrintCount ?? ""}
                    className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
                    placeholder="0"
                  />
                </label>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setShowKot((prev) => !prev)}
                    className="flex items-center justify-between gap-3 text-sm text-slate-600"
                  >
                    KOT
                    <span
                      className={`relative h-5 w-10 rounded-full transition ${
                        showKot ? "bg-[color:rgb(var(--color-teal))]" : "bg-slate-200"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
                          showKot ? "left-5" : "left-1"
                        }`}
                      />
                    </span>
                  </button>
                  {showKot && (
                    <input
                      type="number"
                      inputMode="numeric"
                      name="kotPrintCount"
                      defaultValue={vendor?.kotPrintCount ?? ""}
                      className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
                      placeholder="Enter KOT number"
                    />
                  )}
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <button
                    type="button"
                    onClick={() => setInvoiceDefault((prev) => !prev)}
                    className="flex items-center gap-4 text-sm text-slate-600"
                  >
                    <span className="font-medium text-slate-600">Invoice Format</span>
                    <span className={`text-sm ${invoiceDefault ? "text-slate-700" : "text-slate-400"}`}>
                      Default
                    </span>
                    <span
                      className={`relative h-5 w-10 rounded-full transition ${
                        invoiceDefault ? "bg-slate-200" : "bg-[#22c55e]"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
                          invoiceDefault ? "left-1" : "left-5"
                        }`}
                      />
                    </span>
                    <span className={`text-sm ${invoiceDefault ? "text-slate-400" : "text-blue-500"}`}>
                      Format2
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
        <div className="border-t border-slate-200 bg-white px-6 py-4">
          <div className="flex justify-end">
            <button
              type="submit"
              form="vendor-form"
              disabled={isSubmitting}
              className="rounded-md bg-[color:rgb(var(--color-teal))] px-4 py-2 text-sm font-semibold text-white shadow-[0_6px_12px_rgb(var(--color-teal)/0.25)]"
            >
              {isSubmitting ? "Saving..." : "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
