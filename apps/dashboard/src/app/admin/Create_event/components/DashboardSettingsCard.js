"use client";

import { useState } from "react";
import { IconLabel, SwitchRow } from "./FormIcons";

export default function DashboardSettingsCard({
  activationTopup,
  onToggleActivation,
  couponTopup,
  onToggleCoupon,
  compTopup,
  onToggleComp,
  autoReset,
  onToggleAutoReset
}) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <section className="rounded-lg border border-[#f2d9c8] bg-[#fff5ec] px-5 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
      <div className="space-y-3">
        <IconLabel
          label="Dashboard Password"
          icon={
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 text-[color:rgb(var(--color-orange))]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          }
        />
        <div className="flex items-center gap-3 border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 focus-within:border-[color:rgb(var(--color-orange))]">
          <input
            type={showPassword ? "text" : "password"}
            name="dashboardPassword"
            placeholder="Enter password"
            className="w-full bg-transparent text-sm text-slate-700 outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="text-slate-400 transition hover:text-slate-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
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
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <SwitchRow
          active={activationTopup}
          label="Activation Topup"
          onClick={onToggleActivation}
          icon={
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 text-[color:rgb(var(--color-orange))]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
            </svg>
          }
        />
        <SwitchRow
          active={couponTopup}
          label="Coupon Topup"
          onClick={onToggleCoupon}
          icon={
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 text-[color:rgb(var(--color-orange))]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 8a2 2 0 012-2h9l5 5v5a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" />
              <path d="M14 6v4h4" />
            </svg>
          }
        />
        <SwitchRow
          active={compTopup}
          label="Complimentary Topup"
          onClick={onToggleComp}
          icon={
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 text-[color:rgb(var(--color-orange))]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 21s-7-4.4-7-10a4 4 0 017-2 4 4 0 017 2c0 5.6-7 10-7 10z" />
            </svg>
          }
        />
        <SwitchRow
          active={autoReset}
          label="Auto Reset Dashboard"
          onClick={onToggleAutoReset}
          icon={
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 text-[color:rgb(var(--color-orange))]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 1015.5-6.3" />
              <path d="M21 3v6h-6" />
            </svg>
          }
        />
      </div>

      {autoReset && (
        <div className="mt-4 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Live Link Access
          </div>
          <input
            type="text"
            name="liveLinkAccess"
            placeholder="Enter (+91) Mobile Numbers for Access to Event Live Link"
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[color:rgb(var(--color-teal))] focus:outline-none"
          />
        </div>
      )}
    </section>
  );
}
