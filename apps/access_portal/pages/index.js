import { Suspense, useMemo } from "react";
import { useRouter } from "next/router";
import { UniversalLoginPage } from "@atomx/global-components";

function sanitizeReturnTo(value) {
  try {
    const parsed = new URL(value, window.location.origin);
    parsed.searchParams.delete("returnTo");
    return parsed.toString();
  } catch (err) {
    return value;
  }
}

export default function PortalLogin() {
  const router = useRouter();
  const returnTo = useMemo(() => {
    const raw = router.query.returnTo;
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (!value || typeof window === "undefined") return value;
    return sanitizeReturnTo(value);
  }, [router.query.returnTo]);

  const redirectPath = returnTo
    ? `/access?returnTo=${encodeURIComponent(returnTo)}`
    : "/access";

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f6f7fb] text-sm text-slate-600">
          Loading AtomX portal…
        </div>
      }
    >
      <UniversalLoginPage appId="portal" redirectPath={redirectPath} />
    </Suspense>
  );
}
