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
      // NOTE: once mounted we drop the transform utilities entirely. A lingering
      // non-none `transform` here would make any `position: fixed` descendant
      // (the Config/Menu modals) resolve against this box instead of the
      // viewport, dropping them to the bottom of the page.
      className={`transition-all duration-300 ease-out ${
        mounted ? "opacity-100" : "opacity-100 translate-x-6 scale-[0.98]"
      }`}
    >
      {children}
    </div>
  );
}
