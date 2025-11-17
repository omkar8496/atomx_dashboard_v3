import { createApiClient, apiRoutes } from "@atomx/api-client";

const client = createApiClient({
  baseUrl: apiRoutes.livelink.baseUrl,
  project: "livelink"
});

export async function getLiveStats() {
  // Placeholder API read; swap with real API when ready.
  return {
    streams: 42,
    uptime: 99.98,
    latency: 280
  };
}

export async function getLiveSources() {
  // Example data; fetch from client.get("/sources") later.
  return [
    { id: "social", label: "Social", active: true },
    { id: "commerce", label: "Commerce", active: true },
    { id: "ads", label: "Ads", active: false }
  ];
}

export async function pingHealth() {
  try {
    await client.health();
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}
