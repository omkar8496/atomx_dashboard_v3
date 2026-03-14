"use client";

const rows = [
  { id: 13995, vendor: "INVENTORY", stall: "STORE 1", devices: 0 },
  { id: 13996, vendor: "INVENTORY", stall: "STORE 2", devices: 0 },
  { id: 13997, vendor: "INVENTORY", stall: "STORE 3", devices: 0 }
];

export default function StallTable() {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">#</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">Vendor</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">Stall</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">Devices</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">Menu</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-4 text-slate-600">{row.id}</td>
                <td className="px-4 py-4 font-semibold text-slate-800">{row.vendor}</td>
                <td className="px-4 py-4 text-slate-700">{row.stall}</td>
                <td className="px-4 py-4 text-slate-600">{row.devices}</td>
                <td className="px-4 py-4 text-slate-500">
                  <button className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 hover:border-[color:rgb(var(--color-teal))] hover:text-[color:rgb(var(--color-teal))]">
                    Menu
                  </button>
                </td>
                <td className="px-4 py-4 text-slate-500">
                  <button className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 hover:border-[color:rgb(var(--color-teal))] hover:text-[color:rgb(var(--color-teal))]">
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
