"use client";

export default function CategoryTabs({ categories, activeId, onSelect }) {
  return (
    <div className="flex items-end gap-1 overflow-x-auto border-b border-(--line) bg-(--surface) px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {categories.map((cat) => {
        const isActive = activeId === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={`relative flex shrink-0 items-center gap-2 px-4 py-3 text-[13px] font-semibold transition-colors ${
              isActive ? "text-(--text)" : "text-(--muted) hover:text-(--text)"
            }`}
          >
            <span>{cat.name}</span>
            <span
              className={`font-vcr flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[9.5px] leading-none ${
                isActive ? "bg-(--text) text-(--bg)" : "bg-(--chip) text-(--faint)"
              }`}
            >
              {cat.count}
            </span>
            {isActive && <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-sm bg-(--orange)" />}
          </button>
        );
      })}
    </div>
  );
}
