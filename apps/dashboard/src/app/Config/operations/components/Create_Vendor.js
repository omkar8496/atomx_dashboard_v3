"use client";

import { useEffect, useState } from "react";

export default function CreateVendor({ open, onClose }) {
  const [animateIn, setAnimateIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPrintDetails, setShowPrintDetails] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAnimateIn(false);
    const timer = setTimeout(() => setAnimateIn(true), 20);
    return () => clearTimeout(timer);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-6 transition-opacity duration-300 ${
        animateIn ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`w-full max-w-2xl rounded-xl border border-[#e8d9d3] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)] transition-all duration-300 ${
          animateIn ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#e7e0dc] px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-800">Create Vendor</h2>
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
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Vendor Name
                <input
                  type="text"
                  maxLength={50}
                  className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[#f88c43]"
                  placeholder="Enter vendor name"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Type
                <select className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[#f88c43]">
                  <option>FNB</option>
                  <option>PASS</option>
                  <option>Ticket</option>
                  <option>Sale</option>
                  <option>Inventory</option>
                  <option>Table</option>
                  <option>AccessX</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-600">
                GSTIN
                <input
                  type="text"
                  maxLength={50}
                  className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[#f88c43]"
                  placeholder="Enter GSTIN"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-600">
                PAN
                <input
                  type="text"
                  maxLength={50}
                  className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[#f88c43]"
                  placeholder="Enter PAN"
                />
              </label>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <h3 className="text-sm font-bold text-slate-700">Charges</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Service Charges
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  maxLength={50}
                  className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[#f88c43]"
                  placeholder="1.00"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Service Charge TAX
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  maxLength={50}
                  className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[#f88c43]"
                  placeholder="1.00"
                />
              </label>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <h3 className="text-sm font-bold text-slate-700">Dashboard Password</h3>
            <div className="mt-3">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  maxLength={50}
                  defaultValue="1234"
                  className="w-full border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[#f88c43]"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 3l18 18" />
                      <path d="M10.6 10.6a2 2 0 012.8 2.8" />
                      <path d="M9.9 5.1A10.3 10.3 0 0112 5c6 0 10 7 10 7a16.8 16.8 0 01-3 3.6" />
                      <path d="M6.6 6.6A16.7 16.7 0 002 12s4 7 10 7a9.7 9.7 0 004.3-1" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
            <button
              type="button"
              onClick={() => setShowPrintDetails((prev) => !prev)}
              className="flex items-center gap-3 text-sm text-slate-600"
            >
              Show Print Details
              <span
                className={`relative h-5 w-10 rounded-full transition ${
                  showPrintDetails ? "bg-[#1495ab]" : "bg-slate-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
                    showPrintDetails ? "left-5" : "left-1"
                  }`}
                />
              </span>
            </button>
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
