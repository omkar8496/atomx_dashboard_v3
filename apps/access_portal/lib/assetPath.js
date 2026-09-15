// Assets in public/ are referenced with absolute paths ("/images/1.avif"), which
// resolve against the DOMAIN ROOT. That breaks when the export is hosted under a
// sub-path (for example a bucket serving it at /access_portal/). Next rewrites
// next/image and next/link automatically, but not plain <img> tags, so those
// paths go through this helper instead.
//
// Set NEXT_PUBLIC_ACCESS_PORTAL_BASEPATH to the sub-path when hosting under one;
// leave it unset (or "/") when the portal is served at a domain root.
const RAW_BASE_PATH = process.env.NEXT_PUBLIC_ACCESS_PORTAL_BASEPATH ?? "";

export const BASE_PATH =
  !RAW_BASE_PATH || RAW_BASE_PATH === "/"
    ? ""
    : `/${RAW_BASE_PATH.replace(/^\/+|\/+$/g, "")}`;

export function assetPath(path) {
  if (!path) return path;
  // Absolute URLs and data URIs are already complete.
  if (/^(https?:)?\/\//i.test(path) || path.startsWith("data:")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_PATH}${normalized}`;
}
