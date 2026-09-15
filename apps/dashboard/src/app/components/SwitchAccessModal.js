"use client";

import { useEffect, useMemo, useState } from "react";
import { selectAccess } from "../../lib/dashboardApi";
import { readAccessRoles } from "./accessRoles";
import { useDashboardStore } from "../../store/dashboardStore";

const DASHBOARD_TOKEN_KEY = "atomx.dashboard.token";

// Where each role type lands after switching, mirroring the access portal.
const TAG_SERIES_URL = process.env.NEXT_PUBLIC_TAG_SERIES_URL ?? "/tag_series";

function normalizeRoleType(value) {
  return String(value || "").trim().toLowerCase().replace(/[_\s]+/g, "-");
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

function isTagSeries(type) {
  return mapServiceParam(type) === "tag-series";
}

function isAdminRole(type) {
  return normalizeRoleType(type) === "admin";
}

// Workspace-level roles select by adminId; event-scoped ones by eventId.
function isEventScoped(role) {
  return !isAdminRole(role?.type) && !isTagSeries(role?.type) && role?.eventId != null;
}



function formatTypeLabel(value) {
  const raw = String(value || "").trim();
  if (!raw) return "Access";
  return raw.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function groupRoles(roles) {
  const admin = [];
  const events = [];
  const apps = [];

  roles.forEach((role, index) => {
    const entry = { ...role, key: role?.id ?? `${role?.type ?? "role"}-${index}` };
    if (isTagSeries(role?.type)) apps.push(entry);
    else if (isAdminRole(role?.type)) admin.push(entry);
    else events.push(entry);
  });

  return [
    { id: "admin", label: "Admin Workspaces", roles: admin },
    { id: "events", label: "Events", roles: events },
    { id: "apps", label: "Apps", roles: apps }
  ].filter((group) => group.roles.length > 0);
}

function CloseIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <svg viewBox="0 0 14 14" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
    </svg>
  );
}

function SwitchIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 8h13l-3-3" />
      <path d="M20 16H7l3 3" />
    </svg>
  );
}

export default function SwitchAccessModal({ onClose }) {
  const token = useDashboardStore((state) => state.token);
  const profile = useDashboardStore((state) => state.profile);

  const [switching, setSwitching] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !switching) onClose?.();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, switching]);

  // Roles come from the current session token. The portal token is the richer
  // source when it is still around, so it wins; the service token is the fallback.
  const { roles, ctx } = useMemo(() => readAccessRoles(profile), [profile]);

  const groups = useMemo(() => groupRoles(roles), [roles]);

  const isCurrent = (role) => {
    if (!ctx) return false;
    if (normalizeRoleType(ctx.type) !== normalizeRoleType(role?.type)) return false;
    if (role?.eventId != null && ctx.eventId != null) {
      return String(ctx.eventId) === String(role.eventId);
    }
    if (role?.adminId != null && ctx.adminId != null) {
      return String(ctx.adminId) === String(role.adminId);
    }
    return false;
  };

  const handleSelect = async (role) => {
    const service = mapServiceParam(role?.type);
    const eventScoped = isEventScoped(role);

    setSwitching(String(role.key));
    setError("");

    try {
      const response = await selectAccess({
        type: role.type,
        adminId: eventScoped ? undefined : role.adminId,
        eventId: eventScoped ? role.eventId : undefined,
        token
      });

      const nextToken =
        response?.token ??
        response?.accessToken ??
        response?.data?.token ??
        response?.data?.accessToken ??
        null;

      if (!nextToken) {
        throw new Error("No token was returned for this access.");
      }

      // Hand off exactly like the access portal does: purge everything from the
      // previous access, then carry the new token and event context in the URL
      // so the destination hydrates from scratch. Mutating the store and
      // navigating to a bare URL left stale event ids and the vendor/stall
      // caches behind, which is what caused calls for the old event.
      try {
        window.localStorage.removeItem("atomx.dashboard.store");
        window.localStorage.setItem(DASHBOARD_TOKEN_KEY, nextToken);
        if (service) window.localStorage.setItem(`atomx.auth.${service}`, nextToken);
        if (service === "tag-series") {
          window.localStorage.setItem("atomx.auth.tag_series", nextToken);
        }
      } catch (storageError) {
        console.error("Failed to persist switched token", storageError);
      }

      const base =
        service === "tag-series"
          ? TAG_SERIES_URL.endsWith("/")
            ? TAG_SERIES_URL
            : `${TAG_SERIES_URL}/`
          : isAdminRole(role.type)
            ? "/admin"
            : "/Config";

      const target = new URL(base, window.location.origin);
      target.searchParams.set("token", nextToken);
      if (service) target.searchParams.set("service", service);
      if (eventScoped) {
        target.searchParams.set("eventId", String(role.eventId));
        if (role.eventName) target.searchParams.set("eventName", role.eventName);
      }

      window.location.assign(target.toString());
      return;
    } catch (requestError) {
      console.error("Failed to switch access", requestError);
      setError(requestError?.message || "Unable to switch to this access.");
      setSwitching("");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[270] flex items-center justify-center bg-[rgba(12,12,12,0.5)] px-4 py-6 backdrop-blur-[3px] max-[820px]:p-0"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !switching) onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Switch access"
        className="flex max-h-[calc(100dvh-48px)] w-[720px] max-w-full flex-col overflow-hidden rounded-[16px] border border-(--line) bg-(--surface) shadow-(--shadowUp) max-[820px]:h-full max-[820px]:max-h-full max-[820px]:rounded-none"
      >
        <div
          className="relative flex shrink-0 items-start gap-3 px-[clamp(16px,2vw,24px)] py-[clamp(14px,1.8vw,20px)] text-[#ebebeb]"
          style={{ background: "linear-gradient(135deg,#1C1C1C 0%,#241C4A 74%,#341CD6 155%)" }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{ background: "repeating-linear-gradient(90deg,#fff 0 1px,transparent 1px 34px)" }}
            aria-hidden
          />
          <div className="relative min-w-0 flex-1">
            <div className="font-vcr text-[9px] tracking-[0.2em] text-(--purple)">ACCESS</div>
            <h2 className="font-chillax mt-1.5 text-[clamp(20px,2.4vw,26px)] font-semibold leading-[1.05] tracking-[-0.02em] text-white">
              Switch access
            </h2>
            <p className="mt-1.5 text-[12px] font-light text-white/70">
              Move to another workspace, event or app without signing out.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={Boolean(switching)}
            aria-label="Close"
            className="relative grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-[9px] border border-white/20 text-[#ebebeb] transition hover:border-(--orange) hover:bg-(--orange) disabled:opacity-50"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-[clamp(16px,2vw,24px)] py-[clamp(14px,1.8vw,20px)]">
          {error ? (
            <p className="rounded-[10px] border border-[rgba(224,68,32,0.25)] bg-[rgba(224,68,32,0.06)] px-3.5 py-2.5 text-[12.5px] font-semibold text-(--orange)">
              {error}
            </p>
          ) : null}

          {groups.length === 0 ? (
            <div className="rounded-[12px] border border-dashed border-(--line) px-5 py-10 text-center">
              <div className="font-chillax text-[16px] font-medium text-(--text)">
                No other access found
              </div>
              <div className="mt-1.5 text-[12.5px] text-(--muted)">
                This session carries no role list. Sign in again from the access portal to
                pick a different workspace.
              </div>
            </div>
          ) : (
            groups.map((group) => (
              <section key={group.id}>
                <div className="mb-2 flex items-center gap-2.5">
                  <span className="font-vcr grid h-7 min-w-7 place-items-center rounded-[8px] bg-[linear-gradient(140deg,#e04420,#8b5cf6)] px-1.5 text-[10px] text-white">
                    {String(group.roles.length).padStart(2, "0")}
                  </span>
                  <h3 className="font-chillax m-0 text-[15px] font-semibold text-(--text)">
                    {group.label}
                  </h3>
                  <span className="h-px flex-1 bg-(--line2)" aria-hidden />
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {group.roles.map((role) => {
                    const current = isCurrent(role);
                    const busy = String(switching) === String(role.key);
                    const scopedName = isEventScoped(role)
                      ? role.eventName || `Event ${role.eventId}`
                      : role.adminName || "Workspace";
                    const scopeLabel = isEventScoped(role) ? "EVENT ID" : "ADMIN ID";
                    const scopeValue = isEventScoped(role) ? role.eventId : role.adminId;

                    return (
                      <button
                        key={role.key}
                        type="button"
                        onClick={() => handleSelect(role)}
                        disabled={current || Boolean(switching)}
                        aria-current={current ? "true" : undefined}
                        title={current ? "You are here" : `Switch to ${scopedName}`}
                        className={`flex flex-col rounded-[12px] border p-3 text-left transition ${
                          current
                            ? "cursor-default border-(--orange) bg-[rgba(224,68,32,0.06)]"
                            : "cursor-pointer border-(--line) bg-(--surface) hover:border-(--orange) hover:shadow-(--shadow) disabled:cursor-not-allowed disabled:opacity-55"
                        }`}
                      >
                        <div className="flex w-full items-center gap-2">
                          <span className="font-vcr truncate text-[9px] uppercase tracking-[0.14em] text-(--orange)">
                            {formatTypeLabel(role.type)}
                          </span>
                          {current ? (
                            <span className="font-vcr ml-auto shrink-0 rounded-[6px] bg-(--orange) px-1.5 py-0.5 text-[8.5px] tracking-[0.1em] text-white">
                              CURRENT
                            </span>
                          ) : busy ? (
                            <span className="ml-auto h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-(--orange) border-t-transparent" />
                          ) : (
                            <span className="ml-auto shrink-0 text-(--faint)">
                              <SwitchIcon className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </div>
                        <span className="font-chillax mt-1 truncate text-[14.5px] font-semibold text-(--text)">
                          {scopedName}
                        </span>
                        <span className="font-vcr mt-1.5 flex items-baseline gap-2 text-[8.5px] uppercase tracking-[0.14em] text-(--faint)">
                          {scopeLabel}
                          <span className="text-[11px] tracking-[0.02em] text-(--muted)">
                            {scopeValue ?? "-"}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
