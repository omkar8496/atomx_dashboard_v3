"use client";
import { SwitchRow } from "./FormIcons";

const CARD_SETTINGS = ["Standard", "Free Entry", "VIP", "Staff", "Custom"];

const iconClass = "h-4 w-4 text-[color:rgb(var(--color-orange))]";

const FieldLabel = ({ icon, text }) => (
  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
    {icon}
    <span>{text}</span>
  </div>
);

export default function CardSettingsCard({
  cardSetting,
  onChangeCardSetting,
  customTopup,
  onToggleCustomTopup,
  topups,
  onTopupChange
}) {
  return (
    <section className="rounded-lg border border-[#e8d9d3] bg-white px-5 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
      <div className="grid gap-4">
        <div className="space-y-2">
          <FieldLabel
            text="Card Setting"
            icon={
              <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="6" width="18" height="12" rx="2" />
                <path d="M3 10h18" />
              </svg>
            }
          />
          <select
            name="cardSetting"
            value={cardSetting}
            onChange={(event) => onChangeCardSetting?.(event.target.value)}
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[color:rgb(var(--color-teal))] focus:outline-none"
          >
            {CARD_SETTINGS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <SwitchRow
          active={customTopup}
          label="Custom Topup Input"
          onClick={onToggleCustomTopup}
          icon={
            <svg
              viewBox="0 0 24 24"
              className={iconClass}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <ellipse cx="12" cy="6.5" rx="6" ry="2.5" />
              <path d="M6 6.5v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4" />
              <path d="M6 10.5v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4" />
            </svg>
          }
        />

        <div className="mt-2 grid gap-4">
          <div className="grid grid-cols-[50px_1fr_1fr] items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[color:rgb(var(--color-teal))]">
            <span className="text-left">#</span>
            <span className="text-center">Topup Name</span>
            <span className="text-center">Topup Amount</span>
          </div>
          {topups.map((item) => (
            <div key={item.id} className="grid grid-cols-[50px_1fr_1fr] items-center gap-3">
              <span className="text-sm font-semibold text-[color:rgb(var(--color-teal))]">#{item.id}</span>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                <span className="text-slate-400">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <circle cx="8" cy="12" r="1.5" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={item.name}
                  name={`topupName_${item.id}`}
                  onChange={(event) =>
                    onTopupChange?.(item.id, "name", event.target.value)
                  }
                  className="w-full bg-transparent text-sm text-slate-700 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                <span className="text-slate-400">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <ellipse cx="12" cy="6.5" rx="6" ry="2.5" />
                    <path d="M6 6.5v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4" />
                    <path d="M6 10.5v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4" />
                  </svg>
                </span>
                <input
                  type="number"
                  value={item.amount}
                  name={`topupAmount_${item.id}`}
                  onChange={(event) =>
                    onTopupChange?.(item.id, "amount", event.target.value)
                  }
                  className="w-full bg-transparent text-sm text-slate-700 focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
