const CARD_CLIENTS_ENDPOINT = "/api/card-clients";
const SERIES_ENDPOINT = "/api/series";

function buildHeaders(token) {
  if (!token) {
    throw new Error("Missing session token for CardClients request");
  }

  return {
    Authorization: `Bearer ${token}`
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
