"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDashboardStore } from "../../../../store/dashboardStore";
import { useFormAutosave } from "../../../../lib/useFormAutosave";
import BankDetailsCard from "./BankDetailsCard";
import PosSettingsCard from "./PosSettingsCard";
import PosPasswordsCard from "./PosPasswordsCard";

export default function PosTabContent({ onClearDraftReady }) {
  const profile = useDashboardStore((state) => state.profile);
  const [roundOff, setRoundOff] = useState(false);
  const [happyHour, setHappyHour] = useState(false);
  const [mobileCompulsory, setMobileCompulsory] = useState(false);
  const [useClubCard, setUseClubCard] = useState(false);
  const formRef = useRef(null);
  const draftKey = useMemo(() => {
    const userKey = profile?.id ?? profile?.sub ?? profile?.email ?? "anon";
    return `dashboard:create-event:pos:${userKey}`;
  }, [profile]);

  const getFormValues = useCallback(() => {
    const form = formRef.current;
    if (!form) return {};
    const data = new FormData(form);
    const values = {};
    for (const [key, value] of data.entries()) {
      values[key] = String(value ?? "");
    }
    values.roundOff = roundOff ? "1" : "0";
    values.happyHour = happyHour ? "1" : "0";
    values.mobileCompulsory = mobileCompulsory ? "1" : "0";
    values.useClubCard = useClubCard ? "1" : "0";
    return values;
  }, [happyHour, mobileCompulsory, roundOff, useClubCard]);

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
        name === "roundOff" ||
        name === "happyHour" ||
        name === "mobileCompulsory" ||
        name === "useClubCard"
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
    watch: [roundOff, happyHour, mobileCompulsory, useClubCard],
    onRestore: (values) => {
      if (!values) return;
      if (values.roundOff !== undefined) {
        setRoundOff(values.roundOff === "1" || values.roundOff === "true");
      }
      if (values.happyHour !== undefined) {
        setHappyHour(values.happyHour === "1" || values.happyHour === "true");
      }
      if (values.mobileCompulsory !== undefined) {
        setMobileCompulsory(values.mobileCompulsory === "1" || values.mobileCompulsory === "true");
      }
      if (values.useClubCard !== undefined) {
        setUseClubCard(values.useClubCard === "1" || values.useClubCard === "true");
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
      <div>
        <div className="text-sm font-semibold text-slate-800">Bank Details</div>
        <div className="mt-3">
          <BankDetailsCard />
        </div>
      </div>

      <div className="grid items-center gap-6 lg:grid-cols-2">
        <div className="text-sm font-semibold text-slate-700">POS Settings</div>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 text-[color:rgb(var(--color-orange))]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          POS Passwords
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <PosSettingsCard
          roundOff={roundOff}
          onToggleRoundOff={() => setRoundOff((prev) => !prev)}
          happyHour={happyHour}
          onToggleHappyHour={() => setHappyHour((prev) => !prev)}
          mobileCompulsory={mobileCompulsory}
          onToggleMobileCompulsory={() => setMobileCompulsory((prev) => !prev)}
          useClubCard={useClubCard}
          onToggleUseClubCard={() => setUseClubCard((prev) => !prev)}
        />
        <PosPasswordsCard />
      </div>
    </form>
  );
}
