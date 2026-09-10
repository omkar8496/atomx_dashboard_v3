"use client";

import { useSearchParams } from "next/navigation";
import Header from "../../../components/Header";
import AdminRoleManager from "./AdminRoleManager";

export default function AdminRolesShell() {
  const searchParams = useSearchParams();
  // Workspace scope: reached from the event list, before any event is opened.
  // The rail then exposes only the two workspace destinations.
  const isWorkspaceScope = searchParams.get("scope") === "workspace";

  return (
    <main
      className="min-h-screen bg-(--bg) pb-10"
      style={{ fontFamily: '"Poppins", system-ui, sans-serif' }}
    >
      <Header
        areaLabel="User Roles"
        variant="portal"
        navOnly={isWorkspaceScope ? ["allEvents", "admin"] : null}
        navItemHrefs={
          isWorkspaceScope ? { admin: "/admin/Create_event?scope=workspace" } : null
        }
      />
      <div className="mx-auto w-full max-w-[1780px] pl-[72px] pr-4 pt-6 md:pl-[88px] md:pr-6 max-[900px]:px-3">
        <AdminRoleManager isWorkspaceScope={isWorkspaceScope} />
      </div>
    </main>
  );
}
