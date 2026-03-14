"use client";

import { useEffect, useMemo, useState } from "react";

const PRINTERS = [
  "NONE",
  "WISEPOS+",
  "EZETAP",
  "SUNMIPAY",
  "MF919",
  "MOSAMBEE",
  "AIRPAY",
  "WORLDLINE",
  "RUGTEK",
  "BT-2INCH",
  "SPRIN-3INCH",
  "SPRIN-2INCH",
  "PANDA-3INCH",
  "USB-3INCH"
];

const TOPUP_ROWS_FALLBACK = ["50", "100", "500", "1000"];

const TOGGLE_FIELDS = {
  happyhour: "event.happyHour",
  roundoff: "event.roundOff",
  manualTopup: "event.topupManual",
  linkMobile: "event.linkUser",
  useClubCard: "event.useClubCard"
};

export default function ConfigPos({ event, onFieldChange }) {
  const [toggles, setToggles] = useState({
    happyhour: false,
    roundoff: false,
    manualTopup: false,
    linkMobile: false,
    useClubCard: false
  });
  const [showTopupPass, setShowTopupPass] = useState(false);
  const [showSalePass, setShowSalePass] = useState(false);
  const topupRows = useMemo(() => {
    const values = event?.topupValues ? String(event.topupValues).split(",") : [];
    const names = event?.topupNames ? String(event.topupNames).split(",") : [];
    const rows = Array.from({ length: 4 }).map((_, index) => ({
      id: `#${index + 1}`,
      wallet: names[index] ?? values[index] ?? TOPUP_ROWS_FALLBACK[index],
      cash: values[index] ?? names[index] ?? TOPUP_ROWS_FALLBACK[index]
    }));
    return rows;
  }, [event]);

  useEffect(() => {
    if (!event) return;
    setToggles({
      happyhour: Boolean(event.happyHour),
      roundoff: Boolean(event.roundOff),
      manualTopup: Boolean(event.topupManual),
      linkMobile: Boolean(event.linkUser),
      useClubCard: Boolean(event.useClubCard)
    });
  }, [event]);

  const toggleSwitch = (key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
    if (onFieldChange) {
      requestAnimationFrame(() => onFieldChange());
    }
  };

  const printerValue = event?.printer ? String(event.printer).toUpperCase() : "NONE";
  const TOPUP_PASSWORD = event?.devicePasswordTopup ?? "";
  const SALE_PASSWORD = event?.devicePassword ?? "";

  return (
    <div className="h-full rounded-lg border border-[#f1cbb0] bg-[#fff4ec] px-6 py-5 shadow-[0_8px_18px_rgba(15,23,42,0.08)]">
      <div className="grid gap-3 md:grid-cols-2">
        {[
          { key: "happyhour", label: "Happy Hour" },
          { key: "roundoff", label: "Round Off" },
          { key: "manualTopup", label: "Manual Topup" },
          { key: "linkMobile", label: "Link Mobile" },
          { key: "useClubCard", label: "Use Club Card" }
        ].map((item) => {
          const isOn = toggles[item.key];
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => toggleSwitch(item.key)}
              className="flex items-center justify-start gap-3 px-1 py-1 text-sm text-slate-700"
            >
              <span
                className={`relative h-5 w-10 rounded-full transition ${
                  isOn ? "bg-[color:rgb(var(--color-teal))]" : "bg-slate-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
                    isOn ? "left-5" : "left-1"
                  }`}
                />
              </span>
              <span className="text-sm font-medium text-slate-700">{item.label}</span>
              <input
                type="hidden"
                name={TOGGLE_FIELDS[item.key]}
                value={isOn ? "1" : "0"}
              />
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <label className="flex items-center justify-between gap-4 text-sm text-slate-600">
          <span className="font-semibold">Printer:</span>
          <select
            name="event.printer"
            className="flex-1 border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
            defaultValue={printerValue}
          >
            {PRINTERS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5">
        <div className="text-sm font-semibold text-slate-700">Topup Buttons</div>
        <div className="mt-3 grid gap-3">
          {topupRows.map((row) => (
            <div key={row.id} className="grid items-center gap-3 md:grid-cols-[48px_1fr_1fr]">
              <div className="text-sm font-semibold text-[#258d9c]">{row.id}</div>
              <div className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="6" width="18" height="12" rx="2" />
                  <path d="M7 10h6" />
                </svg>
                <span>{row.wallet}</span>
              </div>
              <div className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2">
                  <ellipse cx="12" cy="6" rx="6" ry="3" />
                  <path d="M6 6v6c0 1.7 2.7 3 6 3s6-1.3 6-3V6" />
                </svg>
                <span>{row.cash}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-700">Passwords</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-slate-600">
            Topup Password
            <div className="relative">
              <input
                type={showTopupPass ? "text" : "password"}
                name="event.devicePasswordTopup"
                defaultValue={TOPUP_PASSWORD}
                className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowTopupPass((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showTopupPass ? "Hide password" : "Show password"}
              >
                {showTopupPass ? (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a2 2 0 012.8 2.8" />
                    <path d="M9.9 5.1A10.3 10.3 0 0112 5c6 0 10 7 10 7a16.8 16.8 0 01-3 3.6" />
                    <path d="M6.6 6.6A16.7 16.7 0 002 12s4 7 10 7a9.7 9.7 0 004.3-1" />
                  </svg>
                )}
              </button>
            </div>
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-600">
            Sale Password
            <div className="relative">
              <input
                type={showSalePass ? "text" : "password"}
                name="event.devicePassword"
                defaultValue={SALE_PASSWORD}
                className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowSalePass((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showSalePass ? "Hide password" : "Show password"}
              >
                {showSalePass ? (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a2 2 0 012.8 2.8" />
                    <path d="M9.9 5.1A10.3 10.3 0 0112 5c6 0 10 7 10 7a16.8 16.8 0 01-3 3.6" />
                    <path d="M6.6 6.6A16.7 16.7 0 002 12s4 7 10 7a9.7 9.7 0 004.3-1" />
                  </svg>
                )}
              </button>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
