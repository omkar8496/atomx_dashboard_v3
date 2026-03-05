"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import ConfigTransition from "../components/ConfigTransition";
import CreateVendor from "./components/Create_Vendor";
import EditStall from "./components/Edit_Stall";

export default function OperationsPage() {
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [showStallForm, setShowStallForm] = useState(false);

  return (
    <main className="min-h-screen bg-[#f3f7fb] pb-10">
      <Header
        areaLabel="Configuration"
        breadcrumb={
          <>
            <Link className="text-slate-600 hover:text-[#258d9c]" href="/Config" replace>
              Profile
            </Link>
            <span className="text-slate-400">/</span>
            <Link className="font-semibold text-[#258d9c]" href="/Config/operations" replace>
              Operations
            </Link>
          </>
        }
      />
      <ConfigTransition>
        <div className="w-full pr-3 pl-12 md:pr-6 md:pl-16 mt-2">
          <div className="grid gap-6 lg:grid-cols-2 items-stretch">
          <section className="flex h-full flex-col rounded-lg border border-[#e8d9d3] bg-white px-6 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-3 border-b border-[#e7e0dc] pb-4">
              <div className="flex flex-1 items-center gap-3 text-sm text-slate-600">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Search vendor"
                  className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowVendorForm(true)}
                className="rounded-md bg-[#f88c43] px-3 py-2 text-xs font-semibold text-white shadow-[0_6px_12px_rgba(248,140,67,0.25)]"
              >
                + Vendor
              </button>
            </div>
            <div className="pt-3">
              <div className="grid grid-cols-[36px_1.6fr_1fr_0.9fr_0.7fr_0.6fr_0.8fr_0.6fr] items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-700">
                <span className="text-left">#</span>
                <span className="flex items-center gap-2 text-left">
                  Name
                  <span className="flex flex-col text-[8px] leading-none text-slate-400">
                    <span>▲</span>
                    <span>▼</span>
                  </span>
                </span>
                <span className="justify-self-center text-center">Type</span>
                <span className="justify-self-center text-center leading-tight">
                  <span className="block">Login</span>
                  <span className="block">Code</span>
                </span>
                <span className="justify-self-center text-center">Items</span>
                <span className="justify-self-center text-center">Link</span>
                <span className="justify-self-center text-center leading-tight">
                  <span className="block">Add</span>
                  <span className="block">Stall</span>
                </span>
                <span className="justify-self-center text-center">Edit</span>
              </div>
              <div className="mt-2 border-t border-[#e7e0dc]" />
              <div className="grid grid-cols-[36px_1.6fr_1fr_0.9fr_0.7fr_0.6fr_0.8fr_0.6fr] items-center gap-3 py-3 text-[13px] text-slate-600">
                <span className="text-slate-500">1</span>
                <span className="font-medium text-slate-600">merchandise</span>
                <span className="justify-self-center text-center text-[11px] font-semibold uppercase text-[#b96b25]">
                  Inventory
                </span>
                <span className="justify-self-center text-center text-slate-600">7322</span>
                <span className="flex items-center justify-center text-slate-500">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="4" y="5" width="16" height="4" rx="1" />
                    <rect x="4" y="11" width="12" height="4" rx="1" />
                  </svg>
                </span>
                <span className="flex items-center justify-center text-slate-500">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="7" cy="12" r="3.5" />
                    <circle cx="17" cy="12" r="3.5" />
                    <path d="M10.5 12h3" />
                  </svg>
                </span>
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:text-slate-700 justify-self-center"
                  aria-label="Add stall"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:text-slate-700 justify-self-center"
                  aria-label="Edit"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
                  </svg>
                </button>
              </div>
              <div className="border-t border-[#e7e0dc]" />
            </div>
          </section>

          <section className="flex h-full flex-col rounded-lg border border-[#e8d9d3] bg-white px-6 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-3 border-b border-[#e7e0dc] pb-4">
              <div className="flex flex-1 items-center gap-3 text-sm text-slate-600">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Search stall"
                  className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              <button
                type="button"
                className="rounded-md bg-[#f88c43] px-3 py-2 text-xs font-semibold text-white shadow-[0_6px_12px_rgba(248,140,67,0.25)]"
              >
                + Stall
              </button>
            </div>
            <div className="pt-3">
              <div className="grid grid-cols-[64px_1.6fr_1.3fr_0.8fr_0.7fr_0.6fr] items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-700">
                <span className="text-left">#</span>
                <span className="flex items-center gap-2 text-left">
                  Vendor
                  <span className="flex flex-col text-[8px] leading-none text-slate-400">
                    <span>▲</span>
                    <span>▼</span>
                  </span>
                </span>
                <span className="flex items-center gap-2 text-left">
                  Stall
                  <span className="flex flex-col text-[8px] leading-none text-slate-400">
                    <span>▲</span>
                    <span>▼</span>
                  </span>
                </span>
                <span className="justify-self-center text-center">Devices</span>
                <span className="justify-self-center text-center">Menu</span>
                <span className="justify-self-center text-center">Edit</span>
              </div>
              <div className="mt-2 border-t border-[#e7e0dc]" />
              <div className="grid grid-cols-[64px_1.6fr_1.3fr_0.8fr_0.7fr_0.6fr] items-center gap-3 py-3 text-[13px] text-slate-600">
                <span className="text-slate-500">17130</span>
                <span className="font-medium text-slate-600">merchandise</span>
                <span className="text-slate-600">STALL 1</span>
                <span className="justify-self-center text-center text-slate-600">4</span>
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:text-slate-700 justify-self-center"
                  aria-label="Add menu"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:text-slate-700 justify-self-center"
                  aria-label="Edit"
                  onClick={() => setShowStallForm(true)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
                  </svg>
                </button>
              </div>
              <div className="border-t border-[#e7e0dc]" />
              <div className="grid grid-cols-[64px_1.6fr_1.3fr_0.8fr_0.7fr_0.6fr] items-center gap-3 py-3 text-[13px] text-slate-600">
                <span className="text-slate-500">17131</span>
                <span className="font-medium text-slate-600">merchandise</span>
                <span className="text-slate-600">STALL 2</span>
                <span className="justify-self-center text-center text-slate-600">1</span>
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:text-slate-700 justify-self-center"
                  aria-label="Add menu"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:text-slate-700 justify-self-center"
                  aria-label="Edit"
                  onClick={() => setShowStallForm(true)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
                  </svg>
                </button>
              </div>
              <div className="border-t border-[#e7e0dc]" />
            </div>
          </section>
          </div>
        </div>
      </ConfigTransition>
      <CreateVendor open={showVendorForm} onClose={() => setShowVendorForm(false)} />
      <EditStall open={showStallForm} onClose={() => setShowStallForm(false)} />
    </main>
  );
}
