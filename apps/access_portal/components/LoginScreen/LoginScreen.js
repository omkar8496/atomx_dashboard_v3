"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
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
        src: "/images/1.avif",
        title: "CashlessX",
        description: "Enable fast, secure NFC payments for high-volume event counters."
      },
      {
        src: "/images/2.avif",
        title: "AccessX",
        description: "Control gates and scan entries in real time with reliable validation."
      },
      {
        src: "/images/3.avif",
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
    <main className="relative min-h-screen overflow-hidden bg-[#031026]">
      {sliderItems.map((item, index) => (
        <img
          key={item.src}
          src={item.src}
          alt={`AtomX sign in visual ${index + 1}`}
          className={`absolute inset-0 h-full w-full object-cover brightness-[1.04] contrast-[1.03] saturate-[1.06] transition-opacity duration-[1200ms] ease-out ${
            index === activeSlide ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-[linear-gradient(102deg,rgba(2,8,20,0.06)_0%,rgba(2,8,20,0.03)_44%,rgba(2,8,20,0.2)_78%,rgba(2,8,20,0.28)_100%)]" />

      <div className="absolute bottom-9 left-8 right-[42%] z-10 hidden text-white md:block lg:left-12">
        <h2 className="max-w-[460px] text-[3.1rem] font-semibold leading-[1.05] drop-shadow-[0_6px_14px_rgba(0,0,0,0.45)]">
          {activeSlideItem?.title}
        </h2>
        <p className="mt-5 max-w-[560px] text-xl leading-relaxed text-white/86">
          {activeSlideItem?.description}
        </p>
      </div>

      <section className="relative z-10 flex min-h-screen items-end justify-center px-5 py-8 md:items-center md:justify-end md:pl-10 md:pr-4 lg:pl-14 lg:pr-6">
        <div className="w-full max-w-[460px]">
          <div className="flex rounded-[8px] border border-white/28 bg-black/32 p-7 shadow-[0_26px_60px_rgba(2,8,20,0.46)] backdrop-blur-[10px] md:min-h-[600px] md:px-9 md:py-10">
            <div className="flex w-full flex-col">
            <img
              src="/shared/logos/AtomX_Logo.svg"
              alt="AtomX"
              className="block h-24 w-auto self-start object-contain brightness-0 invert md:h-60 md:-mt-24 md:-mb-16 md:-ml-12"
            />
            <div className="mt-2 h-px w-full max-w-[210px] bg-[linear-gradient(90deg,#F88C43_0%,#1495AB_52%,#FFFFFF_100%)]" />

            <h1 className="mt-7 text-[2.25rem] font-semibold leading-[1.08] text-white md:text-[3rem]">
              Sign in to{" "}
              <span className="text-[#1495AB] drop-shadow-[0_2px_2px_rgba(15,23,42,0.45)]">
                Portal
              </span>
            </h1>

            <p className="mt-5 max-w-[640px] text-[1.08rem] leading-relaxed text-white/65 md:text-[1.22rem]">
              {helperText}
            </p>

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
                  status === "loading"
                    ? "pointer-events-none opacity-95"
                    : "hover:brightness-105"
                }`}
              >
                <IconGoogle className="h-7 w-7" />
                <span className="leading-none">
                  {status === "loading" ? "Verifying..." : "Continue with Google"}
                </span>
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
              By continuing, you agree to AtomX&apos;s{" "}
              <a href="/legal/terms" className="text-[#f88c43] underline underline-offset-2 hover:text-[#ff9f5f]">
                Terms
              </a>{" "}
              and{" "}
              <a href="/legal/privacy" className="text-[#f88c43] underline underline-offset-2 hover:text-[#ff9f5f]">
                Privacy Policy
              </a>
              .
            </p>
            <button
              type="button"
              onClick={() => setConsentOpen(true)}
              className="mt-3 self-start text-sm text-white/70 underline underline-offset-2 transition hover:text-white"
            >
              Cookie settings
            </button>
            </div>
          </div>
        </div>
      </section>

      <div className="pointer-events-none absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-2 md:flex">
        {sliderItems.map((_, index) => (
          <span
            key={`slide-dot-${index}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === activeSlide ? "w-7 bg-white" : "w-2 bg-white/35"
            }`}
          />
        ))}
      </div>

      {consentOpen ? (
        <div className="fixed inset-x-4 bottom-4 z-30 mx-auto w-full max-w-[620px] rounded-2xl border border-white/30 bg-black/55 p-5 text-white shadow-[0_24px_46px_rgba(2,8,20,0.55)] backdrop-blur-xl md:inset-x-auto md:right-6 md:mx-0">
          <h3 className="text-lg font-semibold tracking-tight">Cookie Preferences</h3>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAcceptAnalytics}
              className="rounded-full bg-[#f88c43] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(248,140,67,0.35)] hover:brightness-105"
            >
              Accept all cookies
            </button>
            <button
              type="button"
              onClick={handleRejectAnalytics}
              className="rounded-full border border-white/35 bg-transparent px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
            >
              Accept only essential cookies
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
