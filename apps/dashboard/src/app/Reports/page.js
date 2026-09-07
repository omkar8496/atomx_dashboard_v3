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
        <ReportsContent />
      </div>
    </main>
  );
}
