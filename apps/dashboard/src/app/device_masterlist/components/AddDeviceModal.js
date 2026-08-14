"use client";

import { useState } from "react";
import { addDeviceMasterlist } from "../../../lib/dashboardApi";
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
    sub: "Identity, hardware and configuration for the new device."
  }
];

const EMPTY_FORM = {
  device: "",
  mac: "",
  androidId: "",
  reference: "",
  description: "",
  type: "",
  model: "",
  bank: "",
  bankData: {}
};

export default function AddDeviceModal({ token, onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "bank"
        ? {
            bankData: getDefaultBankData(value)
          }
        : {})
    }));
    setDirty(true);
    setError("");
  };

  const handleBankFieldChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      bankData: { ...(current.bankData ?? {}), [name]: value }
    }));
    setDirty(true);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!String(form.device).trim()) {
      setError("Device ID is required.");
      return;
    }
    if (!String(form.mac).trim()) {
      setError("MAC ID is required.");
      return;
    }
    if (!form.type || !form.model || !form.bank) {
      setError("Type, device model, and bank are required.");
      return;
    }

    const timestamp = new Date().toISOString();
    const payload = {
      printId: String(form.device).trim(),
      hardwareId: String(form.mac).trim(),
      androidId: String(form.androidId).trim(),
      type: String(form.type).trim(),
      bank: String(form.bank).trim(),
      model: String(form.model).trim(),
      reference: String(form.reference).trim(),
      description: String(form.description).trim(),
      hasNfc: 1,
      nfcType: "inbuilt",
      updatedAt: timestamp,
      createdAt: timestamp,
      status: "active",
      bankData: sanitizeBankData(form.bank, form.bankData)
    };

    setSaving(true);
    setError("");
    try {
      const result = await addDeviceMasterlist({ token, payload });
      const createdDevice =
        result?.device ??
        result?.data?.device ??
        (result?.data && !Array.isArray(result.data) ? result.data : null) ??
        (result && typeof result === "object" ? result : null);
      onCreated?.(createdDevice ? { ...payload, ...createdDevice } : payload);
    } catch (submitError) {
      console.error("Failed to add master device", submitError);
      setError(submitError?.message || "Unable to add device.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DeviceFormModal
      eyebrow="ADD DEVICE"
      heading="New Device"
      sections={SECTIONS}
      activeSection={0}
      onSectionChange={() => {}}
      activeTitle={SECTIONS[0].title}
      activeSub={SECTIONS[0].sub}
      dirty={dirty}
      error={error}
      saving={saving}
      submitLabel="Create Device"
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <Field label="DEVICE" name="device" value={form.device} onChange={handleChange} placeholder="Not set" required />
      <Field label="MAC" name="mac" value={form.mac} onChange={handleChange} placeholder="Not set" required />
      <Field label="ANDROID ID" name="androidId" value={form.androidId} onChange={handleChange} placeholder="Not set" />
      <Field label="REFERENCE" name="reference" value={form.reference} onChange={handleChange} placeholder="Not set" />
      <Field label="DESCRIPTION" name="description" value={form.description} onChange={handleChange} placeholder="Not set" />
      <SelectField label="TYPE" name="type" value={form.type} onChange={handleChange}>
        <option value="">Select Type</option>
        {DEFAULT_DEVICE_TYPES.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </SelectField>
      <SelectField label="DEVICE MODEL" name="model" value={form.model} onChange={handleChange}>
        <option value="">Select Device Model</option>
        {DEFAULT_MODEL_TYPES.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </SelectField>
      <SelectField label="BANK" name="bank" value={form.bank} onChange={handleChange}>
        <option value="">Select Bank</option>
        {DEFAULT_BANK_TYPES.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </SelectField>

      <DeviceBankCredentials
        bank={form.bank}
        bankData={form.bankData}
        onChange={handleBankFieldChange}
      />
    </DeviceFormModal>
  );
}
