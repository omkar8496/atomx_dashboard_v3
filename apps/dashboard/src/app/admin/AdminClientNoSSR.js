"use client";

import dynamic from "next/dynamic";

const AdminClient = dynamic(() => import("./AdminClient"), {
  ssr: false,
  loading: () => (
    <main className="min-h-screen bg-[color:rgb(var(--color-bg))] pb-10">
      <div className="w-full pr-3 pl-12 md:pr-6 md:pl-16 mt-2">
        <div className="rounded-lg border border-[#e8d9d3] bg-white px-6 py-6 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
          <div className="text-sm font-semibold text-slate-700">Loading admin…</div>
        </div>
      </div>
    </main>
  )
});

export default function AdminClientNoSSR() {
  return <AdminClient />;
}
