import Link from "next/link";
import Header from "../components/Header";
import ConfigTransition from "./components/ConfigTransition";
import BasicEventDetails from "./components/Basic_Event_Details";
import ActiveService from "./components/Active_Service";
import ConfigPos from "./components/Config_Pos";
import ConfigCard from "./components/Config_Card";
import ConfigBankDetails from "./components/Config_Bank_Details";
import ConfigDashSettings from "./components/Config_Dash_Settings";

export default function ConfigPage() {
  return (
    <main className="min-h-screen bg-[#f3f7fb] pb-10">
      <Header
        areaLabel="Configuration"
        breadcrumb={
          <>
            <Link className="font-semibold text-[#258d9c]" href="/Config" replace>
              Profile
            </Link>
            <span className="text-slate-400">/</span>
            <Link className="text-slate-600 hover:text-[#258d9c]" href="/Config/operations" replace>
              Operations
            </Link>
          </>
        }
      />
      <ConfigTransition>
        <div className="w-full pr-4 pl-16 md:pr-8 md:pl-20 mt-6">
          <BasicEventDetails />

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr] items-stretch">
            <div className="flex flex-col h-full">
              <div>
                <div className="text-sm font-semibold text-slate-700">Active Services</div>
                <div className="mt-3">
                  <ActiveService />
                </div>
              </div>
              <div className="mt-auto">
                <div className="text-sm font-semibold text-slate-700">Card</div>
                <div className="mt-3">
                  <ConfigCard />
                </div>
              </div>
            </div>
            <div className="flex flex-col h-full">
              <div className="text-sm font-semibold text-slate-700">Pos</div>
              <div className="mt-3 flex-1">
                <ConfigPos />
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_1fr] items-stretch">
            <ConfigBankDetails />
            <ConfigDashSettings />
          </div>
        </div>
      </ConfigTransition>
    </main>
  );
}
