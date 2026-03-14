import Header from "../components/Header";
import SearchPanel from "./components/SearchPanel";
import EmptyState from "./components/EmptyState";

export default function WhitelistPage() {
  return (
    <main className="min-h-screen bg-[color:rgb(var(--color-bg))] pb-10">
      <Header areaLabel="Whitelist" />

      <div className="w-full pr-4 pl-16 md:pr-8 md:pl-20 mt-6">
        <div className="w-full rounded-3xl bg-white px-6 py-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
          <SearchPanel />
        </div>

        <div className="mt-6 w-full rounded-3xl bg-white px-6 py-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Users (0)
          </div>
          <div className="mt-6">
            <EmptyState />
          </div>
        </div>
      </div>
    </main>
  );
}
