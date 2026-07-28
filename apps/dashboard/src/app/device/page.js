import Header from "../components/Header";
import DeviceList from "./components/DeviceList";
import PersoDevicesTable from "./components/PersoDevicesTable";

export default function DevicePage() {
  return (
    <main
      className="device-page-font min-h-screen bg-[color:rgb(var(--color-bg))] pb-10"
      style={{ fontFamily: '"AtomX Device Poppins", Poppins, sans-serif' }}
    >
      <style>{`
        @font-face {
          font-family: "AtomX Device Poppins";
          src: url("/shared/fonts/Poppins/Poppins-Regular.ttf") format("truetype");
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: "AtomX Device Poppins";
          src: url("/shared/fonts/Poppins/Poppins-SemiBold.ttf") format("truetype");
          font-weight: 600;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: "AtomX Device Poppins";
          src: url("/shared/fonts/Poppins/Poppins-Bold.ttf") format("truetype");
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }
        .device-page-font,
        .device-page-font * {
          font-family: "AtomX Device Poppins", Poppins, sans-serif;
        }
      `}</style>
      <Header areaLabel="Devices" variant="portal" />

      <div className="w-full pr-4 pl-[72px] pt-5 md:pr-7 md:pl-[88px] max-[900px]:px-3">
        <section className="mb-4 border-b border-[#d8d8d8] pb-4">
          <div>
            <h1 className="text-[1.75rem] font-semibold leading-none text-[#111827] md:text-[1.9rem]">
              Devices
            </h1>
            <p className="mt-3 text-[0.9rem] font-normal text-[#777777]">
              Monitor device sessions, assigned stalls, wallet values, and close state.
            </p>
          </div>
        </section>

        <DeviceList />
        <PersoDevicesTable />
      </div>
    </main>
  );
}
