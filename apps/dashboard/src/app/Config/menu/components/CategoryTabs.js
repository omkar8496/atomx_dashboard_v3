"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "./MenuIcons";

function ScrollButton({ direction, onClick }) {
  const isLeft = direction === "left";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isLeft ? "Show previous categories" : "Show more categories"}
      title={isLeft ? "Previous categories" : "More categories"}
      className={`grid w-9 shrink-0 cursor-pointer place-items-center bg-(--surface) text-(--muted) transition hover:bg-(--surface2) hover:text-(--orange) ${
        isLeft ? "border-r border-(--line2)" : "border-l border-(--line2)"
      }`}
    >
      <ChevronDownIcon className={`h-4 w-4 ${isLeft ? "rotate-90" : "-rotate-90"}`} />
    </button>
  );
}

export default function CategoryTabs({ categories, activeId, onSelect }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const syncScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    syncScrollState();
    el.addEventListener("scroll", syncScrollState, { passive: true });
    window.addEventListener("resize", syncScrollState);
    return () => {
      el.removeEventListener("scroll", syncScrollState);
      window.removeEventListener("resize", syncScrollState);
    };
  }, [syncScrollState, categories.length]);

  const scrollByStep = (multiplier) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: multiplier * Math.max(180, el.clientWidth * 0.6), behavior: "smooth" });
  };

  return (
    <div className="flex items-stretch border-b border-(--line) bg-(--surface)">
      {canScrollLeft ? (
        <ScrollButton direction="left" onClick={() => scrollByStep(-1)} />
      ) : null}

      <div
        ref={scrollRef}
        className="flex min-w-0 flex-1 items-end gap-1 overflow-x-auto px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((cat) => {
          const isActive = activeId === cat.id;
          const isOff = cat.active === false;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelect(cat.id)}
              title={isOff ? `${cat.name} - category is off` : cat.name}
              className={`relative flex shrink-0 cursor-pointer items-center gap-2 px-4 py-3 text-[13px] font-semibold transition-colors ${
                isActive ? "text-(--text)" : "text-(--muted) hover:text-(--text)"
              } ${isOff ? "opacity-60" : ""}`}
            >
              <span className={isOff ? "line-through decoration-(--faint) decoration-1" : ""}>
                {cat.name}
              </span>
              {isOff ? (
                <span className="font-vcr flex h-5 items-center rounded-full bg-(--chip) px-1.5 text-[8.5px] tracking-[0.12em] text-(--faint)">
                  OFF
                </span>
              ) : null}
              <span
                className={`font-vcr flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[9.5px] leading-none ${
                  isActive ? "bg-(--text) text-(--bg)" : "bg-(--chip) text-(--faint)"
                }`}
              >
                {cat.count}
              </span>
              {isActive && (
                <span
                  className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-t-sm ${
                    isOff ? "bg-(--faint)" : "bg-(--orange)"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {canScrollRight ? (
        <ScrollButton direction="right" onClick={() => scrollByStep(1)} />
      ) : null}
    </div>
  );
}
