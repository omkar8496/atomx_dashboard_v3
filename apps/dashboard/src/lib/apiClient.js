import { DASHBOARD_API_KEY } from "./apiConfig";

const STATUS_MESSAGES = {
  400: "The request could not be processed.",
  401: "Your session has expired. Please sign in again.",
  403: "You do not have permission to perform this action.",
  404: "The requested resource was not found.",
  409: "The request conflicts with the current data.",
  422: "Please check the submitted information.",
  429: "Too many requests. Please wait and try again."
};

export class ApiError extends Error {
  constructor(
    message,
    {
      status = 0,
      code = null,
      details = null,
      serverMessage = "",
      url = "",
      method = "GET",
      cause = null
    } = {}
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.serverMessage = serverMessage;
    this.url = url;
    this.method = method;

    if (cause) {
      this.cause = cause;
    }
  }
}

function isJsonBody(body) {
  if (body == null || typeof body !== "object") {
    return false;
  }

  return !(
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof Blob ||
    body instanceof ArrayBuffer
  );
}

function buildHeaders({ token, headers, jsonBody }) {
  const requestHeaders = new Headers(headers || {});

  if (!requestHeaders.has("Accept")) {
    requestHeaders.set("Accept", "application/json");
  }
  if (jsonBody && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }
  if (DASHBOARD_API_KEY && !requestHeaders.has("x-api-key")) {
    requestHeaders.set("x-api-key", DASHBOARD_API_KEY);
  }
  if (token && !requestHeaders.has("Authorization")) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  return requestHeaders;
}

async function parseResponseBody(response) {
  if (response.status === 204 || response.status === 205) {
    return null;
  }

  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractServerMessage(payload) {
  if (typeof payload === "string") {
    return payload.trim();
  }

  if (!payload || typeof payload !== "object") {
    return "";
  }

  const message =
    payload.message ??
    payload.error?.message ??
    payload.error ??
    payload.msg ??
    payload.detail ??
    payload.title;

  return typeof message === "string" ? message.trim() : "";
}

function getStatusMessage(status, serverMessage) {
  if (status >= 500) {
    return "The server could not complete the request. Please try again.";
  }

  return serverMessage || STATUS_MESSAGES[status] || `Request failed (${status}).`;
}

function getErrorCode(payload) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  return payload.code ?? payload.error?.code ?? null;
}

function serializeBody(body) {
  return isJsonBody(body) ? JSON.stringify(body) : body;
}

async function sendRequest({
  url,
  method,
  token,
  body,
  headers,
  credentials,
  cache,
  signal
}) {
  const jsonBody = isJsonBody(body);

  try {
    return await fetch(url, {
      method,
      headers: buildHeaders({ token, headers, jsonBody }),
      credentials,
      ...(cache ? { cache } : {}),
      ...(signal ? { signal } : {}),
      ...(body == null ? {} : { body: serializeBody(body) })
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw error;
    }

    throw new ApiError("Unable to connect to the server. Please try again.", {
      status: 0,
      url,
      method,
      cause: error
    });
  }
}

export async function apiRequest({
  url,
  method = "GET",
  token,
  body,
  headers,
  credentials = "include",
  cache,
  signal,
  retryWithoutToken = false
}) {
  const normalizedMethod = String(method || "GET").toUpperCase();
  const request = (requestToken) =>
    sendRequest({
      url,
      method: normalizedMethod,
      token: requestToken,
      body,
      headers,
      credentials,
      cache: cache ?? (normalizedMethod === "GET" ? "no-store" : undefined),
      signal
    });

  let response = await request(token);

  if (
    retryWithoutToken &&
    token &&
    (response.status === 401 || response.status === 403)
  ) {
    response = await request(null);
  }

  const payload = await parseResponseBody(response);

  if (!response.ok) {
    const serverMessage = extractServerMessage(payload);
    throw new ApiError(getStatusMessage(response.status, serverMessage), {
      status: response.status,
      code: getErrorCode(payload),
      details: payload,
      serverMessage,
      url,
      method: normalizedMethod
    });
  }

  return payload;
}

export function getApiErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  if (error instanceof ApiError || error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}
