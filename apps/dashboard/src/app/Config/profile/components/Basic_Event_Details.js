const iconClass = "h-4 w-4 text-slate-500";

const FieldLabel = ({ icon, text }) => (
  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
    {icon}
    <span>{text}</span>
  </div>
);

const DEFAULT_COUNTRIES = ["India", "United States", "United Kingdom"];
const DEFAULT_CITIES = ["Mumbai", "Pune", "Delhi"];
const DEFAULT_TIMEZONES = ["UTC+05:30 (IST)", "UTC+00:00 (GMT)", "UTC-05:00 (EST)"];
const DEFAULT_CURRENCIES = ["INR", "USD", "EUR"];

function ensureOption(list, value) {
  if (!value) return list;
  const normalized = String(value).trim();
  if (!normalized) return list;
  return list.some((item) => item.toLowerCase() === normalized.toLowerCase())
    ? list
    : [normalized, ...list];
}

function formatDateInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export default function BasicEventDetails({ event }) {
  const countryOptions = ensureOption(DEFAULT_COUNTRIES, event?.country);
  const cityOptions = ensureOption(DEFAULT_CITIES, event?.locationCity);
  const timezoneOptions = ensureOption(DEFAULT_TIMEZONES, event?.tz);
  const currencyOptions = ensureOption(DEFAULT_CURRENCIES, event?.currency?.toUpperCase());

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
              name="event.name"
              defaultValue={event?.name ?? ""}
              className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
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
            <select
              name="event.country"
              className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
              defaultValue={event?.country ?? "Select country"}
            >
              <option>Select country</option>
              {countryOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
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
            <select
              name="event.locationCity"
              className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
              defaultValue={event?.locationCity ?? "Select city"}
            >
              <option>Select city</option>
              {cityOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
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
            <select
              name="event.tz"
              className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
              defaultValue={event?.tz ?? "Select timezone"}
            >
              <option>Select timezone</option>
              {timezoneOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
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
              name="event.organizer"
              defaultValue={event?.organizer ?? ""}
              className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
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
              name="event.client"
              defaultValue={event?.client ?? ""}
              className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
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
              name="event.venue"
              defaultValue={event?.venue ?? ""}
              className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
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
            <select
              name="event.currency"
              className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
              defaultValue={event?.currency?.toUpperCase() ?? "Select currency"}
            >
              <option>Select currency</option>
              {currencyOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
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
                name="event.startAt"
                defaultValue={formatDateInput(event?.startAt)}
                className="w-full max-w-[170px] border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
              />
              <input
                type="date"
                name="event.endAt"
                defaultValue={formatDateInput(event?.endAt)}
                className="w-full max-w-[170px] border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
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
              name="dashSettings.etcode"
              defaultValue={event?.dashSettings?.etcode ?? ""}
              className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
            />
          </label>
        </div>
      </div>
    </section>
  );
}
