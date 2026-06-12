"use client";

import { useMemo, useState } from "react";
import { linkRole } from "../../../../lib/dashboardApi";
import { useDashboardStore } from "../../../../store/dashboardStore";

const TABS = [
  { id: "admin", label: "Admins" },
  { id: "operator", label: "Operators" }
];

const DUMMY_ADMINS = [
  {
    email: "design@atomx.in",
    whenAdded: "Workspace setup",
    date: "20 Sept 2026",
    time: "5:26 pm"
  },
  {
    email: "admin@atomx.in",
    whenAdded: "Recently",
    date: "24 Mar 2027",
    time: "10:00 am"
  }
];

const DUMMY_OPERATORS = [
  {
    email: "cashless.operator@atomx.in",
    whenAdded: "Event setup",
    date: "20 Sept 2026",
    time: "5:26 pm"
  },
  {
    email: "support.operator@atomx.in",
    whenAdded: "Recently",
    date: "24 Mar 2027",
    time: "10:00 am"
  }
];

function nowParts() {
  const now = new Date();
  return {
    whenAdded: "Just now",
    date: now.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }),
    time: now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    })
  };
}

function getInitialAdminId(profile, eventMeta, eventDetails) {
  return (
    profile?.ctx?.adminId ??
    eventMeta?.adminId ??
    eventDetails?.adminId ??
    eventDetails?.admin?.id ??
    eventDetails?.admin_id ??
    eventDetails?.admin?.adminId ??
    ""
  );
}

function getInitialEventId(eventMeta, eventDetails) {
  return eventMeta?.eventId ?? eventDetails?.id ?? "";
}

function RoleTabs({ activeTab, onChange }) {
  return (
    <div className="inline-flex rounded-xl border border-[#e7e0ff] bg-white p-1 shadow-[0_10px_22px_rgba(15,23,42,0.07)]">
      {TABS.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`h-9 rounded-lg px-4 text-[0.82rem] font-semibold transition ${
              active
                ? "bg-[#1c1c1c] text-white shadow-[0_8px_16px_rgba(28,28,28,0.16)]"
                : "text-[#6f7280] hover:bg-[#fff4ef] hover:text-[#e04420]"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.64rem] font-bold uppercase tracking-[0.16em] text-[#8d8d8d]">
        {label}
      </span>
      {children}
    </label>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className="h-10 w-full rounded-lg border border-[#dedede] bg-white px-3 text-[0.84rem] font-medium text-[#1c1c1c] outline-none transition placeholder:text-[#a5a9b5] focus:border-[#e04420] focus:ring-2 focus:ring-[#e04420]/10"
    />
  );
}

function AddedList({ title, items, emptyText }) {
  return (
    <section className="rounded-lg border border-[#ded4ff] border-l-[3px] border-l-[#ed4522] bg-white p-4 shadow-[0_18px_36px_rgba(15,23,42,0.08)]">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#e04420,#341cd6)] px-2 text-[0.82rem] font-bold text-white">
          {items.length}
        </span>
        <h2 className="m-0 text-[1rem] font-bold text-[#1f1f1f]">{title}</h2>
      </div>
      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#dcdcdc] px-4 py-8 text-center text-[0.82rem] font-semibold text-[#8a8a8a]">
            {emptyText}
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={`${item.email}-${item.time}-${index}`}
              className="grid grid-cols-[minmax(180px,1fr)_120px_90px_90px] items-center gap-3 rounded-lg border border-transparent p-px max-lg:grid-cols-1"
              style={{
                background:
                  "linear-gradient(#fff, #fff) padding-box, linear-gradient(110deg, #ffb7ac, #d5c9ff) border-box"
              }}
            >
              <div className="contents max-lg:block">
                <div className="rounded-[7px] bg-white px-3 py-2">
                  <div className="text-[0.58rem] font-bold uppercase tracking-[0.15em] text-[#9d9d9d]">
                    Email
                  </div>
                  <div className="mt-0.5 truncate text-[0.88rem] font-bold text-[#272727]">
                    {item.email}
                  </div>
                </div>
                <div className="rounded-[7px] bg-white px-3 py-2">
                  <div className="text-[0.58rem] font-bold uppercase tracking-[0.15em] text-[#9d9d9d]">
                    When Added
                  </div>
                  <div className="mt-0.5 text-[0.82rem] font-semibold text-[#272727]">
                    {item.whenAdded}
                  </div>
                </div>
                <div className="rounded-[7px] bg-white px-3 py-2">
                  <div className="text-[0.58rem] font-bold uppercase tracking-[0.15em] text-[#9d9d9d]">
                    Date
                  </div>
                  <div className="mt-0.5 text-[0.82rem] font-semibold text-[#272727]">
                    {item.date}
                  </div>
                </div>
                <div className="rounded-[7px] bg-white px-3 py-2">
                  <div className="text-[0.58rem] font-bold uppercase tracking-[0.15em] text-[#9d9d9d]">
                    Time
                  </div>
                  <div className="mt-0.5 text-[0.82rem] font-semibold text-[#272727]">
                    {item.time}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default function AdminRoleManager() {
  const token = useDashboardStore((state) => state.token);
  const profile = useDashboardStore((state) => state.profile);
  const eventMeta = useDashboardStore((state) => state.eventMeta);
  const eventDetails = useDashboardStore((state) => state.eventDetails);
  const initialAdminId = useMemo(
    () => getInitialAdminId(profile, eventMeta, eventDetails),
    [profile, eventMeta, eventDetails]
  );
  const initialEventId = useMemo(
    () => getInitialEventId(eventMeta, eventDetails),
    [eventMeta, eventDetails]
  );
  const [activeTab, setActiveTab] = useState("admin");
  const [adminEmail, setAdminEmail] = useState("");
  const [operatorEmail, setOperatorEmail] = useState("");
  const [admins, setAdmins] = useState(DUMMY_ADMINS);
  const [operators, setOperators] = useState(DUMMY_OPERATORS);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const addRole = async () => {
    const isAdmin = activeTab === "admin";
    const email = (isAdmin ? adminEmail : operatorEmail).trim();
    const normalizedAdminId = String(initialAdminId || "").trim();
    const normalizedEventId = String(initialEventId || "").trim();
    if (!email || !normalizedAdminId || (!isAdmin && !normalizedEventId)) {
      setError(
        isAdmin
          ? "Email and active workspace Admin ID are required."
          : "Email, active workspace Admin ID, and active Event ID are required."
      );
      return;
    }

    const payload = isAdmin
      ? {
          email,
          adminId: Number(normalizedAdminId) || normalizedAdminId,
          type: "admin"
        }
      : {
          email,
          adminId: Number(normalizedAdminId) || normalizedAdminId,
          eventId: Number(normalizedEventId) || normalizedEventId,
          type: "cashless"
        };

    setSubmitting(true);
    setError("");
    try {
      await linkRole({ token, payload });
      const entry = { email, ...nowParts() };
      if (isAdmin) {
        setAdmins((prev) => [entry, ...prev]);
        setAdminEmail("");
      } else {
        setOperators((prev) => [entry, ...prev]);
        setOperatorEmail("");
      }
    } catch (err) {
      console.error("Link role failed", err);
      setError("Unable to add this role.");
    } finally {
      setSubmitting(false);
    }
  };

  const isAdmin = activeTab === "admin";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="m-0 text-[1.45rem] font-bold text-[#111827]">Admin</h1>
          <p className="m-0 mt-1 text-[0.88rem] font-medium text-[#777777]">
            Link admin access and event operators.
          </p>
        </div>
        <RoleTabs activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <section className="rounded-lg border border-[#ded4ff] border-l-[3px] border-l-[#ed4522] bg-white p-4 shadow-[0_18px_36px_rgba(15,23,42,0.08)]">
        <div className="mb-3 flex flex-wrap gap-2 text-[0.72rem] font-semibold text-[#6f7280]">
          <span className="rounded-full bg-[#f7f7f7] px-3 py-1">
            Workspace Admin ID: {initialAdminId || "-"}
          </span>
          {!isAdmin && (
            <span className="rounded-full bg-[#f7f7f7] px-3 py-1">
              Event ID: {initialEventId || "-"}
            </span>
          )}
        </div>
        <div className="grid grid-cols-[minmax(260px,1fr)_auto] items-end gap-3 max-sm:grid-cols-1">
          <Field label={isAdmin ? "Admin Email" : "Operator Email"}>
            <TextInput
              type="email"
              value={isAdmin ? adminEmail : operatorEmail}
              onChange={(event) =>
                isAdmin ? setAdminEmail(event.target.value) : setOperatorEmail(event.target.value)
              }
              placeholder="name@atomx.in"
            />
          </Field>
          <button
            type="button"
            onClick={addRole}
            disabled={submitting}
            className="h-10 rounded-lg bg-[#1c1c1c] px-5 text-[0.84rem] font-bold text-white shadow-[0_12px_22px_rgba(28,28,28,0.16)] transition hover:bg-[#e04420] disabled:cursor-not-allowed disabled:opacity-55"
          >
            {submitting ? "Adding..." : isAdmin ? "Add Admin" : "Add Operator"}
          </button>
        </div>
        {error ? (
          <div className="mt-3 rounded-lg bg-[#fff4ef] px-3 py-2 text-[0.78rem] font-semibold text-[#e04420]">
            {error}
          </div>
        ) : null}
      </section>

      {isAdmin ? (
        <AddedList title="Added Admins" items={admins} emptyText="No admins added in this session." />
      ) : (
        <AddedList title="Added Operators" items={operators} emptyText="No operators added in this session." />
      )}
    </div>
  );
}
