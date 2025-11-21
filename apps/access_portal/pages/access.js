import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { decodeJwt, getInitials } from "@atomx/lib";
import { HeaderBar } from "../components/HeaderBar/HeaderBar";
import { WelcomePanel } from "../components/WelcomePanel/WelcomePanel";
import { AssignmentCard } from "../components/AssignmentCard/AssignmentCard";
import { QuickActionsPanel } from "../components/QuickActionsPanel/QuickActionsPanel";
import styles from "../styles/AccessPage.module.css";

const moduleLinks = {
  livelink: process.env.NEXT_PUBLIC_LIVELINK_URL ?? "http://localhost:3001",
  "tag-series": process.env.NEXT_PUBLIC_TAG_SERIES_URL ?? "http://localhost:3002"
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
      expiryAt: role.expiryAt ?? null
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
        initials: "AO"
      };
    }
    return {
      name: profile.name ?? "AtomX Operator",
      role: profile.type ?? "member",
      email: profile.email ?? "unknown@atomx.in",
      initials: getInitials(profile.name)
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
      permissions: modules.length ? modules.map((module) => module.title) : ["No modules assigned"]
    };
  }, [profile, modules]);

  const highlightActions = useMemo(() => {
    if (!modules.length) {
      return [
        { label: "LiveLink", variant: "teal" },
        { label: "Tag Series", variant: "orange" }
      ];
    }
    return modules.slice(0, 2).map((module, index) => ({
      label: module.title,
      variant: module.variant ?? (index === 0 ? "teal" : "orange")
    }));
  }, [modules]);

  const quickActions = useMemo(() => {
    if (!modules.length) {
      return [
        {
          title: "LiveLink",
          description: "Unified live orchestration",
          color: "#f88c43",
          type: "livelink"
        },
        {
          title: "Tag Series",
          description: "IoT tag + telemetry control",
          color: "#1495ab",
          type: "tag-series"
        }
      ];
    }
    return modules.map((module) => ({
      title: module.title,
      description: module.description,
      color: module.color,
      type: module.type
    }));
  }, [modules]);

  const handleAction = (action) => {
    const moduleMeta = modules.find((module) => module.type === action.type);
    if (moduleMeta?.href) {
      try {
        const target = new URL(moduleMeta.href);
        if (token) {
          target.searchParams.set("token", token);
        }
        window.location.href = target.toString();
        return;
      } catch {
        // fall back to modal
      }
    }
    setModalApp({
      title: action.title,
      description: action.description
    });
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
      <main className={styles.wrapper}>
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

        <WelcomePanel user={user} actions={highlightActions} />
        <AssignmentCard assignment={assignment} />
        <QuickActionsPanel actions={quickActions} onAction={handleAction} />
      </main>

      {modalApp && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard}>
            <h2>{modalApp.title}</h2>
            <p>
              {modalApp.description || "This module is going live soon. We&apos;ll notify you when access is ready."}
            </p>
            <button type="button" onClick={() => setModalApp(null)}>
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
