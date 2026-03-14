"use client";

const iconClass = "h-4 w-4 text-slate-500";

const FieldLabel = ({ icon, text }) => (
  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
    {icon}
    <span>{text}</span>
  </div>
);

export default function CashlessLimitsCard() {
  return (
    <section className="rounded-lg border border-[#e8d9d3] bg-white px-5 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <FieldLabel
            text="Card Fee"
            icon={
              <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 10h10" />
                <path d="M4 14h10" />
                <path d="M10 4v16" />
                <path d="M14 6c3 1 4 4 4 6s-1 5-4 6" />
              </svg>
            }
          />
          <input
            type="number"
            name="cardFee"
            placeholder="Card fee"
            className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
          />
        </label>
        <label className="flex flex-col gap-2">
          <FieldLabel
            text="1st Topup"
            icon={
              <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v6l4 2" />
              </svg>
            }
          />
          <input
            type="number"
            name="firstTopup"
            placeholder="1st topup"
            className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
          />
        </label>
        <label className="flex flex-col gap-2">
          <FieldLabel
            text="Max Wallet"
            icon={
              <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="6" width="18" height="12" rx="2" />
                <path d="M7 12h3" />
              </svg>
            }
          />
          <input
            type="number"
            name="maxWallet"
            placeholder="Max wallet"
            className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
          />
        </label>
        <label className="flex flex-col gap-2">
          <FieldLabel
            text="Token Conversion Rate"
            icon={
              <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h16" />
                <path d="M4 17h16" />
                <path d="M8 7l8 10" />
              </svg>
            }
          />
          <input
            type="number"
            name="tokenConversionRate"
            placeholder="Token conversion rate"
            className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
          />
        </label>
      </div>
    </section>
  );
}
