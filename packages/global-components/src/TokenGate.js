"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const DEFAULT_FALLBACK = (
  <div className="flex min-h-screen items-center justify-center bg-[#f6f7fb] text-sm text-slate-500">
    Checking your access…
  </div>
);

export function TokenGate({
  appId,
  children,
  publicRoutes = ["/login"],
  fallback = DEFAULT_FALLBACK
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);

  const isPublicRoute = useMemo(() => {
    if (!pathname) return false;
    return publicRoutes.some((route) => pathname.startsWith(route));
  }, [pathname, publicRoutes]);

  useEffect(() => {
    if (!appId || isPublicRoute) {
      setReady(true);
      return;
    }
    setReady(true);
    if (searchParams.get("token") && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("token");
      // Avoid router basePath re-prefix issues by rewriting URL in place.
      window.history.replaceState(
        window.history.state,
        "",
        `${url.pathname}${url.search}${url.hash}`
      );
    }
  }, [appId, isPublicRoute, searchParams]);

  if (isPublicRoute || ready) {
    return children;
  }

  return fallback;
}
