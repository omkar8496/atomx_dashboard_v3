import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { decodeJwt, getInitials } from "@atomx/lib";
import { HeaderBar } from "../components/HeaderBar/HeaderBar";
import { WelcomePanel } from "../components/WelcomePanel/WelcomePanel";
import { AssignmentCard } from "../components/AssignmentCard/AssignmentCard";
import { Add_Role } from "../components/Add_Role/Add_Role";

const moduleLinks = {
  livelink: process.env.NEXT_PUBLIC_LIVELINK_URL ?? "/livelink",
  "tag-series": process.env.NEXT_PUBLIC_TAG_SERIES_URL ?? "/tag_series"
};

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

export default function AccessPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [modules, setModules] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [modalApp, setModalApp] = useState(null);
  const [token, setToken] = useState(null);
  const [selecting, setSelecting] = useState(null);
  const [selectError, setSelectError] = useState(null);

  useEffect(() => {
    if (!router.isReady) return;
    let tokenCandidate = router.query.token;
    tokenCandidate = Array.isArray(tokenCandidate) ? tokenCandidate[0] : tokenCandidate;

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
      setToken(tokenCandidate);
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

  const assignment = useMemo(() => {
    if (!profile) {
      return {
        event: "Sign in to view assignments",
        email: "login@atomx.in",
        period: "—",
        permissions: []
      };
    }
    const expiry = profile.exp ? new Date(profile.exp * 1000).toLocaleString() : "Active";
    return {
      event: "AtomX Universal Access",
      email: profile.email,
      period: `Session expires ${expiry}`,
      permissions: modules.length
        ? modules.map((module) => ({
            label: module.title,
            type: module.type,
            href: module.href ?? moduleLinks[module.type]
          }))
        : [
            {
              label: "Tag Series",
              type: "tag-series",
              href: moduleLinks["tag-series"]
            }
          ]
    };
  }, [profile, modules]);

  const highlightActions = useMemo(() => [], []);

  const handlePermissionClick = async (permission) => {
    if (typeof window === "undefined") return;
    setSelectError(null);
    const apiBase = (process.env.NEXT_PUBLIC_BASE_URL ?? "https://dapi.atomx.in").replace(/\/$/, "");
    const moduleMeta =
      modules.find((module) => module.type === permission.type) ??
      modules.find((module) => module.title === permission.label);
    const destination = permission.href ?? moduleMeta?.href ?? moduleLinks[permission.type];
    const roleMatch =
      profile?.roles?.find((role) => role.type === permission.type) ??
      profile?.roles?.find((role) => role.type === permission.label);
    const adminId = roleMatch?.adminId;
    const apiType = permission.type ?? roleMatch?.type;

    if (!apiBase) {
      setSelectError("Missing API base URL (NEXT_PUBLIC_BASE_URL)");
      return;
    }
    if (!adminId || !apiType) {
      setSelectError("Module is missing admin access details.");
      return;
    }

    try {
      setSelecting(permission.type || permission.label || "switching");
      const res = await fetch(`${apiBase}/auth/select`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ adminId, type: apiType })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed (${res.status})`);
      }

      const data = await res.json();
      const nextToken = data.token ?? data.accessToken ?? data.data?.token;
      if (!nextToken) {
        throw new Error("No token returned from auth/select");
      }

      // persist and refresh state with new token
      window.localStorage.setItem("atomx.portal.token", nextToken);
      const decoded = decodeJwt(nextToken);
      const sanitized = sanitizeModules(decoded.roles);
      setProfile(decoded);
      setModules(sanitized);
      setToken(nextToken);
      sanitized.forEach((module) => {
        if (module.type) {
          window.localStorage.setItem(`atomx.auth.${module.type}`, nextToken);
        }
      });

      if (destination) {
        const target = destination.startsWith("http")
          ? new URL(destination)
          : new URL(destination, window.location.origin);
        target.searchParams.set("token", nextToken);
        window.location.href = target.toString();
      }
    } catch (err) {
      console.error(err);
      setSelectError(err.message || "Failed to switch module");
      setModalApp({
        title: permission.label,
        description: "We could not refresh your access token. Please try again."
      });
    } finally {
      setSelecting(null);
    }
  };

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem("atomx.portal.token");
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
    setToken(null);
    router.replace("/");
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
      <main className="mx-auto flex max-w-5xl flex-col gap-3 px-4 pb-10 pt-6 md:px-6 md:pt-8">
        <HeaderBar user={user} onSignOut={handleSignOut} />

        {status === "error" && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {status === "empty" && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-700">
            No active session detected. Please log in first.
          </div>
        )}

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <WelcomePanel user={user} actions={highlightActions} />
          <div className="flex justify-start md:justify-end px-1 md:px-2">
            <Add_Role labels={["Admin", "Operator"]} />
          </div>
        </div>
        <AssignmentCard assignment={assignment} onPermissionClick={handlePermissionClick} />
      </main>

      {selecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-6 py-5 shadow-[0_20px_45px_rgba(15,23,42,0.18)]">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0f9ca3] border-t-transparent" />
            <p className="m-0 text-sm font-semibold text-slate-700">Switching access…</p>
          </div>
        </div>
      )}

      {selectError && !modalApp && (
        <div className="fixed bottom-4 left-1/2 z-40 w-[90%] max-w-md -translate-x-1/2 rounded-2xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700 shadow-lg">
          {selectError}
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
