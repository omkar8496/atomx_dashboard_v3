"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDashboardStore } from "../../../../store/dashboardStore";
import { useFormAutosave } from "../../../../lib/useFormAutosave";
import CardSettingsCard from "./CardSettingsCard";
import CashlessLimitsCard from "./CashlessLimitsCard";
import ReturnSettingsCard from "./ReturnSettingsCard";

const DEFAULT_TOPUPS = [
  { id: 1, name: "50", amount: "50" },
  { id: 2, name: "100", amount: "100" },
  { id: 3, name: "500", amount: "500" },
  { id: 4, name: "1000", amount: "1000" }
];

export default function CashlessTabContent({ onClearDraftReady }) {
  const profile = useDashboardStore((state) => state.profile);
  const [cardSetting, setCardSetting] = useState("Standard");
  const [customTopup, setCustomTopup] = useState(false);
  const [topups, setTopups] = useState(DEFAULT_TOPUPS);
  const [returnCardFee, setReturnCardFee] = useState(false);
  const [returnBalance, setReturnBalance] = useState(false);
  const [returnBankCardBalance, setReturnBankCardBalance] = useState(false);
  const [returnCardFeeCash, setReturnCardFeeCash] = useState(false);
  const formRef = useRef(null);
  const draftKey = useMemo(() => {
    const userKey = profile?.id ?? profile?.sub ?? profile?.email ?? "anon";
    return `dashboard:create-event:cashless:${userKey}`;
  }, [profile]);

  const updateTopup = (id, key, value) => {
    setTopups((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [key]: value } : item))
    );
  };

  const getFormValues = useCallback(() => {
    const form = formRef.current;
    if (!form) return {};
    const data = new FormData(form);
    const values = {};
    for (const [key, value] of data.entries()) {
      values[key] = String(value ?? "");
    }
    values.cardSetting = cardSetting;
    values.customTopup = customTopup ? "1" : "0";
    values.topups = JSON.stringify(topups);
    values.returnCardFee = returnCardFee ? "1" : "0";
    values.returnBalance = returnBalance ? "1" : "0";
    values.returnBankCardBalance = returnBankCardBalance ? "1" : "0";
    values.returnCardFeeCash = returnCardFeeCash ? "1" : "0";
    return values;
  }, [
    cardSetting,
    customTopup,
    returnBankCardBalance,
    returnBalance,
    returnCardFee,
    returnCardFeeCash,
    topups
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
        name === "cardSetting" ||
        name === "customTopup" ||
        name === "topups" ||
        name === "returnCardFee" ||
        name === "returnBalance" ||
        name === "returnBankCardBalance" ||
        name === "returnCardFeeCash"
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
      cardSetting,
      customTopup,
      JSON.stringify(topups),
      returnCardFee,
      returnBalance,
      returnBankCardBalance,
      returnCardFeeCash
    ],
    onRestore: (values) => {
      if (!values) return;
      if (values.cardSetting) {
        setCardSetting(values.cardSetting);
      }
      if (values.customTopup !== undefined) {
        setCustomTopup(values.customTopup === "1" || values.customTopup === "true");
      }
      if (values.topups) {
        try {
          const parsed = JSON.parse(values.topups);
          if (Array.isArray(parsed)) {
            setTopups(parsed);
          }
        } catch (err) {
          console.error("Failed to restore topups", err);
        }
      }
      if (values.returnCardFee !== undefined) {
        setReturnCardFee(values.returnCardFee === "1" || values.returnCardFee === "true");
      }
      if (values.returnBalance !== undefined) {
        setReturnBalance(values.returnBalance === "1" || values.returnBalance === "true");
      }
      if (values.returnBankCardBalance !== undefined) {
        setReturnBankCardBalance(
          values.returnBankCardBalance === "1" || values.returnBankCardBalance === "true"
        );
      }
      if (values.returnCardFeeCash !== undefined) {
        setReturnCardFeeCash(
          values.returnCardFeeCash === "1" || values.returnCardFeeCash === "true"
        );
      }
      applyDraftToForm(values);
    }
  });

  useEffect(() => {
    onClearDraftReady?.(clearDraft);
  }, [clearDraft, onClearDraftReady]);

  return (
    <form
      ref={formRef}
      onSubmit={(event) => event.preventDefault()}
      className="grid gap-6"
    >
      <div className="grid items-center gap-6 lg:grid-cols-2">
        <div className="text-sm font-semibold text-slate-700">Card Settings</div>
        <div className="text-sm font-semibold text-slate-700">Cashless Limits</div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <CardSettingsCard
          cardSetting={cardSetting}
          onChangeCardSetting={setCardSetting}
          customTopup={customTopup}
          onToggleCustomTopup={() => setCustomTopup((prev) => !prev)}
          topups={topups}
          onTopupChange={updateTopup}
        />
        <div className="flex flex-col gap-6">
          <CashlessLimitsCard />
          <div>
            <div className="text-sm font-semibold text-slate-700">Return</div>
            <div className="mt-3">
              <ReturnSettingsCard
                returnCardFee={returnCardFee}
                onToggleReturnCardFee={() => setReturnCardFee((prev) => !prev)}
                returnBalance={returnBalance}
                onToggleReturnBalance={() => setReturnBalance((prev) => !prev)}
                returnBankCardBalance={returnBankCardBalance}
                onToggleReturnBankCardBalance={() =>
                  setReturnBankCardBalance((prev) => !prev)
                }
                returnCardFeeCash={returnCardFeeCash}
                onToggleReturnCardFeeCash={() => setReturnCardFeeCash((prev) => !prev)}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
