import { getBaseUrl } from "@atomx/lib";
import { DASHBOARD_API_KEY } from "./apiConfig";

const inFlightGetRequests = new Map();

function buildGetRequestKey(url, token) {
  return `${url}::${token || "cookie-session"}`;
}

function buildAuthHeaders(token) {
  return {
    ...(DASHBOARD_API_KEY ? { "x-api-key": DASHBOARD_API_KEY } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function requestGetJson({ url, token }) {
  return fetch(url, {
    method: "GET",
    headers: buildAuthHeaders(token),
    credentials: "include",
    cache: "no-store"
  });
}

async function fetchGetJson({ url, token }) {
  let res = await requestGetJson({ url, token });

  if (!res.ok && token) {
    res = await requestGetJson({ url, token: null });
  }

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Request failed (${res.status})`);
  }

  return res.json();
}

async function fetchGetJsonDeduped({ url, token, dedupe = true }) {
  if (!dedupe) {
    return fetchGetJson({ url, token });
  }

  const key = buildGetRequestKey(url, token);
  const existing = inFlightGetRequests.get(key);
  if (existing) {
    return existing;
  }

  const request = fetchGetJson({ url, token }).finally(() => {
    inFlightGetRequests.delete(key);
  });

  inFlightGetRequests.set(key, request);
  return request;
}

export async function linkRole({ token, payload }) {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/v1/Operators/Link`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(token)
    },
    credentials: "include",
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Request failed (${res.status})`);
  }

  return res.json();
}

export async function linkOperator({ email, adminId, eventId, type = "operator", token }) {
  return linkRole({
    token,
    payload: {
      email,
      adminId,
      ...(eventId ? { eventId } : {}),
      type
    }
  });
}

export async function fetchEventDetails({ eventId, token, dedupe = true }) {
  if (!eventId) {
    throw new Error("Missing eventId");
  }
  const baseUrl = getBaseUrl();
  const data = await fetchGetJsonDeduped({
    url: `${baseUrl}/v1/Events/Details/${encodeURIComponent(eventId)}`,
    token,
    dedupe
  });
  return data?.event ?? data?.data?.event ?? null;
}

export async function fetchEventsList({ token, dedupe = true }) {
  const baseUrl = getBaseUrl();
  const data = await fetchGetJsonDeduped({
    url: `${baseUrl}/v1/Events/List`,
    token,
    dedupe
  });
  return data?.events ?? data?.data?.events ?? data?.data ?? data?.list ?? [];
}

export async function updateEventDetails({ eventId, token, payload }) {
  if (!eventId) {
    throw new Error("Missing eventId");
  }
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/v1/Events/Edit/${encodeURIComponent(eventId)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(token)
    },
    credentials: "include",
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Request failed (${res.status})`);
  }

  return res.json();
}

export async function createVendor({ token, vendor }) {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/v1/Vendors/Create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(token)
    },
    credentials: "include",
    body: JSON.stringify({ vendor })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Request failed (${res.status})`);
  }

  return res.json();
}

export async function fetchVendors({ eventId, token, dedupe = true }) {
  if (!eventId) {
    throw new Error("Missing eventId");
  }
  const baseUrl = getBaseUrl();
  const data = await fetchGetJsonDeduped({
    url: `${baseUrl}/v1/Vendors/List/${encodeURIComponent(eventId)}`,
    token,
    dedupe
  });
  return data?.vendors ?? data?.data?.vendors ?? data?.data ?? data?.list ?? [];
}

export async function updateVendor({ vendorId, token, payload }) {
  if (!vendorId) {
    throw new Error("Missing vendorId");
  }
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/v1/Vendors/Edit/${encodeURIComponent(vendorId)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(token)
    },
    credentials: "include",
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Request failed (${res.status})`);
  }

  return res.json();
}

export async function createStall({ token, stall }) {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/v1/Stalls/Create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(token)
    },
    credentials: "include",
    body: JSON.stringify({ stall })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Request failed (${res.status})`);
  }

  return res.json();
}

export async function fetchStalls({ eventId, token, dedupe = true }) {
  if (!eventId) {
    throw new Error("Missing eventId");
  }
  const baseUrl = getBaseUrl();
  const data = await fetchGetJsonDeduped({
    url: `${baseUrl}/v1/Stalls/List/Eventwise/${encodeURIComponent(eventId)}`,
    token,
    dedupe
  });
  return data?.stalls ?? data?.data?.stalls ?? data?.data ?? data?.list ?? [];
}

async function fetchAccessXList({ path, eventId, token, dedupe = true }) {
  if (!eventId) {
    throw new Error("Missing eventId");
  }

  const baseUrl = getBaseUrl();
  return fetchGetJsonDeduped({
    url: `${baseUrl}${path}?code=${encodeURIComponent(eventId)}`,
    token,
    dedupe
  });
}

export function fetchAccessXCategories({ eventId, token, dedupe = true }) {
  return fetchAccessXList({
    path: "/v1/AccessX/Categories/List",
    eventId,
    token,
    dedupe
  });
}

export function fetchAccessXGateMasters({ eventId, token, dedupe = true }) {
  return fetchAccessXList({
    path: "/v1/AccessX/GatesMaster/List",
    eventId,
    token,
    dedupe
  });
}

export function fetchAccessXGates({ eventId, token, dedupe = true }) {
  return fetchAccessXList({
    path: "/v1/AccessX/Gates/List",
    eventId,
    token,
    dedupe
  });
}

export async function createAccessXCategory({ token, category }) {
  if (!category?.eventId) {
    throw new Error("Missing eventId");
  }
  if (!String(category?.name || "").trim()) {
    throw new Error("Missing category name");
  }

  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/v1/AccessX/Category/Create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(token)
    },
    credentials: "include",
    body: JSON.stringify(category)
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Request failed (${res.status})`);
  }

  return res.json().catch(() => null);
}

export async function updateAccessXCategory({ token, category }) {
  if (!category?.id) {
    throw new Error("Missing category id");
  }
  if (!category?.eventId) {
    throw new Error("Missing eventId");
  }

  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/v1/AccessX/Category/Edit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(token)
    },
    credentials: "include",
    body: JSON.stringify(category)
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Request failed (${res.status})`);
  }

  return res.json().catch(() => null);
}

export async function fetchEventDevices({ eventId, token, type = "event-wise", dedupe = true }) {
  if (!eventId) {
    throw new Error("Missing eventId");
  }

  const baseUrl = getBaseUrl();
  const data = await fetchGetJsonDeduped({
    url: `${baseUrl}/v1/Devices/List?code=${encodeURIComponent(eventId)}&type=${encodeURIComponent(type)}`,
    token,
    dedupe
  });

  return data?.devices ?? data?.data?.devices ?? data?.data ?? data?.list ?? [];
}

export async function fetchPersoDevices({ eventId, token, dedupe = true }) {
  return fetchEventDevices({ eventId, token, type: "perso-wise", dedupe });
}

export async function searchDeviceMasterlist({ search, token, dedupe = true }) {
  const query = String(search ?? "").trim();
  if (!query) {
    return [];
  }

  const baseUrl = getBaseUrl();
  const data = await fetchGetJsonDeduped({
    url: `${baseUrl}/v1/Devices/Masterlist/Search?search=${encodeURIComponent(query)}`,
    token,
    dedupe
  });

  return data?.devices ?? data?.data?.devices ?? data?.data ?? data?.list ?? [];
}

export async function updateDeviceMasterlist({ token, payload }) {
  if (!payload?.id) {
    throw new Error("Missing device id");
  }

  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/v1/Devices/Masterlist/edit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(token)
    },
    credentials: "include",
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Request failed (${res.status})`);
  }

  return res.json();
}

export async function addDevicesToStall({ token, payload }) {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/v1/Devices/AddToStall`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(token)
    },
    credentials: "include",
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Request failed (${res.status})`);
  }

  return res.json();
}

export async function addPersoDevices({ eventId, token, devices }) {
  if (!eventId) {
    throw new Error("Missing eventId");
  }

  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/v1/Devices/Perso/Add?code=${encodeURIComponent(eventId)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(token)
    },
    credentials: "include",
    body: JSON.stringify({ devices })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Request failed (${res.status})`);
  }

  return res.json();
}

export async function removePersoDevice({ eventId, token, id }) {
  if (!eventId) {
    throw new Error("Missing eventId");
  }

  if (!id) {
    throw new Error("Missing perso device id");
  }

  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/v1/Devices/Perso/Remove?code=${encodeURIComponent(eventId)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(token)
    },
    credentials: "include",
    body: JSON.stringify({ id })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Request failed (${res.status})`);
  }

  return res.json();
}

export async function filterEventTransactions({ token, payload }) {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/v1/EventTransactions/Filter`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(token)
    },
    credentials: "include",
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Request failed (${res.status})`);
  }

  return res.json();
}

export async function fetchEventTransactionDetails({ token, txId, dedupe = true }) {
  if (txId === "" || txId == null) {
    throw new Error("Missing transaction id");
  }

  const baseUrl = getBaseUrl();
  const data = await fetchGetJsonDeduped({
    url: `${baseUrl}/v1/EventTransactions/Details/${encodeURIComponent(txId)}`,
    token,
    dedupe
  });
  const details =
    data?.transaction ??
    data?.data?.transaction ??
    data?.data?.details ??
    data?.details ??
    data?.result?.transaction ??
    data?.result?.details ??
    data?.result ??
    data?.data ??
    data;

  if (Array.isArray(details)) {
    return details[0] ?? null;
  }

  return details && typeof details === "object" ? details : null;
}

export async function updateEventTransactionStatus({ token, txId, status, reason }) {
  if (txId === "" || txId == null) {
    throw new Error("Missing transaction id");
  }

  const normalizedStatus = String(status || "").trim().toLowerCase();
  if (!["completed", "void"].includes(normalizedStatus)) {
    throw new Error("Unsupported transaction status");
  }

  const numericTxId = Number(txId);
  const payload = {
    txId: Number.isNaN(numericTxId) ? txId : numericTxId,
    status: normalizedStatus,
    reason: String(reason || `aml ${normalizedStatus}`).trim()
  };
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/v1/EventTransactions/UpdateStatus`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(token)
    },
    credentials: "include",
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Request failed (${res.status})`);
  }

  return res.json().catch(() => null);
}

export async function updateEventBalanceSetting({ token, eventId }) {
  if (!eventId) {
    throw new Error("Missing eventId");
  }

  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/v1/Events/update-balance-setting`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(token)
    },
    credentials: "include",
    body: JSON.stringify({ eventId: Number(eventId) })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Request failed (${res.status})`);
  }

  return res.json();
}

export async function closeEventDay({
  token,
  eventId,
  day = "a",
  volunteerCount = 0
}) {
  if (!eventId) {
    throw new Error("Missing eventId");
  }

  const numericEventId = Number(eventId);
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/v1/Events/day-close`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(token)
    },
    credentials: "include",
    body: JSON.stringify({
      eventId: Number.isNaN(numericEventId) ? eventId : numericEventId,
      day,
      volunteerCount: Number(volunteerCount) || 0
    })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Request failed (${res.status})`);
  }

  return res.json().catch(() => null);
}
