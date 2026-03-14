"use client";

export default function ConfigBankDetails({ event }) {
  const fields = [
    {
      label: "Username",
      type: "text",
      placeholder: "Username",
      defaultValue: event?.bankUsername ?? "",
      name: "event.bankUsername"
    },
    {
      label: "Password",
      type: "password",
      placeholder: "Password",
      defaultValue: event?.bankPassword ?? "",
      name: "event.bankPassword"
    },
    { label: "Verify Client Code", type: "text", placeholder: "Client code" },
    { label: "Verify UserId", type: "text", placeholder: "UserId" },
    { label: "Verify Password", type: "password", placeholder: "Password" },
    { label: "UPI API", type: "text", placeholder: "UPI API" }
  ];

  return (
    <section className="h-full flex flex-col">
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-semibold text-slate-700">MSWIPE Details</h3>
        <div className="h-px flex-1 bg-slate-200" />
      </div>
      <div className="mt-3 flex-1 h-full rounded-lg border border-[#dbe9ef] bg-[#f4fbfd] px-6 py-5 shadow-[0_8px_18px_rgba(15,23,42,0.06)]">
        <div className="grid gap-5 md:grid-cols-2">
          {fields.map((field) => (
            <label key={field.label} className="flex flex-col gap-2 text-sm text-slate-600">
              {field.label}
              <input
                type={field.type}
                name={field.name}
                defaultValue={field.defaultValue ?? ""}
                className="border-b border-slate-200 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
                placeholder={field.placeholder}
              />
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}
