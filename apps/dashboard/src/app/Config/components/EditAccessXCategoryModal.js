"use client";

import { useEffect, useState } from "react";

const FIELD_CLASS =
  "h-11 w-full rounded-[10px] border border-(--line) bg-(--surface) px-3.5 text-[13px] font-medium text-(--text) outline-none transition placeholder:text-(--faint) focus:border-(--orange) focus:shadow-[0_0_0_3px_rgba(224,68,32,0.12)]";

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
    <svg viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
    </svg>
  );
}

function FormField({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <label className="block min-w-0">
      <span className="font-vcr mb-1.5 block text-[8.5px] uppercase tracking-[0.16em] text-(--muted)">{label}</span>
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

export default function EditAccessXCategoryModal({ category, mode = "edit", onClose, onConfirm }) {
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
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(12,12,12,0.5)] p-4 backdrop-blur-[3px] max-[640px]:p-0"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-accessx-category-title"
        className="flex max-h-[calc(100dvh-48px)] w-full max-w-[680px] flex-col overflow-hidden rounded-[16px] border border-(--line) bg-(--surface) shadow-(--shadowUp) max-[640px]:h-full max-[640px]:max-h-full max-[640px]:rounded-none"
      >
        <header
          className="relative shrink-0 overflow-hidden px-5 py-4"
          style={{ background: "linear-gradient(120deg,#1C1C1C 0%,#341CD6 62%,#E04420 130%)" }}
        >
          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-vcr text-[9px] uppercase tracking-[0.2em] text-(--purple)">AccessX Category</p>
              <h2 id="edit-accessx-category-title" className="font-chillax mt-1 truncate text-[clamp(18px,2.2vw,24px)] font-semibold tracking-[-0.01em] text-white">
                {isCreate ? "Add Category" : `Edit ${category?.name || "Category"}`}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] border border-white/20 text-white/80 transition hover:border-(--orange) hover:bg-(--orange)"
              aria-label="Close category editor"
            >
              <CloseIcon />
            </button>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto p-5 max-[640px]:p-4">
            <div className="grid gap-4 sm:grid-cols-2 max-[640px]:gap-3">
              <div className="sm:col-span-2">
                <FormField label="Name" value={form.name} onChange={(value) => setField("name", value)} placeholder="Category name" />
              </div>

              <label className="block min-w-0">
                <span className="font-vcr mb-1.5 block text-[8.5px] uppercase tracking-[0.16em] text-(--muted)">Access Allow Count</span>
                <div className="relative">
                  <select
                    value={form.allowCount}
                    onChange={(event) => setField("allowCount", Number(event.target.value))}
                    className={`${FIELD_CLASS} cursor-pointer appearance-none pr-9`}
                  >
                    {ALLOW_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <svg viewBox="0 0 12 12" className="pointer-events-none absolute right-3.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 opacity-50" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M2.5 4.5 6 8l3.5-3.5" />
                  </svg>
                </div>
              </label>

              <FormField label="Position" type="number" value={form.position} onChange={(value) => setField("position", value)} placeholder="Position" />

              <FormField label="Issuer ID" value={form.qrLogicIssuerId} onChange={(value) => setField("qrLogicIssuerId", value)} placeholder="Issuer ID" />
              <FormField label="Sector ID" value={form.qrLogicSectorId} onChange={(value) => setField("qrLogicSectorId", value)} placeholder="Sector ID" />
              <FormField label="Discount ID" value={form.qrLogicDiscountId} onChange={(value) => setField("qrLogicDiscountId", value)} placeholder="Discount ID" />
              <FormField label="Ticket Type" value={form.qrLogicTicketType} onChange={(value) => setField("qrLogicTicketType", value)} placeholder="Ticket type" />
              <div className="sm:col-span-2">
                <FormField label="Ticket / Accred" value={form.qrLogicTktAccred} onChange={(value) => setField("qrLogicTktAccred", value)} placeholder="Ticket or accreditation" />
              </div>
            </div>

            {error ? (
              <p className="mt-4 rounded-[10px] border border-[rgba(224,68,32,0.25)] bg-[rgba(224,68,32,0.06)] px-3 py-2 text-[12px] font-semibold text-(--orange)">
                {error}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 justify-end gap-2.5 border-t border-(--line) bg-(--surface2) px-5 py-4 max-[640px]:grid max-[640px]:grid-cols-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex h-11 items-center justify-center rounded-[10px] border border-(--line) bg-(--surface) px-5 text-[13px] font-semibold text-(--muted) transition hover:border-(--orange) hover:text-(--orange)"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !form.name.trim()}
              className="flex h-11 items-center justify-center rounded-[10px] bg-(--text) px-6 text-[13px] font-semibold text-(--bg) transition hover:bg-(--orange) disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving…" : isCreate ? "Add Category" : "Confirm"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
