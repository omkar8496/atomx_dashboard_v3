"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const DEFAULT_FALLBACK = (
  <div className="flex min-h-screen items-center justify-center bg-[#f6f7fb] text-sm text-slate-500">
    Checking your access…
  </div>
);

export function TokenGate({
  appId,
  children,
  redirect = "/login",
  publicRoutes = ["/login"],
  fallback = DEFAULT_FALLBACK
}) {
  const router = useRouter();
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

    let token = searchParams.get("token");
    if (!token && typeof window !== "undefined") {
      token = window.localStorage.getItem(`atomx.auth.${appId}`);
    }

    if (token) {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(`atomx.auth.${appId}`, token);
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
      return;
    }

    router.replace(redirect);
  }, [appId, isPublicRoute, redirect, searchParams, router]);

  if (isPublicRoute || ready) {
    return children;
  }

  return fallback;
}
