"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchOperatorsList,
  linkAdmin,
  linkOperator,
  unlinkRole
} from "../../../../lib/dashboardApi";
import { useDashboardStore } from "../../../../store/dashboardStore";

const TABS = [
  { id: "admin", label: "Admins" },
  { id: "operator", label: "Operators" }
];

const OPERATOR_TYPES = [
  { value: "event", label: "Event" },
  { value: "cashless", label: "Cashless" },
  { value: "access", label: "Access" },
  { value: "inventory", label: "Inventory" },
  { value: "guest-ops", label: "Guest Ops" },
  { value: "finance", label: "Finance" }
];

function nowParts() {
  const now = new Date();
  return {
    timestampMs: now.getTime(),
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

function getTypeLabel(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return (
    OPERATOR_TYPES.find((option) => option.value === normalized)?.label ||
    (normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : "-")
  );
}

function idsMatch(value, expected) {
  if (value == null || expected == null || String(expected).trim() === "") {
    return false;
  }

  return String(value) === String(expected);
}

function formatOperatorRecord(record, index, fallbackAdminId = null) {
  const timestamp =
    record?.createdAt ??
    record?.created_at ??
    record?.linkedAt ??
    record?.linked_at ??
    record?.updatedAt ??
    record?.updated_at;
  const parsedDate = timestamp ? new Date(timestamp) : null;
  const hasValidDate = parsedDate && !Number.isNaN(parsedDate.getTime());

  return {
    id: record?.id ?? record?.operatorId ?? record?.operator_id ?? index,
    // Unlink is keyed on the link row's own id (NOT the nested operator.id) + adminId.
    linkId: record?.id ?? record?.linkId ?? null,
    // Operator links frequently come back without an adminId; they belong to the
    // workspace admin currently in context, which is how they were selected above.
    adminId: record?.adminId ?? record?.admin_id ?? fallbackAdminId ?? null,
    email:
      record?.email ??
      record?.operatorEmail ??
      record?.operator_email ??
      record?.user?.email ??
      record?.operator?.email ??
      "-",
    typeLabel: getTypeLabel(
      record?.type ?? record?.operatorType ?? record?.operator_type ?? record?.role
    ),
    timestampMs: hasValidDate ? parsedDate.getTime() : 0,
    whenAdded: hasValidDate ? "Recorded" : "-",
    date: hasValidDate
      ? parsedDate.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        })
      : "-",
    time: hasValidDate
      ? parsedDate.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit"
        })
      : "-"
  };
}

function groupOperatorRecords(records) {
  const groups = new Map();

  records.forEach((record) => {
    const normalizedEmail = String(record?.email || "").trim().toLowerCase();
    const key = normalizedEmail && normalizedEmail !== "-"
      ? normalizedEmail
      : `record-${record?.id}`;
    const existing = groups.get(key) || [];
    existing.push(record);
    groups.set(key, existing);
  });

  return Array.from(groups.entries())
    .map(([key, history]) => {
      const sortedHistory = [...history].sort(
        (left, right) => (right.timestampMs || 0) - (left.timestampMs || 0)
      );
      const latest = sortedHistory[0];

      return {
        ...latest,
        id: `email-${key}`,
        whenAdded: "Latest",
        history: sortedHistory,
        historyCount: sortedHistory.length
      };
    })
    .sort((left, right) => (right.timestampMs || 0) - (left.timestampMs || 0));
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

function UnlinkIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 17H7A5 5 0 0 1 7 7h2" />
      <path d="M15 7h2a5 5 0 0 1 3.9 8.1" />
      <path d="M8 12h4" />
      <path d="M3 3l18 18" />
    </svg>
  );
}

function UnlinkButton({ record, onUnlink, unlinkingId, compact = false }) {
  const linkId = record?.linkId;
  const adminId = record?.adminId;
  const hasLinkId = linkId !== null && linkId !== undefined && linkId !== "";
  const hasAdminId = adminId !== null && adminId !== undefined && adminId !== "";
  const canUnlink = hasLinkId && hasAdminId;
  const blockedReason = hasLinkId
    ? "This record has no admin ID to unlink"
    : "This record has no link ID to unlink";
  const isUnlinking = canUnlink && String(unlinkingId) === String(linkId);

  return (
    <button
      type="button"
      onClick={() => onUnlink?.(record)}
      disabled={!canUnlink || Boolean(unlinkingId)}
      title={canUnlink ? "Unlink this access" : blockedReason}
      aria-label={canUnlink ? `Unlink ${record?.email ?? "record"}` : "Unlink unavailable"}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-[8px] border border-(--line) font-medium text-(--muted) transition hover:border-(--orange) hover:bg-[rgba(224,68,32,0.06)] hover:text-(--orange) disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-(--line) disabled:hover:bg-transparent disabled:hover:text-(--muted) ${
        compact ? "h-7 px-2 text-[10.5px]" : "h-8 px-2.5 text-[11px]"
      }`}
    >
      {isUnlinking ? (
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-(--orange) border-t-transparent" />
      ) : (
        <UnlinkIcon className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
      )}
      <span>{isUnlinking ? "Unlinking\u2026" : "Unlink"}</span>
    </button>
  );
}

function RoleTabs({ activeTab, onChange }) {
  return (
    <div className="inline-flex rounded-[11px] border border-(--line) bg-(--surface) p-1">
      {TABS.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`h-9 rounded-[8px] px-4 text-[12.5px] font-semibold transition ${
              active ? "bg-(--text) text-(--bg)" : "text-(--muted) hover:text-(--orange)"
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
      <span className="font-vcr mb-1.5 block text-[8.5px] uppercase tracking-[0.16em] text-(--muted)">
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
      className="h-11 w-full rounded-[10px] border border-(--line) bg-(--surface) px-3.5 text-[13px] font-medium text-(--text) outline-none transition placeholder:text-(--faint) focus:border-(--orange) focus:shadow-[0_0_0_3px_rgba(224,68,32,0.12)]"
    />
  );
}

function TypeSelect({ value, onChange }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full cursor-pointer appearance-none rounded-[10px] border border-(--line) bg-(--surface) px-3.5 pr-9 text-[13px] font-medium text-(--text) outline-none transition focus:border-(--orange) focus:shadow-[0_0_0_3px_rgba(224,68,32,0.12)]"
      >
        <option value="" disabled>
          Select operator type
        </option>
        {OPERATOR_TYPES.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <svg
        viewBox="0 0 16 16"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--muted) opacity-60"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="m4 6 4 4 4-4" />
      </svg>
    </div>
  );
}

function AddedList({
  title,
  items,
  emptyText,
  showType = false,
  loading = false,
  loadError = "",
  onUnlink,
  unlinkingId = "",
  unlinkError = ""
}) {
  const [expandedItems, setExpandedItems] = useState({});

  const toggleHistory = (id) => {
    setExpandedItems((current) => ({ ...current, [id]: !current[id] }));
  };

  return (
    <section className="rounded-[15px] border border-(--line) border-l-[3px] border-l-(--orange) bg-(--surface) p-4 shadow-(--shadow)">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="font-vcr flex h-9 min-w-9 items-center justify-center rounded-[10px] bg-[linear-gradient(140deg,#e04420,#8b5cf6)] px-2 text-[12px] text-white">
          {String(items.length).padStart(2, "0")}
        </span>
        <h2 className="font-chillax m-0 text-[18px] font-semibold text-(--text)">{title}</h2>
      </div>
      {unlinkError ? (
        <div className="mb-3 rounded-[10px] border border-[rgba(224,68,32,0.25)] bg-[rgba(224,68,32,0.06)] px-3 py-2 text-[12.5px] font-semibold text-(--orange)">
          {unlinkError}
        </div>
      ) : null}
      <div className="space-y-2">
        {loading ? (
          <div className="rounded-[11px] border border-dashed border-(--line) px-4 py-8 text-center text-[13px] font-medium text-(--muted)">
            Loading records…
          </div>
        ) : loadError ? (
          <div className="rounded-[11px] border border-[rgba(224,68,32,0.25)] bg-[rgba(224,68,32,0.06)] px-4 py-3 text-center text-[13px] font-semibold text-(--orange)">
            {loadError}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-[11px] border border-dashed border-(--line) px-4 py-8 text-center text-[13px] font-medium text-(--muted)">
            {emptyText}
          </div>
        ) : (
          items.map((item, index) => {
            const canExpand = (item.historyCount || 0) > 1;
            const isExpanded = Boolean(expandedItems[item.id]);

            return (
              <div
                key={item.id ?? `${item.email}-${item.time}-${index}`}
                className="overflow-hidden rounded-[11px] border border-transparent p-px"
                style={{
                  background:
                    "linear-gradient(var(--surface),var(--surface)) padding-box, linear-gradient(135deg,rgba(224,68,32,.34),rgba(139,92,246,.26) 52%,rgba(0,169,242,.22)) border-box"
                }}
              >
                <div
                  className={`grid items-center gap-3 rounded-[10px] bg-(--surface) max-lg:grid-cols-1 ${
                    showType
                      ? "grid-cols-[minmax(180px,1fr)_120px_120px_90px_90px_auto]"
                      : "grid-cols-[minmax(180px,1fr)_120px_90px_90px_auto]"
                  }`}
                >
                  <div className="contents max-lg:block">
                    <div className="rounded-[10px] bg-(--surface) px-3 py-2">
                      <div className="font-vcr text-[7.5px] uppercase tracking-[0.15em] text-(--faint)">
                        Email
                      </div>
                      <div className="mt-0.5 truncate text-[13.5px] font-semibold text-(--text)">
                        {item.email}
                      </div>
                    </div>
                    {showType ? (
                      <div className="rounded-[10px] bg-(--surface) px-3 py-2">
                        <div className="font-vcr text-[7.5px] uppercase tracking-[0.15em] text-(--faint)">
                          Type
                        </div>
                        <div className="mt-0.5 text-[13px] font-semibold text-(--text)">
                          {item.typeLabel}
                        </div>
                      </div>
                    ) : null}
                    <div className="rounded-[10px] bg-(--surface) px-3 py-2">
                      <div className="font-vcr text-[7.5px] uppercase tracking-[0.15em] text-(--faint)">
                        When Added
                      </div>
                      <div className="mt-0.5 text-[13px] font-semibold text-(--text)">
                        {item.whenAdded}
                      </div>
                    </div>
                    <div className="rounded-[10px] bg-(--surface) px-3 py-2">
                      <div className="font-vcr text-[7.5px] uppercase tracking-[0.15em] text-(--faint)">
                        Date
                      </div>
                      <div className="mt-0.5 text-[13px] font-semibold text-(--text)">
                        {item.date}
                      </div>
                    </div>
                    <div className="rounded-[10px] bg-(--surface) px-3 py-2">
                      <div className="font-vcr text-[7.5px] uppercase tracking-[0.15em] text-(--faint)">
                        Time
                      </div>
                      <div className="mt-0.5 text-[13px] font-semibold text-(--text)">
                        {item.time}
                      </div>
                    </div>
                  </div>
                  <div className="mr-2 flex items-center justify-end gap-1.5 max-lg:mb-2 max-lg:ml-3 max-lg:mr-0 max-lg:justify-start">
                  {canExpand ? (
                    <button
                      type="button"
                      onClick={() => toggleHistory(item.id)}
                      aria-expanded={isExpanded}
                      title={isExpanded ? "Hide history" : "Show history"}
                      className="font-vcr flex h-8 items-center gap-1.5 rounded-[8px] border border-(--line) px-2.5 text-[11px] font-medium text-(--muted) transition hover:border-(--orange) hover:text-(--orange)"
                    >
                      <span>{item.historyCount}</span>
                      <svg
                        viewBox="0 0 16 16"
                        className={`h-3.5 w-3.5 transition ${isExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="m4 6 4 4 4-4" />
                      </svg>
                    </button>
                  ) : null}
                  <UnlinkButton
                    record={item}
                    onUnlink={onUnlink}
                    unlinkingId={unlinkingId}
                  />
                  </div>
                </div>

                {isExpanded ? (
                  <div className="border-t border-(--line2) bg-(--surface2) px-5 py-4">
                    <div className="relative ml-1 pl-6">
                      <span className="absolute bottom-2 left-[5px] top-2 w-px bg-[linear-gradient(#e04420,#341cd6)]" />
                      <div className="space-y-4">
                        {item.history.map((historyItem, historyIndex) => (
                          <div
                            key={`${historyItem.id}-${historyIndex}`}
                            className="relative flex flex-wrap items-center justify-between gap-x-5 gap-y-1"
                          >
                            <span
                              className={`absolute -left-[26px] top-1.5 h-3 w-3 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(52,28,214,0.18)] ${
                                historyIndex === 0
                                  ? "bg-[#e04420]"
                                  : "bg-[#341cd6]"
                              }`}
                            />
                            <div>
                              <div className="text-[12.5px] font-semibold text-(--text)">
                                {historyItem.typeLabel}
                              </div>
                              <div className="mt-0.5 text-[11px] font-medium text-(--muted)">
                                {historyIndex === 0 ? "Latest access link" : "Previous access link"}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="font-vcr text-[12px] text-(--text)">
                                  {historyItem.date}
                                </div>
                                <div className="font-vcr mt-0.5 text-[11px] text-(--muted)">
                                  {historyItem.time}
                                </div>
                              </div>
                              <UnlinkButton
                                record={historyItem}
                                onUnlink={onUnlink}
                                unlinkingId={unlinkingId}
                                compact
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })
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
  const [operatorType, setOperatorType] = useState("");
  const [admins, setAdmins] = useState([]);
  const [operators, setOperators] = useState([]);
  const [linksLoading, setLinksLoading] = useState(true);
  const [linksError, setLinksError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [unlinkingId, setUnlinkingId] = useState("");
  const [unlinkError, setUnlinkError] = useState("");

  const loadOperators = useCallback(
    async ({ force = false, quiet = false } = {}) => {
      if (!quiet) {
        setLinksLoading(true);
      }
      setLinksError("");

      try {
        const list = await fetchOperatorsList({ token, dedupe: !force });
        const records = Array.isArray(list) ? list : [];
        const adminRecords = records.filter((record) =>
          idsMatch(record?.adminId ?? record?.admin_id, initialAdminId)
        );
        const operatorRecords = records.filter((record) => {
          const recordAdminId = record?.adminId ?? record?.admin_id;
          const matchesEvent = idsMatch(
            record?.eventId ?? record?.event_id,
            initialEventId
          );
          const matchesAdmin =
            recordAdminId == null || idsMatch(recordAdminId, initialAdminId);

          return matchesEvent && matchesAdmin;
        });
        const normalizedAdmins = groupOperatorRecords(
          adminRecords.map((record, index) =>
            formatOperatorRecord(record, index, initialAdminId)
          )
        );
        const normalizedOperators = groupOperatorRecords(
          operatorRecords.map((record, index) =>
            formatOperatorRecord(record, index, initialAdminId)
          )
        );

        setAdmins(normalizedAdmins);
        setOperators(normalizedOperators);
        return { admins: normalizedAdmins, operators: normalizedOperators };
      } catch (err) {
        console.error("Operator list failed", err);
        if (!quiet) {
          setLinksError(err?.message || "Unable to load linked users.");
        }
        return null;
      } finally {
        if (!quiet) {
          setLinksLoading(false);
        }
      }
    },
    [initialAdminId, initialEventId, token]
  );

  useEffect(() => {
    loadOperators();
  }, [loadOperators]);

  const handleUnlink = async (record) => {
    const opId = record?.linkId;
    const adminId = record?.adminId;

    if (opId === null || opId === undefined || opId === "") {
      setUnlinkError("This record has no link ID, so it cannot be unlinked.");
      return;
    }
    if (adminId === null || adminId === undefined || adminId === "") {
      setUnlinkError("This record has no admin ID, so it cannot be unlinked.");
      return;
    }

    setUnlinkingId(String(opId));
    setUnlinkError("");

    try {
      await unlinkRole({ token, opId, adminId });

      // Drop it immediately, then reconcile against the API.
      const removeRecord = (groups) =>
        groupOperatorRecords(
          groups
            .flatMap((group) => group.history || [group])
            .filter((entry) => String(entry?.linkId) !== String(opId))
        );
      setAdmins(removeRecord);
      setOperators(removeRecord);

      await loadOperators({ force: true, quiet: true });
    } catch (err) {
      console.error("Unlink role failed", err);
      setUnlinkError(err?.message || "Unable to unlink this access.");
    } finally {
      setUnlinkingId("");
    }
  };

  const addRole = async () => {
    const isAdmin = activeTab === "admin";
    const email = (isAdmin ? adminEmail : operatorEmail).trim();
    const normalizedAdminId = String(initialAdminId || "").trim();
    const normalizedEventId = String(initialEventId || "").trim();
    if (!email) {
      setError(`Enter the ${isAdmin ? "admin" : "operator"} email address.`);
      return;
    }

    if (!isAdmin && !operatorType) {
      setError("Select an operator type.");
      return;
    }

    if ((isAdmin && !normalizedAdminId) || (!isAdmin && !normalizedEventId)) {
      setError("Active workspace context is unavailable. Select a workspace and try again.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      if (isAdmin) {
        await linkAdmin({
          token,
          email,
          adminId: Number(normalizedAdminId) || normalizedAdminId
        });
      } else {
        await linkOperator({
          token,
          email,
          eventId: Number(normalizedEventId) || normalizedEventId,
          type: operatorType.toLowerCase()
        });
      }
      const selectedType = OPERATOR_TYPES.find((option) => option.value === operatorType);
      const entry = {
        id: `pending-${Date.now()}`,
        email,
        typeLabel: isAdmin ? "Admin" : selectedType?.label || operatorType,
        ...nowParts()
      };
      if (isAdmin) {
        setAdminEmail("");
      } else {
        setOperatorEmail("");
        setOperatorType("");
      }

      const refreshed = await loadOperators({ force: true, quiet: true });
      if (!refreshed) {
        if (isAdmin) {
          setAdmins((prev) =>
            groupOperatorRecords([
              entry,
              ...prev.flatMap((item) => item.history || [item])
            ])
          );
        } else {
          setOperators((prev) =>
            groupOperatorRecords([
              entry,
              ...prev.flatMap((item) => item.history || [item])
            ])
          );
        }
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
          <h1 className="font-chillax m-0 text-[clamp(24px,3vw,32px)] font-semibold tracking-[-0.02em] text-(--text)">Admin</h1>
          <p className="m-0 mt-1 text-[13.5px] font-light text-(--muted)">
            Link admin access and event operators.
          </p>
        </div>
        <RoleTabs activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <section className="rounded-[15px] border border-(--line) border-l-[3px] border-l-(--orange) bg-(--surface) p-4 shadow-(--shadow)">
        <div
          className={`grid items-end gap-3 max-sm:grid-cols-1 ${
            isAdmin
              ? "grid-cols-[minmax(260px,1fr)_auto]"
              : "grid-cols-[minmax(260px,1fr)_minmax(180px,260px)_auto]"
          }`}
        >
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
          {!isAdmin ? (
            <Field label="Operator Type">
              <TypeSelect value={operatorType} onChange={setOperatorType} />
            </Field>
          ) : null}
          <button
            type="button"
            onClick={addRole}
            disabled={submitting}
            className="h-11 rounded-[10px] bg-(--text) px-5 text-[13.5px] font-semibold text-(--bg) transition hover:bg-(--orange) disabled:cursor-not-allowed disabled:opacity-55"
          >
            {submitting ? "Adding…" : isAdmin ? "Add Admin" : "Add Operator"}
          </button>
        </div>
        {error ? (
          <div className="mt-3 rounded-[10px] border border-[rgba(224,68,32,0.25)] bg-[rgba(224,68,32,0.06)] px-3 py-2 text-[12.5px] font-semibold text-(--orange)">
            {error}
          </div>
        ) : null}
      </section>

      {isAdmin ? (
        <AddedList
          title="Added Admins"
          items={admins}
          emptyText="No admins found."
          loading={linksLoading}
          loadError={linksError}
          onUnlink={handleUnlink}
          unlinkingId={unlinkingId}
          unlinkError={unlinkError}
        />
      ) : (
        <AddedList
          title="Added Operators"
          items={operators}
          emptyText="No operators found."
          showType
          loading={linksLoading}
          loadError={linksError}
          onUnlink={handleUnlink}
          unlinkingId={unlinkingId}
          unlinkError={unlinkError}
        />
      )}
    </div>
  );
}
