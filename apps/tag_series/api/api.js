const CARD_CLIENTS_ENDPOINT = "https://dapi.atomx.in/v1/TagSeries/CardClients";
const SERIES_ENDPOINT = "https://dapi.atomx.in/v1/TagSeries/Series";
const TAG_SERIES_API_KEY = "pZebJlF_.dv3_prod.Iu7Zitu3X30C2R6-bVZtRXRu0DeiHY-j";

function buildHeaders(token) {
  if (!token) {
    throw new Error("Missing session token for CardClients request");
  }

  return {
    "x-api-key": TAG_SERIES_API_KEY,
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
