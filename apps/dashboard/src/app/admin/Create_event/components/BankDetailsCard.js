"use client";

const iconClass = "h-4 w-4 text-slate-500";

const FieldLabel = ({ icon, text }) => (
  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
    {icon}
    <span>{text}</span>
  </div>
);

export default function BankDetailsCard() {
  return (
    <section className="px-1">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <FieldLabel
            text="Username"
            icon={
              <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            }
          />
          <input
            type="text"
            name="bankUsername"
            placeholder="Username"
            className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
          />
        </label>

        <label className="flex flex-col gap-2">
          <FieldLabel
            text="Password"
            icon={
              <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            }
          />
          <input
            type="password"
            name="bankPassword"
            placeholder="Password"
            className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
          />
        </label>

        <label className="flex flex-col gap-2">
          <FieldLabel
            text="Verify Client Code"
            icon={
              <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h16" />
                <path d="M7 7v10a4 4 0 004 4" />
                <path d="M17 7v6a4 4 0 01-4 4h-2" />
              </svg>
            }
          />
          <input
            type="text"
            name="verifyClientCode"
            placeholder="Verify client code"
            className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
          />
        </label>

        <label className="flex flex-col gap-2">
          <FieldLabel
            text="Verify User ID"
            icon={
              <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 14a4 4 0 100-8 4 4 0 000 8z" />
                <path d="M4 20a8 8 0 0116 0" />
              </svg>
            }
          />
          <input
            type="text"
            name="verifyUserId"
            placeholder="Verify user ID"
            className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
          />
        </label>

        <label className="flex flex-col gap-2 md:col-span-2">
          <FieldLabel
            text="Verify Password"
            icon={
              <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            }
          />
          <input
            type="password"
            name="verifyPassword"
            placeholder="Verify password"
            className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
          />
        </label>
      </div>
    </section>
  );
}
