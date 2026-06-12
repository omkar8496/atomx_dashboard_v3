"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchEventDetails, updateEventDetails } from "../../../lib/dashboardApi";
import { useDashboardStore } from "../../../store/dashboardStore";
import {
  CalendarIcon,
  Field,
  SearchIcon,
  SectionCard,
  SelectField,
  SettingRow,
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

function BackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
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

  return (
    <>
      <section className="mb-4 border-b border-[#d8d8d8] pb-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <button
              type="button"
              onClick={() => router.push("/Config")}
              className="inline-flex items-center gap-1.5 text-[0.74rem] font-medium text-[#7f7f7f] transition hover:text-[#E04420]"
            >
              <BackIcon />
              <span>
                Events &gt; {eventFields["Event Name"] || "Selected Event"} &gt; Settings
              </span>
            </button>
            <h1 className="mt-2 text-[2rem] font-normal leading-none text-[#111827] md:text-[2.2rem]">
              Edit Event Information
            </h1>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <label className="flex h-10 w-full min-w-[420px] items-center gap-3 border-b border-[#bfbfbf] px-1 text-[#8a8a8a] focus-within:border-[#E04420]">
              <SearchIcon />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search settings, fields, passwords, services..."
                className="min-w-0 flex-1 bg-transparent text-[0.78rem] font-semibold outline-none placeholder:text-[#7f7f7f]"
              />
            </label>
            <button
              type="button"
              onClick={saveChanges}
              disabled={saving || !eventId}
              className="h-9 rounded-md bg-[#1c1c1c] px-5 text-[0.78rem] font-bold text-white shadow-[0_10px_18px_rgba(28,28,28,0.12)] transition hover:bg-[#E04420]"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </section>

      {error ? (
        <div className="mb-4 rounded-lg bg-[#fff4ef] px-4 py-3 text-[0.84rem] font-semibold text-[#E04420]">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-lg border border-[#ded4ff] bg-white px-6 py-12 text-center text-[0.9rem] font-semibold text-[#777777]">
          Loading event details...
        </div>
      ) : null}

      {!loading && !eventId ? (
        <div className="rounded-lg border border-dashed border-[#d6d6d6] bg-white px-6 py-12 text-center text-[0.9rem] font-semibold text-[#777777]">
          Select an event before editing event details.
        </div>
      ) : null}

      {!loading && eventId ? (
      <div className="grid items-start gap-4 xl:grid-cols-[1.55fr_1fr]">
        <div className="space-y-4">
          {visible.details && (
            <SectionCard
              title="Event Details"
              description="Identity, location, schedule, and billing basics."
            >
              <UploadBox />
              <div className="mt-4 grid gap-4 md:grid-cols-3">
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
            <SectionCard title="POS" description="Point-of-sale behavior and topup presets.">
              <div className="grid gap-4 lg:grid-cols-2">
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
                  <div className="mt-2">
                    <SelectField label="Printer" value={printer} onChange={setPrinter} />
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-md border border-[#e6e6e6] p-4">
                <p className="mb-3 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#888888]">
                  Topup Buttons
                </p>
                <div className="space-y-3">
                  {topups.length === 0 ? (
                    <div className="rounded-md border border-dashed border-[#dddddd] px-4 py-5 text-center text-[0.78rem] font-semibold text-[#888888]">
                      No topup buttons configured.
                    </div>
                  ) : (
                    topups.map((topup, index) => (
                      <TopupRow
                        key={index}
                        index={String(index + 1)}
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
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
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

        <aside className="space-y-4">
          {visible.services && (
            <SectionCard
              title="Active Services"
              description="Enable or disable core event capabilities."
            >
              <div className="grid gap-x-8 md:grid-cols-2">
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
            <SectionCard title="Card" description="Card fee, wallet limits, and return rules.">
              <div className="grid gap-4 md:grid-cols-2">
                {["Card Fee", "1st Topup", "Max Wallet"].map((label) => (
                  <Field
                    key={label}
                    label={label}
                    value={cardFields[label]}
                    onChange={(value) => setField(setCardFields, label, value)}
                  />
                ))}
              </div>

              <div className="mt-4 rounded-md border border-[#e6e6e6] p-4">
                <p className="mb-3 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#888888]">
                  Returns
                </p>
                <div className="grid gap-x-8 md:grid-cols-2">
                  {returns.map((label) => (
                    <SettingRow
                      key={label}
                      label={label}
                      checked={returnState[label]}
                      onToggle={() => toggle(setReturnState, label)}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
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
              title="Dash Settings"
              description="Dashboard security, visibility, and reset behavior."
            >
              <div className="grid gap-4 md:grid-cols-2">
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
                <div className="flex min-h-[38px] items-center text-[1rem] font-normal text-[#1f1f1f]">
                  Get New Balance Setting
                </div>
              </div>
            </SectionCard>
          )}

          {visible.mswipe && (
            <SectionCard
              title="MSWIPE Details"
              description="Payment gateway credentials and verification details."
            >
              <div className="grid gap-4 md:grid-cols-2">
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
        <div className="mt-8 rounded-lg border border-dashed border-[#d6d6d6] bg-white px-6 py-10 text-center text-[0.88rem] font-semibold text-[#888888]">
          No settings found for "{search}".
        </div>
      ) : null}
    </>
  );
}
