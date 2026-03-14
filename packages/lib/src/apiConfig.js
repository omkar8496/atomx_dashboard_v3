export const DEFAULT_BASE_URL = "https://dapi.atomx.in";

export function getBaseUrl() {
  return (process.env.NEXT_PUBLIC_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, "");
}
