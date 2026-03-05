import Header from "../components/Header";
import SearchBar from "./components/SearchBar";
import TimelineEmptyState from "./components/TimelineEmptyState";

export default function TimelinePage() {
  return (
    <main className="min-h-screen bg-[#f3f7fb] pb-10">
      <Header areaLabel="Timeline" />

      <div className="w-full pr-4 pl-16 md:pr-8 md:pl-20 mt-6">
        <div className="w-full rounded-3xl bg-white px-6 py-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
          <SearchBar />
        </div>

        <div className="mt-6 w-full rounded-3xl bg-white px-6 py-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Timeline Events (0)
          </div>
          <div className="mt-6">
            <TimelineEmptyState />
          </div>
        </div>
      </div>
    </main>
  );
}
