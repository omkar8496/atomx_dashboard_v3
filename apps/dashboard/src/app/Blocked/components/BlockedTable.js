"use client";

const rows = [
  { id: 1, cardId: "24", status: "active" },
  { id: 2, cardId: "240060131", status: "active" },
  { id: 3, cardId: "1111111", status: "active" },
  { id: 4, cardId: "99889988", status: "active" }
];

export default function BlockedTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[color:rgb(var(--color-orange))] text-white">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em]">#</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em]">Card Id</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em]">Status</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em]">Unblock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((row) => (
              <tr key={row.id} className="bg-white">
                <td className="px-6 py-5 font-semibold text-slate-700">{row.id}</td>
                <td className="px-6 py-5 text-base font-semibold text-slate-800">{row.cardId}</td>
                <td className="px-6 py-5">
                  <span className="rounded-full bg-[#dffbe6] px-4 py-1 text-xs font-semibold uppercase text-[#1f7a3d]">
                    {row.status}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-[color:rgb(var(--color-teal))] hover:text-[color:rgb(var(--color-teal))]"
                    aria-label="Unblock card"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="5" y="11" width="14" height="9" rx="2" />
                      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
