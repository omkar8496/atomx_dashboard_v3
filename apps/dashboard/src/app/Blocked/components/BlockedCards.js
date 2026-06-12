"use client";

import { useMemo, useState } from "react";

const BLOCKED_CARDS = [
  { id: 1, cardId: "24", status: "ACTIVE" },
  { id: 2, cardId: "240060131", status: "ACTIVE" },
  { id: 3, cardId: "111111", status: "ACTIVE" },
  { id: 4, cardId: "99889988", status: "ACTIVE" }
];

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

function BlockedCard({ item }) {
  return (
    <article className="min-h-[126px] rounded-lg border border-[#efb9d9] bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.035)] transition duration-200 hover:-translate-y-0.5 hover:border-[#ded4ff] hover:shadow-[0_16px_30px_rgba(52,28,214,0.09)]">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[0.8rem] font-bold text-[#E04420]">#{item.id}</span>
        <span className="rounded-full bg-[#e4f6ff] px-2.5 py-1 text-[0.62rem] font-bold uppercase text-[#0285bf]">
          {item.status}
        </span>
      </div>

      <div className="mt-3">
        <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#929292]">
          Card ID
        </p>
        <p className="mt-1 text-[1.05rem] font-bold leading-tight text-[#202020]">
          {item.cardId}
        </p>
      </div>

      <button
        type="button"
        className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#1c1c1c] text-[0.74rem] font-bold text-white shadow-[0_10px_20px_rgba(28,28,28,0.10)] transition duration-200 hover:bg-[#E04420]"
      >
        <LockIcon />
        Unblock
      </button>
    </article>
  );
}

export default function BlockedCards() {
  const [query, setQuery] = useState("");

  const filteredCards = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return BLOCKED_CARDS;

    return BLOCKED_CARDS.filter((item) =>
      [item.id, item.cardId, item.status].some((value) =>
        String(value).toLowerCase().includes(normalizedQuery)
      )
    );
  }, [query]);

  return (
    <section className="rounded-xl border border-[#ded4ff] border-l-[4px] border-l-[#E04420] bg-white p-4 shadow-[0_18px_52px_rgba(15,23,42,0.09)]">
      <div className="flex flex-col gap-3 border-b border-[#e5e5e5] pb-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[linear-gradient(135deg,#E04420_0%,#A9379E_48%,#341CD6_100%)] text-[0.82rem] font-bold text-white shadow-[0_10px_22px_rgba(52,28,214,0.20)]">
            4
          </span>
          <h2 className="text-[1.05rem] font-semibold text-[#1f1f1f]">Cards</h2>
        </div>

        <label className="flex h-9 w-full items-center gap-3 border-b border-[#cfcfcf] px-1 text-[#8f80ff] focus-within:border-[#E04420] lg:max-w-[720px]">
          <SearchIcon />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search Card"
            className="h-full min-w-0 flex-1 bg-transparent text-[0.84rem] font-normal text-[#1f2937] outline-none placeholder:text-[#8e98ad]"
          />
        </label>
      </div>

      <div className="grid gap-2.5 pt-3 sm:grid-cols-2 lg:grid-cols-4 xl:max-w-[960px]">
        {filteredCards.map((item) => (
          <BlockedCard key={item.cardId} item={item} />
        ))}
      </div>

      <div className="flex min-h-[92px] flex-col items-center justify-center gap-2 text-[#8b96aa]">
        <EmptyIcon />
        <p className="text-[0.82rem] font-normal">No more blocked IDs to show</p>
      </div>
    </section>
  );
}
