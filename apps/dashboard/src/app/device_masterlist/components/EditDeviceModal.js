"use client";

import { useEffect, useMemo, useState } from "react";
import { updateDeviceMasterlist } from "../../../lib/dashboardApi";

const BANK_FIELDS = [
  ["bank_mswipe_username", "Mswipe username"],
  ["bank_mswipe_password", "Mswipe password"],
  ["bank_mswipe_verify_client_code", "Verify client code"],
  ["bank_mswipe_verify_user_id", "Verify user ID"],
  ["bank_mswipe_verify_password", "Verify password"],
  ["bank_mswipe_upi_api", "UPI API"]
];

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function Field({ label, name, value, onChange, type = "text", required = false, readOnly = false }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#858585]">
        {label}
      </span>
      <input
        name={name}
        value={value ?? ""}
        onChange={onChange}
        type={type}
        required={required}
        readOnly={readOnly}
        className={`h-10 w-full rounded-lg border px-3 text-[0.78rem] font-medium outline-none transition ${
          readOnly
            ? "border-[#ececec] bg-[#f5f5f5] text-[#8a8a8a]"
            : "border-[#dedede] bg-white text-[#1c1c1c] focus:border-[#E04420] focus:ring-3 focus:ring-[#E04420]/10"
        }`}
      />
    </label>
  );
}

function SelectField({ label, name, value, onChange, children }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#858585]">
        {label}
      </span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="h-10 w-full rounded-lg border border-[#dedede] bg-white px-3 text-[0.78rem] font-medium text-[#1c1c1c] outline-none transition focus:border-[#E04420] focus:ring-3 focus:ring-[#E04420]/10"
      >
        {children}
      </select>
    </label>
  );
}

function normalizeBankData(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value;
  }
  return {};
}

function createFormState(device) {
  const bankData = normalizeBankData(device?.bankData);
  return {
    id: device?.id ?? "",
    printId: device?.printId ?? "",
    hardwareId: device?.hardwareId ?? "",
    androidId: device?.androidId ?? "",
    type: device?.type ?? "",
    bank: device?.bank ?? "",
    model: device?.model ?? "",
    reference: device?.reference ?? "",
    description: device?.description ?? "",
    hasNfc: Number(device?.hasNfc) === 1 ? "1" : "0",
    nfcType: device?.nfcType ?? "",
    status: device?.status ?? "active",
    updatedAt: device?.updatedAt ?? null,
    createdAt: device?.createdAt ?? null,
    bankData: Object.fromEntries(
      BANK_FIELDS.map(([key]) => [key, bankData[key] ?? ""])
    )
  };
}

function getUpdatedDevice(result, payload) {
  const directData =
    result?.data &&
    !Array.isArray(result.data) &&
    (result.data.id || result.data.hardwareId)
      ? result.data
      : null;
  const returned =
    result?.device ??
    result?.data?.device ??
    (result?.id || result?.hardwareId ? result : null) ??
    directData;

  return returned && typeof returned === "object"
    ? { ...payload, ...returned, bankData: returned.bankData ?? payload.bankData }
    : payload;
}

export default function EditDeviceModal({ device, token, onClose, onSaved }) {
  const initialState = useMemo(() => createFormState(device), [device]);
  const [form, setForm] = useState(initialState);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(initialState);
    setError("");
  }, [initialState]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !saving) onClose?.();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, saving]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  };

  const handleBankChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      bankData: { ...current.bankData, [name]: value }
    }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.id) {
      setError("Device ID is missing.");
      return;
    }

    if (!String(form.hardwareId).trim()) {
      setError("Hardware ID is required.");
      return;
    }

    const payload = {
      id: Number(form.id),
      printId: String(form.printId).trim(),
      hardwareId: String(form.hardwareId).trim(),
      androidId: String(form.androidId).trim(),
      type: String(form.type).trim(),
      bank: String(form.bank).trim(),
      model: String(form.model).trim(),
      reference: String(form.reference).trim(),
      description: String(form.description).trim(),
      hasNfc: Number(form.hasNfc),
      nfcType: String(form.nfcType).trim(),
      updatedAt: form.updatedAt,
      createdAt: form.createdAt,
      status: form.status,
      bankData: Object.fromEntries(
        BANK_FIELDS.map(([key]) => [key, String(form.bankData[key] ?? "").trim()])
      )
    };

    setSaving(true);
    setError("");

    try {
      const result = await updateDeviceMasterlist({ token, payload });
      onSaved?.(getUpdatedDevice(result, payload));
    } catch (submitError) {
      console.error("Failed to update master device", submitError);
      setError(submitError?.message || "Unable to update device.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[230] flex h-dvh items-center justify-center overflow-hidden bg-[#1c1c1c]/45 px-4 py-6 backdrop-blur-[3px] max-[640px]:px-3 max-[640px]:py-3"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose?.();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[calc(100dvh-48px)] w-full max-w-[920px] flex-col overflow-hidden rounded-xl border border-[#d5b7ff]/70 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.28)] max-[640px]:max-h-[calc(100dvh-24px)]"
      >
        <header className="flex shrink-0 items-center justify-between bg-[#1c1c1c] px-6 py-4 text-white max-[640px]:px-4 max-[640px]:py-3">
          <div className="min-w-0">
            <p className="m-0 text-[0.6rem] font-bold uppercase tracking-[0.24em] text-[#D5B7FF]">
              Device Master List
            </p>
            <h2 className="m-0 mt-1 truncate text-[1.08rem] font-semibold">
              Edit device {form.printId || `#${form.id}`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/15 text-white/75 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close edit device"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 max-[640px]:px-4 max-[640px]:py-4">
          <section>
            <h3 className="m-0 text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[#E04420]">
              Device information
            </h3>
            <div className="mt-3 grid grid-cols-3 gap-x-4 gap-y-3 max-[760px]:grid-cols-2 max-[520px]:grid-cols-1">
              <Field label="Device ID" name="id" value={form.id} onChange={handleChange} readOnly />
              <Field label="Print ID" name="printId" value={form.printId} onChange={handleChange} required />
              <Field label="Hardware ID" name="hardwareId" value={form.hardwareId} onChange={handleChange} required />
              <Field label="Android ID" name="androidId" value={form.androidId} onChange={handleChange} />
              <Field label="Type" name="type" value={form.type} onChange={handleChange} />
              <Field label="Bank" name="bank" value={form.bank} onChange={handleChange} />
              <Field label="Model" name="model" value={form.model} onChange={handleChange} />
              <Field label="Reference" name="reference" value={form.reference} onChange={handleChange} />
              <Field label="Description" name="description" value={form.description} onChange={handleChange} />
              <SelectField label="NFC" name="hasNfc" value={form.hasNfc} onChange={handleChange}>
                <option value="1">Enabled</option>
                <option value="0">Disabled</option>
              </SelectField>
              <Field label="NFC type" name="nfcType" value={form.nfcType} onChange={handleChange} />
              <SelectField label="Status" name="status" value={form.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </SelectField>
            </div>
          </section>

          <section className="mt-6 border-t border-[#ececec] pt-5">
            <h3 className="m-0 text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[#E04420]">
              Mswipe bank data
            </h3>
            <div className="mt-3 grid grid-cols-3 gap-x-4 gap-y-3 max-[760px]:grid-cols-2 max-[520px]:grid-cols-1">
              {BANK_FIELDS.map(([name, label]) => (
                <Field
                  key={name}
                  label={label}
                  name={name}
                  value={form.bankData[name]}
                  onChange={handleBankChange}
                  type={name.includes("password") ? "password" : "text"}
                />
              ))}
            </div>
          </section>

          {error ? (
            <p className="m-0 mt-4 rounded-lg border border-[#E04420]/20 bg-[#fff4f1] px-3 py-2 text-[0.74rem] font-semibold text-[#c73617]">
              {error}
            </p>
          ) : null}
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-[#ececec] bg-[#fafafa] px-6 py-4 max-[640px]:px-4 max-[640px]:py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="h-10 rounded-lg border border-[#dedede] bg-white px-5 text-[0.76rem] font-semibold text-[#4b4b4b] transition hover:border-[#b8b8b8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="h-10 rounded-lg bg-[#1c1c1c] px-6 text-[0.76rem] font-semibold text-white shadow-[0_12px_24px_rgba(28,28,28,0.16)] transition hover:bg-[#E04420] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </footer>
      </form>
    </div>
  );
}
