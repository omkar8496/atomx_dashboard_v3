"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { getStepOneState } from "../../lib/setupStorage";

const SERIAL_WIDTH = 7; // 7-digit serial allows up to one million entries
const MAX_QTY = 1_000_000;

// Form (f)
const FORM_TYPES = [
  { value: 1, label: "Card" },
  { value: 2, label: "Paper-card" },
  { value: 3, label: "Sticker" },
  { value: 4, label: "Tag" },
  { value: 5, label: "Band" },
  { value: 6, label: "Bracelet" },
  { value: 7, label: "Bamboo-card" },
  { value: 8, label: "Bamboo-tag-square" },
  { value: 9, label: "Accred" },
  { value: 10, label: "Powerbank station" },
];

// Product (p) - only 1: event
const PRODUCT_VALUE = 1;
const BASE_URL = "https://tags.atomx.in/redirect/v1?scanType=QR";

function pad(num, width) {
  const s = String(num);
  return s.length >= width ? s : "0".repeat(width - s.length) + s;
}

function GenerateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("c") || "";

  const defaultYY = useMemo(() => new Date().getFullYear().toString().slice(-2), []);

  const [yy, setYy] = useState(defaultYY); // XX - Year
  const [brand, setBrand] = useState("0"); // Y  - 0=AtomX, 1=Client
  const [series, setSeries] = useState("00"); // ZZ - 2 digits
  const [qty, setQty] = useState(""); // Quantity
  const [formType, setFormType] = useState(1); // f
  const [out, setOut] = useState(null);
  const [err, setErr] = useState("");
  const [includeLinks, setIncludeLinks] = useState(true);
  const [clientMeta, setClientMeta] = useState(null);

  useEffect(() => {
    if (!/^\d+$/.test(eventId)) {
      router.replace("/");
    }
  }, [eventId, router]);

  useEffect(() => {
    const state = getStepOneState();
    if (state && state.eventId === eventId) {
      setClientMeta(state);
    }
  }, [eventId]);

  useEffect(() => {
    if (clientMeta?.yearSeries) {
      setYy(clientMeta.yearSeries);
    }
    if (clientMeta?.clientSeries !== undefined && clientMeta?.clientSeries !== null) {
      setBrand(String(clientMeta.clientSeries));
    }
    if (clientMeta?.eventSeries) {
      setSeries(clientMeta.eventSeries);
    }
  }, [clientMeta]);

  const handleGenerate = (e) => {
    e.preventDefault();
    setErr("");
    setOut(null);

    if (!/^\d{2}$/.test(yy)) return setErr("Year Series must be exactly 2 digits (e.g., 25).");
    if (!/^[01]$/.test(brand)) return setErr("Client must be AtomX (0) or Client (1).");
    if (!/^\d{2}$/.test(series)) return setErr("Event Series must be exactly 2 digits (00–99).");
    if (!/^\d+$/.test(qty)) return setErr("Quantity must be a positive number.");
    const q = parseInt(qty, 10);
    if (q < 1) return setErr("Quantity must be at least 1.");
    if (q > MAX_QTY) return setErr(`Max quantity is ${MAX_QTY.toLocaleString()} (serial is ${SERIAL_WIDTH} digits).`);

    const serialStart = 1;
    const serialEnd = q;

    const firstTag = `${yy}${brand}${series}${pad(serialStart, SERIAL_WIDTH)}`;
    const lastTag = `${yy}${brand}${series}${pad(serialEnd, SERIAL_WIDTH)}`;

    const firstUrl = `${BASE_URL}&f=${formType}&p=${PRODUCT_VALUE}&c=${eventId}&tag=${firstTag}`;
    const lastUrl = `${BASE_URL}&f=${formType}&p=${PRODUCT_VALUE}&c=${eventId}&tag=${lastTag}`;

    setOut({
      firstTag,
      lastTag,
      firstUrl,
      lastUrl,
      q,
      params: {
        yy,
        brand,
        series,
        formType,
      },
    });
  };

  const handleDownloadExcel = () => {
    if (!out) return;

    const { q, params } = out;
    const rows = Array.from({ length: q }, (_, idx) => {
      const serialNumber = idx + 1;
      const tag = `${params.yy}${params.brand}${params.series}${pad(serialNumber, SERIAL_WIDTH)}`;
      const row = {
        Serial: pad(serialNumber, SERIAL_WIDTH),
        Tag: tag,
      };

      if (includeLinks) {
        row.URL = `${BASE_URL}&f=${params.formType}&p=${PRODUCT_VALUE}&c=${eventId}&tag=${tag}`;
      }

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tags");

    XLSX.writeFile(
      workbook,
      `AtomX_Event_${eventId}_${params.yy}${params.brand}${params.series}.xlsx`
    );
  };

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-b from-gray-50 to-white px-4 py-8">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-xl shadow-gray-100/60 md:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            AtomX <span className="text-[#e04420]">–</span> Tag Generator
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Event ID: <span className="font-semibold text-gray-900">{eventId}</span>
          </p>
        </div>

        {!clientMeta && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Client information is missing. Please complete Step 1 again if values look incorrect.
          </div>
        )}

        <form onSubmit={handleGenerate} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {clientMeta && (
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Client</label>
              <input
                readOnly
                value={clientMeta.clientName || `Admin #${clientMeta.clientId}`}
                className="w-full rounded-xl border-0 ring-1 ring-inset ring-gray-200 bg-gray-50 px-3 py-2 text-gray-900"
              />
            </div>
          )}
          {/* Year */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Year Series</label>
            <input
              className="w-full rounded-xl border-0 ring-1 ring-inset ring-gray-200 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#e04420]"
              inputMode="numeric"
              maxLength={2}
              value={yy}
              onChange={(e) => setYy(e.target.value.replace(/\D/g, "").slice(0, 2))}
              placeholder={defaultYY}
            />
          </div>

          {!clientMeta && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Client</label>
              <select
                className="w-full rounded-xl border-0 ring-1 ring-inset ring-gray-200 bg-white px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#e04420]"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              >
                <option value="0">AtomX (0)</option>
                <option value="1">Client Branded (1)</option>
              </select>
            </div>
          )}

          {/* Series */}
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Event Series (2 digits)</label>
            <input
              className={`w-full rounded-xl border-0 ring-1 ring-inset ring-gray-200 px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#e04420] ${
                clientMeta?.eventSeries ? "bg-gray-50" : "bg-white"
              }`}
              inputMode="numeric"
              maxLength={2}
              value={series}
              onChange={(e) => {
                if (clientMeta?.eventSeries) return;
                const next = e.target.value.replace(/\D/g, "").slice(0, 2);
                setSeries(next);
              }}
              placeholder="00"
              readOnly={Boolean(clientMeta?.eventSeries)}
            />
            {clientMeta?.eventSeries && (
              <p className="mt-1 text-xs text-gray-500">
                Auto-generated from last batch ({clientMeta.eventSeries}).
              </p>
            )}
          </div>

          {/* Quantity */}
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Quantity</label>
            <input
              className="w-full rounded-xl border-0 ring-1 ring-inset ring-gray-200 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#e04420]"
              inputMode="numeric"
              value={qty}
              onChange={(e) => setQty(e.target.value.replace(/\D/g, ""))}
              placeholder="e.g. 45678"
            />
            
          </div>

          {/* Form Type */}
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Form Type (f)</label>
            <select
              className="w-full rounded-xl border-0 ring-1 ring-inset ring-gray-200 bg-white px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#e04420]"
              value={formType}
              onChange={(e) => setFormType(parseInt(e.target.value, 10))}
            >
              {FORM_TYPES.map((ft) => (
                <option key={ft.value} value={ft.value}>
                  {ft.value} : {ft.label}
                </option>
              ))}
            </select>
          </div>

          {err && (
            <div className="md:col-span-2">
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {err}
              </div>
            </div>
          )}

          <div className="md:col-span-2 flex gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-xl bg-[#e04420] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 active:scale-[.99] md:w-1/2"
            >
              Generate
            </button>
            <button
              type="button"
              className="inline-flex w-full items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-[.99] md:w-1/2"
              onClick={() => location.assign("/")}
            >
              Back
            </button>
          </div>
        </form>

        {out && (
          <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-4">
            <p className="mb-2 text-sm font-semibold text-gray-800">Generated Card IDs:</p>
            <p className="font-mono text-sm text-green-800">
              From: <span className="font-bold">{out.firstTag}</span>
              <span className="mx-2">→</span>
              To: <span className="font-bold">{out.lastTag}</span>
            </p>

            <div className="mt-3 space-y-1 text-sm">
              <div className="text-gray-600">First URL:</div>
              <div className="break-all font-mono">{out.firstUrl}</div>
              <div className="mt-2 text-gray-600">Last URL:</div>
              <div className="break-all font-mono">{out.lastUrl}</div>
            </div>

            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <button
                type="button"
                onClick={handleDownloadExcel}
                className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#e04420] shadow-sm ring-1 ring-inset ring-[#e04420]/40 transition hover:bg-[#e04420] hover:text-white"
              >
                Download Excel (.xlsx)
              </button>

              <div className="flex items-center gap-3 text-sm text-gray-700">
                <span>Include URLs in Excel</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={includeLinks}
                  onClick={() => setIncludeLinks((prev) => !prev)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${includeLinks ? "bg-[#e04420]" : "bg-gray-300"}`}
                >
                  <span className="sr-only">Toggle URL column</span>
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${includeLinks ? "translate-x-5" : "translate-x-1"}`}
                  />
                </button>
              </div>
            </div>

            
          </div>
        )}
      </div>
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-white text-sm text-gray-500">Loading generator…</div>}>
      <GenerateForm />
    </Suspense>
  );
}
