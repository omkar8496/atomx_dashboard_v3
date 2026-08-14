"use client";

import { useEffect, useMemo, useState } from "react";
import { updateDeviceMasterlist } from "../../../lib/dashboardApi";
import DeviceFormModal, { Field, SelectField } from "./DeviceFormModal";
import DeviceBankCredentials, {
  DEFAULT_BANK_TYPES,
  DEFAULT_DEVICE_TYPES,
  DEFAULT_MODEL_TYPES,
  getDefaultBankData,
  sanitizeBankData
} from "./DeviceBankCredentials";

const SECTIONS = [
  {
    label: "Device Information",
    hint: "IDENTITY & HARDWARE",
    title: "DEVICE INFORMATION",
    sub: "Identity, hardware and NFC configuration for this device."
  },
  {
    label: "Bank Credentials",
    hint: "PAYMENT CREDENTIALS",
    title: "BANK CREDENTIALS",
    sub: "Acquirer credentials used for card and UPI transactions."
  }
];

function normalizeBankData(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value;
  }
  return {};
}

function createFormState(device) {
  const bank = device?.bank ?? "";
  const bankData = {
    ...getDefaultBankData(bank),
    ...normalizeBankData(device?.bankData)
  };
  return {
    id: device?.id ?? "",
    printId: device?.printId ?? "",
    hardwareId: device?.hardwareId ?? "",
    androidId: device?.androidId ?? "",
    type: device?.type ?? "",
    bank,
    model: device?.model ?? "",
    reference: device?.reference ?? "",
    description: device?.description ?? "",
    hasNfc: Number(device?.hasNfc) === 1 ? "1" : "0",
    nfcType: device?.nfcType ?? "",
    status: device?.status ?? "active",
    updatedAt: device?.updatedAt ?? null,
    createdAt: device?.createdAt ?? null,
    bankData
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
  const [section, setSection] = useState(0);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setForm(initialState);
    setError("");
    setSection(0);
    setDirty(false);
  }, [initialState]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "bank" ? { bankData: getDefaultBankData(value) } : {})
    }));
    setDirty(true);
    setError("");
  };

  const handleBankChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      bankData: { ...current.bankData, [name]: value }
    }));
    setDirty(true);
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
      bankData: sanitizeBankData(form.bank, form.bankData)
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
    <DeviceFormModal
      eyebrow="EDIT DEVICE"
      heading={form.printId || `#${form.id}`}
      identityName={form.description || form.androidId || form.model || "Master device"}
      identityMac={form.hardwareId}
      sections={SECTIONS}
      activeSection={section}
      onSectionChange={setSection}
      activeTitle={SECTIONS[section].title}
      activeSub={SECTIONS[section].sub}
      dirty={dirty}
      error={error}
      saving={saving}
      submitLabel="Save Changes"
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      {section === 0 ? (
        <>
          <Field label="DEVICE ID" name="id" value={form.id} onChange={handleChange} readOnly />
          <Field label="PRINT ID" name="printId" value={form.printId} onChange={handleChange} required />
          <Field label="HARDWARE ID" name="hardwareId" value={form.hardwareId} onChange={handleChange} required />
          <Field label="ANDROID ID" name="androidId" value={form.androidId} onChange={handleChange} />
          <SelectField label="TYPE" name="type" value={form.type} onChange={handleChange}>
            {form.type && !DEFAULT_DEVICE_TYPES.some(([value]) => value === form.type) ? (
              <option value={form.type}>{form.type}</option>
            ) : null}
            {DEFAULT_DEVICE_TYPES.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </SelectField>
          <SelectField label="BANK" name="bank" value={form.bank} onChange={handleChange}>
            {form.bank && !DEFAULT_BANK_TYPES.some(([value]) => value === form.bank) ? (
              <option value={form.bank}>{form.bank}</option>
            ) : null}
            {DEFAULT_BANK_TYPES.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </SelectField>
          <SelectField label="MODEL" name="model" value={form.model} onChange={handleChange}>
            {form.model && !DEFAULT_MODEL_TYPES.some(([value]) => value === form.model) ? (
              <option value={form.model}>{form.model}</option>
            ) : null}
            {DEFAULT_MODEL_TYPES.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </SelectField>
          <Field label="REFERENCE" name="reference" value={form.reference} onChange={handleChange} />
          <Field label="NFC TYPE" name="nfcType" value={form.nfcType} onChange={handleChange} />
          <SelectField label="NFC" name="hasNfc" value={form.hasNfc} onChange={handleChange}>
            <option value="1">Enabled</option>
            <option value="0">Disabled</option>
          </SelectField>
          <SelectField label="STATUS" name="status" value={form.status} onChange={handleChange}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </SelectField>
          <Field label="DESCRIPTION" name="description" value={form.description} onChange={handleChange} wide />
        </>
      ) : (
        <DeviceBankCredentials
          bank={form.bank}
          bankData={form.bankData}
          onChange={handleBankChange}
        />
      )}
    </DeviceFormModal>
  );
}
