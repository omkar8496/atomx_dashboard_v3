"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDashboardStore } from "../../../../store/dashboardStore";
import { useFormAutosave } from "../../../../lib/useFormAutosave";
import EventDetailsCard from "./EventDetailsCard";
import NfcCashlessCard from "./NfcCashlessCard";
import DashboardSettingsCard from "./DashboardSettingsCard";

const toBool = (value) => value === "1" || value === "true";

export default function AboutTabContent({ onClearDraftReady }) {
  const profile = useDashboardStore((state) => state.profile);
  const [nfcCashless, setNfcCashless] = useState(false);
  const [onlineTopup, setOnlineTopup] = useState(false);
  const [usePin, setUsePin] = useState(false);
  const [useAccessX, setUseAccessX] = useState(false);
  const [useGst, setUseGst] = useState(false);
  const [activationTopup, setActivationTopup] = useState(false);
  const [couponTopup, setCouponTopup] = useState(false);
  const [compTopup, setCompTopup] = useState(false);
  const [autoReset, setAutoReset] = useState(false);
  const formRef = useRef(null);
  const draftKey = useMemo(() => {
    const userKey = profile?.id ?? profile?.sub ?? profile?.email ?? "anon";
    return `dashboard:create-event:about:${userKey}`;
  }, [profile]);

  const getFormValues = useCallback(() => {
    const form = formRef.current;
    if (!form) return {};
    const data = new FormData(form);
    const values = {};
    for (const [key, value] of data.entries()) {
      values[key] = String(value ?? "");
    }
    values.nfcCashless = nfcCashless ? "1" : "0";
    values.onlineTopup = onlineTopup ? "1" : "0";
    values.usePin = usePin ? "1" : "0";
    values.useAccessX = useAccessX ? "1" : "0";
    values.useGst = useGst ? "1" : "0";
    values.activationTopup = activationTopup ? "1" : "0";
    values.couponTopup = couponTopup ? "1" : "0";
    values.compTopup = compTopup ? "1" : "0";
    values.autoReset = autoReset ? "1" : "0";
    return values;
  }, [
    activationTopup,
    autoReset,
    compTopup,
    couponTopup,
    nfcCashless,
    onlineTopup,
    useAccessX,
    useGst,
    usePin
  ]);

  const applyDraftToForm = useCallback((values) => {
    const form = formRef.current;
    if (!form || !values) return;
    const escapeName = (name) => {
      if (typeof CSS !== "undefined" && CSS.escape) {
        return CSS.escape(name);
      }
      return name.replace(/\"/g, '\\"');
    };

    Object.entries(values).forEach(([name, value]) => {
      if (
        name === "nfcCashless" ||
        name === "onlineTopup" ||
        name === "usePin" ||
        name === "useAccessX" ||
        name === "useGst" ||
        name === "activationTopup" ||
        name === "couponTopup" ||
        name === "compTopup" ||
        name === "autoReset"
      ) {
        return;
      }
      const selector = `[name=\"${escapeName(name)}\"]`;
      const nodes = form.querySelectorAll(selector);
      nodes.forEach((node) => {
        node.value = String(value ?? "");
        node.dispatchEvent(new Event("input", { bubbles: true }));
        node.dispatchEvent(new Event("change", { bubbles: true }));
      });
    });
  }, []);

  const { clearDraft } = useFormAutosave({
    formRef,
    draftKey,
    getValues: getFormValues,
    watch: [
      nfcCashless,
      onlineTopup,
      usePin,
      useAccessX,
      useGst,
      activationTopup,
      couponTopup,
      compTopup,
      autoReset
    ],
    onRestore: (values) => {
      if (!values) return;
      setNfcCashless(toBool(values.nfcCashless));
      setOnlineTopup(toBool(values.onlineTopup));
      setUsePin(toBool(values.usePin));
      setUseAccessX(toBool(values.useAccessX));
      setUseGst(toBool(values.useGst));
      setActivationTopup(toBool(values.activationTopup));
      setCouponTopup(toBool(values.couponTopup));
      setCompTopup(toBool(values.compTopup));
      setAutoReset(toBool(values.autoReset));
      applyDraftToForm(values);
    }
  });

  useEffect(() => {
    onClearDraftReady?.(clearDraft);
  }, [clearDraft, onClearDraftReady]);

  return (
    <form ref={formRef} onSubmit={(event) => event.preventDefault()} className="grid gap-6">
      <div className="grid items-center gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="text-sm font-semibold text-slate-800">Details</div>
        <div className="text-sm font-semibold text-slate-700">NFC Cashless</div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-start">
        <EventDetailsCard />
        <div className="flex flex-col gap-6">
          <NfcCashlessCard
            nfcCashless={nfcCashless}
            onToggleNfc={() => setNfcCashless((prev) => !prev)}
            onlineTopup={onlineTopup}
            onToggleOnlineTopup={() => setOnlineTopup((prev) => !prev)}
            usePin={usePin}
            onToggleUsePin={() => setUsePin((prev) => !prev)}
            useAccessX={useAccessX}
            onToggleAccessX={() => setUseAccessX((prev) => !prev)}
            useGst={useGst}
            onToggleGst={() => setUseGst((prev) => !prev)}
          />
          <div>
            <div className="text-sm font-semibold text-slate-700">Dash Settings</div>
            <div className="mt-3">
              <DashboardSettingsCard
                activationTopup={activationTopup}
                onToggleActivation={() => setActivationTopup((prev) => !prev)}
                couponTopup={couponTopup}
                onToggleCoupon={() => setCouponTopup((prev) => !prev)}
                compTopup={compTopup}
                onToggleComp={() => setCompTopup((prev) => !prev)}
                autoReset={autoReset}
                onToggleAutoReset={() => setAutoReset((prev) => !prev)}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
