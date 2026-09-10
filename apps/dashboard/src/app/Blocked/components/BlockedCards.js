"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchBlockedCards, unblockCard } from "../../../lib/dashboardApi";
import { useDashboardStore } from "../../../store/dashboardStore";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function EmptyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M7 7l10 10" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  );
}

function formatBlockedAt(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function normalizeCard(card, index) {
  return {
    key: card?.id ?? card?.cardId ?? index,
    id: card?.id ?? "-",
    cardId: card?.cardId ?? card?.card_id ?? "-",
    status: String(card?.status ?? "-"),
    blockedAt: card?.updatedAt ?? card?.createdAt ?? null
  };
}

function BlockedCard({ item, onUnblock, unblockingKey }) {
  const canUnblock =
    item.id !== "-" && item.id != null && item.cardId !== "-" && item.cardId != null;
  const isUnblocking = canUnblock && String(unblockingKey) === String(item.key);

  return (
    <article className="min-h-[126px] rounded-lg border border-[#efb9d9] bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.035)] transition duration-200 hover:-translate-y-0.5 hover:border-[#ded4ff] hover:shadow-[0_16px_30px_rgba(52,28,214,0.09)] max-[640px]:min-h-[108px] max-[640px]:p-2.5">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[0.8rem] font-bold text-[#E04420] max-[640px]:text-[0.68rem]">#{item.id}</span>
        <span className="rounded-full bg-[#e4f6ff] px-2.5 py-1 text-[0.62rem] font-bold uppercase text-[#0285bf] max-[640px]:px-2 max-[640px]:py-0.5 max-[640px]:text-[0.52rem]">
          {item.status}
        </span>
      </div>

      <div className="mt-3">
        <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#929292] max-[640px]:text-[0.52rem]">
          Card ID
        </p>
        <p className="mt-1 text-[1.05rem] font-bold leading-tight text-[#202020] max-[640px]:text-[0.86rem]">
          {item.cardId}
        </p>
        <p className="mt-1.5 text-[0.62rem] font-normal text-[#8b96aa] max-[640px]:text-[0.54rem]">
          {formatBlockedAt(item.blockedAt)}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onUnblock?.(item)}
        disabled={!canUnblock || Boolean(unblockingKey)}
        title={canUnblock ? `Unblock card ${item.cardId}` : "This record cannot be unblocked"}
        aria-label={canUnblock ? `Unblock card ${item.cardId}` : "Unblock unavailable"}
        className="mt-3 inline-flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#1c1c1c] text-[0.74rem] font-bold text-white shadow-[0_10px_20px_rgba(28,28,28,0.10)] transition duration-200 hover:bg-[#E04420] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:bg-[#1c1c1c] max-[640px]:mt-2 max-[640px]:h-8 max-[640px]:text-[0.64rem]"
      >
        {isUnblocking ? (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        ) : (
          <LockIcon />
        )}
        {isUnblocking ? "Unblocking..." : "Unblock"}
      </button>
    </article>
  );
}

export default function BlockedCards({ reloadKey = 0 }) {
  const token = useDashboardStore((state) => state.token);
  const eventMeta = useDashboardStore((state) => state.eventMeta);
  const eventDetails = useDashboardStore((state) => state.eventDetails);
  const eventId = eventMeta?.eventId ?? eventDetails?.id;

  const [query, setQuery] = useState("");
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unblockingKey, setUnblockingKey] = useState("");
  const [unblockError, setUnblockError] = useState("");

  const loadCards = useCallback(
    async ({ signal } = {}) => {
      if (eventId === "" || eventId == null) {
        setCards([]);
        setLoading(false);
        setError("Select an event to load its blocked cards.");
        return;
      }

      setLoading(true);
      setError("");
      try {
        const list = await fetchBlockedCards({ eventId, token });
        if (signal?.cancelled) return;
        setCards(Array.isArray(list) ? list.map(normalizeCard) : []);
      } catch (requestError) {
        console.error("Failed to load blocked cards", requestError);
        if (signal?.cancelled) return;
        setCards([]);
        setError(requestError?.message || "Unable to load blocked cards.");
      } finally {
        if (!signal?.cancelled) setLoading(false);
      }
    },
    [eventId, token]
  );

  useEffect(() => {
    const signal = { cancelled: false };
    loadCards({ signal });
    return () => {
      signal.cancelled = true;
    };
    // reloadKey changes after a card is blocked, forcing a refetch.
  }, [loadCards, reloadKey]);

  const handleUnblock = async (item) => {
    setUnblockingKey(String(item.key));
    setUnblockError("");
    try {
      const response = await unblockCard({
        eventId,
        cardId: item.cardId,
        id: item.id,
        token
      });
      if (response?.success === false) {
        throw new Error(response?.message || "Unable to unblock this card.");
      }
      // Drop it immediately, then reconcile with the API.
      setCards((current) => current.filter((card) => String(card.key) !== String(item.key)));
      await loadCards();
    } catch (requestError) {
      console.error("Failed to unblock card", requestError);
      setUnblockError(requestError?.message || "Unable to unblock this card.");
    } finally {
      setUnblockingKey("");
    }
  };

  const filteredCards = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return cards;

    return cards.filter((item) =>
      [item.id, item.cardId, item.status].some((value) =>
        String(value).toLowerCase().includes(normalizedQuery)
      )
    );
  }, [cards, query]);

  return (
    <section className="rounded-xl border border-[#ded4ff] border-l-[4px] border-l-[#E04420] bg-white p-4 shadow-[0_18px_52px_rgba(15,23,42,0.09)] max-[640px]:rounded-lg max-[640px]:p-3">
      <div className="flex flex-col gap-3 border-b border-[#e5e5e5] pb-3 lg:flex-row lg:items-center lg:justify-between max-[640px]:gap-2 max-[640px]:pb-2.5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[linear-gradient(135deg,#E04420_0%,#A9379E_48%,#341CD6_100%)] text-[0.82rem] font-bold text-white shadow-[0_10px_22px_rgba(52,28,214,0.20)] max-[640px]:h-7 max-[640px]:w-7 max-[640px]:text-[0.66rem]">
            {loading ? "-" : cards.length}
          </span>
          <h2 className="text-[1.05rem] font-semibold text-[#1f1f1f] max-[640px]:text-[0.95rem]">Cards</h2>
          <button
            type="button"
            onClick={() => loadCards()}
            disabled={loading || eventId === "" || eventId == null}
            title="Reload blocked cards"
            aria-label="Reload blocked cards"
            className="grid h-7 w-7 cursor-pointer place-items-center rounded-md border border-[#e5e5e5] text-[#8b96aa] transition hover:border-[#E04420] hover:text-[#E04420] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshIcon />
          </button>
        </div>

        <label className="flex h-9 w-full items-center gap-3 border-b border-[#cfcfcf] px-1 text-[#8f80ff] focus-within:border-[#E04420] lg:max-w-[720px] max-[640px]:gap-2">
          <SearchIcon />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search Card"
            className="h-full min-w-0 flex-1 bg-transparent text-[0.84rem] font-normal text-[#1f2937] outline-none placeholder:text-[#8e98ad] max-[640px]:text-[0.7rem]"
          />
        </label>
      </div>

      {unblockError ? (
        <p className="mt-3 rounded-md border border-[#f5c6ba] bg-[#fff4ef] px-3 py-2 text-[0.74rem] font-semibold text-[#E04420]">
          {unblockError}
        </p>
      ) : null}

      {loading ? (
        <div className="flex min-h-[132px] flex-col items-center justify-center gap-2 text-[#8b96aa]">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#ded4ff] border-t-[#E04420]" />
          <p className="text-[0.82rem] font-normal">Loading blocked cards...</p>
        </div>
      ) : error ? (
        <div className="flex min-h-[132px] flex-col items-center justify-center gap-2 px-4 text-center">
          <p className="text-[0.82rem] font-semibold text-[#E04420]">{error}</p>
          {eventId ? (
            <button
              type="button"
              onClick={() => loadCards()}
              className="mt-1 inline-flex h-8 cursor-pointer items-center rounded-md bg-[#1c1c1c] px-3 text-[0.72rem] font-bold text-white transition hover:bg-[#E04420]"
            >
              Retry
            </button>
          ) : null}
        </div>
      ) : filteredCards.length ? (
        <div className="grid gap-2.5 pt-3 sm:grid-cols-2 lg:grid-cols-4 xl:max-w-[960px] max-[640px]:grid-cols-2 max-[640px]:gap-2">
          {filteredCards.map((item) => (
            <BlockedCard
              key={item.key}
              item={item}
              onUnblock={handleUnblock}
              unblockingKey={unblockingKey}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[132px] flex-col items-center justify-center gap-2 text-[#8b96aa] max-[640px]:min-h-[92px]">
          <EmptyIcon />
          <p className="text-[0.82rem] font-normal max-[640px]:text-[0.68rem]">
            {cards.length
              ? "No blocked cards match this search."
              : "No blocked cards for this event."}
          </p>
        </div>
      )}
    </section>
  );
}
