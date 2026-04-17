"use client";

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 rounded-full transition ${
        checked ? "bg-[#1495ab]" : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
          checked ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

function ActionButton({ children, tone = "teal" }) {
  const toneClass =
    tone === "orange"
      ? "border-[#f88c43] bg-[#f88c43] text-white shadow-[0_8px_18px_rgba(248,140,67,0.25)] hover:bg-[#ef7f32]"
      : "border-[#d4dee8] bg-white text-[#0f3340] hover:border-[#1495ab]/35 hover:bg-[#1495ab]/5 hover:text-[#0a6776]";
  return (
    <button
      type="button"
      className={`inline-flex h-10 min-w-[108px] items-center justify-center rounded-full border px-4 text-xs font-semibold tracking-[0.08em] transition ${toneClass}`}
    >
      {children}
    </button>
  );
}

export default function MenuActionBar({ inactiveCategory, onInactiveCategoryChange }) {
  return (
    <section className="rounded-xl border border-[#dce6ef] bg-white/90 px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.07)]">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="mr-1 flex h-10 items-center gap-2 rounded-full border border-[#d4dee8] bg-slate-50 px-4">
          <span className="text-xs font-semibold tracking-[0.08em] text-slate-600">InActive Category</span>
          <Toggle checked={inactiveCategory} onChange={onInactiveCategoryChange} />
        </div>
        <ActionButton>Download</ActionButton>
        <ActionButton>+ GRN</ActionButton>
        <ActionButton>- RN</ActionButton>
        <ActionButton>Menu Load</ActionButton>
        <ActionButton tone="orange">+ Add Category</ActionButton>
        <ActionButton tone="orange">Save</ActionButton>
      </div>
    </section>
  );
}
