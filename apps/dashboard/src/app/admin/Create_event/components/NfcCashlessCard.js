"use client";

import { IconLabel, SwitchRow } from "./FormIcons";

export default function NfcCashlessCard({
  nfcCashless,
  onToggleNfc,
  onlineTopup,
  onToggleOnlineTopup,
  usePin,
  onToggleUsePin,
  useAccessX,
  onToggleAccessX,
  useGst,
  onToggleGst
}) {
  return (
    <section className="rounded-lg border border-[#e8d9d3] bg-white px-5 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between gap-3">
        <IconLabel
          label="Cashless Mode"
          icon={<span className="text-xs font-bold text-[color:rgb(var(--color-orange))]">NFC</span>}
        />
        <button
          type="button"
          onClick={onToggleNfc}
          className={`flex h-9 w-16 items-center rounded-full p-1 transition ${
            nfcCashless ? "bg-[color:rgb(var(--color-teal))]" : "bg-slate-200"
          }`}
        >
          <span
            className={`h-7 w-7 rounded-full bg-white shadow transition ${
              nfcCashless ? "translate-x-7" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {nfcCashless && (
          <>
            <SwitchRow
              active={onlineTopup}
              label="Online Topup"
              onClick={onToggleOnlineTopup}
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
                  <path d="M12 3v18" />
                  <path d="M8 7h8a4 4 0 010 8H8" />
                </svg>
              }
            />
            <SwitchRow
              active={usePin}
              label="Use Pin"
              onClick={onToggleUsePin}
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
                  <rect x="4" y="11" width="16" height="9" rx="2" />
                  <path d="M8 11V7a4 4 0 018 0v4" />
                </svg>
              }
            />
          </>
        )}
        <SwitchRow
          active={useAccessX}
          label="Use AccessX"
          onClick={onToggleAccessX}
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
              <path d="M12 2l7 3v6c0 5-3.8 9.3-7 10-3.2-.7-7-5-7-10V5l7-3z" />
              <path d="M9.5 11.5l1.8 1.8 3.5-3.5" />
            </svg>
          }
        />
        <SwitchRow
          active={useGst}
          label="Use GST"
          onClick={onToggleGst}
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
              <path d="M4 7h16" />
              <path d="M7 7v10a4 4 0 004 4" />
              <path d="M17 7v6a4 4 0 01-4 4h-2" />
            </svg>
          }
        />
      </div>
    </section>
  );
}
