"use client";

import { useState } from "react";

const RETURN_TOGGLES = [
  "Return Card Fee",
  "Return Balance",
  "Return Bank Card Balance",
  "Return Card Fee In Cash"
];

export default function ConfigCard() {
  const [toggles, setToggles] = useState({});

  const toggle = (key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="rounded-lg border border-[#e8d9d3] bg-white px-6 py-5 shadow-[0_8px_18px_rgba(15,23,42,0.08)]">
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <label className="flex flex-col gap-2 text-sm text-slate-600">
          Card Fee
          <input
            type="number"
            inputMode="decimal"
            className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[#f88c43]"
            placeholder="0.00"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-600">
          1st Topup
          <input
            type="number"
            inputMode="decimal"
            className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[#f88c43]"
            placeholder="0.00"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-600">
          Max Wallet
          <input
            type="number"
            inputMode="numeric"
            className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[#f88c43]"
            placeholder="100000"
          />
        </label>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <span className="text-sm font-semibold text-slate-700">Returns</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {RETURN_TOGGLES.map((label) => {
          const isOn = Boolean(toggles[label]);
          return (
            <button
              key={label}
              type="button"
              onClick={() => toggle(label)}
              className="flex items-center justify-start gap-4 px-1 py-1 text-sm text-slate-700"
            >
              <span
                className={`relative h-5 w-10 rounded-full transition ${
                  isOn ? "bg-[#1495ab]" : "bg-slate-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
                    isOn ? "left-5" : "left-1"
                  }`}
                />
              </span>
              <span className="text-sm font-medium text-slate-700">{label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-slate-600">
          Return Min Amount
          <input
            type="number"
            inputMode="decimal"
            className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[#f88c43]"
            placeholder="0.00"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-600">
          Return Max Amount
          <input
            type="number"
            inputMode="decimal"
            className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[#f88c43]"
            placeholder="0.00"
          />
        </label>
      </div>
    </div>
  );
}
