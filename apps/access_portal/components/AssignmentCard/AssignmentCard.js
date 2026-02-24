export function AssignmentCard({ assignment, onPermissionClick }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-[0_10px_32px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between bg-[#f88c43] px-5 py-3 text-white">
        <div>
          <p className="m-0 text-base font-bold leading-tight">Current Assignment</p>
          <p className="m-0 pt-1 text-sm opacity-90">Your active event assignment details</p>
        </div>
        <span className="rounded-full border border-white/40 bg-white/15 px-3 py-1 text-sm font-semibold leading-none">
          Live
        </span>
      </div>

      <div className="flex flex-col gap-4 px-5 py-4">
        <div className="flex flex-wrap gap-5 sm:gap-8">
          <div>
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Event
            </p>
            <p className="mt-1 text-lg font-semibold">{assignment.event}</p>
          </div>
          <div>
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Email
            </p>
            <p className="mt-1 text-lg font-semibold">{assignment.email}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Assigned Period
          </p>
          <div className="flex items-center gap-3 rounded-[14px] bg-[#e6f4f7] px-4 py-3 font-semibold text-[#0f9ca3]">
            <CalendarIcon />
            <span>{assignment.period}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Access Permissions
          </p>
          <div className="flex flex-wrap gap-2">
            {assignment.permissions.map((permission) => {
              const label = typeof permission === "string" ? permission : permission.label;
              return (
                <button
                  type="button"
                  key={label}
                  className="rounded-full bg-[#0f9ca3] px-3.5 py-2 text-sm font-bold text-white shadow-[0_8px_20px_rgba(15,156,163,0.18)] transition hover:-translate-y-[1px] hover:shadow-[0_12px_28px_rgba(15,156,163,0.25)] hover:brightness-105"
                  onClick={() => onPermissionClick?.(permission)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden
      className="text-[#0f9ca3]"
    >
      <path
        d="M7 4V2m10 2V2m-9 8h8m-9 12h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
