"use client";

export default function CategoryTabs({ categories, activeId, onSelect }) {
  return (
    <div className="flex items-end gap-1 overflow-x-auto border-b border-[#ebebeb] bg-white px-4">
      {categories.map((cat) => {
        const isActive = activeId === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={`relative flex shrink-0 items-center gap-2 px-4 py-3 text-[0.84rem] font-semibold transition-colors ${
              isActive
                ? "text-[#1C1C1C]"
                : "text-[#858585] hover:text-[#333333]"
            }`}
          >
            <span>{cat.name}</span>
            <span
              className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[0.65rem] font-bold leading-none ${
                isActive
                  ? "bg-[#1C1C1C] text-white"
                  : "bg-[#f3f3f3] text-[#8c8c8c]"
              }`}
            >
              {cat.count}
            </span>
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t-sm bg-[#E04420]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
