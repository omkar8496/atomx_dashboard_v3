"use client";

const rows = [
  {
    id: 1,
    name: "INVENTORY",
    type: "Inventory",
    loginCode: "6283",
    items: 2
  }
];

export default function VendorTable() {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">#</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">Name</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">Type</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">Login Code</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">Items</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">Link</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">Add Stall</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-4 text-slate-600">{row.id}</td>
                <td className="px-4 py-4 font-semibold text-slate-800">{row.name}</td>
                <td className="px-4 py-4">
                  <span className="rounded-full bg-[#ffe8d4] px-3 py-1 text-xs font-semibold text-[#f88c43]">
                    {row.type}
                  </span>
                </td>
                <td className="px-4 py-4 text-slate-700">{row.loginCode}</td>
                <td className="px-4 py-4 text-slate-600">{row.items}</td>
                <td className="px-4 py-4 text-slate-500">
                  <button className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 hover:border-[#1495ab] hover:text-[#1495ab]">
                    Link
                  </button>
                </td>
                <td className="px-4 py-4 text-slate-500">
                  <button className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 hover:border-[#1495ab] hover:text-[#1495ab]">
                    Add
                  </button>
                </td>
                <td className="px-4 py-4 text-slate-500">
                  <button className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 hover:border-[#1495ab] hover:text-[#1495ab]">
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
