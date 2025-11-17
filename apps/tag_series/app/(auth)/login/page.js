import { Suspense } from "react";
import { UniversalLoginPage } from "@atomx/global-components";

export const metadata = {
  title: "Tag Series Login",
  description: "Secure console access for the Tag Series fleet."
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#f6f7fb]">Loading…</div>}>
      <UniversalLoginPage appId="tag_series" redirectPath="/" />
    </Suspense>
  );
}
