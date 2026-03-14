import Header from "../components/Header";
import SearchBar from "./components/SearchBar";
import DeviceTable from "./components/DeviceTable";

export default function DevicePage() {
  return (
    <main className="min-h-screen bg-[color:rgb(var(--color-bg))] pb-10">
      <Header areaLabel="Device" />

      <div className="w-full pr-4 pl-16 md:pr-8 md:pl-20 mt-6">
        <div className="w-full rounded-3xl bg-white px-6 py-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
          <SearchBar />
        </div>

        <div className="mt-6 w-full rounded-3xl bg-white px-6 py-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
          <DeviceTable />
        </div>
      </div>
    </main>
  );
}
