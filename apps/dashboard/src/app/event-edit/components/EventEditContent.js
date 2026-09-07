"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AtomXLoader } from "@atomx/global-components";
import {
  closeEventDay,
  fetchEventDetails,
  updateEventBalanceSetting,
  updateEventDetails
} from "../../../lib/dashboardApi";
import { useDashboardStore } from "../../../store/dashboardStore";
import {
  CalendarIcon,
  Field,
  SearchIcon,
  SectionCard,
  SelectField,
  SettingRow,
  SubPanel,
  TopupRow,
  UploadBox
} from "./EventEditPrimitives";

const emptyEventFields = {
  "Event Name": "",
  Country: "",
  City: "",
  "Time Zone": "",
  Venue: "",
  Organiser: "",
  Client: "",
  Currency: "",
  "Start Date": "",
  "End Date": "",
  "ET Code": ""
};

const eventFieldOrder = [
  "Event Name",
  "Country",
  "City",
  "Time Zone",
  "Venue",
  "Organiser",
  "Client",
  "Currency",
  "Start Date",
  "End Date",
  "ET Code"
];

const emptyCardFields = {
  "Card Fee": "",
  "1st Topup": "",
  "Max Wallet": "",
  "Return Min Amount": "",
  "Return Max Amount": ""
};

const initialDashFields = {
  "Dashboard Password": ""
};

const initialMswipeFields = {
  Username: "",
  Password: "",
  "Verify Client Code": "",
  "Verify User ID": "",
  "Verify Password": "",
  "UPI API": ""
};

const services = [
  "NFC Cashless",
  "Use Pin",
  "Maker Checker",
  "Online Topup",
  "Access Control",
  "Taxation"
];

const posLeft = ["Happy Hours", "Round Off", "Use Club Card"];
const posRight = ["Manual Topup", "Link Mobile"];
const returns = [
  "Return Card Fee",
  "Return Balance",
  "Return Bank Card Balance",
  "Return Card Fee In Cash"
];
const dashToggles = ["Show Activation Data", "Show Coupon Data", "Show Comp Data", "Auto Reset Dashboard"];

function boolMap(labels, value = true) {
  return labels.reduce((acc, label) => ({ ...acc, [label]: value }), {});
}

function asText(value) {
  return value === null || value === undefined ? "" : String(value);
}

function asBool(value) {
  return value === true || value === 1 || value === "1" || value === "true";
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return asText(value);
  return date.toISOString().slice(0, 10);
}

function splitCsv(value) {
  return asText(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function topupsFromEvent(event) {
  const cashValues = splitCsv(event?.topupValues);
  const tokenValues = splitCsv(event?.topupNames);
  const length = Math.max(cashValues.length, tokenValues.length);
  if (!length) return [];
  return Array.from({ length }, (_, index) => ({
    cash: cashValues[index] ?? "",
    token: tokenValues[index] ?? cashValues[index] ?? ""
  }));
}

function mapEventToState(event) {
  return {
    eventFields: {
      "Event Name": asText(event?.name),
      Country: asText(event?.country),
      City: asText(event?.locationCity),
      "Time Zone": asText(event?.tz),
      Venue: asText(event?.venue),
      Organiser: asText(event?.organizer ?? event?.organiser),
      Client: asText(event?.client),
      Currency: asText(event?.currency).toUpperCase(),
      "Start Date": formatDate(event?.startAt),
      "End Date": formatDate(event?.endAt),
      "ET Code": asText(event?.etCode ?? event?.eventCode ?? event?.locationId)
    },
    cardFields: {
      "Card Fee": asText(event?.cardFee),
      "1st Topup": asText(event?.minTopup),
      "Max Wallet": asText(event?.maxTopupWallet),
      "Return Min Amount": asText(event?.returnMinAmount),
      "Return Max Amount": asText(event?.returnMaxAmount)
    },
    serviceState: {
      "NFC Cashless": asBool(event?.useNfc),
      "Use Pin": asBool(event?.usePin),
      "Maker Checker": asBool(event?.useMakerChecker),
      "Online Topup": asBool(event?.onlineTopup),
      "Access Control": asBool(event?.useAccessx),
      Taxation: asBool(event?.gstSetting)
    },
    posState: {
      "Happy Hours": asBool(event?.happyHour),
      "Round Off": asBool(event?.roundOff),
      "Use Club Card": asBool(event?.useClubCard),
      "Manual Topup": asBool(event?.topupManual),
      "Link Mobile": asBool(event?.linkUser)
    },
    returnState: {
      "Return Card Fee": asBool(event?.returnCardFee),
      "Return Balance": asBool(event?.returnCartValue ?? event?.returnBalance),
      "Return Bank Card Balance": asBool(event?.returnCardFull),
      "Return Card Fee In Cash": asBool(event?.returnCardFeeCash)
    },
    dashFields: {
      "Dashboard Password": asText(event?.devicePasswordAdmin ?? event?.dashboardPassword)
    },
    dashState: {
      "Show Activation Data": asBool(event?.showActivationData),
      "Show Coupon Data": asBool(event?.showCouponData),
      "Show Comp Data": asBool(event?.showCompData),
      "Auto Reset Dashboard": asBool(event?.autoResetDashboard)
    },
    mswipeFields: {
      Username: asText(event?.bankUsername),
      Password: asText(event?.bankPassword),
      "Verify Client Code": asText(event?.verifyClientCode),
      "Verify User ID": asText(event?.verifyUserId),
      "Verify Password": asText(event?.verifyPassword),
      "UPI API": asText(event?.upiApi)
    },
    posPasswords: {
      "Topup Password": asText(event?.devicePasswordTopup),
      "Sale Password": asText(event?.devicePassword)
    },
    printer: asText(event?.printer) || "Select Printer",
    topups: topupsFromEvent(event)
  };
}

function includesQuery(query, ...values) {
  if (!query) return true;
  return values.join(" ").toLowerCase().includes(query);
}

function BackIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function CloseIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function CheckIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function BalanceSettingToast({ reference, onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-[70] bg-[rgba(12,12,12,0.5)] backdrop-blur-[2px]" />
      <div className="fixed left-1/2 top-20 z-[80] w-[320px] max-w-[calc(100vw-2rem)] -translate-x-1/2 animate-[balanceToastIn_260ms_ease-out] overflow-hidden rounded-[16px] border border-(--line) bg-(--surface) shadow-(--shadowUp) max-[640px]:top-[72px] max-[640px]:w-[min(320px,calc(100vw-1.5rem))]">
        <style jsx>{`
          @keyframes balanceToastIn {
            from {
              opacity: 0;
              transform: translate(-50%, -22px);
            }
            to {
              opacity: 1;
              transform: translate(-50%, 0);
            }
          }
        `}</style>
        <div className="h-1 bg-[linear-gradient(90deg,#E04420,#8B5CF6,#341CD6)]" />
        <div
          className="flex items-center justify-between gap-3 px-4 py-3"
          style={{ background: "linear-gradient(135deg,#1C1C1C 0%,#241C4A 74%,#341CD6 155%)" }}
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-[linear-gradient(140deg,#e04420,#8b5cf6)] text-white">
              <CheckIcon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="font-vcr text-[8.5px] uppercase tracking-[0.18em] text-(--purple)">
                Balance Setting
              </p>
              <h3 className="font-chillax mt-0.5 text-[17px] font-semibold text-white">Done</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] border border-white/20 text-white/70 transition hover:border-(--orange) hover:bg-(--orange) hover:text-white"
            aria-label="Close balance setting message"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="p-4">
          <div className="rounded-[12px] border border-(--line2) bg-(--surface2) p-3">
            <p className="font-vcr text-[8.5px] uppercase tracking-[0.16em] text-(--muted)">
              Reference
            </p>
            <p className="font-chillax mt-1.5 text-[30px] font-semibold leading-none text-(--orange)">
              {reference || "-"}
            </p>
          </div>
          <p className="mt-4 text-[12.5px] font-light leading-5 text-(--muted)">
            Please update all devices for the changes to reflect this reference number.
          </p>
        </div>
      </div>
    </>
  );
}

export default function EventEditContent() {
  const router = useRouter();
  const token = useDashboardStore((state) => state.token);
  const eventMeta = useDashboardStore((state) => state.eventMeta);
  const storedEventDetails = useDashboardStore((state) => state.eventDetails);
  const setEventDetails = useDashboardStore((state) => state.setEventDetails);
  const setEventMeta = useDashboardStore((state) => state.setEventMeta);
  const eventId = eventMeta?.eventId ?? storedEventDetails?.id;
  const [search, setSearch] = useState("");
  const [eventFields, setEventFields] = useState(emptyEventFields);
  const [cardFields, setCardFields] = useState(emptyCardFields);
  const [dashFields, setDashFields] = useState(initialDashFields);
  const [mswipeFields, setMswipeFields] = useState(initialMswipeFields);
  const [posPasswords, setPosPasswords] = useState({
    "Topup Password": "",
    "Sale Password": ""
  });
  const [printer, setPrinter] = useState("Select Printer");
  const [serviceState, setServiceState] = useState(() => boolMap(services, false));
  const [posState, setPosState] = useState(() => boolMap([...posLeft, ...posRight], false));
  const [returnState, setReturnState] = useState(() => boolMap(returns, false));
  const [dashState, setDashState] = useState(() => boolMap(dashToggles, false));
  const [topups, setTopups] = useState([]);
  const [loading, setLoading] = useState(Boolean(eventId));
  const [saving, setSaving] = useState(false);
  const [closingDay, setClosingDay] = useState(false);
  const [dayCloseMessage, setDayCloseMessage] = useState("");
  const [updatingBalanceSetting, setUpdatingBalanceSetting] = useState(false);
  const [balanceToast, setBalanceToast] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadDetails() {
      if (!eventId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const details = await fetchEventDetails({ eventId, token, dedupe: false });
        if (cancelled) return;
        const mapped = mapEventToState(details);
        setEventDetails(details);
        setEventMeta({
          eventId: details?.id ?? eventId,
          eventName: details?.name ?? "",
          venue: details?.venue ?? "",
          city: details?.locationCity ?? ""
        });
        setEventFields(mapped.eventFields);
        setCardFields(mapped.cardFields);
        setServiceState(mapped.serviceState);
        setPosState(mapped.posState);
        setReturnState(mapped.returnState);
        setDashFields(mapped.dashFields);
        setDashState(mapped.dashState);
        setMswipeFields(mapped.mswipeFields);
        setPosPasswords(mapped.posPasswords);
        setPrinter(mapped.printer);
        setTopups(mapped.topups);
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load event details", err);
          setError("Unable to load event details.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadDetails();
    return () => {
      cancelled = true;
    };
  }, [eventId, token, setEventDetails, setEventMeta]);

  const query = search.trim().toLowerCase();
  const visible = useMemo(
    () => ({
      details: includesQuery(query, "event details identity location schedule billing poster", ...eventFieldOrder),
      pos: includesQuery(query, "pos point of sale topup printer password", ...posLeft, ...posRight),
      services: includesQuery(query, "active services enable disable", ...services),
      card: includesQuery(query, "card fee wallet return rules", ...Object.keys(emptyCardFields), ...returns),
      dash: includesQuery(query, "dash settings dashboard password coupon comp activation balance reset", ...dashToggles),
      mswipe: includesQuery(query, "mswipe payment gateway username password verify upi")
    }),
    [query]
  );

  const setField = (setter, label, value) => {
    setter((prev) => ({ ...prev, [label]: value }));
  };
  const toggle = (setter, label) => {
    setter((prev) => ({ ...prev, [label]: !prev[label] }));
  };
  const saveChanges = async () => {
    if (!eventId) return;
    setSaving(true);
    setError("");
    try {
      await updateEventDetails({
        eventId,
        token,
        payload: {
          name: eventFields["Event Name"],
          country: eventFields.Country,
          locationCity: eventFields.City,
          tz: eventFields["Time Zone"],
          venue: eventFields.Venue,
          organizer: eventFields.Organiser,
          client: eventFields.Client,
          currency: eventFields.Currency,
          startAt: eventFields["Start Date"] || null,
          endAt: eventFields["End Date"] || null,
          cardFee: Number(cardFields["Card Fee"]) || 0,
          minTopup: Number(cardFields["1st Topup"]) || 0,
          maxTopupWallet: Number(cardFields["Max Wallet"]) || 0,
          returnMinAmount: Number(cardFields["Return Min Amount"]) || 0,
          returnMaxAmount: Number(cardFields["Return Max Amount"]) || 0,
          useNfc: serviceState["NFC Cashless"] ? 1 : 0,
          usePin: serviceState["Use Pin"] ? 1 : 0,
          useMakerChecker: serviceState["Maker Checker"] ? 1 : 0,
          onlineTopup: serviceState["Online Topup"] ? 1 : 0,
          useAccessx: serviceState["Access Control"] ? 1 : 0,
          gstSetting: serviceState.Taxation ? 1 : 0,
          happyHour: posState["Happy Hours"] ? 1 : 0,
          roundOff: posState["Round Off"] ? 1 : 0,
          useClubCard: posState["Use Club Card"] ? 1 : 0,
          topupManual: posState["Manual Topup"] ? 1 : 0,
          linkUser: posState["Link Mobile"] ? 1 : 0,
          returnCardFee: returnState["Return Card Fee"] ? 1 : 0,
          returnCartValue: returnState["Return Balance"] ? 1 : 0,
          returnCardFull: returnState["Return Bank Card Balance"] ? 1 : 0,
          returnCardFeeCash: returnState["Return Card Fee In Cash"] ? 1 : 0,
          devicePasswordAdmin: dashFields["Dashboard Password"],
          devicePasswordTopup: posPasswords["Topup Password"],
          devicePassword: posPasswords["Sale Password"],
          printer,
          topupValues: topups.map((item) => item.cash).join(","),
          topupNames: topups.map((item) => item.token).join(","),
          bankUsername: mswipeFields.Username,
          bankPassword: mswipeFields.Password
        }
      });
    } catch (err) {
      console.error("Failed to save event details", err);
      setError("Unable to save event details.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateBalanceSetting = async () => {
    if (!eventId) return;
    setUpdatingBalanceSetting(true);
    setError("");
    try {
      const response = await updateEventBalanceSetting({ token, eventId });
      const updatedEvent = response?.event;
      if (updatedEvent) {
        setEventDetails(updatedEvent);
        setEventMeta({
          eventId: updatedEvent?.id ?? eventId,
          eventName: updatedEvent?.name ?? "",
          venue: updatedEvent?.venue ?? "",
          city: updatedEvent?.locationCity ?? ""
        });
      }
      setBalanceToast({
        reference: updatedEvent?.locationId ?? response?.locationId ?? ""
      });
    } catch (err) {
      console.error("Failed to update balance setting", err);
      setError("Unable to update balance setting.");
    } finally {
      setUpdatingBalanceSetting(false);
    }
  };

  const handleDayClose = async () => {
    if (!eventId) return;
    setClosingDay(true);
    setDayCloseMessage("");
    setError("");
    try {
      await closeEventDay({
        token,
        eventId,
        day: "a",
        volunteerCount: 0
      });
      setDayCloseMessage("Event day closed successfully.");
    } catch (err) {
      console.error("Failed to close event day", err);
      setError("Unable to close the event day.");
    } finally {
      setClosingDay(false);
    }
  };

  return (
    <>
      <section className="mb-4 max-[640px]:mb-3">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between max-[640px]:gap-3">
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => router.push("/Config")}
              className="font-vcr inline-flex max-w-full items-center gap-1.5 text-[9.5px] uppercase tracking-[0.16em] text-(--muted) transition hover:text-(--orange)"
            >
              <BackIcon className="h-3 w-3 shrink-0" />
              <span className="min-w-0 truncate">
                Events / {eventFields["Event Name"] || "Selected Event"} / Settings
              </span>
            </button>
            <h1 className="font-chillax mt-2 min-w-0 text-[clamp(24px,3vw,32px)] font-semibold leading-[1.05] tracking-[-0.02em] text-(--text) max-[640px]:mt-1.5 max-[640px]:truncate">
              Edit Event Information
            </h1>
            <p className="mt-2 text-[13.5px] font-light text-(--muted) max-[640px]:mt-1.5 max-[640px]:text-[12px]">
              Identity, services, POS behavior, card limits, and dashboard settings.
            </p>
          </div>

          <div className="flex min-w-0 flex-col gap-2.5 md:flex-row md:items-center">
            <label className="flex h-11 min-w-[280px] items-center gap-2.5 rounded-[10px] border border-(--line) bg-(--surface) px-3.5 text-(--muted) transition focus-within:border-(--orange) focus-within:shadow-[0_0_0_3px_rgba(224,68,32,0.12)] max-[640px]:h-10 max-[640px]:min-w-0">
              <SearchIcon className="h-4 w-4 shrink-0 opacity-60" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search settings, fields, passwords, services..."
                className="min-w-0 flex-1 bg-transparent text-[13px] font-medium text-(--text) outline-none placeholder:text-(--faint) max-[640px]:text-[12px]"
              />
            </label>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={saveChanges}
                disabled={saving || !eventId}
                className="h-11 shrink-0 rounded-[10px] bg-(--text) px-5 text-[13.5px] font-semibold text-(--bg) transition hover:bg-(--orange) disabled:cursor-not-allowed disabled:opacity-55 max-[640px]:h-10 max-[640px]:flex-1 max-[640px]:px-3 max-[640px]:text-[12px]"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={handleDayClose}
                disabled={closingDay || !eventId}
                className="h-11 shrink-0 rounded-[10px] border border-(--line) bg-(--surface) px-4 text-[13px] font-semibold text-(--muted) transition hover:border-(--orange) hover:text-(--orange) disabled:cursor-not-allowed disabled:opacity-55 max-[640px]:h-10 max-[640px]:flex-1 max-[640px]:px-3 max-[640px]:text-[12px]"
              >
                {closingDay ? "Closing..." : "Day Close"}
              </button>
              <button
                type="button"
                onClick={handleUpdateBalanceSetting}
                disabled={updatingBalanceSetting || !eventId}
                className="h-11 shrink-0 truncate rounded-[10px] bg-(--orange) px-5 text-[13.5px] font-semibold text-white transition hover:bg-(--text) hover:text-(--bg) disabled:cursor-not-allowed disabled:opacity-55 max-[640px]:h-10 max-[640px]:flex-1 max-[640px]:px-3 max-[640px]:text-[12px]"
              >
                {updatingBalanceSetting ? "Setting..." : "Set New Balance"}
              </button>
            </div>
          </div>
        </div>
        <div className="mt-[clamp(16px,2vw,22px)] h-px w-full bg-(--line)" />
      </section>

      {error ? (
        <div className="mb-4 rounded-[10px] border border-[rgba(224,68,32,0.25)] bg-[rgba(224,68,32,0.06)] px-3.5 py-2.5 text-[12.5px] font-semibold text-(--orange)">
          {error}
        </div>
      ) : null}

      {dayCloseMessage ? (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-[10px] border border-[rgba(0,169,242,0.28)] bg-[rgba(0,169,242,0.08)] px-3.5 py-2.5 text-[12.5px] font-semibold text-[#0284c7]">
          <span>{dayCloseMessage}</span>
          <button
            type="button"
            onClick={() => setDayCloseMessage("")}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-[8px] transition hover:bg-[rgba(0,169,242,0.14)]"
            aria-label="Close day close message"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="flex min-h-[220px] items-center justify-center rounded-[15px] border border-(--line) bg-(--surface) shadow-(--shadow)">
          <AtomXLoader label="Loading event details..." size={52} />
        </div>
      ) : null}

      {!loading && !eventId ? (
        <div className="rounded-[15px] border border-dashed border-(--line) bg-(--surface) px-6 py-14 text-center">
          <div className="font-chillax text-[17px] font-medium text-(--text)">No event selected</div>
          <div className="mt-1.5 text-[12.5px] text-(--faint)">
            Select an event before editing event details.
          </div>
        </div>
      ) : null}

      {!loading && eventId ? (
      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[1.55fr_1fr] max-[640px]:gap-3">
        <div className="min-w-0 space-y-4 max-[640px]:space-y-3">
          {visible.details && (
            <SectionCard
              index="01"
              title="Event Details"
              description="Identity, location, schedule, and billing basics."
            >
              <UploadBox />
              <div className="mt-4 grid gap-4 md:grid-cols-3 max-[640px]:mt-3 max-[640px]:gap-3">
                {eventFieldOrder.map((label) => (
                  <Field
                    key={label}
                    label={label}
                    value={eventFields[label]}
                    onChange={(value) => setField(setEventFields, label, value)}
                    placeholder={label.includes("Date") ? "dd/mm/yyyy" : ""}
                    icon={label.includes("Date") ? <CalendarIcon /> : null}
                  />
                ))}
              </div>
            </SectionCard>
          )}

          {visible.pos && (
            <SectionCard index="02" title="POS" description="Point-of-sale behavior and topup presets.">
              <div className="grid gap-4 lg:grid-cols-2 max-[640px]:gap-3">
                <div>
                  {posLeft.map((label) => (
                    <SettingRow
                      key={label}
                      label={label}
                      checked={posState[label]}
                      onToggle={() => toggle(setPosState, label)}
                    />
                  ))}
                </div>
                <div>
                  {posRight.map((label) => (
                    <SettingRow
                      key={label}
                      label={label}
                      checked={posState[label]}
                      onToggle={() => toggle(setPosState, label)}
                    />
                  ))}
                  <div className="mt-3">
                    <SelectField label="Printer" value={printer} onChange={setPrinter} />
                  </div>
                </div>
              </div>

              <SubPanel label="Topup Buttons" className="mt-4 max-[640px]:mt-3">
                <div className="space-y-3 max-[640px]:space-y-2.5">
                  {topups.length === 0 ? (
                    <div className="rounded-[11px] border border-dashed border-(--line) px-4 py-8 text-center text-[13px] font-medium text-(--muted) max-[640px]:px-3 max-[640px]:py-6 max-[640px]:text-[12px]">
                      No topup buttons configured.
                    </div>
                  ) : (
                    topups.map((topup, index) => (
                      <TopupRow
                        key={index}
                        index={String(index + 1).padStart(2, "0")}
                        cash={topup.cash}
                        token={topup.token}
                        onCashChange={(value) =>
                          setTopups((prev) =>
                            prev.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, cash: value } : item
                            )
                          )
                        }
                        onTokenChange={(value) =>
                          setTopups((prev) =>
                            prev.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, token: value } : item
                            )
                          )
                        }
                      />
                    ))
                  )}
                </div>
              </SubPanel>

              <div className="mt-4 grid gap-4 md:grid-cols-2 max-[640px]:mt-3 max-[640px]:gap-3">
                {Object.keys(posPasswords).map((label) => (
                  <Field
                    key={label}
                    label={label}
                    value={posPasswords[label]}
                    onChange={(value) => setField(setPosPasswords, label, value)}
                    placeholder={`Enter ${label.toLowerCase()}`}
                  />
                ))}
              </div>
            </SectionCard>
          )}
        </div>

        <aside className="min-w-0 space-y-4 max-[640px]:space-y-3">
          {visible.services && (
            <SectionCard
              index="03"
              title="Active Services"
              description="Enable or disable core event capabilities."
            >
              <div className="grid gap-x-8 md:grid-cols-2 max-[640px]:gap-x-0">
                {services.map((label) => (
                  <SettingRow
                    key={label}
                    label={label}
                    checked={serviceState[label]}
                    onToggle={() => toggle(setServiceState, label)}
                  />
                ))}
              </div>
            </SectionCard>
          )}

          {visible.card && (
            <SectionCard index="04" title="Card" description="Card fee, wallet limits, and return rules.">
              <div className="grid gap-4 md:grid-cols-2 max-[640px]:gap-3">
                {["Card Fee", "1st Topup", "Max Wallet"].map((label) => (
                  <Field
                    key={label}
                    label={label}
                    value={cardFields[label]}
                    onChange={(value) => setField(setCardFields, label, value)}
                  />
                ))}
              </div>

              <SubPanel label="Returns" className="mt-4 max-[640px]:mt-3">
                <div className="grid gap-x-8 md:grid-cols-2 max-[640px]:gap-x-0">
                  {returns.map((label) => (
                    <SettingRow
                      key={label}
                      label={label}
                      checked={returnState[label]}
                      onToggle={() => toggle(setReturnState, label)}
                    />
                  ))}
                </div>
              </SubPanel>

              <div className="mt-4 grid gap-4 md:grid-cols-2 max-[640px]:mt-3 max-[640px]:gap-3">
                {["Return Min Amount", "Return Max Amount"].map((label) => (
                  <Field
                    key={label}
                    label={label}
                    value={cardFields[label]}
                    onChange={(value) => setField(setCardFields, label, value)}
                  />
                ))}
              </div>
            </SectionCard>
          )}

          {visible.dash && (
            <SectionCard
              index="05"
              title="Dash Settings"
              description="Dashboard security, visibility, and reset behavior."
            >
              <div className="grid gap-4 md:grid-cols-2 max-[640px]:gap-3">
                <Field
                  label="Dashboard Password"
                  value={dashFields["Dashboard Password"]}
                  onChange={(value) => setField(setDashFields, "Dashboard Password", value)}
                  placeholder="Enter dashboard password"
                />
                {dashToggles.map((label) => (
                  <SettingRow
                    key={label}
                    label={label}
                    checked={dashState[label]}
                    onToggle={() => toggle(setDashState, label)}
                  />
                ))}
              </div>
            </SectionCard>
          )}

          {visible.mswipe && (
            <SectionCard
              index="06"
              title="MSWIPE Details"
              description="Payment gateway credentials and verification details."
            >
              <div className="grid gap-4 md:grid-cols-2 max-[640px]:gap-3">
                {Object.keys(mswipeFields).map((label) => (
                  <Field
                    key={label}
                    label={label}
                    value={mswipeFields[label]}
                    onChange={(value) => setField(setMswipeFields, label, value)}
                    placeholder={`Enter ${label.toLowerCase()}`}
                  />
                ))}
              </div>
            </SectionCard>
          )}
        </aside>
      </div>
      ) : null}

      {!loading && eventId && query && !Object.values(visible).some(Boolean) ? (
        <div className="mt-6 rounded-[15px] border border-dashed border-(--line) bg-(--surface) px-6 py-12 text-center">
          <div className="font-chillax text-[17px] font-medium text-(--text)">No settings match</div>
          <div className="mt-1.5 text-[12.5px] text-(--faint)">
            Nothing found for &quot;{search}&quot;. Try a different field or service name.
          </div>
        </div>
      ) : null}

      {balanceToast ? (
        <BalanceSettingToast
          reference={balanceToast.reference}
          onClose={() => setBalanceToast(null)}
        />
      ) : null}
    </>
  );
}
