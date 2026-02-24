"use client";

import { useEffect, useMemo, useState } from "react";

const ORANGE = "#e65a24";
const ORANGE_DARK = "#d94c14";

export function Add_Role({ labels = ["Admin", "Operator"], onClick }) {
  const items = useMemo(() => {
    const list = Array.isArray(labels) ? labels.filter(Boolean) : [];
    return list.length ? list : ["Admin"];
  }, [labels]);
  const hasLoop = items.length > 1;
  const [current, setCurrent] = useState(0);
  const [next, setNext] = useState(() => (items.length > 1 ? 1 : 0));
  const [sliding, setSliding] = useState(false);

  useEffect(() => {
    // reset indices when labels change
    setCurrent(0);
    setNext(items.length > 1 ? 1 : 0);
  }, [items]);

  useEffect(() => {
    if (!hasLoop) return undefined;
    const id = setInterval(() => setSliding(true), 3000);
    return () => clearInterval(id);
  }, [hasLoop]);

  useEffect(() => {
    if (!sliding) return undefined;
    const timeout = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % items.length);
      setNext((prev) => (prev + 1) % items.length);
      setSliding(false);
    }, 450);
    return () => clearTimeout(timeout);
  }, [sliding, items.length]);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/60 bg-[radial-gradient(circle_at_25%_30%,rgba(255,255,255,0.18),transparent_55%),linear-gradient(135deg,#ee7237,#e04420)] px-3.5 py-2 text-white shadow-[0_12px_24px_rgba(224,68,32,0.22)] transition hover:translate-y-[-1px] hover:brightness-105 active:translate-y-[0px]"
      style={{
        backgroundColor: ORANGE,
        borderColor: ORANGE_DARK
      }}
    >
      <span className="flex h-8 w-8 items-center justify-center text-base font-bold text-white">
        <svg
          aria-hidden="true"
          focusable="false"
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </span>
      <span
        className="relative h-5 overflow-hidden text-sm font-semibold leading-none tracking-wide text-white"
        style={{ minWidth: "86px" }}
        aria-live="polite"
      >
        <span
          className="absolute inset-0 flex items-center justify-start transition-transform duration-500 ease-out will-change-transform"
          style={{
            transform: sliding ? "translateY(100%)" : "translateY(0%)"
          }}
        >
          {items[current]}
        </span>
        {hasLoop && (
          <span
            className="absolute inset-0 flex items-center justify-start transition-transform duration-500 ease-out will-change-transform"
            style={{
              transform: sliding ? "translateY(0%)" : "translateY(-100%)"
            }}
          >
            {items[next]}
          </span>
        )}
      </span>
    </button>
  );
}
