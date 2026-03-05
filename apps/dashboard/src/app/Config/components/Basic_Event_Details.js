const iconClass = "h-4 w-4 text-slate-500";

const FieldLabel = ({ icon, text }) => (
  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
    {icon}
    <span>{text}</span>
  </div>
);

export default function BasicEventDetails() {
  return (
    <section className="px-1">
      <div className="grid gap-6">
        <div className="grid gap-5 md:grid-cols-12">
          <label className="md:col-span-5 flex flex-col gap-2">
            <FieldLabel
              text="Event Name"
              icon={
                <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16" />
                  <path d="M4 12h10" />
                  <path d="M4 18h7" />
                </svg>
              }
            />
            <input
              type="text"
              placeholder="Event name"
              className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[#f88c43]"
            />
          </label>

          <label className="md:col-span-3 flex flex-col gap-2">
            <FieldLabel
              text="Country"
              icon={
                <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M3 12h18" />
                  <path d="M12 3a15 15 0 010 18" />
                </svg>
              }
            />
            <select className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[#f88c43]">
              <option>Select country</option>
              <option>India</option>
              <option>United States</option>
              <option>United Kingdom</option>
            </select>
          </label>

          <label className="md:col-span-2 flex flex-col gap-2">
            <FieldLabel
              text="City"
              icon={
                <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 21h18" />
                  <path d="M7 21V9l5-4 5 4v12" />
                  <path d="M9 21v-6h6v6" />
                </svg>
              }
            />
            <select className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[#f88c43]">
              <option>Select city</option>
              <option>Mumbai</option>
              <option>Pune</option>
              <option>Delhi</option>
            </select>
          </label>

          <label className="md:col-span-2 flex flex-col gap-2">
            <FieldLabel
              text="Timezone"
              icon={
                <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 3" />
                </svg>
              }
            />
            <select className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[#f88c43]">
              <option>Select timezone</option>
              <option>UTC+05:30 (IST)</option>
              <option>UTC+00:00 (GMT)</option>
              <option>UTC-05:00 (EST)</option>
            </select>
          </label>
        </div>

        <div className="grid gap-5 md:grid-cols-12">
          <label className="md:col-span-3 flex flex-col gap-2">
            <FieldLabel
              text="Organizer"
              icon={
                <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
                  <path d="M4 20a8 8 0 0116 0" />
                </svg>
              }
            />
            <input
              type="text"
              placeholder="Organizer"
              className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[#f88c43]"
            />
          </label>

          <label className="md:col-span-3 flex flex-col gap-2">
            <FieldLabel
              text="Client"
              icon={
                <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="7" width="18" height="13" rx="2" />
                  <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
              }
            />
            <input
              type="text"
              placeholder="Client"
              className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[#f88c43]"
            />
          </label>

          <label className="md:col-span-4 flex flex-col gap-2">
            <FieldLabel
              text="Venue"
              icon={
                <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
              }
            />
            <input
              type="text"
              placeholder="Venue"
              className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[#f88c43]"
            />
          </label>

          <label className="md:col-span-2 flex flex-col gap-2">
            <FieldLabel
              text="Currency"
              icon={
                <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3v18" />
                  <path d="M16 7H9a3 3 0 000 6h6a3 3 0 010 6H8" />
                </svg>
              }
            />
            <select className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[#f88c43]">
              <option>Select currency</option>
              <option>INR</option>
              <option>USD</option>
              <option>EUR</option>
            </select>
          </label>
        </div>

        <div className="grid gap-5 md:grid-cols-12">
          <label className="md:col-span-7 flex flex-col gap-2">
            <FieldLabel
              text="Dates"
              icon={
                <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4" />
                  <path d="M8 2v4" />
                  <path d="M3 10h18" />
                </svg>
              }
            />
            <div className="flex flex-wrap gap-3">
              <input
                type="date"
                className="w-full max-w-[170px] border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[#f88c43]"
              />
              <input
                type="date"
                className="w-full max-w-[170px] border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[#f88c43]"
              />
            </div>
          </label>

          <label className="md:col-span-5 flex flex-col gap-2">
            <FieldLabel
              text="ETCODE"
              icon={
                <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h10" />
                </svg>
              }
            />
            <input
              type="text"
              placeholder="ETCODE"
              className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[#f88c43]"
            />
          </label>
        </div>
      </div>
    </section>
  );
}
