import Header from "../../components/Header";
import ConfigTransition from "../components/ConfigTransition";
import MenuContent from "./components/MenuContent";

export default function MenuPage() {
  return (
    <main
      className="config-menu-font min-h-screen bg-[color:rgb(var(--color-bg))] pb-10"
      style={{ fontFamily: '"AtomX Menu Poppins", Poppins, sans-serif' }}
    >
      <style>{`
        @font-face {
          font-family: "AtomX Menu Poppins";
          src: url("/shared/fonts/Poppins/Poppins-Regular.ttf") format("truetype");
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: "AtomX Menu Poppins";
          src: url("/shared/fonts/Poppins/Poppins-SemiBold.ttf") format("truetype");
          font-weight: 600;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: "AtomX Menu Poppins";
          src: url("/shared/fonts/Poppins/Poppins-Bold.ttf") format("truetype");
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }

        .config-menu-font,
        .config-menu-font * {
          font-family: "AtomX Menu Poppins", Poppins, sans-serif;
        }
      `}</style>
      <Header areaLabel="Menu" variant="portal" />
      <ConfigTransition>
        <div className="w-full pr-4 pl-[72px] pt-5 md:pr-7 md:pl-[88px]">
          <MenuContent stallName="Stall1" />
        </div>
      </ConfigTransition>
    </main>
  );
}
