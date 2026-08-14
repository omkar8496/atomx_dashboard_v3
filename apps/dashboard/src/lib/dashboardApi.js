import { getBaseUrl } from "@atomx/lib";
import { apiRequest } from "./apiClient";

const inFlightGetRequests = new Map();

function buildGetRequestKey(url, token) {
  return `${url}::${token || "cookie-session"}`;
}

async function fetchGetJson({ url, token }) {
  return apiRequest({
    url,
    method: "GET",
    token,
    retryWithoutToken: true
  });
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
  return apiRequest({
    url: `${baseUrl}/v1/Operators/Link`,
    method: "POST",
    token,
    body: payload
  });
}

export async function linkAdmin({ email, adminId, token }) {
  return linkRole({
    token,
    payload: {
      email,
      adminId,
      type: "admin"
    }
  });
}

export async function linkOperator({ email, eventId, type, token }) {
  return linkRole({
    token,
    payload: {
      email,
      eventId,
      type
    }
  });
}

export async function fetchOperatorsList({ token, dedupe = true }) {
  const baseUrl = getBaseUrl();
  const data = await fetchGetJsonDeduped({
    url: `${baseUrl}/v1/Operators/List`,
    token,
    dedupe
  });

  const candidates = [
    data?.operatorLinks,
    data?.operators,
    data?.data?.operatorLinks,
    data?.data?.operators,
    data?.data?.rows,
    data?.result?.operatorLinks,
    data?.result?.operators,
    data?.result,
    data?.rows,
    data?.list,
    data?.data
  ];

  return candidates.find(Array.isArray) ?? [];
}

export async function fetchReportsList({ eventId, token, dedupe = true }) {
  if (eventId === "" || eventId == null) {
    throw new Error("Missing eventId");
  }

  const baseUrl = getBaseUrl();
  return fetchGetJsonDeduped({
    url: `${baseUrl}/v1/Reports/List?eventId=${encodeURIComponent(eventId)}`,
    token,
    dedupe
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
  return apiRequest({
    url: `${baseUrl}/v1/Events/Edit/${encodeURIComponent(eventId)}`,
    method: "PATCH",
    token,
    body: payload
  });
}

export async function createVendor({ token, vendor }) {
  const baseUrl = getBaseUrl();
  return apiRequest({
    url: `${baseUrl}/v1/Vendors/Create`,
    method: "POST",
    token,
    body: { vendor }
  });
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
  return apiRequest({
    url: `${baseUrl}/v1/Vendors/Edit/${encodeURIComponent(vendorId)}`,
    method: "PATCH",
    token,
    body: payload
  });
}

export async function createStall({ token, stall }) {
  const baseUrl = getBaseUrl();
  return apiRequest({
    url: `${baseUrl}/v1/Stalls/Create`,
    method: "POST",
    token,
    body: { stall }
  });
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

export async function fetchStallItems({ stallId, token, dedupe = true }) {
  if (!stallId) {
    throw new Error("Missing stallId");
  }

  const baseUrl = getBaseUrl();
  return fetchGetJsonDeduped({
    url: `${baseUrl}/v1/Items/List/${encodeURIComponent(stallId)}`,
    token,
    dedupe
  });
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

export async function createAccessXGateMaster({ token, gateMaster }) {
  if (!gateMaster?.eventId) {
    throw new Error("Missing eventId");
  }
  if (!String(gateMaster?.name || "").trim()) {
    throw new Error("Missing gate master name");
  }

  const baseUrl = getBaseUrl();
  return apiRequest({
    url: `${baseUrl}/v1/AccessX/GatesMaster/Create`,
    method: "POST",
    token,
    body: gateMaster
  });
}

export async function updateAccessXGateMaster({ token, gateMaster }) {
  if (!gateMaster?.id) {
    throw new Error("Missing gate master id");
  }
  if (!gateMaster?.eventId) {
    throw new Error("Missing eventId");
  }

  const baseUrl = getBaseUrl();
  return apiRequest({
    url: `${baseUrl}/v1/AccessX/GatesMaster/Edit`,
    method: "POST",
    token,
    body: gateMaster
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

export async function searchAccessXWhitelist({ eventId, search, token }) {
  if (eventId === "" || eventId == null) {
    throw new Error("Missing eventId");
  }

  const normalizedSearch = String(search || "").trim();
  if (!normalizedSearch) {
    throw new Error("Missing whitelist search value");
  }

  const baseUrl = getBaseUrl();
  return fetchGetJson({
    url: `${baseUrl}/v1/Whitelist/Search?code=${encodeURIComponent(eventId)}&search=${encodeURIComponent(normalizedSearch)}`,
    token
  });
}

export async function fetchAccessXWhitelistLogs({ eventId, wid, token }) {
  if (eventId === "" || eventId == null) {
    throw new Error("Missing eventId");
  }

  const normalizedWid = String(wid || "").trim();
  if (!normalizedWid) {
    throw new Error("Missing whitelist user id");
  }

  const baseUrl = getBaseUrl();
  return fetchGetJson({
    url: `${baseUrl}/v1/Whitelist/Logs?eventId=${encodeURIComponent(eventId)}&wid=${encodeURIComponent(normalizedWid)}`,
    token
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
  return apiRequest({
    url: `${baseUrl}/v1/AccessX/Category/Create`,
    method: "POST",
    token,
    body: category
  });
}

export async function updateAccessXCategory({ token, category }) {
  if (!category?.id) {
    throw new Error("Missing category id");
  }
  if (!category?.eventId) {
    throw new Error("Missing eventId");
  }

  const baseUrl = getBaseUrl();
  return apiRequest({
    url: `${baseUrl}/v1/AccessX/Category/Edit`,
    method: "POST",
    token,
    body: category
  });
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

export async function addDeviceMasterlist({ token, payload }) {
  if (!payload?.printId) {
    throw new Error("Missing device print ID");
  }
  if (!payload?.hardwareId) {
    throw new Error("Missing device hardware ID");
  }

  const baseUrl = getBaseUrl();
  return apiRequest({
    url: `${baseUrl}/v1/Devices/Masterlist/add`,
    method: "POST",
    token,
    body: payload
  });
}

export async function updateDeviceMasterlist({ token, payload }) {
  if (!payload?.id) {
    throw new Error("Missing device id");
  }

  const baseUrl = getBaseUrl();
  return apiRequest({
    url: `${baseUrl}/v1/Devices/Masterlist/edit`,
    method: "POST",
    token,
    body: payload
  });
}

export async function addDevicesToStall({ token, payload }) {
  const baseUrl = getBaseUrl();
  return apiRequest({
    url: `${baseUrl}/v1/Devices/AddToStall`,
    method: "POST",
    token,
    body: payload
  });
}

export async function addPersoDevices({ eventId, token, devices }) {
  if (!eventId) {
    throw new Error("Missing eventId");
  }

  const baseUrl = getBaseUrl();
  return apiRequest({
    url: `${baseUrl}/v1/Devices/Perso/Add?code=${encodeURIComponent(eventId)}`,
    method: "POST",
    token,
    body: { devices }
  });
}

export async function removePersoDevice({ eventId, token, id }) {
  if (!eventId) {
    throw new Error("Missing eventId");
  }

  if (!id) {
    throw new Error("Missing perso device id");
  }

  const baseUrl = getBaseUrl();
  return apiRequest({
    url: `${baseUrl}/v1/Devices/Perso/Remove?code=${encodeURIComponent(eventId)}`,
    method: "POST",
    token,
    body: { id }
  });
}

export async function filterEventTransactions({ token, payload }) {
  const baseUrl = getBaseUrl();
  return apiRequest({
    url: `${baseUrl}/v1/EventTransactions/Filter`,
    method: "POST",
    token,
    body: payload
  });
}

export async function fetchTapXWalletCardList({ token }) {
  const baseUrl = getBaseUrl();
  return apiRequest({
    url: `${baseUrl}/v2/WalletTapX/card-list`,
    token
  });
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
  return apiRequest({
    url: `${baseUrl}/v1/EventTransactions/UpdateStatus`,
    method: "POST",
    token,
    body: payload
  });
}

export async function updateEventBalanceSetting({ token, eventId }) {
  if (!eventId) {
    throw new Error("Missing eventId");
  }

  const baseUrl = getBaseUrl();
  return apiRequest({
    url: `${baseUrl}/v1/Events/update-balance-setting`,
    method: "POST",
    token,
    body: { eventId: Number(eventId) }
  });
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
  return apiRequest({
    url: `${baseUrl}/v1/Events/day-close`,
    method: "POST",
    token,
    body: {
      eventId: Number.isNaN(numericEventId) ? eventId : numericEventId,
      day,
      volunteerCount: Number(volunteerCount) || 0
    }
  });
}
