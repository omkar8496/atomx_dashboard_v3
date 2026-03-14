"use client";

import { useEffect, useState } from "react";

export default function ConfigTransition({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mounted) return;
    const timer = setTimeout(() => setMounted(true), 20);
    return () => clearTimeout(timer);
  }, [mounted]);

  return (
    <div
      className={`transition-all duration-300 ease-out ${
        mounted
          ? "opacity-100 translate-x-0 scale-100"
          : "opacity-100 translate-x-6 scale-[0.98]"
      }`}
    >
      {children}
    </div>
  );
}
