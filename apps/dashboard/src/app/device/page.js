import Header from "../components/Header";
import DeviceList from "./components/DeviceList";
import PersoDevicesTable from "./components/PersoDevicesTable";

export default function DevicePage() {
  return (
    <main
      className="min-h-screen bg-(--bg) pb-10"
      style={{ fontFamily: '"Poppins", system-ui, sans-serif' }}
    >
      <Header areaLabel="Devices" variant="portal" />

      <div className="mx-auto w-full max-w-[1780px] pr-4 pl-[72px] pt-6 md:pr-7 md:pl-[88px] max-[900px]:px-3">
        <h1 className="font-chillax text-[clamp(26px,3.2vw,38px)] font-semibold leading-[1.05] tracking-[-0.02em] text-(--text)">
          Devices
        </h1>
        <p className="mt-2 text-[13.5px] font-light text-(--muted)">
          Monitor device sessions, assigned stalls, wallet values, and close state.
        </p>
        <div className="mt-[clamp(16px,2vw,22px)] h-px w-full bg-(--line)" />

        <DeviceList />
        <PersoDevicesTable />
      </div>
    </main>
  );
}
