"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { decodeJwt } from "@atomx/lib";

const DEFAULT_AUTH_URL = "https://dapi.atomx.in/auth/google/start";

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

function IconInfo(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="10" x2="12" y2="16" />
      <circle cx="12" cy="7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconShield(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z" />
    </svg>
  );
}

function IconGoogle(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M21.35 11.1h-9.18v2.92h5.91c-.24 1.4-1.47 4.1-5.91 4.1-3.55 0-6.45-2.93-6.45-6.56S8.62 5 12.17 5c2.02 0 3.37.86 4.14 1.6l2.83-2.73C16.93 2.85 14.7 2 12.08 2 6.64 2 2.24 6.48 2.24 12s4.4 10 9.84 10c5.68 0 9.44-3.99 9.44-9.6 0-.64-.07-1.13-.17-1.3z" />
    </svg>
  );
}

export default function LoginScreen({
  appId = "portal",
  redirectPath = "/access",
  authUrl = DEFAULT_AUTH_URL
}) {
  const router = useRouter();
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
        redirectTarget = window.location.origin;
      }
    }
    setLoginUrl(buildAuthUrl(authUrl, appId, redirectTarget));
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

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      process.env.NODE_ENV !== "development" ||
      status !== "idle"
    ) {
      return;
    }

    let cancelled = false;
    import("../../../../DEV_TOKEN_TEMP.js")
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
  }, [status]);

  useEffect(() => {
    if (!router.isReady) return;
    const raw = router.query.token;
    const fromQuery = Array.isArray(raw) ? raw[0] : raw;
    const tokenFromUrl =
      fromQuery ||
      (typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("token")
        : null);
    if (tokenFromUrl) {
      processToken(tokenFromUrl);
    }
  }, [router.isReady, router.query.token, processToken]);

  const showDevButton =
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_DEV_TOKEN_BUTTON === "true" &&
    devToken &&
    status === "idle" &&
    !profile;

  const handleDevTokenLogin = () => {
    if (!showDevButton) return;
    processToken(devToken, 450);
  };

  const helperText = useMemo(() => {
    if (status === "success") return "Authenticated. Redirecting...";
    if (status === "error") return error;
    return "Access your event dashboard, manage cashless payments, and view real-time analytics.";
  }, [status, error]);

  return (
    <main className="min-h-screen bg-[#e9edf3]">
      <section className="w-full min-h-screen">
        <div className="overflow-hidden bg-white md:grid md:min-h-screen md:grid-cols-[1.38fr_0.62fr]">
          <div className="relative h-[54vh] min-h-[380px] md:h-auto">
            <img
              src="/shared/images/Sign_in_Screen.png"
              alt="AtomX sign in visual"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,12,24,0.56)_0%,rgba(7,12,24,0.2)_42%,rgba(7,12,24,0.08)_100%)]" />

            <div className="absolute left-6 top-6 z-10 hidden items-center gap-3 text-white md:flex">
              <img
                src="/shared/logos/AtomX_Logo.svg"
                alt="AtomX"
                className="h-11 w-auto object-contain brightness-[1.2]"
              />
            </div>

            <div className="absolute bottom-8 left-8 right-8 z-10 hidden text-white md:block">
              <h2 className="max-w-[340px] text-[3rem] font-semibold leading-[1.05]">
                Sign in to AtomX Portal
              </h2>
              <p className="mt-5 max-w-[430px] text-lg leading-relaxed text-white/85">
                Secure access to event operations, analytics, and payment controls.
              </p>
            </div>
          </div>

          <div className="relative -mt-10 rounded-t-[34px] bg-white px-7 pb-6 pt-7 md:mt-0 md:rounded-none md:px-10 md:py-10">
            <div className="mx-auto w-full max-w-[420px]">
              <div className="text-center md:text-left">
                <img
                  src="/shared/logos/AtomX_Logo.svg"
                  alt="AtomX"
                  className="mx-auto h-14 w-auto object-contain md:mx-0 md:h-16"
                />
                <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-[#f45d13] md:mx-0" />
                <h1 className="mt-7 text-[2.8rem] font-semibold leading-[1.08] text-[#0f1631] md:text-[3rem]">
                  Sign in to
                  <br />
                  AtomX Portal
                </h1>
              </div>

              {status === "error" ? (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              {profile ? (
                <div className="mt-7 rounded-xl border border-[#cde3f7] bg-[#f4f9ff] px-4 py-3 text-sm text-[#375576]">
                  Authenticated as{" "}
                  <span className="font-semibold text-[#10203b]">{profile.email}</span>. Redirecting...
                </div>
              ) : (
                <a
                  href={loginUrl}
                  className="mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#f45d13] px-6 text-base font-semibold text-white shadow-[0_14px_26px_rgba(244,93,19,0.22)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f45d13]/45"
                >
                  <IconGoogle className="h-6 w-6" />
                  <span className="text-[1.1rem] leading-none">Continue with Google</span>
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

              <p className="mx-auto mt-7 max-w-[420px] text-center text-base leading-relaxed text-[#8193b0] md:text-left md:text-[1rem]">
                {helperText}
              </p>

              <div className="mt-8 h-px w-full bg-[#e5eaf2]" />

              <div className="mt-5 flex items-center justify-center gap-8 text-[#70839f] md:justify-start">
                <a href="/legal/terms" className="inline-flex items-center gap-2 text-base font-medium hover:text-[#475a77]">
                  <IconInfo className="h-5 w-5" />
                  Terms
                </a>
                <a href="/legal/privacy" className="inline-flex items-center gap-2 text-base font-medium hover:text-[#475a77]">
                  <IconShield className="h-5 w-5" />
                  Privacy
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
