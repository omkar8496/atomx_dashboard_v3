"use client";

export default function TabHeader({ activeTab, onChange }) {
  const tabs = ["About", "Pos", "Cashless"];
  return (
    <div className="flex items-center gap-2 text-sm">
      {tabs.map((tab, index) => (
        <div key={tab} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange(tab)}
            className={`transition-colors ${
              activeTab === tab
                ? "font-semibold text-[#258d9c]"
                : "text-slate-600 hover:text-[#258d9c]"
            }`}
          >
            {tab}
          </button>
          {index < tabs.length - 1 && <span className="text-slate-400">/</span>}
        </div>
      ))}
    </div>
  );
}
