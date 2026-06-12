import { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { decodeJwt, getBaseUrl, getInitials } from "@atomx/lib";
import { AtomXLoader, capturePostHogEvent } from "@atomx/global-components";
import { HeaderBar } from "../components/HeaderBar/HeaderBar";
import { WelcomePanel } from "../components/WelcomePanel/WelcomePanel";

const moduleLinks = {
  livelink: process.env.NEXT_PUBLIC_LIVELINK_URL ?? "/livelink",
  "tag-series": process.env.NEXT_PUBLIC_TAG_SERIES_URL ?? "/tag_series"
};
const dashboardBase = (process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "").replace(/\/$/, "");
const dashboardConfigPath = "/Config/";
const REAUTH_CONTEXT_KEY = "atomx.portal.reauth";
const REAUTH_CONTEXT_FALLBACK_TTL_MS = 24 * 60 * 60 * 1000;
const BOOTSTRAP_TOKEN_COOKIE = "atomx_bootstrap_token";
const DASHBOARD_SELECTED_TOKEN_KEY = "atomx.dashboard.token";
const DASHBOARD_API_KEY =
  process.env.NEXT_PUBLIC_DASHBOARD_API_KEY ??
  "pZebJlF_.dv3_prod.Iu7Zitu3X30C2R6-bVZtRXRu0DeiHY-j";

function ensureTrailingSlashForRoute(value) {
  if (!value) return value;
  try {
    const isAbsolute = /^https?:\/\//i.test(value);
    const parsed = isAbsolute ? new URL(value) : new URL(value, "http://atomx.local");
    const pathname = parsed.pathname || "/";
    const lastSegment = pathname.split("/").pop() || "";
    const hasFileExtension = lastSegment.includes(".");
    if (!hasFileExtension && !pathname.endsWith("/")) {
      parsed.pathname = `${pathname}/`;
    }
    return isAbsolute
      ? parsed.toString()
      : `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return value;
  }
}

const accessAdminUrl = ensureTrailingSlashForRoute(
  process.env.NEXT_PUBLIC_ACCESS_ADMIN_URL ?? `${dashboardBase}/admin`
);

const MODULE_CATALOG = {
  "tag-series": {
    title: "Tag Series",
    description: "Provision NFC tags, manage telemetry, and orchestrate IoT fleets.",
    color: "#1495ab",
    variant: "teal",
    href: moduleLinks["tag-series"]
  },
  livelink: {
    title: "LiveLink",
    description: "Route live content, moderate pipelines, and automate streaming.",
    color: "#f88c43",
    variant: "orange",
    href: moduleLinks.livelink
  }
};

const FALLBACK_MODULE = {
  title: "Coming Soon",
  description: "This module will be available shortly.",
  color: "#d1d5db",
  variant: "teal"
};

function formatSessionExpiry(expirySeconds) {
  if (!expirySeconds) return null;
  const expiryDate = new Date(expirySeconds * 1000);
  if (Number.isNaN(expiryDate.getTime())) return null;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

  let prefix = "";
  if (expiryDate >= startOfToday && expiryDate < startOfTomorrow) {
    prefix = "Today";
  } else if (expiryDate >= startOfTomorrow && expiryDate < new Date(startOfTomorrow.getTime() + 86400000)) {
    prefix = "Tomorrow";
  } else if (expiryDate >= startOfYesterday && expiryDate < startOfToday) {
    prefix = "Yesterday";
  }

  const formatted = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(expiryDate);

  return prefix ? `${prefix}, ${formatted}` : formatted;
}

function sanitizeReturnTo(value) {
  try {
    const parsed = new URL(value, window.location.origin);
    parsed.searchParams.delete("returnTo");
    parsed.searchParams.delete("token");
    return parsed.toString();
  } catch (err) {
    return value;
  }
}

function normalizeRoleType(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-");
}

function mapServiceParam(type) {
  const normalized = normalizeRoleType(type);
  if (normalized.includes("tag-series") || normalized.includes("tagseries")) {
    return "tag-series";
  }
  if (normalized.includes("cashless")) return "cashless";
  if (normalized.includes("inventory")) return "inventory";
  return normalized;
}

function sanitizeModules(roles = []) {
  const seen = new Set();
  return roles.reduce((acc, role) => {
    if (!role?.type || seen.has(role.type)) return acc;
    seen.add(role.type);
    const meta = MODULE_CATALOG[role.type] ?? {
      ...FALLBACK_MODULE,
      title: role.type,
      typeLabel: role.type
    };
    acc.push({
      ...meta,
      type: role.type,
      expiryAt: role.expiryAt ?? null,
      adminId: role.adminId ?? null,
      rawRole: role
    });
    return acc;
  }, []);
}

function findRoleMatch(roles, type, eventId, adminId) {
  if (!Array.isArray(roles) || !type) return null;
  const typeNorm = normalizeRoleType(type);
  const eventIdNorm =
    eventId === null || eventId === undefined || eventId === ""
      ? null
      : String(eventId);
  const adminIdNorm =
    adminId === null || adminId === undefined || adminId === ""
      ? null
      : String(adminId);

  const typedRoles = roles.filter((role) => normalizeRoleType(role?.type) === typeNorm);
  if (!typedRoles.length) return null;

  if (eventIdNorm) {
    const byEvent = typedRoles.find((role) => String(role?.eventId) === eventIdNorm);
    if (byEvent) return byEvent;
  }

  if (adminIdNorm) {
    const byAdmin = typedRoles.find((role) => String(role?.adminId) === adminIdNorm);
    if (byAdmin) return byAdmin;
  }

  return typedRoles[0] ?? null;
}

function readReauthContext() {
  if (typeof window === "undefined") return null;
  let parsed = null;
  try {
    const raw = window.localStorage.getItem(REAUTH_CONTEXT_KEY);
    if (!raw) return null;
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse reauth context", err);
    window.localStorage.removeItem(REAUTH_CONTEXT_KEY);
    return null;
  }

  if (!parsed || typeof parsed !== "object") {
    window.localStorage.removeItem(REAUTH_CONTEXT_KEY);
    return null;
  }

  const now = Date.now();
  const expiresAt = Number(parsed.expiresAt);
  const createdAt = Number(parsed.createdAt);
  const hasExpiry = Number.isFinite(expiresAt);
  const hasCreatedAt = Number.isFinite(createdAt);
  const isExpired = hasExpiry
    ? expiresAt <= now
    : hasCreatedAt
      ? now - createdAt > REAUTH_CONTEXT_FALLBACK_TTL_MS
      : false;

  if (isExpired) {
    window.localStorage.removeItem(REAUTH_CONTEXT_KEY);
    return null;
  }

  return parsed;
}

function readCookie(name) {
  if (typeof document === "undefined") return null;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setBootstrapTokenCookie(tokenValue) {
  if (typeof window === "undefined" || !tokenValue) return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${BOOTSTRAP_TOKEN_COOKIE}=${encodeURIComponent(
    tokenValue
  )}; Path=/; Max-Age=1800; SameSite=Lax${secure}`;
}

function clearBootstrapTokenCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${BOOTSTRAP_TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

function findTokenInResponse(value, seen = new Set(), allowRawString = true) {
  if (!value) return null;
  if (typeof value === "string") {
    return allowRawString && value.split(".").length >= 3 ? value : null;
  }
  if (typeof value !== "object" || seen.has(value)) return null;
  seen.add(value);

  const tokenKeys = [
    "token",
    "accessToken",
    "access_token",
    "jwt",
    "idToken",
    "id_token",
    "authToken",
    "auth_token",
    "bearerToken",
    "bearer_token",
    "selectedToken",
    "selected_token",
    "sessionToken",
    "session_token"
  ];
  for (const key of tokenKeys) {
    const token = value[key];
    if (typeof token === "string" && token) return token;
  }

  for (const key of ["data", "result", "value"]) {
    const token = value[key];
    if (typeof token === "string" && token.split(".").length >= 3) return token;
  }

  for (const item of Object.values(value)) {
    const token = findTokenInResponse(item, seen, false);
    if (token) return token;
  }
  return null;
}

function persistSelectedAuthToken(token, { type, service }) {
  if (typeof window === "undefined" || !token) return;
  const keys = new Set([
    DASHBOARD_SELECTED_TOKEN_KEY,
    type ? `atomx.auth.${type}` : null,
    type ? `atomx.auth.${normalizeRoleType(type)}` : null,
    service ? `atomx.auth.${service}` : null
  ]);
  if (service === "tag-series") {
    keys.add("atomx.auth.tag_series");
  }
  keys.forEach((key) => {
    if (key) window.localStorage.setItem(key, token);
  });
}

async function fetchSelectedEventDetails({ apiBase, eventId, token }) {
  if (!apiBase || !eventId) {
    throw new Error("Missing data to load event details.");
  }

  const res = await fetch(
    `${apiBase}/v1/Events/Details/${encodeURIComponent(eventId)}`,
    {
      method: "GET",
      headers: {
        ...(DASHBOARD_API_KEY ? { "x-api-key": DASHBOARD_API_KEY } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      credentials: "include",
      cache: "no-store"
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Unable to load event details (${res.status})`);
  }

  const data = await res.json().catch(() => null);
  return data?.event ?? data?.data?.event ?? null;
}

function formatSectionCount(count) {
  return String(count).padStart(2, "0");
}

function RoleGlyph({ type }) {
  const normalized = normalizeRoleType(type);
  const iconClass = "h-3.5 w-3.5";

  if (normalized === "admin") {
    return (
      <svg
        viewBox="0 0 24 24"
        className={iconClass}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    );
  }

  if (normalized.includes("cashless")) {
    return (
      <svg
        viewBox="0 0 24 24"
        className={iconClass}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <rect x="4" y="6" width="16" height="12" rx="2" />
        <path d="M4 10h16" />
        <path d="M8 15h4" />
      </svg>
    );
  }

  if (normalized.includes("inventory")) {
    return (
      <svg
        viewBox="0 0 24 24"
        className={iconClass}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
        <path d="m4.5 8 7.5 4 7.5-4" />
        <path d="M12 12v8.5" />
      </svg>
    );
  }

  if (normalized.includes("tag")) {
    return (
      <svg
        viewBox="0 0 24 24"
        className={iconClass}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M20 13 13 20 4 11V4h7l9 9Z" />
        <path d="M7.5 7.5h.01" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className={iconClass}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="5" y="5" width="14" height="14" rx="3" />
      <path d="M9 9h6v6H9z" />
    </svg>
  );
}

function OpenArrowGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M7 17 17 7" />
      <path d="M9 7h8v8" />
    </svg>
  );
}

export default function AccessPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [modules, setModules] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [modalApp, setModalApp] = useState(null);
  const [selecting, setSelecting] = useState(null);
  const [selectError, setSelectError] = useState(null);
  const [hideErrorBanner, setHideErrorBanner] = useState(false);
  const [hideEmptyBanner, setHideEmptyBanner] = useState(false);
  const reauthHandledRef = useRef(false);

  useEffect(() => {
    if (!router.isReady) return;
    const queryTokenRaw = router.query.token;
    const queryToken = Array.isArray(queryTokenRaw) ? queryTokenRaw[0] : queryTokenRaw;
    let tokenCandidate = queryToken;

    if (!tokenCandidate && typeof window !== "undefined") {
      const directToken = new URLSearchParams(window.location.search).get("token");
      if (directToken) {
        tokenCandidate = directToken;
      }
    }

    if (!tokenCandidate && typeof window !== "undefined") {
      tokenCandidate = window.localStorage.getItem("atomx.portal.token");
    }

    if (!tokenCandidate) {
      setStatus("empty");
      router.replace("/");
      return;
    }

    try {
      const decoded = decodeJwt(tokenCandidate);
      const sanitized = sanitizeModules(decoded.roles);
      setProfile(decoded);
      setModules(sanitized);
      setBootstrapTokenCookie(tokenCandidate);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("atomx.portal.token", tokenCandidate);
        sanitized.forEach((module) => {
          window.localStorage.setItem(`atomx.auth.${module.type}`, tokenCandidate);
        });
      }
      setStatus("ready");
      if (tokenCandidate && typeof window !== "undefined") {
        const url = new URL(window.location.href);
        if (url.searchParams.has("token")) {
          url.searchParams.delete("token");
          router.replace(url.pathname, undefined, { shallow: true });
        }
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setError("We could not verify your access token. Please sign in again.");
    }
  }, [router]);

  useEffect(() => {
    setHideErrorBanner(false);
    setHideEmptyBanner(false);
  }, [status, error]);

  const user = useMemo(() => {
    if (!profile) {
      return {
        name: "AtomX Operator",
        role: "Awaiting Login",
        email: "login@atomx.in",
        initials: "AO",
        picture: null
      };
    }
    return {
      name: profile.name ?? "AtomX Operator",
      role: profile.type ?? "member",
      email: profile.email ?? "unknown@atomx.in",
      initials: getInitials(profile.name),
      picture: profile.picture ?? profile.image ?? null
    };
  }, [profile]);

  const roleCards = useMemo(() => {
    if (!Array.isArray(profile?.roles)) return [];
    return profile.roles.map((role, index) => ({
      id: role?.id ?? `${role?.type ?? "role"}-${index}`,
      type: role?.type ?? "Unknown",
      expiryAt: role?.expiryAt ?? null,
      eventName: role?.eventName ?? null,
      eventId: role?.eventId ?? null,
      adminName: role?.adminName ?? null,
      adminId: role?.adminId ?? null
    }));
  }, [profile]);

  const adminRoles = useMemo(() => {
    return roleCards.filter(
      (role) => String(role.type || "").toLowerCase() === "admin"
    );
  }, [roleCards]);

  const eventRoles = useMemo(() => {
    return roleCards.filter(
      (role) => String(role.type || "").toLowerCase() !== "admin"
    );
  }, [roleCards]);

  const highlightActions = useMemo(() => [], []);

  const handlePermissionClick = async (permission) => {
    if (typeof window === "undefined") return;
    if (selecting) return;
    setSelectError(null);
    const apiBase = getBaseUrl();
    const moduleMeta =
      modules.find((module) => module.type === permission.type) ??
      modules.find((module) => module.title === permission.label);
    const destination =
      permission.destination ?? permission.href ?? moduleMeta?.href ?? moduleLinks[permission.type];
    const roleMatch = findRoleMatch(
      profile?.roles,
      permission.type ?? permission.label,
      permission.eventId,
      permission.adminId
    );
    const adminId = permission.adminId ?? roleMatch?.adminId;
    const apiType = permission.type ?? roleMatch?.type;
    const normalizedType = normalizeRoleType(apiType || "");
    const isAdminType = normalizedType === "admin";
    const needsEventId =
      normalizedType &&
      normalizedType !== "tag-series" &&
      normalizedType !== "tag_series" &&
      normalizedType !== "tag series" &&
      !isAdminType;
    const eventId = permission.eventId ?? roleMatch?.eventId ?? null;
    const userEmail = profile?.email ?? null;

    capturePostHogEvent("module_role_selected", {
      app: "access_portal",
      user_email: userEmail,
      module_type: apiType ?? null,
      selected_label: permission.label ?? null,
      admin_id: adminId ?? null,
      event_id: eventId ?? null
    });

    if (!apiBase) {
      setSelectError("Missing API base URL (NEXT_PUBLIC_BASE_URL)");
      return;
    }
    if (!apiType) {
      setSelectError("Module type is missing.");
      return;
    }
    if (needsEventId && !eventId) {
      setSelectError("Event ID is required for this module.");
      return;
    }
    if (!needsEventId && !adminId) {
      setSelectError("Admin ID is required for this module.");
      return;
    }

    const shouldFetchEventDetails = Boolean(
      (permission.requireEventDetails ??
        (needsEventId &&
          normalizedType !== "tag-series" &&
          normalizedType !== "tag_series" &&
          normalizedType !== "tag series")) &&
        eventId
    );

    let didNavigateAway = false;
    try {
      setSelecting(permission.type || permission.label || "switching");
      const payload = needsEventId
        ? { type: apiType, eventId }
        : { type: apiType, adminId };
      const bootstrapToken = readCookie(BOOTSTRAP_TOKEN_COOKIE);
      const res = await fetch(`${apiBase}/auth/select`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(bootstrapToken ? { Authorization: `Bearer ${bootstrapToken}` } : {})
        },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed (${res.status})`);
      }
      const selectionData = await res.json().catch(() => null);
      const selectedToken = findTokenInResponse(selectionData);
      const service = permission.service ?? mapServiceParam(apiType);
      if (selectedToken) {
        persistSelectedAuthToken(selectedToken, {
          type: apiType,
          service
        });
      } else if (typeof window !== "undefined") {
        window.localStorage.removeItem(DASHBOARD_SELECTED_TOKEN_KEY);
        window.localStorage.removeItem("atomx.dashboard.store");
      }
      clearBootstrapTokenCookie();

      if (typeof window !== "undefined") {
        window.localStorage.removeItem(REAUTH_CONTEXT_KEY);
      }

      let eventDetails = null;
      if (shouldFetchEventDetails) {
        eventDetails = await fetchSelectedEventDetails({
          apiBase,
          eventId,
          token: selectedToken
        });
      }

      capturePostHogEvent("module_selected", {
        app: "access_portal",
        user_email: userEmail,
        service,
        module_type: apiType ?? null,
        admin_id: adminId ?? null,
        event_id: eventId ?? null,
        destination: destination ?? null
      });

      if (destination) {
        const target = destination.startsWith("http")
          ? new URL(destination)
          : new URL(destination, window.location.origin);
        if (permission.returnMode === "message" && window.opener && !window.opener.closed) {
          try {
            window.opener.postMessage(
              {
                type: "atomx.auth",
                service: service ?? permission.type,
                token: selectedToken,
                eventId
              },
              target.origin
            );
            window.close();
            return;
          } catch (err) {
            console.error("Failed to post auth token", err);
          }
        }
        if (service) {
          target.searchParams.set("service", service);
        }
        if (selectedToken) {
          target.searchParams.set("token", selectedToken);
        }
        if (shouldFetchEventDetails) {
          const resolvedEventId = eventDetails?.id ?? eventId;
          const resolvedEventName = eventDetails?.name ?? eventDetails?.eventName ?? null;
          const resolvedVenue = eventDetails?.venue ?? null;
          const resolvedCity =
            eventDetails?.locationCity ?? eventDetails?.city ?? null;

          if (resolvedEventId) {
            target.searchParams.set("eventId", String(resolvedEventId));
          }
          if (resolvedEventName) {
            target.searchParams.set("eventName", resolvedEventName);
          }
          if (resolvedVenue) {
            target.searchParams.set("venue", resolvedVenue);
          }
          if (resolvedCity) {
            target.searchParams.set("city", resolvedCity);
          }
        }
        didNavigateAway = true;
        window.location.assign(target.toString());
        return;
      }
    } catch (err) {
      console.error(err);
      capturePostHogEvent("module_selection_failed", {
        app: "access_portal",
        user_email: userEmail,
        module_type: apiType ?? null,
        service: permission.service ?? mapServiceParam(apiType),
        admin_id: adminId ?? null,
        event_id: eventId ?? null,
        error_message: err?.message || "service_selection_failed"
      });
      setSelectError(err.message || "Failed to switch module");
      setModalApp({
        title: permission.label,
        description: "We could not refresh your access token. Please try again."
      });
    } finally {
      clearBootstrapTokenCookie();
      if (!didNavigateAway) {
        setSelecting(null);
      }
    }
  };

  useEffect(() => {
    if (status !== "ready" || !profile || reauthHandledRef.current) return;
    if (typeof window === "undefined") return;

    const returnToParamRaw = router.query.returnTo;
    const returnToParam = Array.isArray(returnToParamRaw)
      ? returnToParamRaw[0]
      : returnToParamRaw;
    const sanitizedReturnToParam =
      returnToParam && typeof window !== "undefined"
        ? sanitizeReturnTo(returnToParam)
        : returnToParam;

    const context = readReauthContext();
    const rawReturnTo = context?.returnTo || sanitizedReturnToParam || null;
    const returnTo = rawReturnTo ? sanitizeReturnTo(rawReturnTo) : null;
    const type = context?.type || null;
    const eventId = context?.eventId ?? null;
    const adminId = context?.adminId ?? null;
    const service = context?.service || mapServiceParam(type);
    const currentUrl = sanitizeReturnTo(window.location.href);

    if (type) {
      const hasRole = Boolean(findRoleMatch(profile?.roles, type, eventId, adminId));
      if (hasRole) {
        reauthHandledRef.current = true;
        handlePermissionClick({
          type,
          label: type,
          eventId,
          adminId,
          destination: returnTo,
          service
        });
        return;
      }
      window.localStorage.removeItem(REAUTH_CONTEXT_KEY);
    }

    if (returnTo && returnTo !== currentUrl) {
      reauthHandledRef.current = true;
      window.localStorage.removeItem(REAUTH_CONTEXT_KEY);
      window.location.assign(returnTo);
    }
  }, [status, profile, router.query.returnTo, handlePermissionClick]);

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem("atomx.portal.token");
        window.localStorage.removeItem(DASHBOARD_SELECTED_TOKEN_KEY);
        window.localStorage.removeItem("atomx.dashboard.store");
        window.localStorage.removeItem(REAUTH_CONTEXT_KEY);
        const keysToRemove = [];
        for (let i = 0; i < window.localStorage.length; i += 1) {
          const key = window.localStorage.key(i);
          if (!key) continue;
          if (key.startsWith("atomx.auth.")) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => window.localStorage.removeItem(key));
        if (window.sessionStorage) {
          window.sessionStorage.clear();
        }
      } catch (err) {
        console.error("Failed to clear auth cache", err);
      }
      window.location.assign("/");
      return;
    }
    setProfile(null);
    setModules([]);
    setStatus("empty");
    clearBootstrapTokenCookie();
    router.replace("/");
  };

  const handleEventRoleClick = (role) => {
    const service = mapServiceParam(role?.type);
    const isTagSeries = service === "tag-series";
    const destination = isTagSeries
      ? ensureTrailingSlashForRoute(moduleLinks["tag-series"])
      : `${dashboardBase}${dashboardConfigPath}`;
    handlePermissionClick({
      type: role.type,
      label: role.type,
      destination,
      service,
      eventId: role.eventId,
      requireEventDetails: !isTagSeries
    });
  };

  const handleAdminRoleClick = (role) => {
    handlePermissionClick({
      type: role.type,
      label: role.type,
      destination: accessAdminUrl
    });
  };

  const renderSectionHeader = (count, label) => (
    <div className="flex items-center gap-3">
      <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-[#1f1f1f] px-2 text-[0.7rem] font-semibold text-white">
        {formatSectionCount(count)}
      </span>
      <h2 className="m-0 text-[1rem] font-medium text-[#1d2940]">{label}</h2>
    </div>
  );

  const renderRoleCards = (roles, emptyLabel, options = {}) => {
    const { onCardClick, showOpenIcon = false } = options;
    const isAdminSection = options.section === "admin";
    const gridClass = isAdminSection
      ? "grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(280px,370px))] max-[640px]:grid-cols-1"
      : "grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(205px,215px))] max-[500px]:grid-cols-1";

    if (!roles.length) {
      return (
        <div className="rounded-lg border border-[#ececec] bg-white px-5 py-4 text-sm text-[#58677f] shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
          {emptyLabel}
        </div>
      );
    }

    return (
      <section className={gridClass}>
        {roles.map((role) => (
          <button
            key={role.id}
            type="button"
            className={`group relative min-h-[98px] overflow-visible rounded-lg border border-transparent bg-white p-0 text-left shadow-[0_10px_20px_rgba(15,23,42,0.055)] transition duration-200 ease-out hover:-translate-y-1.5 hover:shadow-[0_16px_28px_rgba(47,30,199,0.10),0_10px_18px_rgba(224,68,32,0.06)] ${
              onCardClick ? "cursor-pointer" : "cursor-default"
            }`}
            style={{
              background:
                "linear-gradient(#fff, #fff) padding-box, linear-gradient(135deg, rgba(224,68,32,0.35), rgba(47,30,199,0.32)) border-box"
            }}
            onClick={() => {
              if (!onCardClick || !role?.type) return;
              onCardClick(role);
            }}
            disabled={!onCardClick}
            aria-label={`Open ${role.type}`}
          >
            <span
              className="pointer-events-none absolute inset-x-7 -bottom-3 h-7 rounded-full bg-[rgba(47,30,199,0.09)] opacity-0 blur-xl transition duration-200 group-hover:opacity-100"
              aria-hidden
            />
            <div className="relative flex h-full min-h-[96px] flex-col px-2.5 py-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-start gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[linear-gradient(135deg,#e04420,#2f1ec7)] text-white">
                    <RoleGlyph type={role.type} />
                  </span>
                  <div className="min-w-0">
                    <p className="m-0 truncate text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-[#72809b]">
                      {role.type}
                    </p>
                    <p className="m-0 mt-0.5 truncate text-[0.62rem] font-medium text-[#71809a]">
                      {role.expiryAt ? formatSessionExpiry(role.expiryAt) : "No expiry"}
                    </p>
                  </div>
                </div>
                {showOpenIcon ? (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-[#e2e2e2] bg-white text-[#262626] shadow-[0_5px_10px_rgba(15,23,42,0.05)] transition duration-200 group-hover:border-[#e04420] group-hover:text-[#e04420]">
                    <OpenArrowGlyph />
                  </span>
                ) : null}
              </div>

              <div className="ml-8 mt-1.5 min-w-0">
                <p className="m-0 truncate text-[0.74rem] font-medium text-[#262626]">
                  {isAdminSection ? role.adminName || "—" : role.eventName || "—"}
                </p>
                <div className="mt-1.5 h-px bg-[#ececec]" />
              </div>

              <div className="ml-8 mt-auto flex items-center justify-between gap-2 pt-1.5">
                <span className="text-[0.54rem] font-semibold uppercase tracking-[0.2em] text-[#a0acc0]">
                  {isAdminSection ? "Admin Id" : "Event Id"}
                </span>
                <span className="text-[0.74rem] font-semibold text-[#22304a]">
                  {isAdminSection ? role.adminId ?? "—" : role.eventId ?? "—"}
                </span>
              </div>
            </div>
          </button>
        ))}
      </section>
    );
  };

  return (
    <>
      <Head>
        <title>AtomX Access Portal</title>
        <meta
          name="description"
          content="Pick the AtomX module you need in one click."
        />
      </Head>
      <main className="min-h-[calc(100vh-58px)] w-full bg-[#f7f7f8] px-4 pb-12 md:px-5">
        <HeaderBar
          user={user}
          onSignOut={handleSignOut}
          pageTitle="Workspace"
        />

        {status === "error" && !hideErrorBanner && (
          <div className="relative mt-5 rounded-lg border border-red-200 bg-red-50 px-5 py-4 pr-12 text-sm text-red-700">
            {error}
            <button
              type="button"
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md border border-red-200 text-red-500 transition hover:bg-red-100"
              onClick={() => setHideErrorBanner(true)}
              aria-label="Dismiss error"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {status === "empty" && !hideEmptyBanner && (
          <div className="relative mt-5 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 pr-12 text-sm text-amber-700">
            No active session detected. Please log in first.
            <button
              type="button"
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md border border-amber-200 text-amber-600 transition hover:bg-amber-100"
              onClick={() => setHideEmptyBanner(true)}
              aria-label="Dismiss notice"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="mt-6">
          <WelcomePanel user={user} actions={highlightActions} />
        </div>

        <div className="mt-4 h-px w-full bg-[#dddddd]" />

        {roleCards.length ? (
          <div className="mt-5 flex flex-col gap-7">
            <div className="flex flex-col gap-3">
              {renderSectionHeader(adminRoles.length, "Admin Workspaces")}
              {renderRoleCards(adminRoles, "No admin roles assigned yet.", {
                onCardClick: handleAdminRoleClick,
                showOpenIcon: true,
                section: "admin"
              })}
            </div>

            <div className="flex flex-col gap-3">
              {renderSectionHeader(eventRoles.length, "Events")}
              {renderRoleCards(eventRoles, "No event roles assigned yet.", {
                onCardClick: handleEventRoleClick,
                showOpenIcon: true,
                section: "event"
              })}
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-lg border border-[#ececec] bg-white px-5 py-4 text-sm text-[#58677f] shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
            No roles assigned yet.
          </div>
        )}
      </main>

      {selecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="rounded-2xl bg-white px-6 py-4 shadow-[0_20px_45px_rgba(15,23,42,0.18)]">
            <AtomXLoader label="Switching access..." size={62} />
          </div>
        </div>
      )}

      {selectError && !modalApp && (
        <div className="fixed bottom-4 left-1/2 z-40 w-[90%] max-w-md -translate-x-1/2 rounded-2xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700 shadow-lg">
          {selectError}
          <button
            type="button"
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-red-200 text-red-500 transition hover:bg-red-100"
            onClick={() => setSelectError(null)}
            aria-label="Dismiss error"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {modalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-[0_32px_65px_rgba(15,23,42,0.24)]">
            <h2 className="m-0 text-xl font-semibold">{modalApp.title}</h2>
            <p className="mt-3 text-base text-slate-600">
              {modalApp.description || "This module is going live soon. We’ll notify you when access is ready."}
            </p>
            <button
              type="button"
              className="mt-5 w-full rounded-full bg-[#e04420] px-4 py-3 text-sm font-semibold text-white shadow-[0_15px_40px_rgba(224,68,32,0.3)] transition hover:brightness-105"
              onClick={() => setModalApp(null)}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
