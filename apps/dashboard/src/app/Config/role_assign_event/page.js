"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import { decodeJwt } from "@atomx/lib";
import { linkOperator } from "../../../lib/dashboardApi";
import { useDashboardStore } from "../../../store/dashboardStore";

function normalizeType(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-");
}

function getAdminIdFromToken(decoded, service) {
  if (!decoded) return null;
  if (decoded.adminId) return decoded.adminId;
  const roles = Array.isArray(decoded.roles) ? decoded.roles : [];
  const normalizedService = normalizeType(service);
  if (normalizedService) {
    const match = roles.find((role) => normalizeType(role?.type) === normalizedService);
    if (match?.adminId) return match.adminId;
  }
  const fallback = roles.find((role) => role?.adminId);
  return fallback?.adminId ?? null;
}

export default function RoleAssignEventPage() {
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState(null);
  const [adminId, setAdminId] = useState(null);
  const [queryService, setQueryService] = useState("");
  const token = useDashboardStore((state) => state.token);
  const setToken = useDashboardStore((state) => state.setToken);

  const service = useMemo(() => queryService, [queryService]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    const urlService = params.get("service") || "";
    if (urlService) {
      setQueryService(urlService);
    }
    if (urlToken) {
      setToken(urlToken);
    }
  }, [setToken]);

  useEffect(() => {
    if (!token) {
      setAdminId(null);
      return;
    }

    try {
      const decoded = decodeJwt(token);
      setAdminId(getAdminIdFromToken(decoded, service));
    } catch (error) {
      console.error("Failed to decode token", error);
      setAdminId(null);
    }
  }, [token, service]);

  const canSubmit = Boolean(email && adminId && status !== "loading");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email) {
      setStatus("error");
      setMessage("Please enter an email address.");
      return;
    }
    if (!adminId) {
      setStatus("error");
      setMessage("Missing admin ID for this account.");
      return;
    }

    try {
      setStatus("loading");
      setMessage(null);
      await linkOperator({ email, adminId, token });
      setStatus("success");
      setMessage("Operator invite sent.");
      setEmail("");
      setOpen(false);
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage(error.message || "Failed to link operator.");
    }
  };

  return (
    <main className="min-h-screen bg-[color:rgb(var(--color-bg))] pb-10">
      <Header
        areaLabel="Configuration"
        breadcrumb={
          <>
            <Link className="text-slate-600 hover:text-[#258d9c]" href="/Config/profile" replace>
              Profile
            </Link>
            <span className="text-slate-400">/</span>
            <Link className="text-slate-600 hover:text-[#258d9c]" href="/Config/operations" replace>
              Operations
            </Link>
            <span className="text-slate-400">/</span>
            <span className="font-semibold text-[#258d9c]">+ Operator</span>
          </>
        }
      />
      <div className="w-full pr-3 pl-12 md:pr-6 md:pl-16 mt-4">
        <section className="rounded-lg border border-[#e8d9d3] bg-white px-6 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-semibold text-slate-700">Operator Access</h1>
              <p className="mt-1 text-sm text-slate-500">
                Add an operator to this admin account.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className="rounded-md bg-[color:rgb(var(--color-orange))] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_6px_12px_rgb(var(--color-orange)/0.25)]"
            >
              + Operator
            </button>
          </div>

          <div className="mt-4 text-xs text-slate-500">
            {adminId ? (
              <span>Admin ID: {adminId}</span>
            ) : (
              <span>Admin ID not detected. Make sure you are logged in.</span>
            )}
          </div>

          {open && (
            <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Operator email
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="mohini@atomx.in"
                  className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[color:rgb(var(--color-orange))]"
                />
              </label>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  operator
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={`rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_6px_12px_rgb(var(--color-orange)/0.25)] ${
                    canSubmit ? "bg-[color:rgb(var(--color-orange))]" : "cursor-not-allowed bg-[#f2c9ae]"
                  }`}
                >
                  {status === "loading" ? "Sending..." : "Send Invite"}
                </button>
                <button
                  type="button"
                  className="text-xs font-semibold text-slate-500 hover:text-[#258d9c]"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {message && (
            <div
              className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
                status === "error"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {message}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
