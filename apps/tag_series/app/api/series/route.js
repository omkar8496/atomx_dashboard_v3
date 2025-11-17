const SERIES_ENDPOINT = "https://dapi.atomx.in/v1/TagSeries/Series";
const TAG_SERIES_API_KEY = "pZebJlF_.dv3_prod.Iu7Zitu3X30C2R6-bVZtRXRu0DeiHY-j";

function buildUpstreamUrl({ eventId, adminId, yearSeries }) {
  const url = new URL(SERIES_ENDPOINT);
  url.searchParams.set("eventId", eventId);
  url.searchParams.set("adminId", adminId);
  url.searchParams.set("yearSeries", yearSeries);
  return url.toString();
}

async function proxySeries(authHeader, params) {
  const upstreamUrl = buildUpstreamUrl(params);
  const response = await fetch(upstreamUrl, {
    method: "GET",
    headers: {
      "x-api-key": TAG_SERIES_API_KEY,
      Authorization: authHeader
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const errorPayload = await response.text().catch(() => response.statusText);
    const message = errorPayload?.trim() || "Upstream Series error";
    throw new Response(message, { status: response.status });
  }

  return response.json();
}

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return Response.json({ error: "Missing Authorization header" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");
  const adminId = searchParams.get("adminId");
  const yearSeries = searchParams.get("yearSeries");

  if (!eventId || !adminId || !yearSeries) {
    return Response.json({ error: "eventId, adminId, and yearSeries are required" }, { status: 400 });
  }

  try {
    const payload = await proxySeries(authHeader, { eventId, adminId, yearSeries });
    return Response.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    console.error("Series proxy failed", error);
    return Response.json({ error: "Series proxy request failed" }, { status: 502 });
  }
}
