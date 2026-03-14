"use client";

const iconClass = "h-4 w-4 text-slate-500";

const FieldLabel = ({ icon, text }) => (
  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
    {icon}
    <span>{text}</span>
  </div>
);

const COUNTRIES = ["India", "United States", "UAE", "Singapore", "UK"];
const TIMEZONES = ["GMT+05:30", "GMT", "UTC", "GMT+04:00", "GMT+08:00"];
const CITIES = ["Mumbai", "Pune", "Delhi", "Bengaluru", "Chennai"];
const CURRENCIES = ["INR", "USD", "EUR", "AED", "SGD"];

export default function EventDetailsCard() {
  return (
    <section className="px-1">
      <div className="grid gap-6">
        <label className="flex flex-col gap-2">
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
            name="eventName"
            placeholder="Enter event name"
            className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
          />
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="flex flex-col gap-2">
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
            <input
              list="country-list"
              name="country"
              placeholder="Select country"
              className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
            />
            <datalist id="country-list">
              {COUNTRIES.map((country) => (
                <option key={country} value={country} />
              ))}
            </datalist>
          </label>
          <label className="flex flex-col gap-2">
            <FieldLabel
              text="Timezone"
              icon={
                <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v6l4 2" />
                </svg>
              }
            />
            <input
              list="timezone-list"
              name="timezone"
              placeholder="Select timezone"
              className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
            />
            <datalist id="timezone-list">
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz} />
              ))}
            </datalist>
          </label>
          <label className="flex flex-col gap-2">
            <FieldLabel
              text="City"
              icon={
                <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 21h18" />
                  <path d="M6 21V8l6-4 6 4v13" />
                  <path d="M9 21v-6h6v6" />
                </svg>
              }
            />
            <input
              list="city-list"
              name="city"
              placeholder="Select city"
              className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
            />
            <datalist id="city-list">
              {CITIES.map((city) => (
                <option key={city} value={city} />
              ))}
            </datalist>
          </label>
          <label className="flex flex-col gap-2">
            <FieldLabel
              text="Currency"
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
              list="currency-list"
              name="currency"
              placeholder="Select currency"
              className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
            />
            <datalist id="currency-list">
              {CURRENCIES.map((currency) => (
                <option key={currency} value={currency} />
              ))}
            </datalist>
          </label>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            <FieldLabel
              text="Organizer"
              icon={
                <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              }
            />
            <input
              type="text"
              name="organizer"
              placeholder="Organizer"
              className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
            />
          </label>
          <label className="flex flex-col gap-2">
            <FieldLabel
              text="Client"
              icon={
                <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="14" rx="2" />
                  <path d="M7 20h10" />
                </svg>
              }
            />
            <input
              type="text"
              name="client"
              placeholder="Client"
              className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
            />
          </label>
          <label className="flex flex-col gap-2">
            <FieldLabel
              text="Venue"
              icon={
                <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
              }
            />
            <input
              type="text"
              name="venue"
              placeholder="Venue"
              className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
            />
          </label>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            <FieldLabel
              text="Start Date"
              icon={
                <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              }
            />
            <input
              type="date"
              name="startDate"
              className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
            />
          </label>
          <label className="flex flex-col gap-2">
            <FieldLabel
              text="End Date"
              icon={
                <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              }
            />
            <input
              type="date"
              name="endDate"
              className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
            />
          </label>
        </div>
      </div>
    </section>
  );
}
