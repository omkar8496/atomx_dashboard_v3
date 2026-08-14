"use client";

import { useEffect } from "react";

const INPUT_CLASS =
  "h-[46px] w-full rounded-[10px] border border-(--line) bg-(--surface) px-3.5 text-[13.5px] font-medium text-(--text) outline-none transition focus:border-(--orange) focus:shadow-[0_0_0_3px_rgba(224,68,32,0.12)]";

const INPUT_DISABLED_CLASS =
  "h-[46px] w-full rounded-[10px] border border-(--line) bg-(--surface2) px-3.5 text-[13.5px] font-medium text-(--faint) outline-none";

function FieldLabel({ children }) {
  return (
    <label className="font-vcr mb-[7px] block text-[8.5px] tracking-[0.16em] text-(--muted)">
      {children}
    </label>
  );
}

export function Field({ label, name, value, onChange, type = "text", placeholder = "", required = false, readOnly = false, wide = false }) {
  return (
    <div className={`min-w-0 ${wide ? "[grid-column:1/-1]" : ""}`}>
      <FieldLabel>{label}</FieldLabel>
      <input
        name={name}
        value={value ?? ""}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        required={required}
        readOnly={readOnly}
        disabled={readOnly}
        className={readOnly ? INPUT_DISABLED_CLASS : INPUT_CLASS}
      />
    </div>
  );
}

export function SelectField({ label, name, value, onChange, children, wide = false }) {
  return (
    <div className={`min-w-0 ${wide ? "[grid-column:1/-1]" : ""}`}>
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`${INPUT_CLASS} cursor-pointer appearance-none pr-9`}
        >
          {children}
        </select>
        <svg
          viewBox="0 0 12 12"
          className="pointer-events-none absolute right-3.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 opacity-50"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M2.5 4.5 6 8l3.5-3.5" />
        </svg>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
    </svg>
  );
}

export default function DeviceFormModal({
  eyebrow,
  heading,
  identityName,
  identityMac,
  sections,
  activeSection,
  onSectionChange,
  activeTitle,
  activeSub,
  dirty = false,
  error = "",
  saving = false,
  submitLabel = "Save Changes",
  onClose,
  onSubmit,
  children
}) {
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

  return (
    <div
      className="fixed inset-0 z-[230] flex items-center justify-center bg-[rgba(12,12,12,0.5)] px-4 py-6 backdrop-blur-[3px] max-[820px]:p-0"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose?.();
      }}
    >
      <div className="flex h-auto max-h-[calc(100dvh-48px)] w-[1040px] max-w-full flex-col overflow-hidden rounded-[16px] border border-(--line) bg-(--surface) shadow-(--shadowUp) max-[820px]:h-full max-[820px]:max-h-full max-[820px]:rounded-none md:flex-row">
        {/* Sidebar */}
        <aside
          className="relative flex shrink-0 flex-col gap-[18px] p-[clamp(20px,2.4vw,26px)] text-[#ebebeb] md:w-[272px]"
          style={{ background: "linear-gradient(165deg,#1C1C1C 0%,#241C4A 78%,#341CD6 150%)" }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.14]"
            style={{ background: "repeating-linear-gradient(90deg,#fff 0 1px,transparent 1px 34px)" }}
            aria-hidden
          />

          <div className="relative flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-[linear-gradient(140deg,#e04420,#8b5cf6)]">
              <svg viewBox="0 0 16 16" className="h-[19px] w-[19px]" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4.4" y="1.9" width="7.2" height="12.2" rx="1.4" />
                <path d="M6.8 11.9h2.4" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-vcr text-[9px] tracking-[0.2em] text-(--purple)">{eyebrow}</div>
              <div className="font-chillax mt-1.5 truncate text-[clamp(22px,2.6vw,28px)] font-semibold leading-[1.05] tracking-[-0.02em] text-white">
                {heading}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              aria-label="Close"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] border border-white/20 text-[#ebebeb] transition hover:border-(--orange) hover:bg-(--orange) disabled:opacity-50 md:hidden"
            >
              <CloseIcon />
            </button>
          </div>

          {identityName ? (
            <div className="relative rounded-[12px] border border-white/10 bg-white/[0.07] p-[13px_14px] max-[820px]:hidden">
              <div className="text-[13px] font-semibold leading-[1.35] text-white [overflow-wrap:anywhere]">
                {identityName}
              </div>
              {identityMac ? (
                <div className="font-vcr mt-1.5 text-[11px] text-white/60 [overflow-wrap:anywhere]">
                  {identityMac}
                </div>
              ) : null}
            </div>
          ) : null}

          <nav className="relative flex gap-1.5 max-[820px]:overflow-x-auto md:mt-auto md:flex-col">
            {sections.map((section, index) => {
              const isActive = index === activeSection;
              return (
                <button
                  key={section.label}
                  type="button"
                  onClick={() => onSectionChange(index)}
                  className={`flex shrink-0 items-center gap-3 rounded-[11px] p-[11px_12px] text-left transition ${
                    isActive ? "bg-white/[0.12] text-white" : "text-white/70 hover:bg-white/[0.09]"
                  }`}
                >
                  <span
                    className={`font-vcr grid h-7 w-7 shrink-0 place-items-center rounded-[8px] text-[10px] ${
                      isActive ? "bg-(--orange) text-white" : "bg-white/10 text-white/70"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-semibold">{section.label}</span>
                    <span className="font-vcr mt-0.5 block text-[8px] tracking-[0.14em] opacity-60">{section.hint}</span>
                  </span>
                  {isActive ? <span className="h-6 w-[5px] shrink-0 rounded-full bg-(--orange) max-[820px]:hidden" /> : null}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Form panel */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex shrink-0 items-start gap-3 border-b border-(--line) px-[clamp(16px,2vw,24px)] py-[clamp(14px,1.8vw,20px)]">
            <div className="min-w-0">
              <div className="font-vcr text-[10px] tracking-[0.18em] text-(--orange)">{activeTitle}</div>
              <div className="mt-1 text-[12px] font-light text-(--muted)">{activeSub}</div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              aria-label="Close"
              className="ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-[9px] border border-(--line) text-(--muted) transition hover:border-(--orange) hover:text-(--orange) disabled:opacity-50 max-[820px]:hidden"
            >
              <CloseIcon />
            </button>
          </div>

          <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-[clamp(16px,2vw,24px)] py-[clamp(16px,2vw,24px)]">
              <div className="grid grid-cols-1 gap-[clamp(12px,1.4vw,18px)] md:grid-cols-3">
                {children}
              </div>
              {error ? (
                <p className="mt-4 rounded-[10px] border border-[rgba(224,68,32,0.25)] bg-[rgba(224,68,32,0.06)] px-3 py-2 text-[12px] font-semibold text-(--orange)">
                  {error}
                </p>
              ) : null}
            </div>

            <div className="flex shrink-0 flex-col gap-2.5 border-t border-(--line) bg-(--surface2) px-[clamp(16px,2vw,24px)] py-[13px] md:flex-row md:items-center">
              <div
                className={`inline-flex items-center justify-center gap-1.5 self-start rounded-full px-2.5 py-1.5 md:self-auto ${
                  dirty ? "bg-[rgba(224,68,32,0.1)] text-(--orange)" : "bg-(--chip) text-(--faint)"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                <span className="font-vcr text-[9px] tracking-[0.13em]">
                  {dirty ? "UNSAVED CHANGES" : "NO CHANGES"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 md:ml-auto md:flex md:items-center">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="flex h-11 items-center justify-center rounded-[10px] border border-(--line) bg-(--surface) px-6 text-[13.5px] font-semibold text-(--muted) transition hover:border-(--orange) hover:text-(--orange) disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex h-11 items-center justify-center whitespace-nowrap rounded-[10px] bg-(--text) px-7 text-[13.5px] font-semibold text-(--bg) transition hover:bg-(--orange) disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving…" : submitLabel}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
