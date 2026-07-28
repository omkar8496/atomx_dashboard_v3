"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { createTagSeriesLog, fetchBatchRecords } from "../../api/api";
import { getStepOneState } from "../../lib/setupStorage";
import { capturePostHogEvent } from "@atomx/global-components";

const LOG_SERIAL_WIDTH = 5;
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
const EXTRA_QTY_DIVISORS = {
  1: 28,
  4: 28,
  9: 16
};

// Product (p) - only 1: event
const PRODUCT_VALUE = 1;
const BASE_URL = "https://tags.atomx.in/redirect/v1?scanType=QR";

function pad(num, width) {
  const s = String(num);
  return s.length >= width ? s : "0".repeat(width - s.length) + s;
}

function buildTag(prefix, serial) {
  return `${prefix}${pad(serial, LOG_SERIAL_WIDTH)}`;
}

function buildTagUrl({ eventId, formType, tag }) {
  return `${BASE_URL}&f=${formType}&p=${PRODUCT_VALUE}&c=${eventId}&tag=${tag}`;
}

function getTagSeriesToken() {
  if (typeof window === "undefined") return null;
  const canonical = window.localStorage.getItem("atomx.auth.tag-series");
  if (canonical) return canonical;

  const legacy = window.localStorage.getItem("atomx.auth.tag_series");
  if (legacy) {
    // Migrate old key to canonical key to keep all apps in sync.
    window.localStorage.setItem("atomx.auth.tag-series", legacy);
    return legacy;
  }
  return null;
}

function normalizeBatchRecords(response) {
  if (!response) return [];
  if (typeof response === "string") {
    try {
      return normalizeBatchRecords(JSON.parse(response));
    } catch (error) {
      return [];
    }
  }
  if (Array.isArray(response)) return response;

  const candidates = [
    response.records,
    response.data?.records,
    response.seriesLogs,
    response.data?.seriesLogs,
    response.batchRecords,
    response.data?.batchRecords,
    response.data?.batches,
    response.batches,
    response.record,
    response.data?.record,
    response.batch,
    response.data?.batch,
    response.data,
    response
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (Array.isArray(candidate)) return candidate;
    if (typeof candidate === "object") {
      const values = Object.values(candidate);
      if (values.length && values.every((value) => typeof value === "object")) {
        return values;
      }
      return [candidate];
    }
  }

  return [];
}

function normalizeSeriesList(response) {
  if (!response) return [];
  if (typeof response === "string") {
    try {
      return normalizeSeriesList(JSON.parse(response));
    } catch (error) {
      return [];
    }
  }
  if (Array.isArray(response)) return response;

  const candidates = [
    response.tagSeries_existing,
    response.data?.tagSeries_existing,
    response.tagSeriesExisting,
    response.data?.tagSeriesExisting,
    response.tag_series_existing,
    response.data?.tag_series_existing,
    response.series,
    response.data?.series,
    response.tagSeries,
    response.data?.tagSeries,
    response.seriesList,
    response.data?.seriesList,
    response.records,
    response.data?.records,
    response.data,
    response
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (Array.isArray(candidate)) return candidate;
    if (typeof candidate === "object") {
      const values = Object.values(candidate);
      if (values.length && values.every((value) => typeof value === "object")) {
        return values;
      }
      return [candidate];
    }
  }

  return [];
}

function isSeriesEntry(value) {
  return (
    value &&
    typeof value === "object" &&
    (value.series !== undefined || value.tagSeries !== undefined) &&
    (value.id !== undefined ||
      value.eventwiseId !== undefined ||
      value.tagSeriesId !== undefined ||
      value.tagSeriesExistingId !== undefined)
  );
}

function collectSeriesEntries(value, seen = new Set()) {
  if (!value) return [];
  if (typeof value === "string") {
    try {
      return collectSeriesEntries(JSON.parse(value), seen);
    } catch (error) {
      return [];
    }
  }
  if (typeof value !== "object" || seen.has(value)) return [];
  seen.add(value);

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectSeriesEntries(item, seen));
  }

  const direct = isSeriesEntry(value) ? [value] : [];
  return direct.concat(
    Object.values(value).flatMap((item) => collectSeriesEntries(item, seen))
  );
}

function getSeriesEntryKeys(entry) {
  return [
    entry?.id,
    entry?.eventwiseId,
    entry?.eventwise_id,
    entry?.tagSeriesId,
    entry?.tag_series_id,
    entry?.tagSeriesExistingId,
    entry?.tag_series_existing_id
  ]
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
}

function buildSeriesMap(seriesList = []) {
  const map = new Map();
  seriesList.forEach((entry) => {
    getSeriesEntryKeys(entry).forEach((key) => {
      map.set(key, entry);
    });
  });
  return map;
}

function getSeriesMetaForLog(seriesMap, log) {
  const keys = [
    log?.eventwiseId,
    log?.eventwise_id,
    log?.tagSeriesId,
    log?.tag_series_id,
    log?.tagSeriesExistingId,
    log?.tag_series_existing_id
  ]
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));

  for (const key of keys) {
    const seriesMeta = seriesMap?.get?.(key);
    if (seriesMeta) return seriesMeta;
  }

  return null;
}

function getBatchRecords(response) {
  const normalized = normalizeBatchRecords(response);
  if (normalized.length) return normalized;

  const fallbacks = [
    response?.seriesLogs,
    response?.data?.seriesLogs,
    response?.series_logs,
    response?.data?.series_logs,
    response?.result?.seriesLogs,
    response?.data?.result?.seriesLogs
  ];

  for (const fallback of fallbacks) {
    const next = normalizeBatchRecords(fallback);
    if (next.length) return next;
  }

  return [];
}

function formatRequestTime({ requestId, createdAt }) {
  const ts = Number(requestId);
  const date = Number.isFinite(ts) && ts > 0 ? new Date(ts * 1000) : new Date(createdAt);
  if (!Number.isFinite(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata"
  }).format(date);
}

function formatRanges(logs = [], options = {}) {
  const { seriesMap, fallbackYear, fallbackBrand } = options;
  const list = Array.isArray(logs)
    ? logs
    : typeof logs === "object" && logs
      ? Object.values(logs)
      : [];
  if (!list.length) return "—";

  return list
    .map((log) => {
      const seriesMeta = getSeriesMetaForLog(seriesMap, log);
      const seriesSource = seriesMeta?.series ?? seriesMeta?.tagSeries ?? log.series;
      const yearSource = seriesMeta?.yearSeries ?? seriesMeta?.year ?? fallbackYear;
      const brandSource = seriesMeta?.brand ?? seriesMeta?.brandSeries ?? fallbackBrand ?? "0";
      const hasSeries =
        seriesSource !== undefined && seriesSource !== null && String(seriesSource).trim() !== "";
      const hasYear =
        yearSource !== undefined && yearSource !== null && String(yearSource).trim() !== "";
      const hasBrand =
        brandSource !== undefined && brandSource !== null && String(brandSource).trim() !== "";
      if (!hasSeries || !hasYear || !hasBrand) return null;

      const seriesValue = String(seriesSource).padStart(2, "0");
      const yearValue = String(
        seriesMeta?.yearSeries ?? seriesMeta?.year ?? fallbackYear ?? ""
      ).padStart(2, "0");
      const brandValue = String(brandSource);
      const prefix = `${yearValue}${brandValue}${seriesValue}`;
      const startTag = buildTag(prefix, log.start);
      const endTag = buildTag(prefix, log.end);
      return `${startTag}–${endTag}`;
    })
    .filter(Boolean)
    .join(", ") || "—";
}

function getRecordLogs(record) {
  if (!record) return [];
  return (
    record.tagSeriesLogs ||
    record.seriesLogs ||
    record.logs ||
    record.tag_series_logs ||
    []
  );
}

function formatCount(value) {
  const next = Number(value);
  return Number.isFinite(next) ? next.toLocaleString("en-IN") : "—";
}

function getRecordKey(record, index) {
  return String(record.id ?? record.requestId ?? `batch-${index}`);
}

function getRangeFormType(record, seriesMeta, fallbackFormType) {
  const value =
    record?.formFactor ??
    record?.form_factor ??
    seriesMeta?.formFactor ??
    seriesMeta?.form_factor ??
    fallbackFormType;
  const next = Number(value);
  return Number.isFinite(next) ? next : fallbackFormType;
}

function buildRangesFromLogs(logs = [], options = {}) {
  const {
    seriesMap,
    fallbackYear,
    fallbackBrand,
    fallbackFormType,
    eventId,
    requireSeriesMeta = false
  } = options;
  const list = Array.isArray(logs)
    ? logs
    : typeof logs === "object" && logs
      ? Object.values(logs)
      : [];

  return list
    .map((log, index) => {
      const seriesMeta = getSeriesMetaForLog(seriesMap, log);
      const seriesSource =
        seriesMeta?.series ??
        seriesMeta?.tagSeries ??
        log.series;

      if (requireSeriesMeta && (seriesSource === undefined || seriesSource === null || seriesSource === "")) {
        return null;
      }

      const seriesValue = String(seriesSource ?? "").padStart(2, "0");
      const yearValue = String(
        seriesMeta?.yearSeries ?? seriesMeta?.year ?? log.yearSeries ?? fallbackYear ?? ""
      ).padStart(2, "0");
      const brandValue = String(
        seriesMeta?.clientSeries ?? seriesMeta?.brandSeries ?? log.brandSeries ?? fallbackBrand ?? "0"
      );
      const start = Number(log.start);
      const end = Number(log.end);
      const hasPrefix =
        seriesValue.trim() &&
        yearValue.trim() &&
        brandValue.trim() &&
        Number.isFinite(start) &&
        Number.isFinite(end);

      if (!hasPrefix) return null;

      const prefix = `${yearValue}${brandValue}${seriesValue}`;
      const formTypeValue = getRangeFormType(log, seriesMeta, fallbackFormType);
      const startTag = buildTag(prefix, start);
      const endTag = buildTag(prefix, end);

      return {
        id: log.id ?? index,
        eventwiseId: log.eventwiseId,
        series: seriesSource,
        start,
        end,
        count: Number(log.count ?? 0),
        prefix,
        startTag,
        endTag,
        formType: formTypeValue,
        firstUrl: buildTagUrl({ eventId, formType: formTypeValue, tag: startTag }),
        lastUrl: buildTagUrl({ eventId, formType: formTypeValue, tag: endTag })
      };
    })
    .filter(Boolean);
}

function buildExcelRows(ranges, includeUrls, eventId, fallbackFormType) {
  const rows = [];

  ranges.forEach((range) => {
    for (let serial = range.start; serial <= range.end; serial += 1) {
      const tag = buildTag(range.prefix, serial);
      const digits = tag.split("").map((char) => Number(char));
      const code = digits.reduce((sum, value) => sum + value, 0);
      const codeSquared = code * code;
      const lastDigit = digits[digits.length - 1] ?? 0;
      const adjusted = codeSquared - lastDigit;
      const finalCode = String(Math.abs(adjusted) % 100).padStart(2, "0");
      const row = {
        "Final Series": `${tag} / ${finalCode}`
      };
      if (includeUrls) {
        row.URL = buildTagUrl({
          eventId,
          formType: range.formType ?? fallbackFormType,
          tag
        });
      }
      rows.push(row);
    }
  });

  return rows;
}

function downloadRangesExcel({ ranges, eventId, formType, includeUrls, fileLabel = "Tag" }) {
  if (!ranges?.length) return null;

  const headers = includeUrls ? ["Final Series", "URL"] : ["Final Series"];
  const rows = buildExcelRows(ranges, includeUrls, eventId, formType);
  const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Tags");

  const safeLabel = fileLabel.replace(/[\\/:*?"<>|]/g, "-");
  const allTags = ranges.flatMap((range) => [range.startTag, range.endTag]);
  const minMax = allTags.reduce(
    (acc, tag) => {
      if (!acc[0] || BigInt(tag) < BigInt(acc[0])) acc[0] = tag;
      if (!acc[1] || BigInt(tag) > BigInt(acc[1])) acc[1] = tag;
      return acc;
    },
    [null, null]
  );
  const [minTag, maxTag] = minMax;
  const fileName = `${safeLabel}-Series ${minTag} to ${maxTag}.xlsx`;

  XLSX.writeFile(workbook, fileName);

  return {
    fileName,
    rowCount: rows.length
  };
}

function getRequestId() {
  return Math.floor(Date.now() / 1000);
}

function generatePseudoId(length = 12) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return result;
}

function calculateExtraQty(quantity, formType) {
  const value = Number(quantity);
  if (!Number.isFinite(value) || value <= 0) return "";
  const divisor = EXTRA_QTY_DIVISORS[formType];
  if (!divisor) return "0";
  const rounded = Math.ceil(value / divisor) * divisor;
  return String(Math.max(rounded - value, 0));
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
  const [extraQty, setExtraQty] = useState(""); // Extra Quantity
  const [formType, setFormType] = useState(1); // f
  const [note, setNote] = useState("");
  const [out, setOut] = useState(null);
  const [err, setErr] = useState("");
  const [includeLinks, setIncludeLinks] = useState(true);
  const [recentIncludeLinks, setRecentIncludeLinks] = useState({});
  const [clientMeta, setClientMeta] = useState(null);
  const [batchRecords, setBatchRecords] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState("");
  const [batchSeriesMap, setBatchSeriesMap] = useState(() => new Map());

  const fetchAndSetBatchRecords = useCallback(async () => {
    if (!eventId || !clientMeta?.clientId || typeof window === "undefined") return;
    setBatchLoading(true);
    setBatchError("");
    try {
      const token = getTagSeriesToken();
      const response = await fetchBatchRecords(token, {
        eventId,
        adminId: clientMeta.clientId
      });
      const recordList = getBatchRecords(response);
      const seriesList = [
        ...normalizeSeriesList(response),
        ...collectSeriesEntries(response)
      ];
      if (seriesList.length) {
        setBatchSeriesMap(buildSeriesMap(seriesList));
      }
      const sorted = recordList
        .slice()
        .sort((a, b) => Number(b.requestId ?? 0) - Number(a.requestId ?? 0));
      setBatchRecords(sorted.slice(0, 4));
    } catch (error) {
      setBatchError(error.message || "Unable to load batch records.");
    } finally {
      setBatchLoading(false);
    }
  }, [eventId, clientMeta?.clientId, yy]);

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
    setExtraQty(calculateExtraQty(qty, formType));
  }, [qty, formType]);

  useEffect(() => {
    fetchAndSetBatchRecords();
  }, [fetchAndSetBatchRecords]);

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

  const handleGenerate = async (e) => {
    e.preventDefault();
    setErr("");
    setOut(null);

    if (!clientMeta?.clientId) {
      setErr("Client information is missing. Please complete Step 1 again.");
      return;
    }

    if (!/^\d{2}$/.test(yy)) return setErr("Year Series must be exactly 2 digits (e.g., 25).");
    if (!/^[01]$/.test(brand)) return setErr("Client must be AtomX (0) or Client (1).");
    if (!/^\d{2}$/.test(series)) return setErr("Event Series must be exactly 2 digits (00–99).");
    if (!/^\d+$/.test(qty)) return setErr("Quantity must be a positive number.");
    const fallbackExtraQty =
      extraQty === "" ? calculateExtraQty(qty, formType) : extraQty;
    if (extraQty === "" && fallbackExtraQty !== "") {
      setExtraQty(fallbackExtraQty);
    }
    if (!/^\d+$/.test(fallbackExtraQty)) {
      return setErr("Extra Quantity must be a non-negative number.");
    }
    if (note.length > 50) return setErr("Note must be 50 characters or fewer.");
    const q = parseInt(qty, 10);
    const spare = parseInt(fallbackExtraQty, 10);
    const totalCount = q + spare;
    if (q < 1) return setErr("Quantity must be at least 1.");
    if (q > MAX_QTY) return setErr(`Max quantity is ${MAX_QTY.toLocaleString()}.`);

    const token = getTagSeriesToken();
    const payload = {
      eventId: Number(eventId),
      adminId: Number(clientMeta.clientId),
      yearSeries: Number(yy),
      scanType: "tagQR",
      formFactor: formType,
      product: PRODUCT_VALUE,
      requestId: getRequestId(),
      userPseudoId: generatePseudoId(),
      count: totalCount,
      batchNote: note,
      spare
    };

    try {
      const response = await createTagSeriesLog(token, payload);
      const logs = Array.isArray(response?.logs) ? response.logs : [];
      const seriesList = Array.isArray(response?.series) ? response.series : [];
      if (!logs.length) {
        setErr("No log ranges returned from the server.");
        return;
      }
      if (!seriesList.length) {
        setErr("No series metadata returned from the server.");
        return;
      }

      const seriesMap = buildSeriesMap(seriesList);

      const ranges = logs.map((log, index) => {
        const seriesMeta = getSeriesMetaForLog(seriesMap, log);
        if (!seriesMeta) {
          throw new Error(`Missing series metadata for eventwiseId ${log.eventwiseId}`);
        }

        const seriesValue = String(seriesMeta.series ?? "").padStart(2, "0");
        const yearValue = String(seriesMeta.yearSeries ?? yy).padStart(2, "0");
        const prefix = `${yearValue}${brand}${seriesValue}`;
        const start = Number(log.start);
        const end = Number(log.end);
        const startTag = buildTag(prefix, start);
        const endTag = buildTag(prefix, end);
        return {
          id: log.id ?? index,
          eventwiseId: log.eventwiseId,
          series: seriesMeta.series,
          start,
          end,
          count: Number(log.count ?? 0),
          prefix,
          startTag,
          endTag,
          firstUrl: buildTagUrl({ eventId, formType, tag: startTag }),
          lastUrl: buildTagUrl({ eventId, formType, tag: endTag })
        };
      });

      setOut({
        ranges,
        params: {
          formType,
          eventId
        }
      });
      capturePostHogEvent("operation_tag_batch_generated", {
        app: "tag_series",
        event_id: eventId,
        form_type: formType,
        form_type_label: FORM_TYPES.find((ft) => ft.value === formType)?.label,
        quantity: q,
        extra_quantity: spare,
        total_count: totalCount,
        year_series: yy,
        brand_series: brand,
        client_id: clientMeta?.clientId,
        client_name: clientMeta?.clientName,
        range_count: ranges.length
      });
      await fetchAndSetBatchRecords();
    } catch (error) {
      capturePostHogEvent("$exception", {
        app: "tag_series",
        $exception_message: error.message,
        $exception_source: "tag_batch_generated"
      });
      setErr(error.message || "Unable to save tag series log.");
      return;
    }
  };

  const handleDownloadExcel = () => {
    if (!out) return;

    const { ranges, params } = out;
    const formLabel =
      FORM_TYPES.find((ft) => ft.value === params.formType)?.label ?? "Tag";
    const result = downloadRangesExcel({
      ranges,
      eventId: params.eventId,
      formType: params.formType,
      includeUrls: includeLinks,
      fileLabel: formLabel
    });
    if (!result) return;

    capturePostHogEvent("operation_tag_excel_downloaded", {
      app: "tag_series",
      event_id: params.eventId,
      form_type: params.formType,
      form_type_label: formLabel,
      include_urls: includeLinks,
      row_count: result.rowCount,
      file_name: result.fileName
    });
  };

  const handleDownloadRecentBatch = (record, index) => {
    const key = getRecordKey(record, index);
    const includeUrls = recentIncludeLinks[key] ?? true;
    const logs = getRecordLogs(record);
    const ranges = buildRangesFromLogs(logs, {
      seriesMap: batchSeriesMap,
      fallbackYear: yy,
      fallbackBrand: brand,
      fallbackFormType: formType,
      eventId,
      requireSeriesMeta: true
    });
    const selectedFormType = ranges[0]?.formType ?? formType;
    const formLabel =
      FORM_TYPES.find((ft) => ft.value === selectedFormType)?.label ?? "Tag";
    const result = downloadRangesExcel({
      ranges,
      eventId,
      formType: selectedFormType,
      includeUrls,
      fileLabel: formLabel
    });
    if (!result) return;

    capturePostHogEvent("operation_tag_recent_batch_downloaded", {
      app: "tag_series",
      event_id: eventId,
      form_type: selectedFormType,
      form_type_label: formLabel,
      include_urls: includeUrls,
      row_count: result.rowCount,
      file_name: result.fileName,
      request_id: record.requestId ?? null
    });
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

        <div className="mb-6 mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-900">Recent Batch Records</h2>
            <span className="text-xs text-slate-500">Last 4 batches</span>
          </div>

          {batchLoading && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Loading batch records…
            </div>
          )}

          {batchError && !batchLoading && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {batchError}
            </div>
          )}

          {!batchLoading && !batchError && batchRecords.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              No batch records available yet.
            </div>
          )}

          {!batchLoading && !batchError && batchRecords.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="py-2 pr-4">Request Time</th>
                    <th className="py-2 pr-4">Count</th>
                    <th className="py-2 pr-4">Start - End</th>
                    <th className="py-2 pr-4">Spare</th>
                    <th className="py-2 pr-4">Batch Note</th>
                    <th className="py-2">Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {batchRecords.map((record, index) => {
                    const recordKey = getRecordKey(record, index);
                    const recordLogs = getRecordLogs(record);
                    const includeRecentLinks = recentIncludeLinks[recordKey] ?? true;
                    const downloadableRanges = buildRangesFromLogs(recordLogs, {
                      seriesMap: batchSeriesMap,
                      fallbackYear: yy,
                      fallbackBrand: brand,
                      fallbackFormType: formType,
                      eventId,
                      requireSeriesMeta: true
                    });
                    const canDownload = downloadableRanges.length > 0;

                    return (
                      <tr key={recordKey}>
                        <td className="py-3 pr-4 font-medium text-slate-900">
                          {formatRequestTime(record)}
                        </td>
                        <td className="py-3 pr-4 text-slate-700">
                          {formatCount(record.count)}
                        </td>
                        <td className="py-3 pr-4 text-slate-700">
                          {formatRanges(recordLogs, {
                            seriesMap: batchSeriesMap,
                            fallbackYear: yy,
                            fallbackBrand: brand
                          })}
                        </td>
                        <td className="py-3 pr-4 text-slate-700">
                          {formatCount(record.spare)}
                        </td>
                        <td className="py-3 pr-4 text-slate-700">
                          {record.batchNote || "—"}
                        </td>
                        <td className="py-3">
                          <div className="flex min-w-[9rem] flex-col gap-2">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={includeRecentLinks}
                              onClick={() =>
                                setRecentIncludeLinks((prev) => ({
                                  ...prev,
                                  [recordKey]: !(prev[recordKey] ?? true)
                                }))
                              }
                              className="inline-flex items-center gap-2 text-xs font-medium text-slate-600"
                            >
                              <span
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
                                  includeRecentLinks ? "bg-[#e04420]" : "bg-gray-300"
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                    includeRecentLinks ? "translate-x-4" : "translate-x-1"
                                  }`}
                                />
                              </span>
                              URLs
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadRecentBatch(record, index)}
                              disabled={!canDownload}
                              className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold shadow-sm ring-1 ring-inset transition ${
                                canDownload
                                  ? "bg-white text-[#e04420] ring-[#e04420]/40 hover:bg-[#e04420] hover:text-white"
                                  : "cursor-not-allowed bg-slate-100 text-slate-400 ring-slate-200"
                              }`}
                            >
                              Download
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

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

          {/* Quantity */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Quantity</label>
            <input
              className="w-full rounded-xl border-0 ring-1 ring-inset ring-gray-200 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#e04420]"
              inputMode="numeric"
              value={qty}
              onChange={(e) => setQty(e.target.value.replace(/\D/g, ""))}
              placeholder="e.g. 45678"
            />
          </div>

          {!clientMeta && (
            <div className="md:col-span-2">
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

          {/* Form Type */}
          <div>
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

          {/* Extra Quantity */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Extra Quantity</label>
            <input
              className="w-full rounded-xl border-0 ring-1 ring-inset ring-gray-200 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#e04420]"
              inputMode="numeric"
              value={extraQty}
              onChange={(e) => setExtraQty(e.target.value.replace(/\D/g, ""))}
              placeholder="Auto-calculated"
            />
          </div>

          {/* Note */}
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Note</label>
            <input
              className="w-full rounded-xl border-0 ring-1 ring-inset ring-gray-200 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#e04420]"
              maxLength={50}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a short note (max 50 characters)"
            />
          </div>

          {err && (
            <div className="md:col-span-2">
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {err}
              </div>
            </div>
          )}

          {!out && (
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
                onClick={() => router.push("/")}
              >
                Back
              </button>
            </div>
          )}
        </form>

        {out && (
          <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-4">
            <p className="mb-2 text-sm font-semibold text-gray-800">Generated Card IDs:</p>
            <div className="space-y-4 text-sm">
              {out.ranges.map((range, index) => (
                <div key={range.id ?? index} className="space-y-2">
                  <p className="font-mono text-sm text-green-800">
                    From: <span className="font-bold">{range.startTag}</span>
                    <span className="mx-2">→</span>
                    To: <span className="font-bold">{range.endTag}</span>
                  </p>
                  <div className="text-gray-600">First URL:</div>
                  <div className="break-all font-mono text-slate-700">{range.firstUrl}</div>
                  <div className="mt-2 text-gray-600">Last URL:</div>
                  <div className="break-all font-mono text-slate-700">{range.lastUrl}</div>
                </div>
              ))}
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
