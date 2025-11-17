import { createApiClient, apiRoutes } from "@atomx/api-client";

export const livelinkApi = createApiClient({
  baseUrl: apiRoutes.livelink.baseUrl,
  project: "livelink"
});
