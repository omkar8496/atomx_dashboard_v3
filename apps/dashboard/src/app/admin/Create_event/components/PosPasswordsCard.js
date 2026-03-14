"use client";

import { useState } from "react";

const iconClass = "h-4 w-4 text-[color:rgb(var(--color-orange))]";

const FieldRow = ({ label, show, onToggle, placeholder, name }) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
      <span>{label}</span>
      <button
        type="button"
        onClick={onToggle}
        className="text-slate-400 transition hover:text-slate-600"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? (
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17.94 17.94A10.94 10.94 0 0112 19c-6.5 0-10-7-10-7a18.7 18.7 0 014.5-5.94" />
            <path d="M10.6 6.6A10.94 10.94 0 0112 5c6.5 0 10 7 10 7a18.72 18.72 0 01-3.14 4.47" />
            <path d="M1 1l22 22" />
          </svg>
        )}
      </button>
    </div>
    <div className="flex items-center gap-3 border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 focus-within:border-[color:rgb(var(--color-orange))]">
      <svg
        viewBox="0 0 24 24"
        className={iconClass}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
      <input
        type={show ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-slate-700 outline-none"
      />
    </div>
  </div>
);

export default function PosPasswordsCard() {
  const [showTopup, setShowTopup] = useState(false);
  const [showSale, setShowSale] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <section className="rounded-lg border border-[#e8d9d3] bg-white px-5 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
      <div className="grid gap-5">
        <FieldRow
          label="Topup Password"
          show={showTopup}
          onToggle={() => setShowTopup((prev) => !prev)}
          placeholder="Topup password"
          name="topupPassword"
        />
        <FieldRow
          label="Sale Password"
          show={showSale}
          onToggle={() => setShowSale((prev) => !prev)}
          placeholder="Sale password"
          name="salePassword"
        />
        <FieldRow
          label="Admin Password"
          show={showAdmin}
          onToggle={() => setShowAdmin((prev) => !prev)}
          placeholder="Admin password"
          name="adminPassword"
        />
      </div>
    </section>
  );
}
