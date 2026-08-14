"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  fetchEventTransactionDetails,
  fetchStalls,
  fetchVendors,
  filterEventTransactions,
  updateEventTransactionStatus
} from "../../../lib/dashboardApi";
import { useDashboardStore } from "../../../store/dashboardStore";

const TRANSACTION_TYPES = [
  { label: "SALE", value: "sale" },
  { label: "TOPUP", value: "topup" },
  { label: "RETURN", value: "return" },
  { label: "REVERSAL TOPUP", value: "reversal_topup" },
  { label: "REVERSAL SALE", value: "reversal_sale" }
];

const STATUS_OPTIONS = [
  { label: "All Status", value: "" },
  { label: "Completed", value: "completed" },
  { label: "Void", value: "void" },
  { label: "Success", value: "success" },
  { label: "Failed", value: "failed" },
  { label: "Pending", value: "pending" }
];

function pad(value) {
  return String(value).padStart(2, "0");
}

function toDateInputValue(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toDateTimeText(dateValue, timeValue) {
  if (!dateValue) return "";
  return `${dateValue} ${timeValue || "00:00:00"}`;
}

function toPayloadIsoDate(dateValue, timeValue) {
  if (!dateValue) return "";
  const date = new Date(`${dateValue}T${timeValue || "00:00:00"}`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
}

function toPayloadNumber(value) {
  if (value === "" || value == null) return "";
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? value : numberValue;
}

function todayDateValue() {
  return toDateInputValue(new Date());
}

function getVendorId(vendor) {
  return vendor?.id ?? vendor?.vendorId ?? vendor?.vendor_id ?? vendor?.login ?? vendor?.password ?? "";
}

function getVendorName(vendor) {
  return vendor?.name ?? vendor?.vendorName ?? vendor?.vendor_name ?? vendor?.label ?? "-";
}

function getStallId(stall) {
  return stall?.id ?? stall?.stallId ?? stall?.stall_id ?? "";
}

function getStallName(stall) {
  return stall?.name ?? stall?.stallName ?? stall?.stall_name ?? "-";
}

function formatMoney(value) {
  if (value === "" || value == null) return "-";
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return String(value);
  return numberValue.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatTxnDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const dateText = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const timeText = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  return `${dateText} ${timeText}`;
}

function cleanText(value, fallback = "-") {
  if (value === "" || value == null) return fallback;
  const text = String(value).trim();
  return text || fallback;
}

function normalizeTxnType(value) {
  return cleanText(value).replace(/_/g, " ").toUpperCase();
}

function normalizeTxnStatus(value) {
  return cleanText(value, "").toLowerCase();
}

function getNextTxnStatus(value) {
  const status = normalizeTxnStatus(value);
  if (status === "void") return "completed";
  if (status === "completed") return "void";
  return null;
}

function getTxnStatusClass(value) {
  const status = normalizeTxnStatus(value);
  if (status === "completed") return "text-[#0e8f62]";
  if (status === "pending" || status.includes("pending")) return "text-[#e08a20]";
  return "text-(--orange)";
}

function getTransactionId(transaction) {
  return transaction?.txn_id ?? transaction?.txId ?? transaction?.transactionId ?? transaction?.id;
}

function getTransactionValue(transaction, ...keys) {
  for (const key of keys) {
    const value = transaction?.[key];
    if (value !== "" && value != null) return value;
  }
  return null;
}

function mergeTransactionDetails(transaction, details) {
  if (!details) return transaction;

  return {
    ...transaction,
    ...details,
    txn_id:
      details.txn_id ??
      details.txId ??
      details.transactionId ??
      transaction.txn_id ??
      transaction.txId ??
      transaction.id,
    txn_status:
      transaction.txn_status ??
      transaction.status ??
      details.txn_status ??
      details.status
  };
}

function ChevronIcon({ open }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 transition ${open ? "rotate-90" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function SearchIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function SortIcon() {
  return (
    <span className="inline-grid gap-[2px] text-(--faint)" aria-hidden>
      <span className="h-0 w-0 border-x-[4px] border-b-[5px] border-x-transparent border-b-current" />
      <span className="h-0 w-0 border-x-[4px] border-t-[5px] border-x-transparent border-t-current" />
    </span>
  );
}

function DownloadIcon({ className = "h-4.5 w-4.5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function EventIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3v18" />
    </svg>
  );
}

function SelectArrow() {
  return (
    <svg viewBox="0 0 24 24" className="pointer-events-none h-4 w-4 text-(--text)" fill="currentColor" aria-hidden>
      <path d="M7 9.5h10L12 15z" />
    </svg>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex h-full items-center gap-3 border-r border-(--line) px-3 max-[640px]:gap-2 max-[640px]:px-2"
      aria-pressed={checked}
    >
      <span
        className={`relative h-5 w-9 rounded-full transition max-[640px]:h-4 max-[640px]:w-8 ${
          checked ? "bg-[#0e8f62]" : "bg-(--surface2)"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-(--surface) shadow transition max-[640px]:h-3 max-[640px]:w-3 ${
            checked ? "left-[18px] max-[640px]:left-[17px]" : "left-0.5"
          }`}
        />
      </span>
      <span className="text-[0.7rem] font-bold uppercase tracking-[0.02em] text-(--muted) max-[640px]:text-[0.58rem]">
        {label}
      </span>
    </button>
  );
}

function FilterCheck({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex h-full items-center gap-3 border-r border-(--line) px-3 max-[640px]:gap-2 max-[640px]:px-2"
      aria-pressed={checked}
    >
      <span
        className={`grid h-[18px] w-[18px] place-items-center rounded-md border shadow-[0_3px_8px_rgba(15,23,42,0.04)] transition max-[640px]:h-[14px] max-[640px]:w-[14px] ${
          checked ? "border-(--orange) bg-(--orange) text-white" : "border-(--line) bg-(--surface) text-transparent"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="m5 12 4 4L19 6" />
        </svg>
      </span>
      <span className="text-[0.7rem] font-bold uppercase tracking-[0.02em] text-(--muted) max-[640px]:text-[0.58rem]">
        {label}
      </span>
    </button>
  );
}

function InputField({ label, value, onChange, placeholder, enabled, onEnabledChange }) {
  return (
    <label className={`grid h-12 grid-cols-[170px_1fr] items-center overflow-hidden rounded-lg border bg-(--surface) shadow-[0_8px_20px_rgba(15,23,42,0.025)] transition max-[640px]:h-9 max-[640px]:grid-cols-[96px_minmax(0,1fr)] ${
      enabled ? "border-(--line)" : "border-(--line2) bg-(--surface2)"
    }`}>
      <FilterCheck checked={enabled} onChange={onEnabledChange} label={label} />
      <input
        type="text"
        disabled={!enabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 bg-transparent px-4 text-[0.82rem] font-semibold text-(--text) outline-none placeholder:text-(--faint) disabled:text-(--faint) max-[640px]:px-2.5 max-[640px]:text-[0.68rem]"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options, enabled, onEnabledChange, disabled = false }) {
  const isDisabled = disabled || !enabled;

  return (
    <label className={`grid h-12 grid-cols-[170px_1fr] items-center overflow-hidden rounded-lg border bg-(--surface) shadow-[0_8px_20px_rgba(15,23,42,0.025)] transition max-[640px]:h-9 max-[640px]:grid-cols-[96px_minmax(0,1fr)] ${
      enabled ? "border-(--line)" : "border-(--line2) bg-(--surface2)"
    }`}>
      <FilterCheck checked={enabled} onChange={onEnabledChange} label={label} />
      <span className="relative flex min-w-0 items-center px-4 max-[640px]:px-2.5">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={isDisabled}
          className="h-full min-w-0 flex-1 appearance-none bg-transparent pr-8 text-[0.82rem] font-semibold text-(--text) outline-none disabled:text-(--faint) max-[640px]:text-[0.68rem]"
        >
          {options.map((option) => (
            <option key={`${label}-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <SelectArrow />
      </span>
    </label>
  );
}

function DateRangeField({ enabled, onEnabledChange, range, onChange }) {
  const [open, setOpen] = useState(false);
  const pickerRef = useRef(null);
  const startText = toDateTimeText(range.startDate, range.startTime);
  const endText = toDateTimeText(range.endDate, range.endTime);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!pickerRef.current || pickerRef.current.contains(event.target)) return;
      setOpen(false);
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const updateRange = (patch) => onChange({ ...range, ...patch });

  const applyQuickRange = (daysBack) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - daysBack);
    updateRange({
      startDate: toDateInputValue(start),
      startTime: "00:00:00",
      endDate: toDateInputValue(end),
      endTime: "00:00:00"
    });
  };

  return (
    <div className="relative" ref={pickerRef}>
      <div
        className={`grid h-12 grid-cols-[170px_48px_1fr_56px_1fr] items-center overflow-hidden rounded-lg border bg-(--surface) shadow-[0_8px_20px_rgba(15,23,42,0.025)] max-[640px]:h-auto max-[640px]:min-h-9 max-[640px]:grid-cols-[96px_28px_minmax(0,1fr)] ${
          open ? "border-(--orange) shadow-[0_0_0_3px_rgba(224,68,32,0.12)]" : "border-(--line)"
        }`}
      >
        <Toggle checked={enabled} onChange={onEnabledChange} label="Dates" />
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          disabled={!enabled}
          className="grid h-full place-items-center border-r border-(--line) text-(--muted)"
          aria-label="Open date range picker"
        >
          <ClockIcon />
        </button>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          disabled={!enabled}
          className="min-w-0 bg-transparent px-5 text-left text-[0.92rem] font-normal text-(--muted) outline-none max-[640px]:px-2 max-[640px]:text-[0.66rem]"
        >
          <span className="block truncate">{startText || "Start"}</span>
        </button>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          disabled={!enabled}
          className="text-center text-[1rem] text-(--muted) max-[640px]:hidden"
        >
          -
        </button>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          disabled={!enabled}
          className="min-w-0 bg-transparent px-5 text-left text-[0.92rem] font-normal text-(--muted) outline-none max-[640px]:col-span-3 max-[640px]:border-t max-[640px]:border-(--line) max-[640px]:px-2 max-[640px]:py-2 max-[640px]:text-[0.66rem]"
        >
          <span className="block truncate">{endText || "End"}</span>
        </button>
      </div>

      {open && enabled ? (
        <div className="absolute left-0 top-[calc(100%+8px)] z-30 grid w-full min-w-[720px] grid-cols-[150px_1fr] overflow-hidden rounded-lg border border-(--line) bg-(--surface) shadow-[0_22px_60px_rgba(15,23,42,0.18)] max-[900px]:min-w-0 max-[900px]:grid-cols-1">
          <div className="border-r border-(--line) p-4 text-[0.84rem] font-normal text-(--muted) max-[900px]:flex max-[900px]:gap-2 max-[900px]:overflow-x-auto max-[900px]:border-b max-[900px]:border-r-0 max-[900px]:p-2">
            <button type="button" onClick={() => applyQuickRange(7)} className="block rounded-md px-2 py-2 text-left hover:bg-(--surface2) max-[900px]:min-w-fit">
              Last week
            </button>
            <button type="button" onClick={() => applyQuickRange(30)} className="block rounded-md px-2 py-2 text-left hover:bg-(--surface2) max-[900px]:min-w-fit">
              Last month
            </button>
            <button type="button" onClick={() => applyQuickRange(90)} className="block rounded-md px-2 py-2 text-left hover:bg-(--surface2) max-[900px]:min-w-fit">
              Last 3 months
            </button>
          </div>

          <div>
            <div className="grid grid-cols-[1fr_28px_1fr] gap-3 border-b border-(--line) p-3 max-[640px]:grid-cols-1">
              <div className="grid grid-cols-[1fr_120px] gap-2 max-[640px]:grid-cols-1">
                <input
                  type="date"
                  value={range.startDate}
                  onChange={(event) => updateRange({ startDate: event.target.value })}
                  className="h-10 rounded-md border border-(--line) px-3 text-[0.86rem] text-(--muted) outline-none focus:border-(--orange)"
                />
                <input
                  type="time"
                  step="1"
                  value={range.startTime}
                  onChange={(event) => updateRange({ startTime: event.target.value })}
                  className="h-10 rounded-md border border-(--line) px-3 text-[0.86rem] text-(--muted) outline-none focus:border-(--orange)"
                />
              </div>
              <span className="grid place-items-center text-xl text-(--text) max-[640px]:hidden">›</span>
              <div className="grid grid-cols-[1fr_120px] gap-2 max-[640px]:grid-cols-1">
                <input
                  type="date"
                  value={range.endDate}
                  onChange={(event) => updateRange({ endDate: event.target.value })}
                  className="h-10 rounded-md border border-(--line) px-3 text-[0.86rem] text-(--muted) outline-none focus:border-(--orange)"
                />
                <input
                  type="time"
                  step="1"
                  value={range.endTime}
                  onChange={(event) => updateRange({ endTime: event.target.value })}
                  className="h-10 rounded-md border border-(--line) px-3 text-[0.86rem] text-(--muted) outline-none focus:border-(--orange)"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-3">
              <button
                type="button"
                onClick={() =>
                  updateRange({
                    startDate: todayDateValue(),
                    startTime: "00:00:00",
                    endDate: todayDateValue(),
                    endTime: "00:00:00"
                  })
                }
                className="h-9 px-3 text-[0.82rem] font-semibold text-(--orange)"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-9 rounded-md border border-(--line) bg-(--surface) px-4 text-[0.82rem] font-semibold text-(--muted) hover:border-(--orange)"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TransactionStatusAction({ transaction, onUpdateStatus }) {
  const [confirming, setConfirming] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const nextStatus = getNextTxnStatus(transaction.txn_status);
  const txId = transaction.txn_id ?? transaction.txId ?? transaction.id;

  if (!nextStatus || txId === "" || txId == null) return null;

  const actionLabel = nextStatus === "completed" ? "Mark Completed" : "Mark Void";

  const handleConfirm = async () => {
    setUpdating(true);
    setError("");
    try {
      await onUpdateStatus({ txId, status: nextStatus });
      setConfirming(false);
    } catch {
      setError("Status could not be updated. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="mt-4 border-t border-(--line2) pt-3">
      {confirming ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-(--surface2) px-3 py-2.5">
          <p className="text-[0.72rem] font-semibold text-(--muted)">
            Change this transaction to <span className="capitalize text-(--text)">{nextStatus}</span>?
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setConfirming(false);
                setError("");
              }}
              disabled={updating}
              className="h-8 rounded-md border border-(--line) bg-(--surface) px-3 text-[0.7rem] font-semibold text-(--muted) transition hover:border-(--muted) disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={updating}
              className={`h-8 rounded-md px-3 text-[0.7rem] font-bold text-(--bg) transition disabled:cursor-not-allowed disabled:opacity-55 ${
                nextStatus === "completed"
                  ? "bg-(--text) hover:bg-[#0e8f62]"
                  : "bg-(--orange) hover:bg-(--orange)"
              }`}
            >
              {updating ? "Updating..." : `Confirm ${nextStatus === "completed" ? "Completed" : "Void"}`}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className={`h-9 rounded-lg px-4 text-[0.74rem] font-bold transition ${
              nextStatus === "completed"
                ? "bg-(--text) text-(--bg) hover:bg-[#0e8f62]"
                : "border border-(--orange) bg-[rgba(224,68,32,0.06)] text-(--orange) hover:bg-(--orange) hover:text-white"
            }`}
          >
            {actionLabel}
          </button>
        </div>
      )}
      {error ? <p className="mt-2 text-right text-[0.68rem] font-semibold text-(--orange)">{error}</p> : null}
    </div>
  );
}

function TransactionDetailContent({
  transaction,
  loading,
  error,
  onRetry,
  onUpdateStatus
}) {
  if (loading) {
    return (
      <div className="grid min-h-36 place-items-center rounded-xl border border-(--line2) bg-(--surface) p-4 text-center shadow-[0_14px_35px_rgba(15,23,42,0.05)]">
        <div>
          <span className="mx-auto block h-7 w-7 animate-spin rounded-full border-2 border-(--line) border-t-[#E04420]" />
          <p className="mt-3 text-[0.74rem] font-semibold text-(--muted)">Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid min-h-32 place-items-center rounded-xl border border-[rgba(224,68,32,0.25)] bg-[rgba(224,68,32,0.06)] p-4 text-center">
        <div>
          <p className="text-[0.74rem] font-semibold text-(--orange)">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 h-8 rounded-md bg-(--text) px-3 text-[0.7rem] font-bold text-(--bg) transition hover:bg-(--orange)"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const details = [
    ["Card ID", cleanText(getTransactionValue(transaction, "txn_card_id", "cardId", "card_id"))],
    ["Card UID", cleanText(getTransactionValue(transaction, "txn_card_uid", "cardUid", "card_uid"))],
    ["TXN Counter", cleanText(getTransactionValue(transaction, "txn_counter", "txnCounter", "counter"))],
    ["TXN ID", cleanText(getTransactionId(transaction))],
    ["Receipt", cleanText(getTransactionValue(transaction, "txn_receipt", "receipt"))],
    ["Invoice", cleanText(getTransactionValue(transaction, "txn_invoice", "invoice"))],
    ["Balance Before", formatMoney(getTransactionValue(transaction, "txn_bal_before", "balanceBefore", "balBefore"))],
    ["Balance After", formatMoney(getTransactionValue(transaction, "txn_bal_after", "balanceAfter", "balAfter"))],
    ["Mobile", cleanText(getTransactionValue(transaction, "txn_mobile", "mobile"))],
    ["Name", cleanText(getTransactionValue(transaction, "txn_name", "name"))],
    ["Reference", cleanText(getTransactionValue(transaction, "txn_reference", "reference"))],
    ["App Version", cleanText(getTransactionValue(transaction, "txn_app_version", "appVersion", "version"))]
  ];

  return (
    <div className="mx-auto max-w-[860px] rounded-xl border border-(--line2) bg-(--surface) p-4 shadow-[0_14px_35px_rgba(15,23,42,0.05)]">
      <div className="mb-3 flex items-center justify-center gap-2">
        <span className="h-px flex-1 bg-(--surface2)" />
        <span className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-(--faint)">Transaction Info</span>
        <span className="h-px flex-1 bg-(--surface2)" />
      </div>
      <dl className="grid grid-cols-2 gap-x-7 gap-y-3 max-[760px]:grid-cols-1">
        {details.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[130px_1fr] items-center gap-3 border-b border-(--line2) pb-2 last:border-b-0 max-[520px]:grid-cols-1 max-[520px]:gap-1">
            <dt className="text-[0.66rem] font-semibold uppercase tracking-[0.05em] text-(--faint)">{label}</dt>
            <dd className="min-w-0 break-words text-[0.9rem] font-medium text-(--muted)">{value}</dd>
          </div>
        ))}
      </dl>
      <TransactionStatusAction transaction={transaction} onUpdateStatus={onUpdateStatus} />
    </div>
  );
}

function TransactionDetailRow(props) {
  return (
    <tr className="bg-(--surface2)">
      <td colSpan={10} className="border-b border-(--line2) px-4 py-5">
        <TransactionDetailContent {...props} />
      </td>
    </tr>
  );
}

function TransactionResults({ transactions, token, onUpdateStatus }) {
  const [query, setQuery] = useState("");
  const [expandedTxnId, setExpandedTxnId] = useState(null);
  const [detailsByTxnId, setDetailsByTxnId] = useState({});

  const loadTransactionDetails = useCallback(
    async (transaction, rowKey, force = false) => {
      const cacheKey = String(rowKey);
      const txId = getTransactionId(transaction);
      if (txId === "" || txId == null) {
        setDetailsByTxnId((current) => ({
          ...current,
          [cacheKey]: {
            data: null,
            loading: false,
            error: "This transaction does not include a transaction ID."
          }
        }));
        return;
      }

      if (!force && detailsByTxnId[cacheKey]?.data) return;

      setDetailsByTxnId((current) => ({
        ...current,
        [cacheKey]: { ...current[cacheKey], loading: true, error: "" }
      }));

      try {
        const details = await fetchEventTransactionDetails({
          token,
          txId,
          dedupe: !force
        });
        setDetailsByTxnId((current) => ({
          ...current,
          [cacheKey]: {
            data: details,
            loading: false,
            error: details ? "" : "No transaction details were returned."
          }
        }));
      } catch (detailError) {
        console.error("Failed to load transaction details", detailError);
        setDetailsByTxnId((current) => ({
          ...current,
          [cacheKey]: {
            data: current[cacheKey]?.data ?? null,
            loading: false,
            error: "Unable to load transaction details."
          }
        }));
      }
    },
    [detailsByTxnId, token]
  );

  const toggleTransactionDetails = useCallback(
    (transaction, rowKey) => {
      if (expandedTxnId === rowKey) {
        setExpandedTxnId(null);
        return;
      }

      setExpandedTxnId(rowKey);
      loadTransactionDetails(transaction, rowKey);
    },
    [expandedTxnId, loadTransactionDetails]
  );

  const updateExpandedTransactionStatus = useCallback(
    async ({ txId, status }) => {
      await onUpdateStatus({ txId, status });
      setDetailsByTxnId((current) => {
        const next = { ...current };
        Object.keys(next).forEach((key) => {
          const details = next[key]?.data;
          if (String(getTransactionId(details)) === String(txId)) {
            next[key] = {
              ...next[key],
              data: { ...details, txn_status: status, status }
            };
          }
        });
        return next;
      });
    },
    [onUpdateStatus]
  );

  const getDetailProps = useCallback(
    (transaction, rowKey) => {
      const detailState = detailsByTxnId[String(rowKey)] ?? {};
      return {
        transaction: mergeTransactionDetails(transaction, detailState.data),
        loading: Boolean(detailState.loading),
        error: detailState.error ?? "",
        onRetry: () => loadTransactionDetails(transaction, rowKey, true),
        onUpdateStatus: updateExpandedTransactionStatus
      };
    },
    [detailsByTxnId, loadTransactionDetails, updateExpandedTransactionStatus]
  );

  const filteredTransactions = useMemo(() => {
    const searchText = query.trim().toLowerCase();
    if (!searchText) return transactions;

    return transactions.filter((transaction) =>
      [
        transaction.txn_id,
        transaction.txn_type,
        transaction.txn_invoice,
        transaction.txn_receipt,
        transaction.txn_card_id,
        transaction.txn_card_uid,
        transaction.txn_device_print_id,
        transaction.txn_mode,
        transaction.txn_mode_info,
        transaction.txn_mobile,
        transaction.stall_name,
        transaction.vendor_name,
        transaction.event_name,
        transaction.txn_status
      ]
        .map((value) => cleanText(value, ""))
        .join(" ")
        .toLowerCase()
        .includes(searchText)
    );
  }, [query, transactions]);

  return (
    <section className="mt-3 rounded-xl border border-(--line) border-l-[4px] border-l-[#E04420] bg-(--surface) shadow-[0_16px_45px_rgba(15,23,42,0.08)] max-[640px]:rounded-lg">
      <div className="flex flex-col gap-3 border-b border-(--line2) px-4 py-3 md:flex-row md:items-center md:justify-between max-[640px]:px-3 max-[640px]:py-2.5">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-(--orange)">Transaction Results</p>
          <h3 className="mt-1 text-[1rem] font-semibold text-(--text) max-[640px]:text-[0.9rem]">
            {filteredTransactions.length} listed
          </h3>
        </div>
        <label className="flex h-10 min-w-[320px] items-center gap-3 rounded-lg border border-(--line) bg-(--surface) px-3 shadow-[0_8px_18px_rgba(15,23,42,0.035)] focus-within:border-(--orange) focus-within:shadow-[0_0_0_3px_rgba(224,68,32,0.12)] max-[640px]:h-9 max-[640px]:min-w-0 max-[640px]:w-full">
          <SearchIcon className="h-4 w-4 text-(--faint)" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search transactions"
            className="min-w-0 flex-1 bg-transparent text-[0.78rem] font-medium text-(--text) outline-none placeholder:text-(--faint) max-[640px]:text-[0.68rem]"
          />
        </label>
      </div>

      {filteredTransactions.length ? (
        <>
          <div className="overflow-x-auto max-[760px]:hidden">
            <table className="min-w-[1180px] w-full border-collapse">
              <thead>
                <tr className="text-left">
                  <th className="w-12 border-b border-(--line2) px-4 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-(--orange)" />
                  {["Type", "Txn ID | Ref", "Vendor | Stall", "Device", "Card ID", "Txn Counter", "Mode", "Amount", "Time"].map((heading) => (
                    <th key={heading} className="border-b border-(--line2) px-4 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-(--orange)">
                      <span className="inline-flex items-center gap-2">
                        {heading}
                        <SortIcon />
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction, index) => {
                  const rowKey = transaction.txn_id ?? `${transaction.txn_receipt}-${index}`;
                  const isOpen = expandedTxnId === rowKey;
                  return (
                    <Fragment key={rowKey}>
                      <tr
                        onClick={() => toggleTransactionDetails(transaction, rowKey)}
                        className="cursor-pointer align-middle transition hover:bg-[rgba(224,68,32,0.06)]"
                      >
                        <td className="border-b border-(--line2) px-4 py-3">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleTransactionDetails(transaction, rowKey);
                            }}
                            className="grid h-8 w-8 place-items-center rounded-md text-(--muted) hover:bg-(--surface2) hover:text-(--orange)"
                            aria-label={isOpen ? "Hide transaction details" : "Show transaction details"}
                          >
                            <ChevronIcon open={isOpen} />
                          </button>
                        </td>
                        <td className="border-b border-(--line2) px-4 py-3">
                          <span className="text-[0.82rem] font-bold text-(--blue)">{normalizeTxnType(transaction.txn_type)}</span>
                        </td>
                        <td className="border-b border-(--line2) px-4 py-3">
                          <div className="text-[0.76rem] font-medium text-(--muted)">{cleanText(transaction.txn_id)}</div>
                          <div className="mt-1 text-[0.72rem] font-semibold text-(--orange)">{cleanText(transaction.txn_receipt)}</div>
                        </td>
                        <td className="border-b border-(--line2) px-4 py-3">
                          <div className="text-[0.76rem] font-semibold text-(--muted)">{cleanText(transaction.vendor_name)}</div>
                          <div className="mt-1 text-[0.76rem] font-semibold text-(--muted)">{cleanText(transaction.stall_name)}</div>
                        </td>
                        <td className="border-b border-(--line2) px-4 py-3 text-[0.76rem] font-medium text-(--muted)">
                          {cleanText(transaction.txn_device_print_id)}
                          {transaction.txn_app_version ? <span className="text-(--faint)"> | {transaction.txn_app_version}</span> : null}
                        </td>
                        <td className="border-b border-(--line2) px-4 py-3">
                          <div className="text-[0.9rem] font-medium text-(--muted)">{cleanText(transaction.txn_card_id)}</div>
                          <div className="mt-1 text-[0.72rem] font-medium text-(--muted) underline">{cleanText(transaction.txn_card_uid)}</div>
                        </td>
                        <td className="border-b border-(--line2) px-4 py-3">
                          <div className="text-[0.76rem] font-medium text-(--muted)">{cleanText(transaction.txn_counter)}</div>
                          <div className="mt-1 text-[0.72rem] font-medium text-(--muted) underline">{cleanText(transaction.txn_invoice)}</div>
                        </td>
                        <td className="border-b border-(--line2) px-4 py-3">
                          <div className="text-[0.72rem] font-medium uppercase text-(--faint)">{cleanText(transaction.txn_mode)}</div>
                          <div className="mt-1 text-[0.74rem] font-medium text-(--muted)">{cleanText(transaction.txn_mode_info)}</div>
                        </td>
                        <td className="border-b border-(--line2) px-4 py-3 text-[0.8rem] font-semibold text-(--muted)">
                          {formatMoney(transaction.txn_amount)}
                        </td>
                        <td className="border-b border-(--line2) px-4 py-3">
                          <span className={`text-[0.72rem] font-bold uppercase ${getTxnStatusClass(transaction.txn_status)}`}>
                            {cleanText(transaction.txn_status)}
                          </span>
                          <div className="mt-1 text-[0.72rem] font-medium text-(--muted)">{formatTxnDate(transaction.txn_at ?? transaction.txn_created_at ?? transaction.txn_updated_at)}</div>
                        </td>
                      </tr>
                      {isOpen ? <TransactionDetailRow {...getDetailProps(transaction, rowKey)} /> : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="hidden divide-y divide-[#eef0f4] max-[760px]:block">
            {filteredTransactions.map((transaction, index) => {
              const rowKey = transaction.txn_id ?? `${transaction.txn_receipt}-${index}`;
              const isOpen = expandedTxnId === rowKey;
              return (
                <article key={rowKey} className="p-3">
                  <button
                    type="button"
                    onClick={() => toggleTransactionDetails(transaction, rowKey)}
                    className="flex w-full items-start justify-between gap-3 text-left"
                  >
                    <div>
                      <p className="text-[0.78rem] font-bold text-(--blue)">{normalizeTxnType(transaction.txn_type)}</p>
                      <p className="mt-1 text-[0.72rem] font-semibold text-(--text)">#{cleanText(transaction.txn_id)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[0.74rem] font-bold text-(--text)">{formatMoney(transaction.txn_amount)}</p>
                      <p className={`mt-1 text-[0.62rem] font-bold uppercase ${getTxnStatusClass(transaction.txn_status)}`}>
                        {cleanText(transaction.txn_status)}
                      </p>
                    </div>
                  </button>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[0.68rem]">
                    <div>
                      <span className="block font-semibold uppercase tracking-[0.06em] text-(--faint)">Vendor</span>
                      <span className="font-semibold text-(--muted)">{cleanText(transaction.vendor_name)}</span>
                    </div>
                    <div>
                      <span className="block font-semibold uppercase tracking-[0.06em] text-(--faint)">Stall</span>
                      <span className="font-semibold text-(--muted)">{cleanText(transaction.stall_name)}</span>
                    </div>
                    <div>
                      <span className="block font-semibold uppercase tracking-[0.06em] text-(--faint)">Device</span>
                      <span className="font-semibold text-(--muted)">{cleanText(transaction.txn_device_print_id)}</span>
                    </div>
                    <div>
                      <span className="block font-semibold uppercase tracking-[0.06em] text-(--faint)">Time</span>
                      <span className="font-semibold text-(--muted)">{formatTxnDate(transaction.txn_at ?? transaction.txn_created_at ?? transaction.txn_updated_at)}</span>
                    </div>
                  </div>
                  {isOpen ? (
                    <div className="mt-3 rounded-lg border border-(--line2) bg-(--surface2) p-3 text-[0.68rem]">
                      <TransactionDetailContent {...getDetailProps(transaction, rowKey)} />
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </>
      ) : (
        <div className="px-4 py-8 text-center text-[0.82rem] font-medium text-(--faint) max-[640px]:px-3 max-[640px]:py-6 max-[640px]:text-[0.68rem]">
          No transactions found for this search.
        </div>
      )}
    </section>
  );
}

export function DownloadDumpButton({ variant = "light" }) {
  const isDark = variant === "dark";
  return (
    <button
      type="button"
      className={`inline-flex h-10 items-center justify-center gap-3 rounded-lg px-5 text-[0.86rem] font-semibold shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition duration-200 max-[640px]:h-9 max-[640px]:gap-2 max-[640px]:px-3 max-[640px]:text-[0.72rem] ${
        isDark
          ? "bg-(--text) text-(--bg) hover:bg-(--orange)"
          : "border border-(--line) bg-(--surface) text-(--text) hover:border-(--orange) hover:text-(--orange)"
      }`}
    >
      <DownloadIcon />
      Download Dump
    </button>
  );
}

export default function TransactionFilters() {
  const token = useDashboardStore((state) => state.token);
  const eventMeta = useDashboardStore((state) => state.eventMeta);
  const eventDetails = useDashboardStore((state) => state.eventDetails);
  const cachedVendors = useDashboardStore((state) => state.vendorsByEventId?.[eventMeta?.eventId ?? eventDetails?.id]);
  const cachedStalls = useDashboardStore((state) => state.stallsByEventId?.[eventMeta?.eventId ?? eventDetails?.id]);
  const setVendorsForEvent = useDashboardStore((state) => state.setVendorsForEvent);
  const setStallsForEvent = useDashboardStore((state) => state.setStallsForEvent);
  const eventId = eventMeta?.eventId ?? eventDetails?.id;
  const eventName = eventDetails?.name ?? eventMeta?.eventName ?? eventMeta?.name ?? "Selected Event";
  const today = useMemo(() => todayDateValue(), []);
  const [filterEnabled, setFilterEnabled] = useState({
    dates: false,
    type: false,
    status: false,
    vendor: false,
    stall: false,
    cardId: false,
    receipt: false,
    device: false,
    txnId: false,
    mobile: false
  });
  const [range, setRange] = useState({
    startDate: today,
    startTime: "00:00:00",
    endDate: today,
    endTime: "00:00:00"
  });
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [stallId, setStallId] = useState("");
  const [mobile, setMobile] = useState("");
  const [cardId, setCardId] = useState("");
  const [txnId, setTxnId] = useState("");
  const [receipt, setReceipt] = useState("");
  const [device, setDevice] = useState("");
  const [vendors, setVendors] = useState(() => cachedVendors || []);
  const [stalls, setStalls] = useState(() => cachedStalls || []);
  const [loadingLists, setLoadingLists] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [filterError, setFilterError] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);

  const setFilterFlag = useCallback((key, value) => {
    setFilterEnabled((current) => ({ ...current, [key]: value }));
  }, []);

  const loadFilterLists = useCallback(async () => {
    if (!eventId) {
      setVendors([]);
      setStalls([]);
      return;
    }

    if (cachedVendors?.length) setVendors(cachedVendors);
    if (cachedStalls?.length) setStalls(cachedStalls);

    setLoadingLists(true);
    try {
      const [vendorList, stallList] = await Promise.all([
        cachedVendors?.length ? Promise.resolve(cachedVendors) : fetchVendors({ eventId, token }),
        cachedStalls?.length ? Promise.resolve(cachedStalls) : fetchStalls({ eventId, token })
      ]);
      const normalizedVendors = Array.isArray(vendorList) ? vendorList : [];
      const normalizedStalls = Array.isArray(stallList) ? stallList : [];
      setVendors(normalizedVendors);
      setStalls(normalizedStalls);
      setVendorsForEvent(eventId, normalizedVendors);
      setStallsForEvent(eventId, normalizedStalls);
    } catch (error) {
      console.error("Failed to load transaction filters", error);
    } finally {
      setLoadingLists(false);
    }
  }, [cachedStalls, cachedVendors, eventId, setStallsForEvent, setVendorsForEvent, token]);

  useEffect(() => {
    loadFilterLists();
  }, [loadFilterLists]);

  const vendorOptions = useMemo(
    () => [
      { label: loadingLists ? "Loading vendors..." : "Select Vendor", value: "" },
      ...vendors.map((vendor) => ({
        label: getVendorName(vendor),
        value: String(getVendorId(vendor))
      }))
    ],
    [loadingLists, vendors]
  );

  const stallOptions = useMemo(
    () => [
      { label: loadingLists ? "Loading stalls..." : "Select Stall", value: "" },
      ...stalls.map((stall) => ({
        label: getStallName(stall),
        value: String(getStallId(stall))
      }))
    ],
    [loadingLists, stalls]
  );

  const buildFilterPayload = useCallback(() => {
    const startIso = toPayloadIsoDate(range.startDate, range.startTime);
    const endIso = toPayloadIsoDate(range.endDate, range.endTime);
    const dates = filterEnabled.dates && startIso ? [startIso, startIso] : [];
    const dates2 = filterEnabled.dates && endIso ? [endIso, endIso] : [];

    return {
      cardId: filterEnabled.cardId ? cardId.trim() : "",
      mobile: filterEnabled.mobile ? mobile.trim() : "",
      receipt: filterEnabled.receipt ? receipt.trim() : "",
      dates,
      dates2,
      type: filterEnabled.type ? type : "",
      status: filterEnabled.status ? status : "",
      device: filterEnabled.device ? device.trim() : "",
      txnId: filterEnabled.txnId ? txnId.trim() : "",
      settings: {
        event: true,
        details: false,
        cardId: filterEnabled.cardId,
        mobile: filterEnabled.mobile,
        receipt: filterEnabled.receipt,
        dates: filterEnabled.dates,
        type: filterEnabled.type,
        status: filterEnabled.status,
        stall: filterEnabled.stall,
        vendor: filterEnabled.vendor,
        device: filterEnabled.device,
        txnId: filterEnabled.txnId
      },
      event: toPayloadNumber(eventId),
      vendor: filterEnabled.vendor ? toPayloadNumber(vendorId) : "",
      stall: filterEnabled.stall ? toPayloadNumber(stallId) : ""
    };
  }, [cardId, device, eventId, filterEnabled, range, receipt, stallId, status, txnId, type, vendorId]);

  const handleApplyFilters = useCallback(async () => {
    if (!eventId) {
      setFilterError("Select an event before applying transaction filters.");
      return;
    }

    setIsFiltering(true);
    setFilterError("");

    try {
      const data = await filterEventTransactions({ token, payload: buildFilterPayload() });
      const list = data?.transactions ?? data?.data?.transactions ?? data?.data ?? data?.list ?? data?.rows ?? [];
      setTransactions(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Failed to filter transactions", error);
      setTransactions([]);
      setFilterError("Unable to load transactions for selected filters.");
    } finally {
      setIsFiltering(false);
    }
  }, [buildFilterPayload, eventId, token]);

  const handleUpdateTransactionStatus = useCallback(
    async ({ txId, status: nextStatus }) => {
      await updateEventTransactionStatus({
        token,
        txId,
        status: nextStatus,
        reason: `aml ${nextStatus}`
      });

      setTransactions((current) =>
        current.map((transaction) => {
          const transactionId = transaction.txn_id ?? transaction.txId ?? transaction.id;
          return String(transactionId) === String(txId)
            ? { ...transaction, txn_status: nextStatus }
            : transaction;
        })
      );
    },
    [token]
  );

  return (
    <>
      <section className="rounded-xl border border-(--line) border-l-[4px] border-l-[#E04420] bg-(--surface) p-4 shadow-[0_18px_52px_rgba(15,23,42,0.09)] max-[640px]:rounded-lg max-[640px]:p-3">
        <div className="flex flex-col gap-3 border-b border-(--line) pb-3 lg:flex-row lg:items-center lg:justify-between max-[640px]:gap-2 max-[640px]:pb-2.5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[linear-gradient(135deg,#E04420_0%,#A9379E_48%,#341CD6_100%)] text-[0.8rem] font-bold text-white shadow-[0_10px_22px_rgba(52,28,214,0.20)] max-[640px]:h-7 max-[640px]:w-7 max-[640px]:text-[0.66rem]">
              01
            </span>
            <h2 className="text-[1.05rem] font-semibold text-(--text) max-[640px]:text-[0.95rem]">Filter</h2>
          </div>

          <div className="inline-flex h-10 items-center gap-3 rounded-full border border-(--line) bg-(--surface) px-5 shadow-[0_8px_18px_rgba(15,23,42,0.04)] max-[640px]:h-8 max-[640px]:gap-2 max-[640px]:px-3">
            <EventIcon />
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.08em] text-(--muted) max-[640px]:text-[0.56rem]">
              Event
            </span>
            <span className="max-w-[220px] truncate text-[0.8rem] font-bold uppercase text-(--text) max-[640px]:max-w-[150px] max-[640px]:text-[0.66rem]">
              {eventName}
            </span>
          </div>
        </div>

        <div className="pt-4 max-[640px]:pt-3">
          <DateRangeField
            enabled={filterEnabled.dates}
            onEnabledChange={(value) => setFilterFlag("dates", value)}
            range={range}
            onChange={setRange}
          />
          <div className="mt-3 grid gap-3 lg:grid-cols-2 max-[640px]:gap-2">
            <SelectField
              label="Type"
              value={type}
              onChange={setType}
              enabled={filterEnabled.type}
              onEnabledChange={(value) => setFilterFlag("type", value)}
              options={[{ label: "Select Type", value: "" }, ...TRANSACTION_TYPES]}
            />
            <SelectField
              label="Status"
              value={status}
              onChange={setStatus}
              enabled={filterEnabled.status}
              onEnabledChange={(value) => setFilterFlag("status", value)}
              options={STATUS_OPTIONS}
            />
            <SelectField
              label="Vendors"
              value={vendorId}
              onChange={setVendorId}
              enabled={filterEnabled.vendor}
              onEnabledChange={(value) => setFilterFlag("vendor", value)}
              options={vendorOptions}
              disabled={!eventId}
            />
            <SelectField
              label="Stalls"
              value={stallId}
              onChange={setStallId}
              enabled={filterEnabled.stall}
              onEnabledChange={(value) => setFilterFlag("stall", value)}
              options={stallOptions}
              disabled={!eventId}
            />
            <InputField label="Mobile" value={mobile} onChange={setMobile} placeholder="Mobile" enabled={filterEnabled.mobile} onEnabledChange={(value) => setFilterFlag("mobile", value)} />
            <InputField label="Card ID" value={cardId} onChange={setCardId} placeholder="Card" enabled={filterEnabled.cardId} onEnabledChange={(value) => setFilterFlag("cardId", value)} />
            <InputField label="TXN-ID" value={txnId} onChange={setTxnId} placeholder="TXN-ID" enabled={filterEnabled.txnId} onEnabledChange={(value) => setFilterFlag("txnId", value)} />
            <InputField label="Receipt" value={receipt} onChange={setReceipt} placeholder="Receipt" enabled={filterEnabled.receipt} onEnabledChange={(value) => setFilterFlag("receipt", value)} />
            <InputField label="Device" value={device} onChange={setDevice} placeholder="Device" enabled={filterEnabled.device} onEnabledChange={(value) => setFilterFlag("device", value)} />
            <button
              type="button"
              onClick={handleApplyFilters}
              disabled={isFiltering}
              className="flex h-12 items-center justify-center gap-3 rounded-lg border border-(--orange) bg-[rgba(224,68,32,0.06)] px-5 text-[0.86rem] font-bold text-(--orange) shadow-[0_10px_22px_rgba(224,68,32,0.10)] transition duration-200 hover:bg-(--orange) hover:text-white disabled:cursor-not-allowed disabled:opacity-60 max-[640px]:h-9 max-[640px]:gap-2 max-[640px]:px-3 max-[640px]:text-[0.72rem]"
            >
              <SearchIcon />
              {isFiltering ? "Applying..." : "Apply Filters"}
            </button>
          </div>
          {filterError ? (
            <p className="mt-3 rounded-lg border border-[rgba(224,68,32,0.25)] bg-[rgba(224,68,32,0.06)] px-3 py-2 text-[0.72rem] font-semibold text-(--orange)">
              {filterError}
            </p>
          ) : null}
        </div>
      </section>

      <TransactionResults
        transactions={transactions}
        token={token}
        onUpdateStatus={handleUpdateTransactionStatus}
      />
    </>
  );
}
