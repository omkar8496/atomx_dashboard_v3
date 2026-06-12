"use client";

import Header from "../../components/Header";
import AdminRoleManager from "./components/AdminRoleManager";

export default function CreateEventPage() {
  return (
    <main
      className="admin-page-font min-h-screen bg-[color:rgb(var(--color-bg))] pb-10"
      style={{ fontFamily: '"AtomX Admin Poppins", Poppins, sans-serif' }}
    >
      <style>{`
        @font-face {
          font-family: "AtomX Admin Poppins";
          src: url("/shared/fonts/Poppins/Poppins-Regular.ttf") format("truetype");
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: "AtomX Admin Poppins";
          src: url("/shared/fonts/Poppins/Poppins-SemiBold.ttf") format("truetype");
          font-weight: 600;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: "AtomX Admin Poppins";
          src: url("/shared/fonts/Poppins/Poppins-Bold.ttf") format("truetype");
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }

        .admin-page-font,
        .admin-page-font * {
          font-family: "AtomX Admin Poppins", Poppins, sans-serif;
        }
      `}</style>
      <Header areaLabel="Admin" />
      <div className="w-full pl-[72px] pr-4 pt-7 md:pl-[88px] md:pr-6">
        <AdminRoleManager />
      </div>
    </main>
  );
}
