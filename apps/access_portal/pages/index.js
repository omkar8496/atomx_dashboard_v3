import { Suspense } from "react";
import { UniversalLoginPage } from "@atomx/global-components";

export default function PortalLogin() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#f6f7fb] text-sm text-slate-600">Loading AtomX portal…</div>}>
      <UniversalLoginPage appId="portal" redirectPath="/access" />
    </Suspense>
  );
}
