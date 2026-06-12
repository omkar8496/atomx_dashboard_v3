import Header from "../components/Header";
import BlockedCards from "./components/BlockedCards";

export default function BlockedPage() {
  return (
    <main
      className="blocked-page-font min-h-screen bg-[color:rgb(var(--color-bg))] pb-10"
      style={{ fontFamily: '"AtomX Blocked Poppins", Poppins, sans-serif' }}
    >
      <style>{`
        @font-face {
          font-family: "AtomX Blocked Poppins";
          src: url("/shared/fonts/Poppins/Poppins-Regular.ttf") format("truetype");
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: "AtomX Blocked Poppins";
          src: url("/shared/fonts/Poppins/Poppins-SemiBold.ttf") format("truetype");
          font-weight: 600;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: "AtomX Blocked Poppins";
          src: url("/shared/fonts/Poppins/Poppins-Bold.ttf") format("truetype");
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }
        .blocked-page-font,
        .blocked-page-font * {
          font-family: "AtomX Blocked Poppins", Poppins, sans-serif;
        }
      `}</style>
      <Header areaLabel="Blocked" variant="portal" />

      <div className="w-full pr-4 pl-[72px] pt-5 md:pr-7 md:pl-[88px]">
        <section className="mb-4 flex flex-col gap-4 border-b border-[#d8d8d8] pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[1.75rem] font-semibold leading-none text-[#111827] md:text-[1.9rem]">
              Blocked IDs
            </h1>
            <p className="mt-3 text-[0.9rem] font-normal text-[#777777]">
              Search, review, and unblock IDs for the active event.
            </p>
          </div>

          <div className="flex h-[54px] min-w-[92px] items-center justify-center gap-2 rounded-lg border border-[#e8e8e8] bg-white px-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
            <span className="text-[1.25rem] font-bold leading-none text-[#E04420]">4</span>
            <span className="text-[0.82rem] font-normal text-[#777777]">listed</span>
          </div>
        </section>

        <BlockedCards />
      </div>
    </main>
  );
}
