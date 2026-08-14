"use client";

import { useState } from "react";
import { useDashboardStore } from "../../../store/dashboardStore";
import {
  fetchAccessXWhitelistLogs,
  searchAccessXWhitelist
} from "../../../lib/dashboardApi";

function SearchIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function CategoryIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 13 11 22l-9-9V2h11l7 7Z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </svg>
  );
}

function cleanValue(value, fallback = "-") {
  if (value === "" || value == null) return fallback;
  return String(value);
}

export default function WhitelistContent() {
  const token = useDashboardStore((state) => state.token);
  const eventMeta = useDashboardStore((state) => state.eventMeta);
  const eventDetails = useDashboardStore((state) => state.eventDetails);
  const eventId = eventMeta?.eventId ?? eventDetails?.id ?? null;
  const eventName =
    eventDetails?.name ??
    eventMeta?.eventName ??
    eventMeta?.name ??
    "Selected Event";
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const hasSearched = submittedQuery.trim().length > 0;

  const runSearch = async (value = query) => {
    const normalized = value.trim();
    setQuery(value);
    setSubmittedQuery(normalized);
    setSearchError("");

    if (!normalized) {
      setResults([]);
      return;
    }
    if (eventId === "" || eventId == null) {
      setSearchError("Event ID is unavailable.");
      return;
    }

    setSearching(true);
    try {
      const response = await searchAccessXWhitelist({
        eventId,
        search: normalized,
        token
      });
      const users = response?.users ?? response?.data?.users ?? [];
      setResults(Array.isArray(users) ? users : []);
    } catch (error) {
      console.error("Failed to search AccessX whitelist", error);
      setResults([]);
      setSearchError("Unable to search the whitelist.");
    } finally {
      setSearching(false);
    }
  };

  const loadHistory = async (whitelistUserId) => {
    try {
      await fetchAccessXWhitelistLogs({
        eventId,
        wid: whitelistUserId,
        token
      });
    } catch (error) {
      console.error("Failed to load AccessX whitelist history", error);
    }
  };

  return (
    <div className="ml-[60px] w-[calc(100vw-60px)] min-w-0 overflow-x-hidden max-[900px]:ml-0 max-[900px]:w-screen">
      <section className="relative overflow-hidden bg-[#241a57] px-6 pb-[72px] pt-8 md:px-8 md:pb-[82px] md:pt-9">
        <div
          className="pointer-events-none absolute inset-0 opacity-100"
          style={{
            background:
              "linear-gradient(115deg, #1c1c1c 0%, #341cd6 64%, #e04420 145%)"
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, #ffffff 0 1px, transparent 1px 46px)"
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto flex w-full max-w-[1400px] items-end justify-between gap-5">
          <div>
            <p className="whitelist-mono text-[0.64rem] uppercase tracking-[0.2em] text-white/65">
              Access Control
            </p>
            <h1 className="whitelist-display mt-2 text-[2.55rem] font-semibold leading-none text-white max-[640px]:text-[2rem]">
              Whitelist
            </h1>
            <p className="mt-3 text-[0.82rem] font-light text-white/70 max-[640px]:max-w-[280px] max-[640px]:text-[0.72rem]">
              Look up a guest and grant or revoke event access.
            </p>
          </div>
          <span className="whitelist-display text-[4rem] font-bold leading-none text-white/15 max-[640px]:text-[2.5rem]">
            {eventId ?? "-"}
          </span>
        </div>
      </section>

      <div className="relative mx-auto w-full max-w-[1448px] px-5 pb-14 md:px-7 max-[640px]:w-[calc(100vw-24px)] max-[640px]:max-w-[calc(100vw-24px)] max-[640px]:px-0">
        <section className="-mt-[48px] w-full max-w-[720px] rounded-lg border border-black/10 bg-white p-5 shadow-[0_20px_44px_-24px_rgba(28,28,28,0.45)] max-[640px]:-mt-[42px] max-[640px]:p-4">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              runSearch();
            }}
          >
            <div className="flex h-12 items-center gap-3 rounded-lg border border-[#dedddb] bg-[#f8f7f5] px-4 text-[#8c8b88] transition focus-within:border-[#b8aef7] focus-within:bg-white">
              <SearchIcon />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search"
                className="h-full min-w-0 flex-1 border-0 bg-transparent text-[0.9rem] text-[#1c1c1c] outline-none placeholder:text-[#8f8e8b]"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setSubmittedQuery("");
                    setResults([]);
                    setSearchError("");
                  }}
                  className="grid h-7 w-7 place-items-center rounded-md text-[#969592] transition hover:bg-black/5 hover:text-[#1c1c1c]"
                  aria-label="Clear whitelist search"
                >
                  <span className="text-lg leading-none">x</span>
                </button>
              ) : null}
            </div>

            <p className="whitelist-mono mt-2.5 text-[0.58rem] uppercase tracking-[0.13em] text-[#777672]">
              Search by name / booking ID / AWB / card ID
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <button
                type="submit"
                disabled={searching}
                className="h-10 rounded-md bg-[#1c1c1c] px-6 text-[0.78rem] font-semibold text-white transition hover:bg-[#e04420] disabled:cursor-wait disabled:opacity-60"
              >
                {searching ? "Searching..." : "Search"}
              </button>
              {["VIP", "CREW", "PENDING"].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => runSearch(filter)}
                  className="whitelist-mono h-9 rounded-md border border-[#dedddb] bg-white px-4 text-[0.58rem] uppercase tracking-[0.11em] text-[#777672] transition hover:border-[#e04420] hover:text-[#e04420]"
                >
                  {filter}
                </button>
              ))}
            </div>

            {searchError ? (
              <p className="mt-3 text-[0.68rem] font-medium text-[#e04420]" role="alert">
                {searchError}
              </p>
            ) : null}
          </form>
        </section>

        <section className="mt-5 overflow-hidden rounded-lg border border-black/10 bg-white shadow-[0_12px_32px_-24px_rgba(28,28,28,0.4)]">
          <header className="flex min-h-12 items-center gap-3 border-b border-black/[0.06] px-4 py-3">
            <span className="whitelist-mono text-[0.66rem] uppercase tracking-[0.14em] text-[#71706e]">
              Users ({results.length})
            </span>
            <span className="ml-auto max-w-[50%] truncate text-[0.7rem] font-semibold text-[#8b8a87] max-[640px]:hidden">
              {eventName}
            </span>
          </header>

          {results.length ? (
            <div className="grid grid-cols-1 gap-2.5 p-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-[640px]:p-2.5">
              {results.map((user, index) => {
                const name = cleanValue(user.name, "Unnamed guest");
                const bookingReference = cleanValue(user.bookingReference);
                const resultEventName = cleanValue(user.eventName, eventName);
                const pax = cleanValue(user.pax, "0");
                return (
                  <article
                    key={user.id ?? `${bookingReference}-${index}`}
                    className="overflow-hidden rounded-lg border border-[#e2e0dc] bg-[#fbfaf8] transition duration-200 hover:-translate-y-0.5 hover:border-[#cfc9f8] hover:shadow-[0_14px_28px_-22px_rgba(28,28,28,0.55)]"
                  >
                    <div className="flex items-start gap-2.5 border-b border-black/[0.06] p-2.5">
                      <div
                        className={`whitelist-display grid h-9 w-9 shrink-0 place-items-center rounded-md text-[0.78rem] font-semibold text-white ${
                          index % 2 ? "bg-[#341cd6]" : "bg-[#e04420]"
                        }`}
                      >
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-[0.78rem] font-semibold text-[#1c1c1c]">{name}</h2>
                        <p className="mt-0.5 truncate text-[0.61rem] text-[#777672]">{resultEventName}</p>
                      </div>
                      <span className="whitelist-mono shrink-0 rounded-md bg-[#eeeafd] px-1.5 py-1 text-[0.46rem] uppercase tracking-[0.08em] text-[#341cd6]">
                        Total pax {pax}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-3 p-2.5">
                      <div className={user.courierBarcode ? "" : "col-span-2"}>
                        <p className="whitelist-mono text-[0.44rem] uppercase tracking-[0.12em] text-[#9b9a97]">Booking reference</p>
                        <p className="mt-0.5 truncate text-[0.65rem] font-semibold text-[#353535]">{bookingReference}</p>
                      </div>
                      {user.courierBarcode ? (
                        <div>
                          <p className="whitelist-mono text-[0.44rem] uppercase tracking-[0.12em] text-[#9b9a97]">Courier barcode</p>
                          <p className="mt-0.5 truncate text-[0.65rem] font-semibold text-[#353535]">{user.courierBarcode}</p>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex gap-1.5 border-t border-black/[0.06] p-2">
                      <button
                        type="button"
                        onClick={() => loadHistory(user.id)}
                        className="flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md border border-[#dedddb] bg-white px-2 text-[0.6rem] font-semibold text-[#555451] transition hover:border-[#341cd6] hover:text-[#341cd6]"
                      >
                        <HistoryIcon />
                        History
                      </button>
                      <button
                        type="button"
                        className="flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md bg-[#1c1c1c] px-2 text-[0.6rem] font-semibold text-white transition hover:bg-[#e04420]"
                      >
                        <CategoryIcon />
                        Category
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-[340px] flex-col items-center justify-center gap-3 px-5 py-10 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-lg border border-dashed border-[#d8d7d4] text-[#9b9a97]">
                <SearchIcon className="h-6 w-6" />
              </div>
              <h2 className="whitelist-display text-[1rem] font-semibold text-[#1c1c1c]">
                {hasSearched ? "No matching guest" : "Nothing searched yet"}
              </h2>
              <p className="max-w-[350px] text-[0.72rem] leading-5 text-[#9b9a97]">
                {hasSearched
                  ? "Check the spelling or try a booking ID instead."
                  : "Search a name, booking ID, AWB or card ID. Matching guests will appear here."}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
