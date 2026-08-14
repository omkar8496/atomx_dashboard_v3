import Header from "../components/Header";
import TransactionFilters, { DownloadDumpButton } from "./components/TransactionFilters";

export default function TransactionsPage() {
  return (
    <main
      className="min-h-screen bg-(--bg) pb-10"
      style={{ fontFamily: '"Poppins", system-ui, sans-serif' }}
    >
      <Header areaLabel="Transactions" variant="portal" />

      <div className="mx-auto w-full max-w-[1780px] pr-4 pl-[72px] pt-6 md:pr-7 md:pl-[88px] max-[900px]:px-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-chillax text-[clamp(24px,3vw,32px)] font-semibold leading-[1.05] tracking-[-0.02em] text-(--text)">
              Transactions
            </h1>
            <p className="mt-2 text-[13.5px] font-light text-(--muted)">
              Filter event transactions by date, type, vendor, stall, card, receipt, or device.
            </p>
          </div>

          <DownloadDumpButton />
        </div>
        <div className="mt-[clamp(16px,2vw,22px)] h-px w-full bg-(--line)" />

        <div className="mt-[clamp(16px,2vw,22px)]">
          <TransactionFilters />
        </div>
      </div>
    </main>
  );
}
