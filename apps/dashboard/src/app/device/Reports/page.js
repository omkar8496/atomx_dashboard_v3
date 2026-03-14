import Header from "../../components/Header";
import FilterRow from "./components/FilterRow";
import TypeSelect from "./components/TypeSelect";
import DownloadButton from "./components/DownloadButton";

export default function ReportsPage() {
  return (
    <main className="min-h-screen bg-[color:rgb(var(--color-bg))] pb-10">
      <Header areaLabel="Reports" />

      <div className="w-full pr-4 pl-16 md:pr-8 md:pl-20 mt-6">
        <div className="w-full rounded-3xl bg-white px-6 py-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
          <h2 className="text-lg font-semibold text-slate-700">Filter</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <FilterRow
              label="Dates"
              icon={
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              }
            />
            <FilterRow
              label="Days"
              icon={
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              }
            />
          </div>

          <div className="mt-6">
            <TypeSelect />
          </div>

          <DownloadButton />
        </div>
      </div>
    </main>
  );
}
