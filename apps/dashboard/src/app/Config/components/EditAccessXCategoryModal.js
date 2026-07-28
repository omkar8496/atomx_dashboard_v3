"use client";

import { useEffect, useState } from "react";

const FIELD_CLASS =
  "h-10 w-full rounded-lg border border-[#dedede] bg-white px-3 text-[0.8rem] font-semibold text-[#242424] outline-none transition placeholder:text-[#a5a5a5] focus:border-[#E04420] focus:ring-2 focus:ring-[#E04420]/10 max-[640px]:h-9 max-[640px]:text-[0.72rem]";

const ALLOW_OPTIONS = [
  { label: "Always Allow", value: 0 },
  ...Array.from({ length: 9 }, (_, index) => ({
    label: `${index + 1} ${index === 0 ? "Time" : "Times"}`,
    value: index + 1
  }))
];

function valueOf(value) {
  return value === null || value === undefined ? "" : String(value);
}

function createForm(category) {
  return {
    name: valueOf(category?.name),
    allowCount: Number(category?.allowCount) || 0,
    position: valueOf(category?.position),
    qrLogicIssuerId: valueOf(category?.qrLogicIssuerId),
    qrLogicSectorId: valueOf(category?.qrLogicSectorId),
    qrLogicDiscountId: valueOf(category?.qrLogicDiscountId),
    qrLogicTicketType: valueOf(category?.qrLogicTicketType),
    qrLogicTktAccred: valueOf(category?.qrLogicTktAccred)
  };
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
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function FormField({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[0.6rem] font-bold uppercase tracking-[0.13em] text-[#8c8c8c]">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={FIELD_CLASS}
      />
    </label>
  );
}

export default function EditAccessXCategoryModal({
  category,
  mode = "edit",
  onClose,
  onConfirm
}) {
  const [form, setForm] = useState(() => createForm(category));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isCreate = mode === "create";

  useEffect(() => {
    setForm(createForm(category));
    setError("");
  }, [category]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onConfirm?.({
        ...form,
        allowCount: Number(form.allowCount) || 0,
        position: form.position === "" ? null : Number(form.position),
        qrLogicIssuerId: form.qrLogicIssuerId || null,
        qrLogicSectorId: form.qrLogicSectorId || null,
        qrLogicDiscountId: form.qrLogicDiscountId || null,
        qrLogicTicketType: form.qrLogicTicketType || null,
        qrLogicTktAccred: form.qrLogicTktAccred || null
      });
    } catch {
      setError("Unable to save this category. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#111827]/42 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-accessx-category-title"
        className="max-h-[calc(100vh-2rem)] w-full max-w-[680px] overflow-y-auto rounded-lg border border-[#ded4ff] bg-white shadow-[0_28px_75px_rgba(15,23,42,0.24)]"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#1c1c1c] px-5 py-4 text-white max-[640px]:px-4 max-[640px]:py-3">
          <div>
            <p className="text-[0.58rem] font-bold uppercase tracking-[0.17em] text-[#ff9a86]">
              AccessX Category
            </p>
            <h2 id="edit-accessx-category-title" className="mt-1 text-[1.15rem] font-semibold">
              {isCreate ? "Add Category" : `Edit ${category?.name || "Category"}`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md text-white/75 transition hover:bg-white/10 hover:text-white"
            aria-label="Close category editor"
          >
            <CloseIcon />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-5 max-[640px]:p-4">
          <div className="grid gap-4 sm:grid-cols-2 max-[640px]:gap-3">
            <div className="sm:col-span-2">
              <FormField
                label="Name"
                value={form.name}
                onChange={(value) => setField("name", value)}
                placeholder="Category name"
              />
            </div>

            <label className="block min-w-0">
              <span className="mb-1.5 block text-[0.6rem] font-bold uppercase tracking-[0.13em] text-[#8c8c8c]">
                Access Allow Count
              </span>
              <select
                value={form.allowCount}
                onChange={(event) => setField("allowCount", Number(event.target.value))}
                className={`${FIELD_CLASS} appearance-none bg-[linear-gradient(45deg,transparent_50%,#777_50%),linear-gradient(135deg,#777_50%,transparent_50%)] bg-[position:calc(100%-16px)_17px,calc(100%-11px)_17px] bg-[size:5px_5px,5px_5px] bg-no-repeat pr-9 max-[640px]:bg-[position:calc(100%-16px)_15px,calc(100%-11px)_15px]`}
              >
                {ALLOW_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <FormField
              label="Position"
              type="number"
              value={form.position}
              onChange={(value) => setField("position", value)}
              placeholder="Position"
            />

            <FormField
              label="Issuer ID"
              value={form.qrLogicIssuerId}
              onChange={(value) => setField("qrLogicIssuerId", value)}
              placeholder="Issuer ID"
            />
            <FormField
              label="Sector ID"
              value={form.qrLogicSectorId}
              onChange={(value) => setField("qrLogicSectorId", value)}
              placeholder="Sector ID"
            />
            <FormField
              label="Discount ID"
              value={form.qrLogicDiscountId}
              onChange={(value) => setField("qrLogicDiscountId", value)}
              placeholder="Discount ID"
            />
            <FormField
              label="Ticket Type"
              value={form.qrLogicTicketType}
              onChange={(value) => setField("qrLogicTicketType", value)}
              placeholder="Ticket type"
            />
            <div className="sm:col-span-2">
              <FormField
                label="Ticket / Accred"
                value={form.qrLogicTktAccred}
                onChange={(value) => setField("qrLogicTktAccred", value)}
                placeholder="Ticket or accreditation"
              />
            </div>
          </div>

          {error ? (
            <p className="mt-4 rounded-md border border-[#ffd2ca] bg-[#fff6f3] px-3 py-2 text-[0.7rem] font-semibold text-[#E04420]">
              {error}
            </p>
          ) : null}

          <div className="mt-5 flex justify-end gap-2 border-t border-[#ececec] pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-9 rounded-md border border-[#dedede] bg-white px-4 text-[0.75rem] font-bold text-[#686868] transition hover:border-[#1c1c1c] hover:text-[#1c1c1c]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !form.name.trim()}
              className="h-9 rounded-md bg-[#1c1c1c] px-5 text-[0.75rem] font-bold text-white transition hover:bg-[#E04420] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : isCreate ? "Add Category" : "Confirm"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
