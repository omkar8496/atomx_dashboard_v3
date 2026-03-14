"use client";

const rows = [
  {
    id: 1,
    code: "888",
    type: "CARD",
    vendorTag: "wisepos+",
    stall: "TOPUP CARD MSWIPE",
    vendor: "Topup",
    loginAt: "2025-07-28 15:01:16",
    value: "5.58",
    closed: true
  },
  {
    id: 2,
    code: "1002",
    type: "CARD",
    vendorTag: null,
    stall: "TOPUP CARD MSWIPE",
    vendor: "Topup",
    loginAt: "2025-07-28 15:01:16",
    value: "5.58",
    closed: false
  },
  {
    id: 3,
    code: "1050",
    type: "CARD",
    vendorTag: null,
    stall: "TOPUP CARD",
    vendor: "Topup",
    loginAt: "2025-07-13 23:05:42",
    value: "5.57",
    closed: false
  },
  {
    id: 4,
    code: "1096",
    type: "ACCESSX",
    vendorTag: null,
    stall: "AccessX",
    vendor: "AccessX",
    loginAt: "2025-03-12 14:38:10",
    value: "5.33",
    closed: false
  },
  {
    id: 5,
    code: "1099",
    type: "MENU",
    vendorTag: null,
    stall: "DEMO SALE",
    vendor: "Sale",
    loginAt: "2025-06-04 15:13:53",
    value: "4.90",
    closed: false
  },
  {
    id: 6,
    code: "1114",
    type: "ITEM_SALE",
    vendorTag: null,
    stall: "BEER",
    vendor: "Sale",
    loginAt: "2025-06-24 13:21:29",
    value: "5.57",
    closed: false
  }
];

const LockIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-4 w-4 text-slate-400"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

export default function DeviceTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#0ea5a0] text-white">
            <tr>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em]">#</th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em]">Device</th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em]">Log In At</th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em]">Value</th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em]">Closed At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((row) => (
              <tr key={row.id} className="bg-white">
                <td className="px-5 py-5 font-semibold text-slate-700">{row.id}</td>
                <td className="px-5 py-5">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-[#d7f9f1] px-3 py-1 text-xs font-semibold text-[#0b8f85]">
                      {row.code}
                    </span>
                    <LockIcon />
                    <span className="rounded-full border border-[#7de3d2] px-3 py-1 text-xs font-semibold text-[#0b8f85]">
                      {row.type}
                    </span>
                    {row.vendorTag && (
                      <span className="rounded-full border border-[#f8c78a] px-3 py-1 text-xs font-semibold text-[color:rgb(var(--color-orange))]">
                        {row.vendorTag}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    ✏️ <span className="font-semibold">STALL:</span> {row.stall}{" "}
                    <span className="font-semibold">| VENDOR:</span> {row.vendor}
                  </div>
                </td>
                <td className="px-5 py-5 text-sm text-slate-700">{row.loginAt}</td>
                <td className="px-5 py-5 text-base font-semibold text-[#0b8f85]">
                  {row.value}
                </td>
                <td className="px-5 py-5">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      row.closed
                        ? "bg-[#dcfce7] text-[#1f7a3d]"
                        : "bg-[#fde2e2] text-[#b42318]"
                    }`}
                  >
                    {row.closed ? "YES" : "NO"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
