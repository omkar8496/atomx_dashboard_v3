"use client";

import dynamic from "next/dynamic";
import { AtomXLoader } from "@atomx/global-components";

const AdminClient = dynamic(() => import("./AdminClient"), {
  ssr: false,
  loading: () => <AtomXLoader fullScreen label="Loading admin..." className="bg-[color:rgb(var(--color-bg))]" />
});

export default function AdminClientNoSSR() {
  return <AdminClient />;
}
