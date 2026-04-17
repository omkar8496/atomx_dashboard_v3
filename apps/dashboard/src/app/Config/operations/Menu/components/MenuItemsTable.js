"use client";

import { useState } from "react";

function Toggle({ defaultChecked = false }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <button
      type="button"
      onClick={() => setChecked((prev) => !prev)}
      className={`relative h-6 w-10 rounded-full ${
        checked ? "bg-[#1495ab]" : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white ${
          checked ? "left-[18px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

function Field({ defaultValue, className = "" }) {
  return (
    <input
      defaultValue={defaultValue}
      className={`w-full border-0 border-b border-slate-200 bg-transparent py-1.5 text-sm text-slate-700 outline-none focus:border-[#1495ab] ${className}`}
    />
  );
}

function SelectField({ defaultValue, options = [] }) {
  const uniqueOptions = Array.from(new Set(options));
  return (
    <select
      defaultValue={defaultValue}
      className="w-full border-0 border-b border-slate-200 bg-transparent py-1.5 text-sm text-slate-700 outline-none focus:border-[#1495ab]"
    >
      {uniqueOptions.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function NumberField({ defaultValue }) {
  return (
    <input
      defaultValue={defaultValue}
      inputMode="numeric"
      className="w-full border-0 border-b border-slate-200 bg-transparent py-1.5 text-sm text-slate-700 outline-none focus:border-[#1495ab]"
    />
  );
}

export default function MenuItemsTable({ items }) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#dce6ef] bg-white shadow-[0_10px_26px_rgba(15,23,42,0.08)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1700px] border-collapse text-sm">
          <thead className="bg-[#258d9c] text-white">
            <tr>
              {[
                "Item Name",
                "Price",
                "Happy",
                "HSN",
                "Barcode",
                "EPC",
                "Type",
                "Tags",
                "Status",
                "Image",
                "Supplier Code",
                "Group ID",
                "Qty",
                "Size",
                "Color",
                "Image Upload"
              ].map((col) => (
                <th
                  key={col}
                  className="whitespace-nowrap px-3 py-3.5 text-left text-xs font-semibold tracking-[0.08em]"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-slate-100 align-top transition hover:bg-slate-50/65"
              >
                <td className="whitespace-nowrap px-3 py-4 font-semibold text-slate-700">{item.itemName}</td>
                <td className="px-3 py-4"><NumberField defaultValue={item.price} /></td>
                <td className="px-3 py-4"><NumberField defaultValue={item.happy} /></td>
                <td className="px-3 py-4"><NumberField defaultValue={item.hsn} /></td>
                <td className="px-3 py-4"><NumberField defaultValue={item.barcode} /></td>
                <td className="px-3 py-4"><NumberField defaultValue={item.epc} /></td>
                <td className="px-3 py-4"><Field defaultValue={item.type} /></td>
                <td className="px-3 py-4">
                  <SelectField
                    defaultValue={item.tags}
                    options={[item.tags, "Bestseller", "Promo", "New", "Chef Special"]}
                  />
                </td>
                <td className="px-3 py-4">
                  <SelectField
                    defaultValue={item.status}
                    options={[item.status, "Veg", "Non Veg", "Drink", "Egg"]}
                  />
                </td>
                <td className="px-3 py-4">
                  <Toggle defaultChecked={Boolean(item.imageEnabled)} />
                </td>
                <td className="px-3 py-4"><Field defaultValue={item.supplierCode} /></td>
                <td className="px-3 py-4"><Field defaultValue={item.groupId} /></td>
                <td className="px-3 py-4"><NumberField defaultValue={item.qty} /></td>
                <td className="px-3 py-4"><Field defaultValue={item.size} /></td>
                <td className="px-3 py-4"><Field defaultValue={item.color} /></td>
                <td className="px-3 py-4">
                  <button
                    type="button"
                    className="rounded-full border border-[#d4dee8] px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-[#1495ab]/40 hover:bg-[#1495ab]/5 hover:text-[#0a6776]"
                  >
                    Upload
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
