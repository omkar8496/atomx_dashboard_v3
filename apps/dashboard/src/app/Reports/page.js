import Header from "../components/Header";
import ReportsContent from "./components/ReportsContent";

export default function ReportsPage() {
  return (
    <main
      className="min-h-screen bg-(--bg) pb-10"
      style={{ fontFamily: '"Poppins", system-ui, sans-serif' }}
    >
      <Header areaLabel="Reports" variant="portal" />

      <div className="mx-auto w-full max-w-[1780px] pr-4 pl-[72px] pt-6 md:pr-7 md:pl-[88px] max-[900px]:px-3">
        <h1 className="font-chillax text-[clamp(24px,3vw,32px)] font-semibold leading-[1.05] tracking-[-0.02em] text-(--text)">
          Reports
        </h1>
        <p className="mt-2 text-[13.5px] font-light text-(--muted)">
          Configure filters and download event, vendor, and summary reports.
        </p>
        <div className="mt-[clamp(16px,2vw,22px)] h-px w-full bg-(--line)" />

        <div className="mt-[clamp(16px,2vw,22px)]">
          <ReportsContent />
        </div>
      </div>
    </main>
  );
}
