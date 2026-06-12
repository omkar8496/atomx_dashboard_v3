import Header from "../components/Header";
import DeviceMasterList from "./components/DeviceMasterList";

export default function DeviceMasterListPage() {
  return (
    <main
      className="device-master-font min-h-screen bg-[color:rgb(var(--color-bg))] pb-8"
      style={{ fontFamily: '"AtomX Device Master Poppins", Poppins, sans-serif' }}
    >
      <style>{`
        @font-face {
          font-family: "AtomX Device Master Poppins";
          src: url("/shared/fonts/Poppins/Poppins-Regular.ttf") format("truetype");
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: "AtomX Device Master Poppins";
          src: url("/shared/fonts/Poppins/Poppins-SemiBold.ttf") format("truetype");
          font-weight: 600;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: "AtomX Device Master Poppins";
          src: url("/shared/fonts/Poppins/Poppins-Bold.ttf") format("truetype");
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }
        .device-master-font,
        .device-master-font * {
          font-family: "AtomX Device Master Poppins", Poppins, sans-serif;
        }
      `}</style>
      <Header areaLabel="Device Master" variant="portal" />
      <div className="w-full pr-4 pl-[72px] pt-5 md:pr-7 md:pl-[88px]">
        <DeviceMasterList />
      </div>
    </main>
  );
}
