"use client";

import { useState } from "react";

const TOGGLES = [
  "Show Activation Data",
  "Show Coupon Data",
  "Show Comp Data",
  "Auto Reset Dashboard"
];

export default function ConfigDashSettings() {
  const [states, setStates] = useState({});

  const toggle = (key) => {
    setStates((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section className="h-full flex flex-col">
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-semibold text-slate-700">Dash Settings</h3>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="mt-3 flex-1 rounded-lg border border-transparent bg-transparent px-6 py-5">
        <div className="flex h-full flex-col gap-5">
          <label className="flex flex-col gap-2 text-sm text-slate-600">
            Dashboard Password
            <input
              type="password"
              className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[#f88c43]"
              placeholder="Password"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            {TOGGLES.map((label) => {
              const isOn = Boolean(states[label]);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggle(label)}
                  className="flex items-center gap-3 px-1 py-1 text-sm text-slate-700"
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

          <div className="pt-1 mt-auto">
            <button
              type="button"
              className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#f88c43] hover:text-[#f88c43]"
            >
              Get new balance setting
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
