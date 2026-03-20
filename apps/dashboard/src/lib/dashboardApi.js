import { getBaseUrl } from "@atomx/lib";
import { DASHBOARD_API_KEY } from "./apiConfig";

const inFlightGetRequests = new Map();

function buildGetRequestKey(url, token) {
  return `${url}::${token || ""}`;
}

async function fetchGetJson({ url, token }) {
  const res = await fetch(url, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(DASHBOARD_API_KEY ? { "x-api-key": DASHBOARD_API_KEY } : {})
    },
    cache: "no-store"
  });

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

export async function linkOperator({ email, adminId, token }) {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/v1/Operators/Link`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(DASHBOARD_API_KEY ? { "x-api-key": DASHBOARD_API_KEY } : {})
    },
    body: JSON.stringify({
      email,
      adminId,
      type: "operator"
    })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Request failed (${res.status})`);
  }

  return res.json();
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
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(DASHBOARD_API_KEY ? { "x-api-key": DASHBOARD_API_KEY } : {})
    },
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
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(DASHBOARD_API_KEY ? { "x-api-key": DASHBOARD_API_KEY } : {})
    },
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
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(DASHBOARD_API_KEY ? { "x-api-key": DASHBOARD_API_KEY } : {})
    },
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
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(DASHBOARD_API_KEY ? { "x-api-key": DASHBOARD_API_KEY } : {})
    },
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
    url: `${baseUrl}/v1/Stalls/List/${encodeURIComponent(eventId)}`,
    token,
    dedupe
  });
  return data?.stalls ?? data?.data?.stalls ?? data?.data ?? data?.list ?? [];
}
