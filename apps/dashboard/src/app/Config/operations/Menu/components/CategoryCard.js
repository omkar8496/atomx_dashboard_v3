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

export default function CategoryCard({
  categoryName,
  categoryEnabled,
  onCategoryEnabledChange,
  taxType,
  onTaxTypeChange,
  taxPercent,
  onTaxPercentChange,
  taxMode,
  onTaxModeChange,
  search,
  onSearchChange
}) {
  return (
    <section className="rounded-xl border border-[#dce6ef] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.07)]">
      <div className="grid gap-3 lg:grid-cols-[1.25fr_0.6fr_0.75fr_1fr_auto] lg:items-end">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Category Name
          </span>
          <input
            value={categoryName}
            readOnly
            className="border-0 border-b border-slate-200 bg-transparent px-0 py-2 text-sm font-medium text-slate-700 focus:border-[#1495ab] focus:outline-none"
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Category On/Off
          </span>
          <Toggle checked={categoryEnabled} onChange={onCategoryEnabledChange} />
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Vat/GST
          </span>
          <div className="flex gap-2">
            <select
              value={taxType}
              onChange={(event) => onTaxTypeChange(event.target.value)}
              className="w-24 border-0 border-b border-slate-200 bg-transparent px-0 py-2 text-sm focus:border-[#1495ab] focus:outline-none"
            >
              <option>GST</option>
              <option>VAT</option>
            </select>
            <select
              value={taxPercent}
              onChange={(event) => onTaxPercentChange(event.target.value)}
              className="w-24 border-0 border-b border-slate-200 bg-transparent px-0 py-2 text-sm focus:border-[#1495ab] focus:outline-none"
            >
              <option value="0">0%</option>
              <option value="5">5%</option>
              <option value="12">12%</option>
              <option value="18">18%</option>
              <option value="28">28%</option>
            </select>
          </div>
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Inclusive / Exclusive
          </span>
          <div className="flex rounded-full border border-slate-200 p-1">
            <button
              type="button"
              onClick={() => onTaxModeChange("inclusive")}
              className={`flex-1 rounded-full px-2 py-1 text-xs font-semibold ${
                taxMode === "inclusive" ? "bg-[#1495ab] text-white" : "text-slate-500"
              }`}
            >
              Inclusive
            </button>
            <button
              type="button"
              onClick={() => onTaxModeChange("exclusive")}
              className={`flex-1 rounded-full px-2 py-1 text-xs font-semibold ${
                taxMode === "exclusive" ? "bg-[#1495ab] text-white" : "text-slate-500"
              }`}
            >
              Exclusive
            </button>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex h-10 min-w-[108px] items-center justify-center rounded-full bg-[#f88c43] px-4 text-xs font-semibold tracking-[0.08em] text-white shadow-[0_8px_20px_rgba(248,140,67,0.28)] transition hover:bg-[#ef7f32]"
        >
          + Add Item
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search item by name / barcode / tags"
          className="h-10 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#1495ab] focus:outline-none"
        />
        <button
          type="button"
          className="inline-flex h-10 min-w-[150px] items-center justify-center rounded-full border border-[#d4dee8] bg-white px-4 text-xs font-semibold tracking-[0.08em] text-slate-700 transition hover:border-[#1495ab]/35 hover:bg-[#1495ab]/5 hover:text-[#0a6776]"
        >
          Menu Upload
        </button>
        <button
          type="button"
          className="inline-flex h-10 min-w-[190px] items-center justify-center rounded-full border border-[#d4dee8] bg-white px-4 text-xs font-semibold tracking-[0.08em] text-slate-700 transition hover:border-[#1495ab]/35 hover:bg-[#1495ab]/5 hover:text-[#0a6776]"
        >
          Download Excel Sample
        </button>
      </div>
    </section>
  );
}
