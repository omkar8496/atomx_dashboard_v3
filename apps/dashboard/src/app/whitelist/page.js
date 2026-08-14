import Header from "../components/Header";
import WhitelistContent from "./components/WhitelistContent";

export default function WhitelistPage() {
  return (
    <main
      className="whitelist-page-font min-h-screen w-full overflow-x-hidden bg-[#f2f1ee] pb-12"
      style={{ fontFamily: '"AtomX Whitelist Poppins", Poppins, sans-serif' }}
    >
      <style>{`
        @font-face {
          font-family: "AtomX Whitelist Poppins";
          src: url("/shared/fonts/Poppins/Poppins-Light.ttf") format("truetype");
          font-weight: 300;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: "AtomX Whitelist Poppins";
          src: url("/shared/fonts/Poppins/Poppins-Regular.ttf") format("truetype");
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: "AtomX Whitelist Poppins";
          src: url("/shared/fonts/Poppins/Poppins-SemiBold.ttf") format("truetype");
          font-weight: 600;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: "AtomX Whitelist Poppins";
          src: url("/shared/fonts/Poppins/Poppins-Bold.ttf") format("truetype");
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: "AtomX Whitelist Chillax";
          src: url("/shared/fonts/Chillex/Chillax-Semibold.woff2") format("woff2");
          font-weight: 600;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: "AtomX Whitelist VCR";
          src: url("/shared/fonts/VCR/VCR_OSD_MONO_1.001.ttf") format("truetype");
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
        .whitelist-page-font,
        .whitelist-page-font * {
          font-family: "AtomX Whitelist Poppins", Poppins, sans-serif;
        }
        .whitelist-page-font .whitelist-display {
          font-family: "AtomX Whitelist Chillax", "AtomX Whitelist Poppins", sans-serif;
        }
        .whitelist-page-font .whitelist-mono {
          font-family: "AtomX Whitelist VCR", monospace;
        }
      `}</style>

      <Header areaLabel="Whitelist" variant="portal" />
      <WhitelistContent />
    </main>
  );
}
