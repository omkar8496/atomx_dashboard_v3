"use client";

import { useEffect, useState } from "react";

const BANK_OPTIONS = [
  "MSWIPE",
  "SUNMIPAY",
  "EZETAP",
  "MOSAMBEE",
  "WORLDLINE",
  "AIRPAY",
  "PINELABS",
  "UTAP"
];

const SCAN_OPTIONS = ["NONE", "MENU", "TICKET"];

export default function EditStall({ open, onClose }) {
  const [animateIn, setAnimateIn] = useState(false);
  const [paymentMode, setPaymentMode] = useState("ALL");
  const [modeOptions, setModeOptions] = useState(["Card", "UPI", "Cash"]);
  const [toggles, setToggles] = useState({
    grn: false,
    cashDisabled: false,
    kotLan: false,
    modeInfo: false,
    sms: false,
    tapx: false
  });

  useEffect(() => {
    if (!open) return;
    setAnimateIn(false);
    const timer = setTimeout(() => setAnimateIn(true), 20);
    return () => clearTimeout(timer);
  }, [open]);

  if (!open) return null;

  const toggleModeOption = (option) => {
    setModeOptions((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  };

  const toggleSwitch = (key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-6 transition-opacity duration-300 ${
        animateIn ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`w-full max-w-3xl rounded-xl border border-[#e8d9d3] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)] transition-all duration-300 ${
          animateIn ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#e7e0dc] px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-800">Edit Stall</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:text-slate-700"
            aria-label="Close"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-4">
          <div className="rounded-lg border border-slate-200 bg-[#f8fbfd] p-3">
            <h3 className="text-sm font-bold text-slate-700">Basics Details</h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Vendor Name
                <input
                  type="text"
                  maxLength={50}
                  className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[#f88c43]"
                  placeholder="Vendor"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Stall Name
                <input
                  type="text"
                  maxLength={50}
                  className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[#f88c43]"
                  placeholder="Stall"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-600 md:col-span-2">
                Stall Banner
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2 text-sm text-slate-500">
                  <span>Upload image</span>
                  <button
                    type="button"
                    className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600"
                  >
                    Browse
                  </button>
                </div>
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Type
                <select className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[#f88c43]">
                  <option>Topup</option>
                  <option>Sale</option>
                  <option>AccessX</option>
                  <option>Inventory</option>
                  <option>Stockmaster</option>
                  <option>Tables</option>
                </select>
              </label>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-700">Payments</h3>
              <div className="flex rounded-full border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setPaymentMode("NFC")}
                  className={`rounded-full px-4 py-1 text-xs font-semibold transition ${
                    paymentMode === "NFC" ? "bg-[#1495ab] text-white" : "text-slate-500"
                  }`}
                >
                  Only NFC
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode("ALL")}
                  className={`rounded-full px-4 py-1 text-xs font-semibold transition ${
                    paymentMode === "ALL" ? "bg-[#1495ab] text-white" : "text-slate-500"
                  }`}
                >
                  Accept All Mode
                </button>
              </div>
            </div>

            {paymentMode === "ALL" && (
              <div className="mt-3 flex items-center gap-4">
                <span className="text-sm font-semibold text-slate-600">Payments Mode :</span>
                <div className="flex flex-nowrap gap-2">
                  {["Card", "UPI", "Cash"].map((option) => {
                    const active = modeOptions.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => toggleModeOption(option)}
                        className={`rounded-full border px-4 py-1 text-xs font-semibold transition ${
                          active
                            ? "border-[#1495ab] bg-[#1495ab] text-white"
                            : "border-slate-200 text-slate-500"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-3 grid gap-3">
              <label className="flex items-center justify-between gap-4 text-sm text-slate-600">
                <span className="font-semibold">Bank Payment :</span>
                <select className="flex-1 border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[#f88c43]">
                  {BANK_OPTIONS.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>

              <label className="flex items-center justify-between gap-4 text-sm text-slate-600">
                <span className="font-semibold">Scan Mode :</span>
                <select className="flex-1 border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[#f88c43]">
                  {SCAN_OPTIONS.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <h3 className="text-sm font-bold text-slate-700">Controls</h3>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {[
                { key: "grn", label: "GRN Mode" },
                { key: "cashDisabled", label: "Cash Disabled" },
                { key: "kotLan", label: "KOT LAN" },
                { key: "modeInfo", label: "Mode Info Mandatory" }
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleSwitch(item.key)}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600"
                >
                  {item.label}
                  <span
                    className={`relative h-5 w-10 rounded-full transition ${
                      toggles[item.key] ? "bg-[#1495ab]" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
                        toggles[item.key] ? "left-5" : "left-1"
                      }`}
                    />
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
              {[
                { key: "sms", label: "Send SMS" },
                { key: "tapx", label: "Show in TapX" }
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleSwitch(item.key)}
                  className="flex items-center gap-3 text-sm text-slate-600"
                >
                  {item.label}
                  <span
                    className={`relative h-5 w-10 rounded-full transition ${
                      toggles[item.key] ? "bg-[#1495ab]" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
                        toggles[item.key] ? "left-5" : "left-1"
                      }`}
                    />
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="rounded-md bg-[#1495ab] px-4 py-2 text-sm font-semibold text-white shadow-[0_6px_12px_rgba(20,149,171,0.25)]"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
