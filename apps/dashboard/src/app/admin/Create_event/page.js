"use client";

import Header from "../../components/Header";
import AdminRoleManager from "./components/AdminRoleManager";

export default function CreateEventPage() {
  return (
    <main
      className="min-h-screen bg-(--bg) pb-10"
      style={{ fontFamily: '"Poppins", system-ui, sans-serif' }}
    >
      <Header areaLabel="Admin" />
      <div className="mx-auto w-full max-w-[1780px] pl-[72px] pr-4 pt-6 md:pl-[88px] md:pr-6 max-[900px]:px-3">
        <AdminRoleManager />
      </div>
    </main>
  );
}
