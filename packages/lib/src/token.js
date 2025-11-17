function normalizeBase64(segment = "") {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4;
  if (padding === 2) return normalized + "==";
  if (padding === 3) return normalized + "=";
  if (padding !== 0) return normalized + "==";
  return normalized;
}

export function decodeJwt(token) {
  if (!token) throw new Error("Missing token");
  const parts = token.split(".");
  if (parts.length < 2) throw new Error("Invalid JWT format");
  const payload = normalizeBase64(parts[1]);
  const decoded =
    typeof window === "undefined"
      ? Buffer.from(payload, "base64").toString("utf-8")
      : atob(payload);
  return JSON.parse(decoded);
}

export function getInitials(name = "") {
  if (!name) return "AO";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
