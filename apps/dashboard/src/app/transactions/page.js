import Header from "../components/Header";
import TransactionFilters, { DownloadDumpButton } from "./components/TransactionFilters";

export default function TransactionsPage() {
  return (
    <main
      className="transactions-page-font min-h-screen bg-[color:rgb(var(--color-bg))] pb-10"
      style={{ fontFamily: '"AtomX Transactions Poppins", Poppins, sans-serif' }}
    >
      <style>{`
        @font-face {
          font-family: "AtomX Transactions Poppins";
          src: url("/shared/fonts/Poppins/Poppins-Regular.ttf") format("truetype");
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: "AtomX Transactions Poppins";
          src: url("/shared/fonts/Poppins/Poppins-SemiBold.ttf") format("truetype");
          font-weight: 600;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: "AtomX Transactions Poppins";
          src: url("/shared/fonts/Poppins/Poppins-Bold.ttf") format("truetype");
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }
        .transactions-page-font,
        .transactions-page-font * {
          font-family: "AtomX Transactions Poppins", Poppins, sans-serif;
        }
      `}</style>
      <Header areaLabel="Transactions" variant="portal" />

      <div className="w-full pr-4 pl-[72px] pt-5 md:pr-7 md:pl-[88px]">
        <section className="mb-4 flex flex-col gap-4 border-b border-[#d8d8d8] pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[1.75rem] font-semibold leading-none text-[#111827] md:text-[1.9rem]">
              Transactions
            </h1>
            <p className="mt-3 text-[0.9rem] font-normal text-[#777777]">
              Filter event transactions by date, type, vendor, stall, card, receipt, or device.
            </p>
          </div>

          <DownloadDumpButton />
        </section>

        <TransactionFilters />
      </div>
    </main>
  );
}
