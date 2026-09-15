"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { assetPath } from "../../lib/assetPath";
import { decodeJwt } from "@atomx/lib";
import {
  capturePostHogEvent,
  getAnalyticsConsent,
  identifyPostHogUser,
  initPostHog,
  setAnalyticsConsent
} from "@atomx/global-components";

const DEFAULT_AUTH_URL = `${
  (process.env.NEXT_PUBLIC_BASE_URL ?? "https://dapi.atomx.in/").replace(/\/$/, "")
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

function IconGoogle(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
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
  const [activeSlide, setActiveSlide] = useState(0);
  const [consentOpen, setConsentOpen] = useState(false);
  const sliderItems = useMemo(
    () => [
      {
        src: assetPath("/images/1.avif"),
        title: "CashlessX",
        description: "Enable fast, secure NFC payments for high-volume event counters."
      },
      {
        src: assetPath("/images/2.avif"),
        title: "AccessX",
        description: "Control gates and scan entries in real time with reliable validation."
      },
      {
        src: assetPath("/images/3.avif"),
        title: "InventoryX",
        description: "Track stock movement live and keep every stall inventory synchronized."
      }
    ],
    []
  );

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const consent = getAnalyticsConsent();
    if (consent === "granted") {
      setConsentOpen(false);
      initPostHog("access_portal");
      return;
    }
    if (consent === "denied") {
      setConsentOpen(false);
      return;
    }
    setConsentOpen(true);
  }, []);

  const processToken = useCallback(
    (token, delay = 1200) => {
      if (!token) return;
      try {
        const decoded = decodeJwt(token);
        const userEmail = decoded?.email || null;
        const userId = decoded?.sub ?? decoded?.id ?? userEmail;
        identifyPostHogUser(userId, {
          email: userEmail,
          name: decoded?.name ?? null,
          role_type: decoded?.type ?? null,
          app: "access_portal"
        });
        capturePostHogEvent("login_success", {
          app: "access_portal",
          app_id: appId,
          user_email: userEmail,
          role_type: decoded?.type ?? null,
          has_roles: Array.isArray(decoded?.roles) && decoded.roles.length > 0
        });
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
        capturePostHogEvent("login_failure", {
          app: "access_portal",
          app_id: appId,
          stage: "token_decode",
          error_message: err?.message || "token_decode_failed"
        });
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

    setDevToken(process.env.NEXT_PUBLIC_DEV_PORTAL_TOKEN || null);
  }, [status]);

  useEffect(() => {
    if (!sliderItems.length) return;
    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % sliderItems.length);
    }, 4300);
    return () => window.clearInterval(timer);
  }, [sliderItems]);

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

  const handleGoogleSignIn = useCallback(
    (event) => {
      event.preventDefault();
      if (status === "loading" || status === "success") return;
      setError(null);
      setStatus("loading");
      capturePostHogEvent("login_start", {
        app: "access_portal",
        app_id: appId,
        provider: "google",
        redirect_path: redirectPath
      });
      if (typeof window !== "undefined") {
        window.setTimeout(() => {
          window.location.assign(loginUrl);
        }, 120);
      }
    },
    [loginUrl, status]
  );

  const helperText = useMemo(() => {
    if (status === "success") return "Authenticated. Redirecting...";
    if (status === "loading") return "Verifying account. Redirecting you to Google...";
    if (status === "error") return error;
    return "Access your event dashboard, manage cashless payments, and view real-time analytics.";
  }, [status, error]);

  const activeSlideItem = sliderItems[activeSlide] || sliderItems[0];

  const handleAcceptAnalytics = () => {
    setAnalyticsConsent(true, "access_portal");
    setConsentOpen(false);
  };

  const handleRejectAnalytics = () => {
    setAnalyticsConsent(false, "access_portal");
    setConsentOpen(false);
  };

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#0c0c0c]">
      {/* Full-bleed backdrop: the card is glass, so it needs something to refract. */}
      {sliderItems.map((item, index) => (
        <img
          key={item.src}
          src={item.src}
          alt=""
          aria-hidden
          loading={index === 0 ? "eager" : "lazy"}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-out ${
            index === activeSlide ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(115deg,rgba(12,12,12,0.34) 0%,rgba(12,12,12,0.16) 40%,rgba(12,12,12,0.66) 100%)"
        }}
        aria-hidden
      />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[1560px] items-center justify-center overflow-x-hidden px-4 py-8 sm:px-[clamp(18px,4vw,56px)] sm:py-[clamp(24px,4vw,48px)] lg:grid lg:grid-cols-[1.05fr_minmax(420px,0.95fr)] lg:gap-[clamp(24px,4vw,72px)]">
        {/* Story panel */}
        <section className="hidden lg:flex lg:flex-col lg:justify-center">
          <span className="font-vcr text-[10px] tracking-[0.22em] text-white/70">
            ATOMX PORTAL
          </span>
          <h2 className="font-chillax mt-3 max-w-[15ch] text-[clamp(34px,3.6vw,54px)] font-semibold leading-[1.03] tracking-[-0.02em] text-white">
            {activeSlideItem?.title}
          </h2>
          <p className="mt-4 max-w-[46ch] text-[clamp(14px,1.05vw,17px)] font-light leading-relaxed text-white/75">
            {activeSlideItem?.description}
          </p>

          <div className="mt-8 flex items-center gap-2" role="tablist" aria-label="Highlights">
            {sliderItems.map((item, index) => (
              <span
                key={`slide-dot-${index}`}
                role="tab"
                aria-selected={index === activeSlide}
                aria-label={item.title}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === activeSlide ? "w-8 bg-(--orange)" : "w-2.5 bg-white/35"
                }`}
              />
            ))}
          </div>
        </section>

        {/* Glass auth card */}
        <section className="mx-auto w-full min-w-0 max-w-[440px] lg:mx-0 lg:justify-self-end">
          <div className="rounded-[20px] border border-white/20 bg-white/10 p-[clamp(22px,2.6vw,34px)] shadow-[0_30px_80px_rgba(2,8,20,0.45)] backdrop-blur-2xl">
            {/* 384x384 canvas with the mark in a thin band, so it is cropped, not scaled. */}
            <span className="relative block h-[52px] w-[132px] overflow-hidden">
              <img
                src={assetPath("/shared/logos/AtomX_Logo.svg")}
                alt="AtomX"
                className="absolute -left-[36px] -top-[69px] h-[176px] w-[200px] max-w-none brightness-0 invert"
              />
            </span>

            <div className="mt-[clamp(20px,2.4vw,28px)]">
              <span className="font-vcr text-[9.5px] tracking-[0.2em] text-white/65">
                SIGN IN
              </span>
              <h1 className="font-chillax mt-2.5 text-[clamp(26px,2.8vw,34px)] font-semibold leading-[1.05] tracking-[-0.02em] text-white">
                Welcome to Portal
              </h1>
              <p className="mt-2.5 text-[13.5px] font-light leading-relaxed text-white/70">
                {helperText}
              </p>
            </div>

            {status === "error" ? (
              <div
                role="alert"
                className="mt-5 rounded-[10px] border border-[rgba(224,68,32,0.45)] bg-[rgba(224,68,32,0.20)] px-3.5 py-2.5 text-[12.5px] font-semibold text-white"
              >
                {error}
              </div>
            ) : null}

            {profile ? (
              <div
                role="status"
                aria-live="polite"
                className="mt-6 flex items-center gap-3 rounded-[12px] border border-white/20 bg-white/10 px-4 py-3.5"
              >
                <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <p className="min-w-0 text-[13px] text-white/75">
                  Signed in as <span className="font-semibold text-white">{profile.email}</span>
                  <span className="block text-[12px] text-white/55">Taking you to your workspaces...</span>
                </p>
              </div>
            ) : (
              // text-* forced: globals.css has an unlayered `a { color: inherit }`
              // which outranks layered utilities.
              <a
                href={loginUrl}
                onClick={handleGoogleSignIn}
                className={`mt-6 flex h-12 w-full items-center justify-center gap-3 rounded-[10px] bg-white px-5 text-[14px] font-semibold text-[#1c1c1c]! transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
                  status === "loading"
                    ? "pointer-events-none opacity-70"
                    : "hover:bg-(--orange) hover:text-white!"
                }`}
              >
                {status === "loading" ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <IconGoogle className="h-5 w-5 shrink-0" />
                )}
                <span className="leading-none">
                  {status === "loading" ? "Verifying..." : "Continue with Google"}
                </span>
              </a>
            )}

            {showDevButton ? (
              <button
                type="button"
                onClick={handleDevTokenLogin}
                className="mt-2.5 w-full cursor-pointer rounded-[10px] border border-dashed border-white/35 bg-white/5 px-4 py-2.5 text-[12.5px] font-semibold text-white/80 transition hover:border-(--orange) hover:text-white"
              >
                Use dev session token
              </button>
            ) : null}

            <div className="mt-[clamp(20px,2.4vw,28px)] border-t border-white/15 pt-4">
              <p className="text-[12px] font-light leading-relaxed text-white/60">
                By continuing, you agree to AtomX&apos;s{" "}
                <a
                  href="/legal/terms"
                  className="font-medium text-white! underline underline-offset-2 transition hover:text-(--orange)!"
                >
                  Terms
                </a>{" "}
                and{" "}
                <a
                  href="/legal/privacy"
                  className="font-medium text-white! underline underline-offset-2 transition hover:text-(--orange)!"
                >
                  Privacy Policy
                </a>
                .
              </p>
              <button
                type="button"
                onClick={() => setConsentOpen(true)}
                className="font-vcr mt-3 cursor-pointer text-[9px] uppercase tracking-[0.16em] text-white/55 underline underline-offset-4 transition hover:text-white"
              >
                Cookie settings
              </button>
            </div>
          </div>

          {/* Slider dots move under the card on small screens. */}
          <div className="mt-6 flex items-center justify-center gap-2 lg:hidden" aria-hidden>
            {sliderItems.map((_, index) => (
              <span
                key={`slide-dot-sm-${index}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === activeSlide ? "w-8 bg-(--orange)" : "w-2.5 bg-white/35"
                }`}
              />
            ))}
          </div>
        </section>
      </div>

      {consentOpen ? (
        <div className="fixed bottom-4 left-4 right-4 z-30 mx-auto w-auto max-w-[560px] rounded-[14px] border border-white/20 bg-black/45 p-4 text-white shadow-[0_24px_60px_rgba(2,8,20,0.55)] backdrop-blur-2xl md:left-auto md:right-6 md:mx-0 md:w-[560px]">
          <h3 className="font-chillax text-[16px] font-semibold text-white">Cookie preferences</h3>
          <p className="mt-1.5 text-[12.5px] font-light text-white/70">
            Analytics cookies help us understand how the portal is used. Essential cookies are
            always on.
          </p>

          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleAcceptAnalytics}
              className="h-10 cursor-pointer rounded-[10px] bg-white text-[12.5px] font-semibold text-[#1c1c1c] transition hover:bg-(--orange) hover:text-white"
            >
              Accept all cookies
            </button>
            <button
              type="button"
              onClick={handleRejectAnalytics}
              className="h-10 cursor-pointer rounded-[10px] border border-white/30 bg-transparent text-[12.5px] font-semibold text-white/85 transition hover:border-(--orange) hover:text-white"
            >
              Essential only
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
