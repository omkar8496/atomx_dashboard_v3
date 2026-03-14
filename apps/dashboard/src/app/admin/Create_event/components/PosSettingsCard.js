"use client";

import { IconLabel, SwitchRow } from "./FormIcons";

const PRINTER_OPTIONS = [
  "NONE",
  "WISEPOS+",
  "EZETAP",
  "SUNMIPAY",
  "MOSAMBEE",
  "AIRPAY",
  "WORLDLINE+",
  "RUGTEK",
  "BT-2INCH",
  "SPRIN-3INCH",
  "SPRIN-2INCH",
  "PANDA-3INCH",
  "USB-3INCH"
];

export default function PosSettingsCard({
  roundOff,
  onToggleRoundOff,
  happyHour,
  onToggleHappyHour,
  mobileCompulsory,
  onToggleMobileCompulsory,
  useClubCard,
  onToggleUseClubCard
}) {
  return (
    <section className="rounded-lg border border-[#e8d9d3] bg-white px-5 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
      <div className="grid gap-3 md:grid-cols-2">
        <SwitchRow
          active={roundOff}
          label="Round Off Decimal"
          onClick={onToggleRoundOff}
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
              <path d="M4 17h16" />
              <path d="M8 7l8 10" />
            </svg>
          }
        />
        <SwitchRow
          active={happyHour}
          label="Start Happy Hour"
          onClick={onToggleHappyHour}
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
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v6l4 2" />
            </svg>
          }
        />
        <SwitchRow
          active={mobileCompulsory}
          label="Mobile Compulsory"
          onClick={onToggleMobileCompulsory}
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
              <rect x="7" y="2.5" width="10" height="19" rx="2.2" />
              <path d="M10 18h4" />
            </svg>
          }
        />
        <SwitchRow
          active={useClubCard}
          label="Use Club Card"
          onClick={onToggleUseClubCard}
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
              <rect x="3" y="6" width="18" height="12" rx="2" />
              <path d="M3 10h18" />
            </svg>
          }
        />
      </div>

      <div className="mt-6 space-y-3">
        <IconLabel label="Printer" icon={<span className="text-xs font-bold">PR</span>} />
        <select
          name="printer"
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[color:rgb(var(--color-teal))] focus:outline-none"
        >
          {PRINTER_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

    </section>
  );
}
