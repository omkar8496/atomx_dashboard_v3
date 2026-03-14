"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Header from "../../components/Header";
import TabHeader from "./components/TabHeader";
import AboutTabContent from "./components/AboutTabContent";
import PosTabContent from "./components/PosTabContent";
import CashlessTabContent from "./components/CashlessTabContent";

const TABS = ["About", "Pos", "Cashless"];

export default function CreateEventPage() {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [animateTab, setAnimateTab] = useState(false);
  const clearDraftsRef = useRef({
    about: null,
    pos: null,
    cashless: null
  });
  const registerClearDraft = useCallback((key) => {
    return (fn) => {
      clearDraftsRef.current[key] = fn;
    };
  }, []);

  const clearAllDrafts = useCallback(() => {
    Object.values(clearDraftsRef.current).forEach((fn) => {
      if (typeof fn === "function") {
        fn();
      }
    });
  }, []);

  useEffect(() => {
    setAnimateTab(false);
    const frame = requestAnimationFrame(() => setAnimateTab(true));
    return () => cancelAnimationFrame(frame);
  }, [activeTab]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handler = () => clearAllDrafts();
    window.addEventListener("atomx:create-event-success", handler);
    return () => window.removeEventListener("atomx:create-event-success", handler);
  }, [clearAllDrafts]);

  return (
    <main className="min-h-screen bg-[color:rgb(var(--color-bg))] pb-10">
      <Header
        areaLabel="Admin"
        breadcrumb={<TabHeader activeTab={activeTab} onChange={setActiveTab} />}
      />
      <div className="w-full pr-3 pl-12 md:pr-6 md:pl-16 mt-2">
        <div
          className={`transition-all duration-300 ease-out ${
            animateTab ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          {activeTab === "About" ? (
            <AboutTabContent onClearDraftReady={registerClearDraft("about")} />
          ) : activeTab === "Pos" ? (
            <PosTabContent onClearDraftReady={registerClearDraft("pos")} />
          ) : activeTab === "Cashless" ? (
            <CashlessTabContent onClearDraftReady={registerClearDraft("cashless")} />
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center text-sm text-slate-500">
              {activeTab} settings coming next.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
