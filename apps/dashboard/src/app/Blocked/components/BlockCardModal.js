"use client";

import { useEffect, useState } from "react";
import { blockCard } from "../../../lib/dashboardApi";

function CloseIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function LockIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function CheckIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

export default function BlockCardModal({ eventId, eventName = "", token, onClose, onBlocked }) {
  const [cardId, setCardId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [blockedCardId, setBlockedCardId] = useState("");

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !submitting) onClose?.();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, submitting]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalized = cardId.trim();

    if (!normalized) {
      setError("Enter the card ID to block.");
      return;
    }
    if (eventId === "" || eventId == null) {
      setError("Select an event before blocking a card.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const response = await blockCard({ eventId, cardId: normalized, token });
      if (response?.success === false) {
        throw new Error(response?.message || "Unable to block this card.");
      }
      setBlockedCardId(normalized);
      setCardId("");
      onBlocked?.(normalized);
    } catch (requestError) {
      console.error("Failed to block card", requestError);
      setError(requestError?.message || "Unable to block this card.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[260] flex items-center justify-center bg-[rgba(12,12,12,0.5)] px-4 py-6 backdrop-blur-[3px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Block card ID"
        className="w-[440px] max-w-full overflow-hidden rounded-xl border border-[#e8e8e8] bg-white shadow-[0_32px_65px_rgba(15,23,42,0.28)]"
      >
        <div className="flex items-start justify-between gap-3 bg-[linear-gradient(135deg,#1c1c1c_0%,#5a1c34_74%,#E04420_155%)] px-5 py-4">
          <div className="min-w-0">
            <p className="text-[0.58rem] font-bold uppercase tracking-[0.18em] text-white/70">
              Blocked IDs
            </p>
            <h2 className="mt-1 text-[1.15rem] font-bold text-white">Block a card ID</h2>
            <p className="mt-1 text-[0.72rem] font-normal text-white/70">
              {eventName ? `Applies to ${eventName}.` : "Applies to the active event."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-md border border-white/25 text-white/80 transition hover:border-white hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        {blockedCardId ? (
          <div className="px-5 py-6 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[linear-gradient(135deg,#E04420,#341CD6)] text-white">
              <CheckIcon />
            </span>
            <h3 className="mt-3 text-[1.05rem] font-bold text-[#1f1f1f]">Card blocked</h3>
            <p className="mt-1.5 text-[0.8rem] font-normal text-[#777777]">
              Card ID{" "}
              <span className="font-bold text-[#1f1f1f]">{blockedCardId}</span>{" "}
              has been blocked for this event.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setBlockedCardId("")}
                className="h-10 cursor-pointer rounded-lg border border-[#e0e0e0] bg-white text-[0.78rem] font-bold text-[#555555] transition hover:border-[#E04420] hover:text-[#E04420]"
              >
                Block another
              </button>
              <button
                type="button"
                onClick={onClose}
                className="h-10 cursor-pointer rounded-lg bg-[#1c1c1c] text-[0.78rem] font-bold text-white transition hover:bg-[#E04420]"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="px-5 py-5">
              <label className="block">
                <span className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#858585]">
                  Card ID
                </span>
                <input
                  value={cardId}
                  onChange={(event) => setCardId(event.target.value)}
                  placeholder="e.g. 2502000351"
                  autoFocus
                  inputMode="numeric"
                  className="mt-2 h-11 w-full rounded-md border border-[#dedede] bg-[#fbfbfb] px-3 text-[0.86rem] font-semibold text-[#1f1f1f] outline-none transition placeholder:text-[#9a9a9a] focus:border-[#E04420] focus:ring-2 focus:ring-[#E04420]/10"
                />
              </label>
              <p className="mt-2 text-[0.68rem] font-normal text-[#8b96aa]">
                A blocked card is rejected at every device for this event.
              </p>

              {error ? (
                <p className="mt-3 rounded-md border border-[#f5c6ba] bg-[#fff4ef] px-3 py-2 text-[0.74rem] font-semibold text-[#E04420]">
                  {error}
                </p>
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-[#eeeeee] bg-[#fbfbfb] px-5 py-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="h-10 cursor-pointer rounded-lg border border-[#e0e0e0] bg-white px-4 text-[0.78rem] font-bold text-[#555555] transition hover:border-[#E04420] hover:text-[#E04420] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-[#E04420] px-5 text-[0.78rem] font-bold text-white shadow-[0_10px_20px_rgba(224,68,32,0.18)] transition hover:bg-[#1c1c1c] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LockIcon className="h-3.5 w-3.5" />
                {submitting ? "Blocking..." : "Block ID"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
