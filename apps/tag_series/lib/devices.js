import { createApiClient, apiRoutes } from "@atomx/api-client";

const client = createApiClient({
  baseUrl: apiRoutes.tag_series.baseUrl,
  project: "tag_series"
});

export async function getDeviceSummary() {
  return {
    active: 1260,
    offline: 24,
    batteriesLow: 18
  };
}

export async function getRecentEvents() {
  return [
    { id: "evt-204", message: "Tag #2245 left safe zone", severity: "alert" },
    { id: "evt-205", message: "Batch 91 synced, 420 records", severity: "info" },
    { id: "evt-206", message: "Firmware 4.12 rolled out", severity: "success" }
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
