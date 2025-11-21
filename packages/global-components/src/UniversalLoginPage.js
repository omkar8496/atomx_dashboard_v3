"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { decodeJwt } from "@atomx/lib";

const DEFAULT_AUTH_URL = "https://dapi.atomx.in/auth/google/start";

const wrapperStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f7f6f2",
  padding: "64px 16px"
};

const cardStyle = {
  width: "100%",
  maxWidth: "360px",
  borderRadius: "22px",
  border: "1px solid #efece6",
  background: "#ffffff",
  padding: "40px 32px",
  textAlign: "center",
  boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
  fontFamily:
    '"Poppins", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
};

const buttonStyle = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  borderRadius: "999px",
  padding: "12px 20px",
  background: "#f88c43",
  color: "#fff",
  border: "none",
  fontWeight: 600,
  fontSize: "14px",
  cursor: "pointer",
  boxShadow: "0 10px 20px rgba(248,140,67,0.25)"
};

function buildAuthUrl(authUrl, appId, redirect) {
  try {
    const url = new URL(authUrl);
    if (redirect) url.searchParams.set("redirect", redirect);
    if (appId) url.searchParams.set("app", appId);
    return url.toString();
  } catch {
    return authUrl;
  }
}

export function UniversalLoginPage({
  appId = "atomx",
  redirectPath = "/",
  title = "Log in AtomX Dashboard",
  description = "Sign in to continue",
  authUrl = DEFAULT_AUTH_URL
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loginUrl, setLoginUrl] = useState(authUrl);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let redirectTarget = redirectPath || "/";
    if (!/^https?:\/\//i.test(redirectTarget)) {
      try {
        redirectTarget = new URL(redirectTarget, window.location.origin).toString();
      } catch {
        redirectTarget = window.location.href;
      }
    }

    const nextUrl = buildAuthUrl(authUrl, appId, redirectTarget);
    setLoginUrl(nextUrl);
  }, [appId, authUrl, redirectPath]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      process.env.NODE_ENV !== "development" ||
      searchParams.get("token") ||
      status !== "idle"
    ) {
      return;
    }

    let cancelled = false;
    import("../../../../DEV_TOKEN_TEMP.js")
      .then((mod) => {
        if (cancelled) return;
        const devToken = mod?.DEV_PORTAL_TOKEN;
        if (!devToken) return;
        const decoded = decodeJwt(devToken);
        setProfile(decoded);
        setStatus("success");
        window.localStorage.setItem(`atomx.auth.${appId}`, devToken);
        router.replace(window.location.pathname);
        setTimeout(() => router.push(redirectPath), 600);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [appId, redirectPath, router, searchParams, status]);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) return;

    try {
      const decoded = decodeJwt(token);
      setProfile(decoded);
      setStatus("success");
      if (typeof window !== "undefined") {
        window.localStorage.setItem(`atomx.auth.${appId}`, token);
        const newUrl = window.location.pathname;
        router.replace(newUrl);
        setTimeout(() => router.push(redirectPath), 1600);
      }
    } catch (err) {
      console.error(err);
      setError("We couldn't verify your login token. Please try again.");
      setStatus("error");
    }
  }, [searchParams, router, redirectPath, appId]);

  const statusLabel = useMemo(() => {
    switch (status) {
      case "success":
        return "Authenticated. Redirecting…";
      case "error":
        return error;
      default:
        return "Continue with Google";
    }
  }, [status, error]);

  return (
    <div style={wrapperStyle}>
      <div style={cardStyle}>
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#1e1e1e", marginBottom: 4 }}>
          {title}
        </h1>
        <p style={{ fontSize: "13px", color: "#6b6b6b", marginBottom: 20 }}>{description}</p>

        {status === "error" && (
          <div
            style={{
              borderRadius: 14,
              border: "1px solid #fecaca",
              background: "#fef2f2",
              color: "#b91c1c",
              fontSize: "13px",
              padding: 10,
              marginBottom: 12
            }}
          >
            {error}
          </div>
        )}

        {profile ? (
          <div
            style={{
              borderRadius: 14,
              border: "1px solid #e5e7eb",
              background: "#f8fafc",
              color: "#475569",
              fontSize: "13px",
              padding: 10,
              marginBottom: 12
            }}
          >
            Authenticated as <span style={{ fontWeight: 600, color: "#0f172a" }}>{profile.email}</span>.
            Redirecting…
          </div>
        ) : (
          <a href={loginUrl} style={buttonStyle}>
            <span
              style={{
                display: "flex",
                height: 32,
                width: 32,
                borderRadius: "999px",
                background: "#fff",
                alignItems: "center",
                justifyContent: "center",
                color: "#f88c43"
              }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M21.35 11.1h-9.18v2.92h5.91c-.24 1.4-1.47 4.1-5.91 4.1-3.55 0-6.45-2.93-6.45-6.56s2.9-6.56 6.45-6.56c2.02 0 3.37.86 4.14 1.6l2.83-2.73C16.93 2.85 14.7 2 12.08 2 6.64 2 2.24 6.48 2.24 12s4.4 10 9.84 10c5.68 0 9.44-3.99 9.44-9.6 0-.64-.07-1.13-.17-1.3"
                />
              </svg>
            </span>
            {statusLabel}
          </a>
        )}

        <p style={{ marginTop: 18, fontSize: "11px", color: "#a0a0a0" }}>
          You&apos;ll be redirected through Google OAuth. Grant access to continue into AtomX.
        </p>
      </div>
    </div>
  );
}
