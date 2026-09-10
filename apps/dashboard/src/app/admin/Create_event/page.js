import { Suspense } from "react";
import AdminRolesShell from "./components/AdminRolesShell";

export default function CreateEventPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-(--bg)" />
      }
    >
      <AdminRolesShell />
    </Suspense>
  );
}
