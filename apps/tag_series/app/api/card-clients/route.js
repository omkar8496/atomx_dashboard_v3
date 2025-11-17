const CARD_CLIENTS_ENDPOINT = "https://dapi.atomx.in/v1/TagSeries/CardClients";
const TAG_SERIES_API_KEY = "pZebJlF_.dv3_prod.Iu7Zitu3X30C2R6-bVZtRXRu0DeiHY-j";

async function proxyCardClients(authHeader) {
  const response = await fetch(CARD_CLIENTS_ENDPOINT, {
    method: "GET",
    headers: {
      "x-api-key": TAG_SERIES_API_KEY,
      Authorization: authHeader
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const errorPayload = await response.text().catch(() => response.statusText);
    const message = errorPayload?.trim() || "Upstream CardClients error";
    throw new Response(message, { status: response.status });
  }

  return response.json();
}

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return Response.json({ error: "Missing Authorization header" }, { status: 401 });
  }

  try {
    const payload = await proxyCardClients(authHeader);
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
    console.error("CardClients proxy failed", error);
    return Response.json({ error: "CardClients proxy request failed" }, { status: 502 });
  }
}
