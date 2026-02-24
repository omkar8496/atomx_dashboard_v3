import Header from "../components/Header";
import SearchBar from "./components/SearchBar";
import BlockedTable from "./components/BlockedTable";

export default function BlockedPage() {
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
          pages={["Access Control", "Tag Series", "Inventory", "Blocked"]}
          currentPage="Blocked"
          user={user}
        />
      </div>

      <div className="w-full px-4 md:px-8">
        <div className="mt-6 w-full rounded-3xl bg-white px-6 py-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
          <SearchBar />
          <div className="mt-6">
            <BlockedTable />
          </div>
        </div>
      </div>
    </main>
  );
}
