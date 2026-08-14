"use client";

function EditIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-[15px] w-[15px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11.2 2.4l2.4 2.4-8 8H3.2v-2.4z" />
    </svg>
  );
}

function gateName(gate) {
  return gate?.gatesmaster_name ?? gate?.gateName ?? gate?.name ?? "-";
}

function categoryName(gate) {
  return gate?.category_name ?? gate?.categoryName ?? gate?.category ?? "-";
}

export default function Access_Gate_Config({ gates, onEdit }) {
  return (
    <div className="max-h-[333px] overflow-auto rounded-[11px] border border-(--line)">
      <table className="w-full min-w-[520px] border-collapse">
        <thead className="font-vcr sticky top-0 z-[1] bg-(--surface2)">
          <tr>
            <th className="w-[64px] border-b border-(--line) px-3 py-2.5 text-left text-[9.5px] tracking-[0.15em] text-(--orange)">
              NO.
            </th>
            <th className="border-b border-(--line) px-3 py-2.5 text-left text-[9.5px] tracking-[0.15em] text-(--orange)">
              GATE
            </th>
            <th className="border-b border-(--line) px-3 py-2.5 text-left text-[9.5px] tracking-[0.15em] text-(--orange)">
              CATEGORY
            </th>
            <th className="w-[64px] border-b border-(--line) px-3 py-2.5 text-center text-[9.5px] tracking-[0.15em] text-(--orange)">
              EDIT
            </th>
          </tr>
        </thead>
        <tbody>
          {gates.map((gate, index) => (
            <tr
              key={gate?.id ?? `${gateName(gate)}-${categoryName(gate)}-${index}`}
              className="transition hover:bg-(--surface2)"
            >
              <td className="font-vcr border-b border-(--line2) px-3 py-2.5 text-[12px] text-(--orange)">
                {index + 1}
              </td>
              <td className="border-b border-(--line2) px-3 py-2.5">
                <span className="block truncate text-[13px] font-semibold text-(--text)">
                  {gateName(gate)}
                </span>
              </td>
              <td className="border-b border-(--line2) px-3 py-2.5">
                <span className="block truncate text-[13px] font-medium text-(--muted)">
                  {categoryName(gate)}
                </span>
              </td>
              <td className="border-b border-(--line2) px-3 py-2.5 text-center">
                <button
                  type="button"
                  onClick={() => onEdit?.(gate)}
                  className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-[8px] border border-(--line) bg-(--surface) text-(--muted) transition hover:border-(--orange) hover:text-(--orange)"
                  aria-label={`Edit ${gateName(gate)} ${categoryName(gate)}`}
                  title={`Edit ${gateName(gate)} ${categoryName(gate)}`}
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
