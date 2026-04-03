import { getBaseUrl } from "@atomx/lib";

const BASE_URL = getBaseUrl();
const CARD_CLIENTS_ENDPOINT = `${BASE_URL}/v1/TagSeries/CardClients`;
const SERIES_ENDPOINT = `${BASE_URL}/v1/TagSeries/Series`;
const LOGS_ENDPOINT = `${BASE_URL}/v1/TagSeries/Logs`;
const BATCH_RECORDS_ENDPOINT = `${BASE_URL}/v1/TagSeries/BatchRecords`;
const EVENTS_ENDPOINT = `${BASE_URL}/v1/TagSeries/Events`;
const TAG_SERIES_API_KEY =
  process.env.NEXT_PUBLIC_TAG_SERIES_API_KEY ??
  process.env.NEXT_PUBLIC_DASHBOARD_API_KEY ??
  "pZebJlF_.dv3_prod.Iu7Zitu3X30C2R6-bVZtRXRu0DeiHY-j";

function buildHeaders(token) {
  return {
    "x-api-key": TAG_SERIES_API_KEY
  };
}

export async function fetchCardClients(token) {
  const response = await fetch(CARD_CLIENTS_ENDPOINT, {
    method: "GET",
    headers: buildHeaders(token),
    cache: "no-store"
  });

  if (!response.ok) {
    const errorMessage = await response.text().catch(() => response.statusText);
    throw new Error(
      `CardClients request failed (${response.status}): ${errorMessage || "Unknown error"}`
    );
  }

  return response.json();
}

export async function fetchSeriesMeta(token, { eventId, adminId, yearSeries }) {
  if (!eventId || !adminId || !yearSeries) {
    throw new Error("Missing required parameters for Series request");
  }

  const searchParams = new URLSearchParams({
    eventId: String(eventId),
    adminId: String(adminId),
    yearSeries: String(yearSeries)
  });

  const response = await fetch(`${SERIES_ENDPOINT}?${searchParams.toString()}`, {
    method: "GET",
    headers: buildHeaders(token),
    cache: "no-store"
  });

  if (!response.ok) {
    const errorMessage = await response.text().catch(() => response.statusText);
    throw new Error(
      `Series request failed (${response.status}): ${errorMessage || "Unknown error"}`
    );
  }

  return response.json();
}

export async function createTagSeriesLog(token, payload) {
  if (!payload) {
    throw new Error("Missing payload for Tag Series log request");
  }

  const response = await fetch(LOGS_ENDPOINT, {
    method: "POST",
    headers: {
      ...buildHeaders(token),
      "Content-Type": "application/json"
    },
    cache: "no-store",
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorMessage = await response.text().catch(() => response.statusText);
    throw new Error(
      `Logs request failed (${response.status}): ${errorMessage || "Unknown error"}`
    );
  }

  return response.json();
}

export async function fetchBatchRecords(token, { eventId, adminId }) {
  if (!eventId || !adminId) {
    throw new Error("Missing eventId or adminId for BatchRecords request");
  }

  const searchParams = new URLSearchParams({
    eventId: String(eventId),
    adminId: String(adminId)
  });

  const response = await fetch(`${BATCH_RECORDS_ENDPOINT}?${searchParams.toString()}`, {
    method: "GET",
    headers: buildHeaders(token),
    cache: "no-store"
  });

  if (!response.ok) {
    const errorMessage = await response.text().catch(() => response.statusText);
    throw new Error(
      `BatchRecords request failed (${response.status}): ${errorMessage || "Unknown error"}`
    );
  }

  return response.json();
}

export async function fetchTagSeriesEvents(token) {
  const response = await fetch(EVENTS_ENDPOINT, {
    method: "GET",
    headers: buildHeaders(token),
    cache: "no-store"
  });

  if (!response.ok) {
    const errorMessage = await response.text().catch(() => response.statusText);
    throw new Error(
      `Events request failed (${response.status}): ${errorMessage || "Unknown error"}`
    );
  }

  return response.json();
}
