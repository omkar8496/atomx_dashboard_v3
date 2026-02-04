"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { fetchCardClients, fetchSeriesMeta } from "../api/api";
import { saveStepOneState } from "../lib/setupStorage";
import AddFormFactorPage from "./Admin/AddFormFactor/page";
import AddProductPage from "./Admin/AddProduct/page";
import ViewPage from "./Admin/View/page";

export default function EventIdPage() {
  const router = useRouter();
  const [eventId, setEventId] = useState("");
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [cardClientsError, setCardClientsError] = useState(null);
  const [yearSeries, setYearSeries] = useState(() => new Date().getFullYear().toString().slice(-2));
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState("");
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const menuRef = useRef(null);

  const adminQuickLinks = [
    { label: "View", href: "/Admin/View", component: ViewPage },
    { label: "Add Formfactor", href: "/Admin/AddFormFactor", component: AddFormFactorPage },
    { label: "Add Product", href: "/Admin/AddProduct", component: AddProductPage }
  ];

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    let cancelled = false;

    async function loadCardClients() {
      if (typeof window === "undefined") return;
      setClientsLoading(true);
      try {
        const token =
          window.localStorage.getItem("atomx.auth.tag-series") ||
          window.localStorage.getItem("atomx.auth.tag_series");
        const response = await fetchCardClients(token);
        if (!cancelled) {
          const fetchedClients = response?.cardClients ?? [];
          setClients(fetchedClients);
          setSelectedClient(fetchedClients[0]?.id?.toString() ?? "");
          setCardClientsError(null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to fetch CardClients", err);
          setClients([]);
          setSelectedClient("");
          setCardClientsError("Unable to sync Card Clients. Try again later.");
        }
      } finally {
        if (!cancelled) {
          setClientsLoading(false);
        }
      }
    }

    loadCardClients();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedClientMeta = clients.find(
    (client) => client.id?.toString() === selectedClient
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!/^\d+$/.test(eventId)) {
      setError("Event ID must be digits only.");
      return;
    }

    if (!selectedClient) {
      setSubmitError("Please select a client.");
      return;
    }

    try {
      setSubmitting(true);
      const token = window.localStorage.getItem("atomx.auth.tag-series");
      if (!token) {
        throw new Error("Missing auth token");
      }

      const seriesPayload = await fetchSeriesMeta(token, {
        eventId,
        adminId: selectedClient,
        yearSeries
      });

      const lastSeries = Number(seriesPayload?.tagSeries_last ?? 0);
      const nextSeries = String((Number.isNaN(lastSeries) ? 0 : lastSeries) + 1).padStart(2, "0");

      saveStepOneState({
        eventId,
        yearSeries,
        clientId: selectedClient,
        clientName: selectedClientMeta?.name ?? "",
        clientSeries: selectedClientMeta?.series ?? null,
        eventSeries: nextSeries,
        timestamp: Date.now()
      });

      router.push(`/generate?c=${eventId}`);
    } catch (err) {
      console.error("Failed to validate series", err);
      setSubmitError("Unable to validate this event. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isContinueDisabled = !eventId || !selectedClient || submitting;

  return (
    <div className="relative min-h-[100dvh] w-full bg-gradient-to-br from-[#fef3ec] via-white to-[#eff8ff] px-4 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(224,68,32,0.08),_transparent_45%)]" />
      <div ref={menuRef} className="fixed right-6 top-6 z-20">
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e04420] text-sm font-semibold uppercase text-white shadow-lg shadow-[#e04420]/30 transition hover:brightness-95"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            OM
            <span className="sr-only">Open user menu</span>
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 z-10 mt-3 w-60 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-200/70"
            >
              <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-sm font-semibold text-gray-900">omkar@atomx.in</p>
                <p className="mt-1 text-xs text-gray-500">Role: Admin</p>
              </div>
              <nav className="py-2" aria-label="Quick links">
                {adminQuickLinks.map(({ label, href, component: Component }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      router.push(href);
                    }}
                    className="flex w-full items-center justify-start px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                    role="menuitem"
                    aria-label={`Go to ${label} (${Component.name})`}
                  >
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-xl rounded-[32px] border border-white/60 bg-white/80 p-8 text-gray-900 shadow-[0_35px_80px_rgba(15,23,42,0.12)] backdrop-blur">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-[#e04420]">AtomX Platform</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Tag Generator</h1>
          <p className="mt-1 text-sm text-slate-500">Step 1 of 2 • Enter event inputs</p>
        </div>

        {cardClientsError && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
            {cardClientsError}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-600">Event ID</label>
            <input
              className="w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-base font-medium text-slate-900 shadow-inner shadow-slate-100 outline-none ring-0 placeholder:text-slate-300 focus:border-[#e04420] focus:ring-2 focus:ring-[#e04420]/30"
              inputMode="numeric"
              pattern="\d*"
              placeholder="e.g. 569"
              value={eventId}
              onChange={(e) => {
                setError("");
                setEventId(e.target.value.replace(/\D/g, ""));
              }}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-600">Year Series</label>
              <input
                value={yearSeries}
                onChange={(e) => setYearSeries(e.target.value.replace(/\D/g, "").slice(0, 2))}
                inputMode="numeric"
                maxLength={2}
                className="w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-base font-semibold text-slate-700 shadow-inner shadow-slate-100 outline-none focus:border-[#e04420] focus:ring-2 focus:ring-[#e04420]/30"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-600">Client</label>
              <div className="relative">
                <select
                  className="w-full appearance-none rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base font-medium text-slate-900 shadow-inner outline-none focus:border-[#1495ab] focus:ring-2 focus:ring-[#1495ab]/30"
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  disabled={clientsLoading || !clients.length}
                >
                  {clientsLoading && <option>Loading clients…</option>}
                  {!clientsLoading && !clients.length && <option>No clients available</option>}
                  {!clientsLoading &&
                    clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                  ▼
                </span>
              </div>
              {selectedClientMeta && (
                <p className="mt-1 text-xs text-slate-500">
                  Series ID: {selectedClientMeta.series ?? "—"}
                </p>
              )}
            </div>
          </div>

          <button
            className={`w-full rounded-2xl px-4 py-3 text-base font-semibold text-white transition ${
              isContinueDisabled
                ? "cursor-not-allowed bg-slate-200 text-slate-400"
                : "bg-[#e04420] shadow-lg shadow-[#e04420]/30 hover:brightness-95"
            }`}
            type="submit"
            disabled={isContinueDisabled}
          >
            {submitting ? "Validating…" : "Continue"}
          </button>

          {submitError && (
            <p className="text-center text-sm font-medium text-red-600">{submitError}</p>
          )}
        </form>
      </div>
    </div>
  );
}
