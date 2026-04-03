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
const dashboardConfigPath = "/Config/operations/";
const REAUTH_CONTEXT_KEY = "atomx.portal.reauth";
const REAUTH_CONTEXT_FALLBACK_TTL_MS = 24 * 60 * 60 * 1000;
const BOOTSTRAP_TOKEN_COOKIE = "atomx_bootstrap_token";
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

async function fetchSelectedEventDetails({ apiBase, eventId }) {
  if (!apiBase || !eventId) {
    throw new Error("Missing data to load event details.");
  }

  const res = await fetch(
    `${apiBase}/v1/Events/Details/${encodeURIComponent(eventId)}`,
    {
      method: "GET",
      headers: {
        ...(DASHBOARD_API_KEY ? { "x-api-key": DASHBOARD_API_KEY } : {})
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

  const sessionExpiry = useMemo(() => {
    return formatSessionExpiry(profile?.exp);
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
      await res.json().catch(() => null);
      clearBootstrapTokenCookie();

      if (typeof window !== "undefined") {
        window.localStorage.removeItem(REAUTH_CONTEXT_KEY);
      }

      let eventDetails = null;
      if (shouldFetchEventDetails) {
        eventDetails = await fetchSelectedEventDetails({
          apiBase,
          eventId
        });
      }

      capturePostHogEvent("module_selected", {
        app: "access_portal",
        user_email: userEmail,
        service: permission.service ?? mapServiceParam(apiType),
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
                service: permission.service ?? permission.type,
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
        if (permission.service) {
          target.searchParams.set("service", permission.service);
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

  const renderRoleCards = (roles, emptyLabel, options = {}) => {
    const { onCardClick, showOpenIcon = false } = options;
    const isAdminSection = options.section === "admin";
    if (!roles.length) {
      return (
        <div className="rounded-lg border border-[#e8d9d3] bg-white px-5 py-4 text-sm text-slate-600 shadow-[0_8px_18px_rgba(15,23,42,0.08)]">
          {emptyLabel}
        </div>
      );
    }

    return (
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roles.map((role) => (
          <article
            key={role.id}
            className={`group rounded-lg border border-[#e8d9d3] bg-white px-5 py-4 shadow-[0_8px_18px_rgba(15,23,42,0.08)] transition hover:border-[#1495ab]/40 hover:bg-[#f8fbfd] hover:shadow-[0_12px_22px_rgba(15,23,42,0.12)] ${
              onCardClick ? "cursor-pointer" : ""
            }`}
            onClick={
              onCardClick
                ? () => {
                    if (!role?.type) return;
                    onCardClick(role);
                  }
                : undefined
            }
          >
            <div className="flex items-start justify-between gap-3 text-sm font-semibold text-slate-700">
              <div className="flex flex-col gap-1">
                <span className="uppercase tracking-[0.12em] text-slate-500">
                  {role.type}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {role.expiryAt ? formatSessionExpiry(role.expiryAt) : "No expiry"}
                </span>
              </div>
              {showOpenIcon ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-500 opacity-0 transition group-hover:opacity-100"
                    aria-label="Open role"
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
                      <path d="M7 17l10-10" />
                      <path d="M9 7h8v8" />
                    </svg>
                  </button>
                </div>
              ) : null}
            </div>
            <div className="mt-3 h-px bg-slate-200" />
            <div className="mt-3 grid gap-2 text-sm text-slate-600">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[0.7rem] uppercase tracking-[0.2em] text-slate-400">
                  {isAdminSection ? "Admin Name" : "Event Name"}
                </span>
                <span className="text-sm font-semibold text-slate-700">
                  {isAdminSection ? role.adminName || "—" : role.eventName || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[0.7rem] uppercase tracking-[0.2em] text-slate-400">
                  {isAdminSection ? "Admin Id" : "Event Id"}
                </span>
                <span className="text-sm font-semibold text-slate-700">
                  {isAdminSection ? role.adminId ?? "—" : role.eventId ?? "—"}
                </span>
              </div>
            </div>
          </article>
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
      <main className="mx-auto flex w-full flex-col gap-3 px-4 pb-10 md:px-6">
        <HeaderBar
          user={user}
          onSignOut={handleSignOut}
          sessionLabel={sessionExpiry ? `Session expires ${sessionExpiry}` : null}
        />

        {status === "error" && !hideErrorBanner && (
          <div className="relative rounded-2xl border border-red-200 bg-red-50 px-5 py-4 pr-12 text-sm text-red-700">
            {error}
            <button
              type="button"
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-red-200 text-red-500 transition hover:bg-red-100"
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
          <div className="relative rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 pr-12 text-sm text-amber-700">
            No active session detected. Please log in first.
            <button
              type="button"
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-amber-200 text-amber-600 transition hover:bg-amber-100"
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

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <WelcomePanel user={user} actions={highlightActions} />
        </div>

        {roleCards.length ? (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-slate-800">Admin</h2>
              <div className="h-px flex-1 bg-slate-300" />
            </div>
            {renderRoleCards(adminRoles, "No admin roles assigned yet.", {
              onCardClick: handleAdminRoleClick,
              showOpenIcon: true,
              section: "admin"
            })}

            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-slate-800">Events</h2>
              <div className="h-px flex-1 bg-slate-300" />
            </div>
            {renderRoleCards(eventRoles, "No event roles assigned yet.", {
              onCardClick: handleEventRoleClick,
              showOpenIcon: true,
              section: "event"
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-[#e8d9d3] bg-white px-5 py-4 text-sm text-slate-600 shadow-[0_8px_18px_rgba(15,23,42,0.08)]">
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
