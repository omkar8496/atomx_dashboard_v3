"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { decodeJwt } from "@atomx/lib";

const DEFAULT_AUTH_URL = `${
  (process.env.NEXT_PUBLIC_BASE_URL ?? "https://dapi.atomx.in").replace(/\/$/, "")
}/auth/google/start`;

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
  title = "Sign in to AtomX Portal",
  description = "Access your event dashboard, manage cashless payments, and view real-time analytics.",
  authUrl = DEFAULT_AUTH_URL
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loginUrl, setLoginUrl] = useState(authUrl);
  const [devToken, setDevToken] = useState(null);

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

  const processToken = useCallback(
    (token, delay = 1200) => {
      if (!token) return;
      try {
        const decoded = decodeJwt(token);
        setProfile(decoded);
        setStatus("success");
        if (typeof window !== "undefined") {
          window.localStorage.setItem(`atomx.auth.${appId}`, token);
          if (appId === "portal") {
            window.localStorage.setItem("atomx.portal.token", token);
          }

          const url = new URL(window.location.href);
          url.searchParams.delete("token");
          window.history.replaceState(
            window.history.state,
            "",
            `${url.pathname}${url.search}${url.hash}`
          );

          window.setTimeout(() => {
            if (/^https?:\/\//i.test(redirectPath)) {
              window.location.assign(redirectPath);
            } else {
              router.push(redirectPath || "/");
            }
          }, delay);
        }
      } catch (err) {
        console.error(err);
        setError("We could not verify your login token. Please try again.");
        setStatus("error");
      }
    },
    [appId, redirectPath, router]
  );

  const handleGoogleSignIn = useCallback(
    (event) => {
      event.preventDefault();
      if (status === "loading" || status === "success") return;
      setError(null);
      setStatus("loading");
      if (typeof window !== "undefined") {
        window.setTimeout(() => {
          window.location.assign(loginUrl);
        }, 120);
      }
    },
    [loginUrl, status]
  );

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
    import("../../../DEV_TOKEN_TEMP.js")
      .then((mod) => {
        if (cancelled) return;
        if (mod?.DEV_PORTAL_TOKEN) {
          setDevToken(mod.DEV_PORTAL_TOKEN);
        }
      })
      .catch(() => setDevToken(null));

    return () => {
      cancelled = true;
    };
  }, [searchParams, status]);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) return;
    processToken(token);
  }, [searchParams, processToken]);

  const showDevButton =
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_DEV_TOKEN_BUTTON === "true" &&
    devToken &&
    status === "idle" &&
    !profile;

  const handleDevTokenLogin = () => {
    if (!showDevButton) return;
    processToken(devToken, 600);
  };

  const statusLabel = useMemo(() => {
    switch (status) {
      case "success":
        return "Authenticated. Redirecting...";
      case "loading":
        return "Verifying...";
      case "error":
        return error;
      default:
        return "Continue with Google";
    }
  }, [status, error]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#031026]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_14%,rgba(20,149,171,0.46)_0%,rgba(20,149,171,0.14)_28%,transparent_56%),radial-gradient(circle_at_78%_78%,rgba(248,140,67,0.34)_0%,rgba(248,140,67,0.12)_34%,transparent_62%),linear-gradient(120deg,#041329_0%,#0a2745_50%,#0f3759_100%)]" />

      <section className="relative z-10 flex min-h-screen items-center justify-center px-5 py-8 md:justify-end md:px-8">
        <div className="w-full max-w-[460px]">
          <div className="flex rounded-[10px] border border-white/28 bg-black/34 p-7 shadow-[0_26px_60px_rgba(2,8,20,0.46)] backdrop-blur-[10px] md:min-h-[600px] md:px-9 md:py-10">
            <div className="flex w-full flex-col">
              <img
                src="/shared/logos/AtomX_Logo.svg"
                alt="AtomX"
                className="block h-20 w-auto self-start object-contain brightness-0 invert md:h-40"
              />
              <div className="mt-2 h-px w-full max-w-[210px] bg-[linear-gradient(90deg,#F88C43_0%,#1495AB_52%,#FFFFFF_100%)]" />

              <h1 className="mt-7 text-[2.2rem] font-semibold leading-[1.08] text-white md:text-[2.8rem]">
                {title}
              </h1>
              <p className="mt-5 text-[1.04rem] leading-relaxed text-white/70">{description}</p>

              {status === "error" ? (
                <div className="mt-6 rounded-2xl border border-red-300/40 bg-red-400/10 px-4 py-3 text-base text-red-100">
                  {error}
                </div>
              ) : null}

              {profile ? (
                <div className="mt-7 rounded-2xl border border-white/25 bg-white/10 px-4 py-3 text-base text-white/90">
                  Authenticated as <span className="font-semibold text-white">{profile.email}</span>. Redirecting...
                </div>
              ) : (
                <a
                  href={loginUrl}
                  onClick={handleGoogleSignIn}
                  className={`mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-[26px] bg-[#f88c43] px-7 text-[1.2rem] font-semibold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.28)] shadow-[0_18px_38px_rgba(248,140,67,0.45)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f88c43]/45 ${
                    status === "loading" || status === "success"
                      ? "pointer-events-none opacity-95"
                      : "hover:brightness-105"
                  }`}
                >
                  <svg viewBox="0 0 24 24" aria-hidden className="h-7 w-7">
                    <path
                      fill="#4285F4"
                      d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.45a5.52 5.52 0 01-2.39 3.62v2.99h3.86c2.26-2.08 3.57-5.14 3.57-8.64z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.86-2.99c-1.07.72-2.44 1.15-4.09 1.15-3.14 0-5.8-2.12-6.75-4.98H1.26v3.11A12 12 0 0012 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.25 14.27a7.22 7.22 0 010-4.54V6.62H1.26a12 12 0 000 10.76l3.99-3.11z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.74c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.23 2.69 1.26 6.62l3.99 3.11c.95-2.86 3.61-4.99 6.75-4.99z"
                    />
                  </svg>
                  <span className="leading-none">{statusLabel}</span>
                </a>
              )}

              {showDevButton ? (
                <button
                  type="button"
                  onClick={handleDevTokenLogin}
                  className="mt-3 w-full rounded-full border border-dashed border-[#ffbb92] bg-[#fff3ea] px-4 py-2 text-sm font-semibold text-[#d24f10]"
                >
                  Use dev session token
                </button>
              ) : null}

              <p className="mt-auto pt-9 text-[0.96rem] leading-relaxed text-white/66 md:text-[1rem]">
                You&apos;ll be redirected through Google OAuth. Grant access to continue into AtomX.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
