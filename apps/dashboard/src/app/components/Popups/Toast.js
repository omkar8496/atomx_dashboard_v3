"use client";

import { useEffect } from "react";

export default function Toast({
  open,
  title,
  message,
  duration = 2400,
  onClose
}) {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div className="fixed top-[92px] left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm text-slate-700 shadow-[0_12px_26px_rgba(15,23,42,0.18)]">
        <span className="font-semibold text-slate-800">{title}</span>
        <span className="text-slate-300">|</span>
        <span className="text-slate-600">{message}</span>
      </div>
    </div>
  );
}
