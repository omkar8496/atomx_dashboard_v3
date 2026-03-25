import { Suspense } from "react";
import "./globals.css";
import { TokenGate } from "@atomx/global-components";
import { PostHogInit } from "../components/PostHogInit";

export const metadata = {
  title: "Tag Series | AtomX Platform",
  description: "IoT analytics and command center for connected tags."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <PostHogInit />
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#f6f7fb] text-sm text-slate-500">Checking access…</div>}>
          <TokenGate appId="tag-series" publicRoutes={["/login"]}>
            {children}
          </TokenGate>
        </Suspense>
      </body>
    </html>
  );
}
