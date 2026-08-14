"use client";

import { useEffect, useState } from "react";

function CloseIcon() {
  return (
    <svg viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
    </svg>
  );
}

export default function CreateAccessGateMasterModal({ onClose, onConfirm }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !saving) onClose?.();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, saving]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalizedName = name.trim();
    if (!normalizedName) return;

    setSaving(true);
    setError("");
    try {
      await onConfirm?.({ name: normalizedName });
    } catch {
      setError("Unable to create this gate master. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(12,12,12,0.5)] p-4 backdrop-blur-[3px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose?.();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-access-gate-master-title"
        className="w-full max-w-[440px] overflow-hidden rounded-[16px] border border-(--line) bg-(--surface) shadow-(--shadowUp)"
      >
        <header
          className="relative overflow-hidden px-5 py-4"
          style={{ background: "linear-gradient(120deg,#1C1C1C 0%,#341CD6 62%,#E04420 130%)" }}
        >
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p className="font-vcr text-[9px] uppercase tracking-[0.2em] text-(--purple)">AccessX</p>
              <h2 id="create-access-gate-master-title" className="font-chillax mt-1 text-[clamp(18px,2.2vw,24px)] font-semibold tracking-[-0.01em] text-white">
                Add Gate Master
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] border border-white/20 text-white/80 transition hover:border-(--orange) hover:bg-(--orange) disabled:opacity-40"
              aria-label="Close gate master form"
            >
              <CloseIcon />
            </button>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="p-5 max-[640px]:p-4">
          <label className="block">
            <span className="font-vcr mb-1.5 block text-[8.5px] uppercase tracking-[0.16em] text-(--muted)">Name</span>
            <input
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter gate master name"
              className="h-11 w-full rounded-[10px] border border-(--line) bg-(--surface) px-3.5 text-[13px] font-medium text-(--text) outline-none transition placeholder:text-(--faint) focus:border-(--orange) focus:shadow-[0_0_0_3px_rgba(224,68,32,0.12)]"
            />
          </label>

          {error ? (
            <p className="mt-3 rounded-[10px] border border-[rgba(224,68,32,0.25)] bg-[rgba(224,68,32,0.06)] px-3 py-2 text-[12px] font-semibold text-(--orange)">
              {error}
            </p>
          ) : null}

          <div className="mt-5 flex justify-end gap-2.5 border-t border-(--line) pt-4 max-[640px]:grid max-[640px]:grid-cols-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex h-11 items-center justify-center rounded-[10px] border border-(--line) bg-(--surface) px-5 text-[13px] font-semibold text-(--muted) transition hover:border-(--orange) hover:text-(--orange) disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="flex h-11 items-center justify-center rounded-[10px] bg-(--text) px-6 text-[13px] font-semibold text-(--bg) transition hover:bg-(--orange) disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Creating…" : "Confirm"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
