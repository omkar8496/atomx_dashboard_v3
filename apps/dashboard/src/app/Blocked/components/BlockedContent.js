"use client";

import { useState } from "react";
import { useDashboardStore } from "../../../store/dashboardStore";
import BlockCardModal from "./BlockCardModal";
import BlockedCards from "./BlockedCards";

function LockIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export default function BlockedContent() {
  const token = useDashboardStore((state) => state.token);
  const eventMeta = useDashboardStore((state) => state.eventMeta);
  const eventDetails = useDashboardStore((state) => state.eventDetails);
  const eventId = eventMeta?.eventId ?? eventDetails?.id;
  const eventName = eventDetails?.name ?? eventMeta?.eventName ?? "";

  const [blockOpen, setBlockOpen] = useState(false);
  // Bumped after a successful block so the list re-fetches.
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <>
      <section className="mb-4 flex flex-col gap-4 border-b border-[#d8d8d8] pb-4 sm:flex-row sm:items-start sm:justify-between max-[640px]:mb-3 max-[640px]:gap-3 max-[640px]:pb-3">
        <div>
          <h1 className="text-[1.75rem] font-semibold leading-none text-[#111827] md:text-[1.9rem] max-[640px]:text-[1.25rem]">
            Blocked IDs
          </h1>
          <p className="mt-3 text-[0.9rem] font-normal text-[#777777] max-[640px]:mt-2 max-[640px]:text-[0.7rem]">
            Search, review, and unblock IDs for the active event.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setBlockOpen(true)}
          disabled={eventId === "" || eventId == null}
          title={eventId ? "Block a card ID" : "Select an event first"}
          className="inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 self-start rounded-lg bg-[#E04420] px-5 text-[0.82rem] font-bold text-white shadow-[0_10px_20px_rgba(224,68,32,0.18)] transition hover:bg-[#1c1c1c] disabled:cursor-not-allowed disabled:opacity-55 max-[640px]:h-10 max-[640px]:px-4 max-[640px]:text-[0.72rem]"
        >
          <LockIcon className="h-3.5 w-3.5" />
          Block ID
        </button>
      </section>

      <BlockedCards reloadKey={reloadKey} />

      {blockOpen ? (
        <BlockCardModal
          eventId={eventId}
          eventName={eventName}
          token={token}
          onClose={() => setBlockOpen(false)}
          onBlocked={() => setReloadKey((current) => current + 1)}
        />
      ) : null}
    </>
  );
}
