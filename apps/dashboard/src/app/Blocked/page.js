import Header from "../components/Header";
import BlockedContent from "./components/BlockedContent";

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

      <div className="w-full pr-4 pl-[72px] pt-5 md:pr-7 md:pl-[88px] max-[900px]:px-3 max-[640px]:pt-4">
        <BlockedContent />
      </div>
    </main>
  );
}
