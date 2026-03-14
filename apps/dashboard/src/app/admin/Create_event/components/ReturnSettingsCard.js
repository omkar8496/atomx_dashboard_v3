"use client";
import { SwitchRow } from "./FormIcons";

const iconClass = "h-4 w-4 text-[color:rgb(var(--color-orange))]";

const FieldLabel = ({ icon, text }) => (
  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
    {icon}
    <span>{text}</span>
  </div>
);

export default function ReturnSettingsCard({
  returnCardFee,
  onToggleReturnCardFee,
  returnBalance,
  onToggleReturnBalance,
  returnBankCardBalance,
  onToggleReturnBankCardBalance,
  returnCardFeeCash,
  onToggleReturnCardFeeCash
}) {
  return (
    <section className="rounded-lg border border-[#e8d9d3] bg-white px-5 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
      <div className="grid gap-3 md:grid-cols-2">
        <SwitchRow
          active={returnCardFee}
          label="Return Card Fee"
          onClick={onToggleReturnCardFee}
          icon={
            <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="6" width="18" height="12" rx="2" />
              <path d="M3 10h18" />
            </svg>
          }
        />
        <SwitchRow
          active={returnBalance}
          label="Return Balance"
          onClick={onToggleReturnBalance}
          icon={
            <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
              <ellipse cx="12" cy="6.5" rx="6" ry="2.5" />
              <path d="M6 6.5v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4" />
            </svg>
          }
        />
        <SwitchRow
          active={returnBankCardBalance}
          label="Return Bank Card Balance"
          onClick={onToggleReturnBankCardBalance}
          icon={
            <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 8a2 2 0 012-2h9l5 5v5a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" />
              <path d="M14 6v4h4" />
            </svg>
          }
        />
        <SwitchRow
          active={returnCardFeeCash}
          label="Return Card Fee In Cash"
          onClick={onToggleReturnCardFeeCash}
          icon={
            <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 4h12a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" />
              <circle cx="12" cy="10" r="2" />
              <path d="M7 16h10" />
            </svg>
          }
        />
      </div>

      <div className="mt-4 grid gap-5 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <FieldLabel
            text="Min Return Balance"
            icon={
              <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12h16" />
                <path d="M8 8l-4 4 4 4" />
              </svg>
            }
          />
          <input
            type="number"
            name="minReturnBalance"
            placeholder="Min return balance"
            className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
          />
        </label>
        <label className="flex flex-col gap-2">
          <FieldLabel
            text="Max Return Amount"
            icon={
              <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12h16" />
                <path d="M16 8l4 4-4 4" />
              </svg>
            }
          />
          <input
            type="number"
            name="maxReturnAmount"
            placeholder="Max return amount"
            className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
          />
        </label>
      </div>
    </section>
  );
}
