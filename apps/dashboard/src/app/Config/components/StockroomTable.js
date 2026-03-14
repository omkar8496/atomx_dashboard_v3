"use client";

const rows = [
  { id: 13993, vendor: "INVENTORY", stall: "STOCKMASTER", devices: 0 },
  { id: 13994, vendor: "INVENTORY", stall: "STOCKROOM", devices: 1 },
  { id: 14011, vendor: "INVENTORY", stall: "STOCKROOM2", devices: 0 },
  { id: 14027, vendor: "INVENTORY", stall: "SM 2", devices: 0 }
];

export default function StockroomTable() {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#fbbf7a] text-white">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">#</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">Vendor</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">Stall</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">Devices</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">Menu</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-orange-100">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-orange-50/60">
                <td className="px-4 py-4 text-slate-700">{row.id}</td>
                <td className="px-4 py-4 font-semibold text-slate-800">{row.vendor}</td>
                <td className="px-4 py-4 text-slate-700">{row.stall}</td>
                <td className="px-4 py-4 text-slate-600">{row.devices}</td>
                <td className="px-4 py-4 text-slate-500">
                  <button className="rounded-full border border-orange-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-[color:rgb(var(--color-orange))] hover:text-[color:rgb(var(--color-orange))]">
                    Menu
                  </button>
                </td>
                <td className="px-4 py-4 text-slate-500">
                  <button className="rounded-full border border-orange-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-[color:rgb(var(--color-orange))] hover:text-[color:rgb(var(--color-orange))]">
                    Edit
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
