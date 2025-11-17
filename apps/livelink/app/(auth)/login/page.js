import { Suspense } from "react";
import { UniversalLoginPage } from "@atomx/global-components";

export const metadata = {
  title: "LiveLink Login",
  description: "Request access to the LiveLink control surface."
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#f6f7fb]">Loading…</div>}>
      <UniversalLoginPage appId="livelink" redirectPath="/" />
    </Suspense>
  );
}
