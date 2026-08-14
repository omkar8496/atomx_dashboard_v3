import Header from "../components/Header";
import ConfigTransition from "./components/ConfigTransition";
import VendorConfigurationContent from "./components/VendorConfigurationContent";

export default function ConfigPage() {
  return (
    <main
      className="min-h-screen bg-(--bg) pb-10"
      style={{ fontFamily: '"Poppins", system-ui, sans-serif' }}
    >
      <Header
        areaLabel="Configuration"
        breadcrumb="Admin"
        variant="portal"
        showEditEventButton
      />
      <ConfigTransition>
        <div className="mx-auto w-full max-w-[1780px] pr-4 pl-[72px] pt-6 md:pr-7 md:pl-[88px] max-[900px]:px-3">
          <VendorConfigurationContent />
        </div>
      </ConfigTransition>
    </main>
  );
}
