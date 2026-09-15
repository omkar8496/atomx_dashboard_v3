"use client";

import { useEffect, useState } from "react";
import { decodeJwt } from "@atomx/lib";

const DASHBOARD_TOKEN_KEY = "atomx.dashboard.token";
const PORTAL_TOKEN_KEY = "atomx.portal.token";

function readStoredToken(key) {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeDecode(token) {
  if (!token) return null;
  try {
    return decodeJwt(token);
  } catch {
    return null;
  }
}

// Roles for the signed-in user. The portal token is the richer source when it is
// still present; the service token is the fallback.
export function readAccessRoles(profile = null) {
  const portalProfile = safeDecode(readStoredToken(PORTAL_TOKEN_KEY));
  const serviceProfile = profile ?? safeDecode(readStoredToken(DASHBOARD_TOKEN_KEY));
  const portalRoles = Array.isArray(portalProfile?.roles) ? portalProfile.roles : [];
  const serviceRoles = Array.isArray(serviceProfile?.roles) ? serviceProfile.roles : [];
  return {
    roles: portalRoles.length ? portalRoles : serviceRoles,
    ctx: serviceProfile?.ctx ?? null
  };
}

function normalizeType(value) {
  return String(value || "").trim().toLowerCase().replace(/[_\s]+/g, "-");
}

// Name of the workspace the current session belongs to. The service token knows
// its adminId; the role list is what carries the human-readable name.
export function readWorkspaceName(profile = null) {
  const { roles, ctx } = readAccessRoles(profile);
  if (!ctx) return "";

  const byAdminAndType = roles.find(
    (role) =>
      ctx.adminId != null &&
      String(role?.adminId) === String(ctx.adminId) &&
      normalizeType(role?.type) === normalizeType(ctx.type)
  );
  const byAdmin = roles.find(
    (role) => ctx.adminId != null && String(role?.adminId) === String(ctx.adminId)
  );

  return byAdminAndType?.adminName ?? byAdmin?.adminName ?? "";
}

// Read after mount: localStorage is not available during prerender, and reading
// it while rendering would risk a hydration mismatch.
export function useAccessRoleCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(readAccessRoles().roles.length);
  }, []);

  return count;
}

export function useWorkspaceName(profile = null) {
  const [name, setName] = useState("");

  useEffect(() => {
    setName(readWorkspaceName(profile));
  }, [profile]);

  return name;
}
