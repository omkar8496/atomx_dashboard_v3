import Header from "../components/Header";
import ReportFilters from "./components/ReportFilters";

export default function ReportsPage() {
  return (
    <main
      className="reports-page-font min-h-screen bg-[color:rgb(var(--color-bg))] pb-10"
      style={{ fontFamily: '"AtomX Reports Poppins", Poppins, sans-serif' }}
    >
      <style>{`
        @font-face {
          font-family: "AtomX Reports Poppins";
          src: url("/shared/fonts/Poppins/Poppins-Regular.ttf") format("truetype");
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: "AtomX Reports Poppins";
          src: url("/shared/fonts/Poppins/Poppins-SemiBold.ttf") format("truetype");
          font-weight: 600;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: "AtomX Reports Poppins";
          src: url("/shared/fonts/Poppins/Poppins-Bold.ttf") format("truetype");
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }
        .reports-page-font,
        .reports-page-font * {
          font-family: "AtomX Reports Poppins", Poppins, sans-serif;
        }
      `}</style>
      <Header areaLabel="Reports" variant="portal" />

      <div className="w-full pr-4 pl-[72px] pt-5 md:pr-7 md:pl-[88px]">
        <section className="mb-4 border-b border-[#d8d8d8] pb-4">
          <h1 className="text-[1.75rem] font-semibold leading-none text-[#111827] md:text-[1.9rem]">
            Reports
          </h1>
          <p className="mt-3 text-[0.9rem] font-normal text-[#777777]">
            Configure filters and download event, vendor, and summary reports.
          </p>
        </section>

        <ReportFilters />
      </div>
    </main>
  );
}
