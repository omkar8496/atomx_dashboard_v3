"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import ConfigTransition from "../components/ConfigTransition";
import BasicEventDetails from "./components/Basic_Event_Details";
import ActiveService from "./components/Active_Service";
import ConfigPos from "./components/Config_Pos";
import ConfigCard from "./components/Config_Card";
import ConfigBankDetails from "./components/Config_Bank_Details";
import ConfigDashSettings from "./components/Config_Dash_Settings";
import SaveButton from "../../components/Buttons/SaveButton";
import Toast from "../../components/Popups/Toast";
import { useDashboardStore } from "../../../store/dashboardStore";
import { fetchEventDetails, updateEventDetails } from "../../../lib/dashboardApi";
import { useFormAutosave } from "../../../lib/useFormAutosave";

const EMPTY_VALUE = "";

const FIELD_DEFS = [
  { name: "event.name", key: "name", label: "Event Name", type: "text", get: (e) => e?.name },
  {
    name: "event.country",
    key: "country",
    label: "Country",
    type: "text",
    get: (e) => e?.country ?? "Select country"
  },
  {
    name: "event.locationCity",
    key: "locationCity",
    label: "City",
    type: "text",
    get: (e) => e?.locationCity ?? "Select city"
  },
  {
    name: "event.tz",
    key: "tz",
    label: "Timezone",
    type: "text",
    get: (e) => e?.tz ?? "Select timezone"
  },
  { name: "event.organizer", key: "organizer", label: "Organizer", type: "text", get: (e) => e?.organizer },
  { name: "event.client", key: "client", label: "Client", type: "text", get: (e) => e?.client },
  { name: "event.venue", key: "venue", label: "Location", type: "text", get: (e) => e?.venue },
  {
    name: "event.currency",
    key: "currency",
    label: "Currency",
    type: "lowercase",
    get: (e) => (e?.currency ? String(e.currency).toUpperCase() : "Select currency")
  },
  {
    name: "event.startAt",
    key: "startAt",
    label: "Start Date",
    type: "date",
    get: (e) => formatDateInput(e?.startAt)
  },
  {
    name: "event.endAt",
    key: "endAt",
    label: "End Date",
    type: "date",
    get: (e) => formatDateInput(e?.endAt)
  },
  { name: "dashSettings.etcode", key: "etcode", label: "ETCODE", type: "text", get: (e) => e?.dashSettings?.etcode },
  { name: "event.cardFee", key: "cardFee", label: "Card Fee", type: "number", get: (e) => e?.cardFee },
  { name: "event.minTopup", key: "minTopup", label: "1st Topup", type: "number", get: (e) => e?.minTopup },
  { name: "event.maxTopupWallet", key: "maxTopupWallet", label: "Max Wallet", type: "number", get: (e) => e?.maxTopupWallet },
  { name: "event.returnMinAmount", key: "returnMinAmount", label: "Return Min Amount", type: "number", get: (e) => e?.returnMinAmount },
  { name: "event.returnMaxAmount", key: "returnMaxAmount", label: "Return Max Amount", type: "number", get: (e) => e?.returnMaxAmount },
  { name: "event.devicePasswordTopup", key: "devicePasswordTopup", label: "Topup Password", type: "text", get: (e) => e?.devicePasswordTopup },
  { name: "event.devicePassword", key: "devicePassword", label: "Sale Password", type: "text", get: (e) => e?.devicePassword },
  {
    name: "event.printer",
    key: "printer",
    label: "Printer",
    type: "printer",
    get: (e) => (e?.printer ? String(e.printer).toUpperCase() : "NONE")
  },
  { name: "event.bankUsername", key: "bankUsername", label: "Username", type: "text", get: (e) => e?.bankUsername },
  { name: "event.bankPassword", key: "bankPassword", label: "Password", type: "text", get: (e) => e?.bankPassword },
  { name: "event.password", key: "password", label: "Dashboard Password", type: "text", get: (e) => e?.password },
  { name: "event.useNfc", key: "useNfc", label: "NFC Cashless", type: "bool", get: (e) => e?.useNfc },
  { name: "event.onlineTopup", key: "onlineTopup", label: "Online Topup", type: "bool", get: (e) => e?.onlineTopup },
  { name: "event.usePin", key: "usePin", label: "Use Pin", type: "bool", get: (e) => e?.usePin },
  { name: "event.useAccessx", key: "useAccessx", label: "Access Control", type: "bool", get: (e) => e?.useAccessx },
  { name: "event.useMakerChecker", key: "useMakerChecker", label: "Maker Checker", type: "bool", get: (e) => e?.useMakerChecker },
  { name: "event.gstSetting", key: "gstSetting", label: "Taxation", type: "bool", get: (e) => e?.gstSetting },
  { name: "event.returnCardFee", key: "returnCardFee", label: "Return Card Fee", type: "bool", get: (e) => e?.returnCardFee },
  { name: "event.returnCartValue", key: "returnCartValue", label: "Return Balance", type: "bool", get: (e) => e?.returnCartValue },
  { name: "event.returnCardFull", key: "returnCardFull", label: "Return Bank Card Balance", type: "bool", get: (e) => e?.returnCardFull },
  { name: "event.returnCardFeeCash", key: "returnCardFeeCash", label: "Return Card Fee In Cash", type: "bool", get: (e) => e?.returnCardFeeCash },
  { name: "event.happyHour", key: "happyHour", label: "Happy Hour", type: "bool", get: (e) => e?.happyHour },
  { name: "event.roundOff", key: "roundOff", label: "Round Off", type: "bool", get: (e) => e?.roundOff },
  { name: "event.topupManual", key: "topupManual", label: "Manual Topup", type: "bool", get: (e) => e?.topupManual },
  { name: "event.linkUser", key: "linkUser", label: "Link Mobile", type: "bool", get: (e) => e?.linkUser },
  { name: "event.useClubCard", key: "useClubCard", label: "Use Club Card", type: "bool", get: (e) => e?.useClubCard },
  { name: "dashSettings.addActivationTopup", key: "addActivationTopup", label: "Show Activation Data", type: "bool", get: (e) => e?.dashSettings?.addActivationTopup },
  { name: "dashSettings.addCouponTopup", key: "addCouponTopup", label: "Show Coupon Data", type: "bool", get: (e) => e?.dashSettings?.addCouponTopup },
  { name: "dashSettings.addCompTopup", key: "addCompTopup", label: "Show Comp Data", type: "bool", get: (e) => e?.dashSettings?.addCompTopup },
  { name: "dashSettings.autoDayClose", key: "autoDayClose", label: "Auto Reset Dashboard", type: "bool", get: (e) => e?.dashSettings?.autoDayClose }
];

function formatDateInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function stringValue(value) {
  if (value === null || value === undefined) return EMPTY_VALUE;
  return String(value);
}

function buildInitialValues(event) {
  return FIELD_DEFS.reduce((acc, def) => {
    const raw = def.get ? def.get(event) : undefined;
    if (def.type === "bool") {
      acc[def.name] = raw ? "1" : "0";
    } else {
      acc[def.name] = stringValue(raw);
    }
    return acc;
  }, {});
}

function normalizePayloadValue(def, value) {
  if (def.type === "number") {
    return value === "" ? 0 : Number(value);
  }
  if (def.type === "bool") {
    return value === "1" || value === "true" ? 1 : 0;
  }
  if (def.type === "date") {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  if (def.type === "printer") {
    return value ? String(value).toLowerCase() : "";
  }
  if (def.type === "lowercase") {
    return value ? String(value).toLowerCase() : "";
  }
  return value;
}

function formatLabelList(labels) {
  const unique = Array.from(new Set(labels.filter(Boolean)));
  if (unique.length === 0) return "Profile";
  if (unique.length === 1) return unique[0];
  if (unique.length === 2) return `${unique[0]} & ${unique[1]}`;
  return `${unique.slice(0, -1).join(", ")} & ${unique[unique.length - 1]}`;
}

export default function ConfigProfilePage() {
  const token = useDashboardStore((state) => state.token);
  const eventMeta = useDashboardStore((state) => state.eventMeta);
  const eventDetails = useDashboardStore((state) => state.eventDetails);
  const profile = useDashboardStore((state) => state.profile);
  const setEventDetails = useDashboardStore((state) => state.setEventDetails);
  const setEventMeta = useDashboardStore((state) => state.setEventMeta);
  const formRef = useRef(null);
  const initialValuesRef = useRef({});
  const draftAppliedRef = useRef(false);
  const [changeState, setChangeState] = useState({
    hasChanges: false,
    labels: [],
    payload: null,
    currentValues: null
  });
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const isLoadingDetails =
    Boolean(eventMeta?.eventId) &&
    (!eventDetails || String(eventDetails?.id) !== String(eventMeta.eventId));

  const eventId = eventDetails?.id ?? eventMeta?.eventId;
  const draftKey = useMemo(() => {
    if (!eventId) return null;
    const userKey = profile?.id ?? profile?.sub ?? profile?.email ?? "anon";
    return `dashboard:profile:${userKey}:${eventId}`;
  }, [eventId, profile]);

  const getFormValues = useCallback(() => {
    const form = formRef.current;
    if (!form) return {};
    const data = new FormData(form);
    const values = {};
    for (const [key, value] of data.entries()) {
      values[key] = String(value ?? "");
    }
    return values;
  }, []);

  const computeChanges = useCallback(() => {
    const currentValues = getFormValues();
    const initialValues = initialValuesRef.current || {};
    const payload = { event: {}, dashSettings: {} };
    let hasEvent = false;
    let hasDash = false;
    const labels = [];

    FIELD_DEFS.forEach((def) => {
      if (!(def.name in currentValues)) return;
      const current = String(currentValues[def.name] ?? "");
      const initial = String(initialValues[def.name] ?? "");
      if (current === initial) return;
      labels.push(def.label);
      const normalized = normalizePayloadValue(def, current);
      if (def.name.startsWith("dashSettings.")) {
        payload.dashSettings[def.key] = normalized;
        hasDash = true;
      } else {
        payload.event[def.key] = normalized;
        hasEvent = true;
      }
    });

    if (!hasEvent) delete payload.event;
    if (!hasDash) delete payload.dashSettings;

    return {
      hasChanges: labels.length > 0,
      labels,
      payload: labels.length ? payload : null,
      currentValues
    };
  }, [getFormValues]);

  const refreshChanges = useCallback(() => {
    if (!initialValuesRef.current || !formRef.current) return;
    const next = computeChanges();
    setChangeState(next);
  }, [computeChanges]);

  const applyDraftToForm = useCallback(
    (values) => {
      const form = formRef.current;
      if (!form || !values) return;
      const escapeName = (name) => {
        if (typeof CSS !== "undefined" && CSS.escape) {
          return CSS.escape(name);
        }
        return name.replace(/\"/g, '\\"');
      };

      Object.entries(values).forEach(([name, value]) => {
        const selector = `[name=\"${escapeName(name)}\"]`;
        const nodes = form.querySelectorAll(selector);
        nodes.forEach((node) => {
          if (node.type === "hidden") {
            const button = node.closest("button");
            if (button && node.value !== String(value)) {
              button.click();
            } else {
              node.value = String(value);
            }
            return;
          }
          if (node.type === "checkbox" || node.type === "radio") {
            node.checked = value === "1" || value === "true";
          } else {
            node.value = String(value);
          }
          node.dispatchEvent(new Event("input", { bubbles: true }));
          node.dispatchEvent(new Event("change", { bubbles: true }));
        });
      });
      requestAnimationFrame(() => refreshChanges());
    },
    [refreshChanges]
  );

  const { clearDraft } = useFormAutosave({
    formRef,
    draftKey,
    getValues: getFormValues,
    onRestore: (values) => {
      if (draftAppliedRef.current) return;
      if (!formRef.current) return;
      const current = getFormValues();
      const keys = Object.keys(values || {});
      if (keys.length && keys.every((key) => current[key] === values[key])) {
        draftAppliedRef.current = true;
        return;
      }
      applyDraftToForm(values);
      draftAppliedRef.current = true;
    }
  });

  useEffect(() => {
    let cancelled = false;
    async function loadDetails() {
      if (!token || !eventMeta?.eventId) return;
      if (eventDetails?.id && String(eventDetails.id) === String(eventMeta.eventId)) {
        return;
      }
      try {
        const details = await fetchEventDetails({
          eventId: eventMeta.eventId,
          token
        });
        if (!cancelled && details) {
          setEventDetails(details);
          setEventMeta({
            eventId: details.id ?? eventMeta.eventId,
            eventName: details.name ?? eventMeta.eventName,
            venue: details.venue ?? eventMeta.venue,
            city: details.locationCity ?? eventMeta.city
          });
        }
      } catch (error) {
        console.error("Failed to load event details", error);
      }
    }

    loadDetails();
    return () => {
      cancelled = true;
    };
  }, [token, eventMeta?.eventId, eventDetails, setEventDetails, setEventMeta]);

  useEffect(() => {
    if (!eventDetails) return;
    initialValuesRef.current = buildInitialValues(eventDetails);
    setChangeState({
      hasChanges: false,
      labels: [],
      payload: null,
      currentValues: null
    });
  }, [eventDetails]);

  useEffect(() => {
    draftAppliedRef.current = false;
  }, [eventId]);

  const handleSave = useCallback(async () => {
    if (!eventId || !token) return;
    const diff = computeChanges();
    if (!diff.payload) {
      setChangeState((prev) => ({ ...prev, hasChanges: false, labels: [], payload: null }));
      return;
    }
    setIsSaving(true);
    try {
      await updateEventDetails({ eventId, token, payload: diff.payload });
      const refreshed = await fetchEventDetails({ eventId, token });
      if (refreshed) {
        const merged = { ...(eventDetails ?? {}) };
        if (diff.payload.event) {
          Object.keys(diff.payload.event).forEach((key) => {
            if (key in refreshed) {
              merged[key] = refreshed[key];
            }
          });
        }
        if (diff.payload.dashSettings) {
          merged.dashSettings = { ...(merged.dashSettings ?? {}) };
          Object.keys(diff.payload.dashSettings).forEach((key) => {
            if (refreshed?.dashSettings && key in refreshed.dashSettings) {
              merged.dashSettings[key] = refreshed.dashSettings[key];
            }
          });
        }
        setEventDetails(merged);
        if (diff.payload.event?.name || diff.payload.event?.venue || diff.payload.event?.locationCity) {
          setEventMeta({
            eventName: diff.payload.event?.name ?? merged.name ?? eventMeta?.eventName,
            venue: diff.payload.event?.venue ?? merged.venue ?? eventMeta?.venue,
            city: diff.payload.event?.locationCity ?? merged.locationCity ?? eventMeta?.city
          });
        }
      }
      initialValuesRef.current = diff.currentValues || initialValuesRef.current;
      setChangeState({
        hasChanges: false,
        labels: [],
        payload: null,
        currentValues: null
      });
      clearDraft();
      setToast({
        title: "Profile Update",
        message: `${formatLabelList(diff.labels)} is updated`
      });
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setIsSaving(false);
    }
  }, [computeChanges, eventDetails, eventId, eventMeta, setEventDetails, setEventMeta, token]);

  return (
    <main className="min-h-screen bg-[color:rgb(var(--color-bg))] pb-10">
      <Header
        areaLabel="Configuration"
        breadcrumb={
          <>
            <Link className="font-semibold text-[#258d9c]" href="/Config/profile" replace>
              Profile
            </Link>
            <span className="text-slate-400">/</span>
            <Link className="text-slate-600 hover:text-[#258d9c]" href="/Config/operations" replace>
              Operations
            </Link>
            <span className="text-slate-400">/</span>
            <Link className="text-slate-600 hover:text-[#258d9c]" href="/Config/role_assign_event" replace>
              + Operator
            </Link>
          </>
        }
      />
      <Toast
        open={Boolean(toast)}
        title={toast?.title}
        message={toast?.message}
        onClose={() => setToast(null)}
      />
      {isLoadingDetails ? (
        <div className="w-full pr-4 pl-16 md:pr-8 md:pl-20 mt-6">
          <div className="space-y-6 animate-pulse">
            <div className="h-40 rounded-2xl border border-slate-100 bg-white/70" />
            <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr] items-stretch">
              <div className="space-y-6">
                <div className="h-32 rounded-2xl border border-slate-100 bg-white/70" />
                <div className="h-32 rounded-2xl border border-slate-100 bg-white/70" />
              </div>
              <div className="h-72 rounded-2xl border border-slate-100 bg-white/70" />
            </div>
            <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr] items-stretch">
              <div className="h-44 rounded-2xl border border-slate-100 bg-white/70" />
              <div className="h-44 rounded-2xl border border-slate-100 bg-white/70" />
            </div>
          </div>
        </div>
      ) : (
        <ConfigTransition>
          <form
            ref={formRef}
            onChange={refreshChanges}
            className="w-full pr-4 pl-16 md:pr-8 md:pl-20 mt-6"
          >
            <BasicEventDetails event={eventDetails} />

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr] items-stretch">
              <div className="flex flex-col h-full">
                <div>
                  <div className="text-sm font-semibold text-slate-700">Active Services</div>
                  <div className="mt-3">
                    <ActiveService event={eventDetails} onFieldChange={refreshChanges} />
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="text-sm font-semibold text-slate-700">Card</div>
                  <div className="mt-3">
                    <ConfigCard event={eventDetails} onFieldChange={refreshChanges} />
                  </div>
                </div>
              </div>
              <div className="flex flex-col h-full">
                <div className="text-sm font-semibold text-slate-700">Pos</div>
                <div className="mt-3 flex-1">
                  <ConfigPos event={eventDetails} onFieldChange={refreshChanges} />
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_1fr] items-stretch">
              <ConfigBankDetails event={eventDetails} />
              <ConfigDashSettings event={eventDetails} onFieldChange={refreshChanges} />
            </div>
          </form>
        </ConfigTransition>
      )}
      <div
        className={`fixed bottom-6 left-6 right-6 z-40 flex items-center justify-end transition-all duration-300 ${
          changeState.hasChanges ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 pointer-events-none"
        }`}
      >
        <SaveButton onClick={handleSave} disabled={isSaving} />
      </div>
    </main>
  );
}
