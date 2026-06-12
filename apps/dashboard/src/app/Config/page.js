import Header from "../components/Header";
import ConfigTransition from "./components/ConfigTransition";
import VendorConfigurationContent from "./components/VendorConfigurationContent";

export default function ConfigPage() {
  return (
    <main
      className="config-page-font min-h-screen bg-[color:rgb(var(--color-bg))] pb-10"
      style={{ fontFamily: '"AtomX Config Poppins", Poppins, sans-serif' }}
    >
      <style>{`
        @font-face {
          font-family: "AtomX Config Poppins";
          src: url("/shared/fonts/Poppins/Poppins-Regular.ttf") format("truetype");
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: "AtomX Config Poppins";
          src: url("/shared/fonts/Poppins/Poppins-Light.ttf") format("truetype");
          font-weight: 300;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: "AtomX Config Poppins";
          src: url("/shared/fonts/Poppins/Poppins-SemiBold.ttf") format("truetype");
          font-weight: 600;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: "AtomX Config Poppins";
          src: url("/shared/fonts/Poppins/Poppins-Bold.ttf") format("truetype");
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }

        .config-page-font,
        .config-page-font * {
          font-family: "AtomX Config Poppins", Poppins, sans-serif;
        }
      `}</style>
      <Header
        areaLabel="Configuration"
        breadcrumb="Admin"
        variant="portal"
        showEditEventButton
      />
      <ConfigTransition>
        <div className="w-full pr-4 pl-[72px] pt-5 md:pr-7 md:pl-[88px]">
          <VendorConfigurationContent />
        </div>
      </ConfigTransition>
    </main>
  );
}
