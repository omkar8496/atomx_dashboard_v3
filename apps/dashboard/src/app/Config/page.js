import Header from "../components/Header";
import SectionHeader from "./components/SectionHeader";
import SearchInput from "./components/SearchInput";
import VendorTable from "./components/VendorTable";
import StallTable from "./components/StallTable";
import StockroomTable from "./components/StockroomTable";

export default function ConfigPage() {
  const user = {
    name: "Omkar Designer",
    email: "design@atomx.in",
    image: null
  };

  return (
    <main className="min-h-screen bg-[#f3f7fb] pb-10">
      <div className="w-full px-4 pt-6 md:px-8">
        <Header
          eventId="4356"
          eventName="Sunburn"
          pages={["Access Control", "Tag Series", "Inventory", "Configuration"]}
          currentPage="Configuration"
          user={user}
        />
      </div>

      <div className="w-full px-4 md:px-8">
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl bg-white px-6 py-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
            <SectionHeader title="Vendors" actionLabel="Add Vendor" />
            <SearchInput placeholder="Search Vendor" />
            <VendorTable />
          </section>

          <section className="rounded-3xl bg-white px-6 py-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
            <SectionHeader title="Stalls" count={3} />
            <SearchInput placeholder="Search Stall" />
            <StallTable />
          </section>
        </div>

        <section className="mt-6 rounded-3xl bg-[#f9b66e] px-6 py-6 shadow-[0_24px_60px_rgba(248,140,67,0.25)]">
          <SectionHeader title="Stockrooms" count={4} />
          <SearchInput placeholder="Search Stockroom" />
          <StockroomTable />
        </section>
      </div>
    </main>
  );
}
