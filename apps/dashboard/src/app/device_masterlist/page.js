import Header from "../components/Header";
import DeviceMasterList from "./components/DeviceMasterList";

export default function DeviceMasterListPage() {
  return (
    <main
      className="min-h-screen bg-(--bg) pb-8"
      style={{ fontFamily: '"Poppins", system-ui, sans-serif' }}
    >
      <Header areaLabel="Device Master" variant="portal" />
      <div className="w-full pr-4 pl-[72px] pt-2 md:pr-7 md:pl-[88px] max-[900px]:px-3">
        <DeviceMasterList />
      </div>
    </main>
  );
}
