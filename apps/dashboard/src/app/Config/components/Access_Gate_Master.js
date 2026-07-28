"use client";

function EditIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
    </svg>
  );
}

function gateCategoryName(gate) {
  return gate?.name ?? gate?.gateName ?? gate?.gate_name ?? gate?.title ?? "-";
}

export default function Access_Gate_Master({ gates, onEdit }) {
  return (
    <div className="max-h-[333px] overflow-auto rounded-lg border border-[#e8e3f7]">
      <table className="w-full min-w-[470px] border-collapse">
        <thead className="sticky top-0 z-[1] bg-[#f8f6ff]">
          <tr>
            <th className="w-[64px] border-b border-[#e5def8] px-3 py-2 text-left text-[0.58rem] font-bold uppercase tracking-[0.13em] text-[#8d859b]">
              No.
            </th>
            <th className="w-[90px] border-b border-[#e5def8] px-3 py-2 text-left text-[0.58rem] font-bold uppercase tracking-[0.13em] text-[#8d859b]">
              Gate
            </th>
            <th className="border-b border-[#e5def8] px-3 py-2 text-left text-[0.58rem] font-bold uppercase tracking-[0.13em] text-[#8d859b]">
              Category Name
            </th>
            <th className="w-[64px] border-b border-[#e5def8] px-3 py-2 text-center text-[0.58rem] font-bold uppercase tracking-[0.13em] text-[#8d859b]">
              Edit
            </th>
          </tr>
        </thead>
        <tbody>
          {gates.map((gate, index) => (
            <tr
              key={gate?.id ?? `${gateCategoryName(gate)}-${index}`}
              className="bg-white transition hover:bg-[#fffaf8]"
            >
              <td className="border-b border-[#eeeeee] px-3 py-2.5 text-[0.76rem] font-bold text-[#E04420]">
                {index + 1}
              </td>
              <td className="border-b border-[#eeeeee] px-3 py-2.5">
                <span className="text-[0.78rem] font-bold text-[#341CD6]">
                  {gate?.gateDay ?? "-"}
                </span>
              </td>
              <td className="border-b border-[#eeeeee] px-3 py-2.5">
                <span className="block truncate text-[0.82rem] font-bold text-[#252525]">
                  {gateCategoryName(gate)}
                </span>
              </td>
              <td className="border-b border-[#eeeeee] px-3 py-2.5 text-center">
                <button
                  type="button"
                  onClick={() => onEdit?.(gate)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#e5e5e5] bg-white text-[#686868] transition hover:border-[#d3c7ff] hover:text-[#202020] hover:shadow-[0_6px_12px_rgba(15,23,42,0.08)]"
                  aria-label={`Edit ${gateCategoryName(gate)}`}
                  title={`Edit ${gateCategoryName(gate)}`}
                >
                  <EditIcon />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
