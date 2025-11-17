function DownloadCloudIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M8 17a4 4 0 1 1 0-8 5.5 5.5 0 0 1 10.4 1.66A3.5 3.5 0 1 1 19 17" />
      <path d="M12 12v9" />
      <path d="m8 16 4 4 4-4" />
    </svg>
  );
}

const RECORDS = [
  {
    id: "1",
    loginEmail: "admin@atomx.in",
    eventId: "333",
    yearSeries: "25",
    client: "00",
    eventSeries: "00",
    quantityGenerated: 998000,
    quantityExtra: 2000,
    formType: "1 : Card",
    createdAt: "2024-10-28T10:32:00Z",
    mailOwner: "Omkar A.",
    mailTo: ["events@brand.com"],
    mailCc: ["ops@atomx.in", "support@atomx.in"],
    mailMessage: "Attached: QR redirects for AtomX card batch.",
    includesUrls: true,
    tagsRange: { first: "250000000001", last: "250000999999" },
  },
  {
    id: "2",
    loginEmail: "ops@atomx.in",
    eventId: "782",
    yearSeries: "24",
    client: "01",
    eventSeries: "12",
    quantityGenerated: 15000,
    quantityExtra: 0,
    formType: "4 : Tag",
    createdAt: "2024-10-18T08:05:00Z",
    mailOwner: "Priya S.",
    mailTo: ["client.ops@brand.com"],
    mailCc: ["qa@atomx.in"],
    mailMessage: "Deliverables ready. Please sync printing line.",
    includesUrls: false,
    tagsRange: { first: "240112000001", last: "240112015000" },
  },
  {
    id: "3",
    loginEmail: "support@atomx.in",
    eventId: "987",
    yearSeries: "23",
    client: "00",
    eventSeries: "45",
    quantityGenerated: 64000,
    quantityExtra: 0,
    formType: "7 : Bamboo-card",
    createdAt: "2024-09-15T15:45:00Z",
    mailOwner: "Nikita R.",
    mailTo: ["green.events@brand.com"],
    mailCc: ["ops@atomx.in", "finance@atomx.in"],
    mailMessage: "Eco batch ready for QA upload.",
    includesUrls: true,
    tagsRange: { first: "230045000001", last: "230045064000" },
  },
];

function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatNumber(value) {
  return value.toLocaleString("en-IN");
}

function formatEmails(list) {
  if (!Array.isArray(list) || list.length === 0) return "—";
  return list.join(", ");
}

function formatTagRange(range) {
  if (!range || !range.first || !range.last) return "—";
  return `From: ${range.first} → To: ${range.last}`;
}

const COLUMNS = [
  { key: "loginEmail", label: "Login Email" },
  { key: "eventId", label: "Event ID" },
  { key: "yearSeries", label: "Year Series" },
  { key: "client", label: "Client" },
  { key: "eventSeries", label: "Event Series" },
  { key: "quantityGenerated", label: "Generated Qty", formatter: formatNumber },
  { key: "quantityExtra", label: "Extra Qty", formatter: formatNumber },
  { key: "tagsRange", label: "Generated Card IDs", formatter: formatTagRange },
  { key: "createdAt", label: "Created", formatter: formatDate },
  { key: "mailOwner", label: "Mail" },
];

export default function AdminViewPage() {
  return (
    <section className="w-full self-start px-6 pt-6 pb-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-gray-900">View Tag Batches</h1>

      <div className="relative rounded-3xl border border-gray-200 shadow-card">
        <div className="w-full">
          <table className="min-w-full text-sm">
            <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
              <tr>
                {COLUMNS.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700"
                  >
                    {column.label}
                  </th>
                ))}
                <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {RECORDS.map((record, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <tr
                    key={record.id}
                    className={`${isEven ? "bg-white" : "bg-gray-50"} border-t border-gray-100 transition hover:bg-[#fff5f2]`}
                  >
                    {COLUMNS.map((column) => {
                      const rawValue = record[column.key];
                      const displayValue = column.formatter ? column.formatter(rawValue) : rawValue;

                      if (column.key === "loginEmail") {
                        return (
                          <td key={column.key} className="px-4 py-3 text-gray-900">
                            <div className="flex items-center gap-3">
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#e04420]/10 text-xs font-semibold text-[#e04420]">
                                {record.mailOwner
                                  .split(" ")
                                  .map((part) => part[0])
                                  .join("")}
                              </span>
                              <div className="min-w-[12rem]">
                                <p className="font-semibold">{displayValue}</p>
                                <p className="text-xs text-gray-500">Owned by {record.mailOwner}</p>
                              </div>
                            </div>
                          </td>
                        );
                      }

                      if (column.key === "mailOwner") {
                        return (
                          <td key={column.key} className="px-4 py-3 text-gray-800">
                            <div className="group relative inline-flex">
                              <button
                                type="button"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-lg text-gray-600 transition hover:border-[#e04420] hover:text-[#e04420] focus:border-[#e04420] focus:text-[#e04420]"
                                aria-haspopup="true"
                                aria-label={`Mail details shared by ${record.mailOwner}`}
                              >
                                ⋮
                              </button>
                              <div
                                className="pointer-events-none absolute right-0 top-full z-20 mt-2 w-60 rounded-2xl border border-gray-200 bg-white p-4 text-xs text-gray-600 shadow-xl opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
                              >
                                <p className="text-sm font-semibold text-gray-900">Shared by {record.mailOwner}</p>
                                <div className="mt-3 space-y-2">
                                  <div>
                                    <p className="font-medium text-gray-700">To</p>
                                    <p className="text-gray-600">{formatEmails(record.mailTo)}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-700">CC</p>
                                    <p className="text-gray-600">{formatEmails(record.mailCc)}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-700">Message</p>
                                    <p className="text-gray-600">{record.mailMessage}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-700">Form Type</p>
                                    <p className="text-gray-600">{record.formType}</p>
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-700">
                                    <span className={`h-2 w-2 rounded-full ${record.includesUrls ? "bg-emerald-500" : "bg-slate-400"}`} />
                                    <span>{record.includesUrls ? "URLs included" : "IDs only"}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td key={column.key} className="px-4 py-3 text-gray-800">
                          {displayValue}
                        </td>
                      );
                    })}

                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-full bg-[#fde6de] px-4 py-2 text-xs font-semibold text-[#c23a19] shadow-sm transition hover:brightness-95"
                        >
                          <DownloadCloudIcon className="h-4 w-4" />
                         
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
