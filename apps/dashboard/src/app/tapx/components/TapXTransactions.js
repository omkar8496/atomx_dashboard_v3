"use client";

import { useCallback, useMemo, useState } from "react";
import {
  fetchTapXWalletCardList,
  filterEventTransactions
} from "../../../lib/dashboardApi";
import { useDashboardStore } from "../../../store/dashboardStore";

const FIELDS = [
  { key: "order", label: "ORDER ID", placeholder: "ORDER ID" },
  { key: "card", label: "CARD ID", placeholder: "CARD ID" },
  { key: "mobile", label: "MOBILE", placeholder: "MOBILE" },
  { key: "email", label: "EMAIL", placeholder: "EMAIL" }
];

const EMPTY_FILTERS = { order: "", card: "", mobile: "", email: "" };

const TABS = [
  { id: "tapx", label: "TapX Transactions" },
  { id: "wallet", label: "Wallet" }
];

const HERO_COPY = {
  tapx: {
    title: "TapX Transactions",
    subtitle: "Trace any tap by order, card, mobile or email"
  },
  wallet: {
    title: "Wallet",
    subtitle: "View wallet balances, top-ups and adjustments"
  }
};

function toPayloadNumber(value) {
  if (value === "" || value == null) return "";
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? value : numberValue;
}

function cleanText(value, fallback = "-") {
  if (value === "" || value == null) return fallback;
  const text = String(value).trim();
  return text || fallback;
}

function formatAmount(value) {
  if (value === "" || value == null) return "—";
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return `₹ ${value}`;
  return `₹ ${numberValue.toLocaleString("en-IN")}`;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatTxnDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function statusTheme(value) {
  const status = String(value || "").trim().toLowerCase();
  if (status === "completed" || status === "success") {
    return { label: "SUCCESS", fg: "#0e8f62", bg: "rgba(14,143,98,0.1)" };
  }
  if (status.includes("pending")) {
    return { label: "PENDING", fg: "#e08a20", bg: "rgba(224,138,32,0.12)" };
  }
  return { label: status ? status.toUpperCase() : "FAILED", fg: "#e04420", bg: "rgba(224,68,32,0.1)" };
}

const AVATARS = [
  "linear-gradient(140deg,#341cd6,#00a9f2)",
  "linear-gradient(140deg,#e04420,#8b5cf6)",
  "linear-gradient(140deg,#8b5cf6,#341cd6)",
  "linear-gradient(140deg,#1c1c1c,#e04420)"
];

function getTxnValue(txn, ...keys) {
  for (const key of keys) {
    const value = txn?.[key];
    if (value !== "" && value != null) return value;
  }
  return null;
}

function TapIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="6.2" cy="8" r="1.2" fill="currentColor" stroke="none" />
      <path d="M8.8 5.4a3.7 3.7 0 0 1 0 5.2M11 3.2a6.8 6.8 0 0 1 0 9.6" />
    </svg>
  );
}

export default function TapXTransactions() {
  const token = useDashboardStore((state) => state.token);
  const eventMeta = useDashboardStore((state) => state.eventMeta);
  const eventDetails = useDashboardStore((state) => state.eventDetails);
  const eventId = eventMeta?.eventId ?? eventDetails?.id;
  const eventName = eventDetails?.name ?? eventMeta?.eventName ?? eventMeta?.name ?? "Selected Event";

  const [view, setView] = useState("tapx");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState(null);

  const setField = (key) => (event) =>
    setFilters((current) => ({ ...current, [key]: event.target.value }));

  const handleViewChange = useCallback(
    (nextView) => {
      setView(nextView);

      if (nextView === "wallet") {
        fetchTapXWalletCardList({ token }).catch((walletError) => {
          console.error("Failed to load TapX wallet cards", walletError);
        });
      }
    },
    [token]
  );

  const runSearch = useCallback(async () => {
    if (!eventId) {
      setError("Select an event before searching transactions.");
      return;
    }
    const order = filters.order.trim();
    const card = filters.card.trim();
    const mobile = filters.mobile.trim();
    const email = filters.email.trim().toLowerCase();

    setLoading(true);
    setError("");
    try {
      const payload = {
        cardId: card,
        mobile,
        receipt: "",
        dates: [],
        dates2: [],
        type: "",
        status: "",
        device: "",
        txnId: order,
        settings: {
          event: true,
          details: false,
          cardId: Boolean(card),
          mobile: Boolean(mobile),
          receipt: false,
          dates: false,
          type: false,
          status: false,
          stall: false,
          vendor: false,
          device: false,
          txnId: Boolean(order)
        },
        event: toPayloadNumber(eventId),
        vendor: "",
        stall: ""
      };
      const data = await filterEventTransactions({ token, payload });
      const list = data?.transactions ?? data?.data?.transactions ?? data?.data ?? data?.list ?? data?.rows ?? [];
      let rows = Array.isArray(list) ? list : [];
      // EMAIL is not a server-side filter — narrow client-side when provided.
      if (email) {
        rows = rows.filter((txn) =>
          Object.values(txn || {})
            .map((value) => String(value ?? "").toLowerCase())
            .some((value) => value.includes(email))
        );
      }
      setResults(rows);
    } catch (searchError) {
      console.error("Failed to search TapX transactions", searchError);
      setResults([]);
      setError("Unable to load transactions for this search.");
    } finally {
      setLoading(false);
    }
  }, [eventId, filters, token]);

  const handleReset = () => {
    setFilters(EMPTY_FILTERS);
    setResults(null);
    setError("");
  };

  const rows = results ?? [];
  const isEmpty = rows.length === 0;

  const displayRows = useMemo(
    () =>
      rows.map((txn, index) => {
        const theme = statusTheme(getTxnValue(txn, "txn_status", "status"));
        return {
          key: getTxnValue(txn, "txn_id", "txId", "id") ?? index,
          order: cleanText(getTxnValue(txn, "txn_id", "txId", "id")),
          amount: formatAmount(getTxnValue(txn, "txn_amount", "amount")),
          avatar: AVATARS[index % AVATARS.length],
          theme,
          fields: [
            { k: "CARD ID", v: cleanText(getTxnValue(txn, "txn_card_id", "cardId", "card_id")) },
            { k: "MOBILE", v: cleanText(getTxnValue(txn, "txn_mobile", "mobile")) },
            { k: "EMAIL", v: cleanText(getTxnValue(txn, "txn_email", "email", "txn_mail")) },
            { k: "TIME", v: formatTxnDate(getTxnValue(txn, "txn_at", "txn_created_at", "txn_updated_at")) }
          ]
        };
      }),
    [rows]
  );

  return (
    <>
      <style>{`@keyframes atxTapIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>

      {/* Hero */}
      <div
        className="relative overflow-hidden px-[clamp(16px,2.4vw,28px)] pb-[clamp(58px,6vw,78px)] pt-[clamp(20px,3vw,34px)]"
        style={{ background: "linear-gradient(120deg,#1C1C1C 0%,#341CD6 62%,#E04420 130%)" }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{ background: "repeating-linear-gradient(90deg,#fff 0 1px,transparent 1px 46px)" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-[1400px]">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="font-vcr text-[9.5px] tracking-[0.2em] text-white/70">CASHLESS PAYMENTS</div>
              <h1 className="font-chillax mt-2 text-[clamp(26px,3.6vw,42px)] font-semibold leading-[1.03] tracking-[-0.02em] text-white">
                {HERO_COPY[view].title}
              </h1>
              <div className="mt-1.5 text-[13px] font-light text-white/70">
                {HERO_COPY[view].subtitle} — {eventName}.
              </div>
            </div>
            <div className="font-chillax text-[clamp(34px,6vw,64px)] font-bold leading-[0.8] tracking-[-0.03em] text-white/15">
              {eventId ? `#${eventId}` : "—"}
            </div>
          </div>

          <div className="mt-5 inline-flex gap-1 rounded-full border border-white/15 bg-white/10 p-1 backdrop-blur">
            {TABS.map((tab) => {
              const active = view === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleViewChange(tab.id)}
                  aria-pressed={active}
                  className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${
                    active ? "bg-white text-[#1c1c1c]" : "text-white/70 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="relative z-[1] mx-auto max-w-[1400px] px-[clamp(16px,2.4vw,28px)] pb-24">
        {view === "tapx" ? (
        <>
        {/* Filter card */}
        <div className="-mt-[clamp(38px,4.4vw,54px)] rounded-[16px] border border-(--line) bg-(--surface) p-[clamp(16px,2vw,22px)] shadow-(--shadowUp)">
          <div className="font-vcr text-[10px] tracking-[0.16em] text-(--muted)">FILTER</div>

          <div className="mt-3 grid grid-cols-1 gap-[clamp(12px,1.4vw,16px)] md:grid-cols-4">
            {FIELDS.map((field) => (
              <div key={field.key} className="min-w-0">
                <label className="font-vcr mb-[7px] block text-[8.5px] tracking-[0.16em] text-(--muted)">
                  {field.label}
                </label>
                <input
                  value={filters[field.key]}
                  onChange={setField(field.key)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") runSearch();
                  }}
                  placeholder={field.placeholder}
                  className="h-[46px] w-full rounded-[10px] border border-(--line) bg-(--surface) px-3.5 text-[13.5px] text-(--text) outline-none transition placeholder:text-(--faint) focus:border-(--orange) focus:shadow-[0_0_0_3px_rgba(224,68,32,0.12)]"
                />
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleReset}
              className="flex h-11 items-center justify-center rounded-[10px] border border-(--line) bg-(--surface) px-[22px] text-[13.5px] font-semibold text-(--muted) transition hover:border-(--orange) hover:text-(--orange)"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={runSearch}
              disabled={loading}
              className="flex h-11 items-center justify-center gap-2 rounded-[10px] bg-(--text) px-[26px] text-[13.5px] font-semibold text-(--bg) transition hover:bg-(--orange) disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/35 border-t-white" />
              ) : (
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <circle cx="7" cy="7" r="4.6" />
                  <path d="M10.5 10.5 14 14" />
                </svg>
              )}
              <span>Search</span>
            </button>
          </div>

          {error ? (
            <p className="mt-3 rounded-[10px] border border-[rgba(224,68,32,0.25)] bg-[rgba(224,68,32,0.06)] px-3 py-2 text-[12px] font-semibold text-(--orange)">
              {error}
            </p>
          ) : null}
        </div>

        {/* Results */}
        <section className="mt-[clamp(16px,2vw,22px)] overflow-hidden rounded-[16px] border border-(--line) bg-(--surface) shadow-(--shadow)">
          <div className="flex items-center gap-3 border-b border-(--line2) px-4 py-[14px]">
            <div className="font-vcr whitespace-nowrap text-[11px] tracking-[0.14em] text-(--muted)">
              RESULTS ( {rows.length} )
            </div>
          </div>

          <div className="flex min-h-[300px] flex-col">
            {isEmpty ? (
              <div className="flex min-h-[300px] flex-1 flex-col items-center justify-center gap-3 px-5 py-9 text-center">
                <span className="grid h-[54px] w-[54px] place-items-center rounded-[15px] border border-dashed border-(--line) text-(--faint)">
                  <TapIcon className="h-[22px] w-[22px]" />
                </span>
                <div className="font-chillax text-[17px] font-medium text-(--text)">
                  {results === null ? "No search yet" : "No matching transaction"}
                </div>
                <div className="max-w-[320px] text-[12.5px] text-(--faint)">
                  {results === null
                    ? "Fill any filter above and hit Search — matching taps will appear here."
                    : "Check the order ID or try another filter combination."}
                </div>
              </div>
            ) : (
              displayRows.map((row, index) => (
                <div
                  key={row.key}
                  className="flex flex-wrap items-center gap-[13px] border-b border-(--line2) px-4 py-3 transition-colors last:border-b-0 hover:bg-(--surface2)"
                  style={{ animation: "atxTapIn 0.3s both", animationDelay: `${index * 0.035}s` }}
                >
                  <span className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[11px] text-white" style={{ background: row.avatar }}>
                    <TapIcon />
                  </span>

                  <div className="min-w-0 flex-[1_1_140px]">
                    <div className="font-vcr text-[7.5px] tracking-[0.15em] text-(--faint)">ORDER ID</div>
                    <div className="font-vcr mt-0.5 truncate text-[13px] text-(--orange)">{row.order}</div>
                  </div>

                  {row.fields.map((field) => (
                    <div key={field.k} className="min-w-0 flex-[1_1_120px]">
                      <div className="font-vcr text-[7.5px] tracking-[0.15em] text-(--faint)">{field.k}</div>
                      <div className="mt-0.5 truncate text-[13.5px] font-semibold">{field.v}</div>
                    </div>
                  ))}

                  <div className="min-w-0 flex-[1_1_90px]">
                    <div className="font-vcr text-[7.5px] tracking-[0.15em] text-(--faint)">AMOUNT</div>
                    <div className="font-vcr mt-0.5 whitespace-nowrap text-[14px]">{row.amount}</div>
                  </div>

                  <div
                    className="flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5"
                    style={{ color: row.theme.fg, background: row.theme.bg }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    <span className="font-vcr text-[9px] tracking-[0.12em]">{row.theme.label}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
        </>
        ) : (
          <div className="-mt-[clamp(38px,4.4vw,54px)] rounded-[16px] border border-(--line) bg-(--surface) p-[clamp(16px,2vw,22px)] shadow-(--shadowUp)">
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 py-12 text-center">
              <span className="grid h-[54px] w-[54px] place-items-center rounded-[15px] border border-dashed border-(--line) text-(--faint)">
                <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="6" width="18" height="12" rx="2" />
                  <path d="M3 10h18" />
                  <path d="M16.5 14h.5" />
                </svg>
              </span>
              <div className="font-chillax text-[19px] font-medium text-(--text)">Wallet</div>
              <div className="max-w-[360px] text-[12.5px] text-(--faint)">
                Wallet balances, top-ups and adjustments will appear here.
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
