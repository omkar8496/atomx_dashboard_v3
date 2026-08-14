import Header from "../components/Header";
import TapXTransactions from "./components/TapXTransactions";

export default function TapXPage() {
  return (
    <main
      className="min-h-screen bg-(--bg) pb-10"
      style={{ fontFamily: '"Poppins", system-ui, sans-serif' }}
    >
      <Header areaLabel="TapX" variant="portal" />
      <div className="pl-[60px] max-[900px]:pl-0">
        <TapXTransactions />
      </div>
    </main>
  );
}
