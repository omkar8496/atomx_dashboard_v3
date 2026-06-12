"use client";

import { useMemo, useState } from "react";
import { ClockIcon, EditIcon, PlusIcon, SearchIcon } from "./DeviceMasterIcons";

const DEVICES = [
  {
    balance: "0",
    mac: "c4:6e:33:22:dd:51",
    name: "bmsfx325",
    serial: "12001208211093",
    type: "WISEPOS+",
    id: "3212",
    nfc: "inbuilt",
    model: "famoco",
    bank: "none",
    lastSeen: "March 16, 2022 7:45 PM",
    owner: "atomx"
  },
  {
    balance: "0",
    mac: "80:fb:f0:dd:c9:7b",
    name: "bmsfx325",
    serial: "90928",
    type: "WISEPOS+",
    id: "3308",
    nfc: "inbuilt",
    model: "famoco",
    bank: "mswipe-bms",
    lastSeen: "March 18, 2022 1:07 AM",
    owner: "MSWIPE"
  },
  {
    balance: "0",
    mac: "c4:6e:33:22:e0:4d",
    name: "bmsfx325",
    serial: "",
    type: "FAMOCO",
    id: "3445",
    nfc: "inbuilt",
    model: "famoco",
    bank: "mswipe-bms",
    lastSeen: "May 28, 2022 4:36 PM",
    owner: "13687"
  },
  {
    balance: "0",
    mac: "00:0c:e7:01:6b:ef",
    name: "bmsfx325",
    serial: "000",
    type: "FAMOCO",
    id: "3481",
    nfc: "inbuilt",
    model: "famoco",
    bank: "mswipe-bms",
    lastSeen: "June 04, 2022 11:20 AM",
    owner: "atomx"
  }
];

function DeviceMeta({ label, value }) {
  return (
    <span className="inline-flex items-center gap-1 border-r border-[#d9dde8] pr-3 last:border-r-0 last:pr-0">
      <span className="font-bold text-[#252525]">{label}:</span>
      <span className="text-[#7b7f89]">{value || "-"}</span>
    </span>
  );
}

function DeviceRow({ device, index }) {
  return (
    <article className="group grid gap-4 border-b border-[#e1e4ec] px-4 py-5 last:border-b-0 md:grid-cols-[1fr_160px] md:px-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[9px] bg-[linear-gradient(135deg,#E04420_0%,#A9379E_48%,#341CD6_100%)] text-[1.4rem] font-bold leading-none text-white shadow-[0_12px_28px_rgba(52,28,214,0.24)]">
            {device.balance}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3 text-[1.22rem] font-medium text-[#282828]">
              <span className="break-all">{device.mac}</span>
              <span className="hidden h-8 w-px bg-[#d9dde8] sm:inline-block" aria-hidden />
              <span>{device.name}</span>
            </div>
          </div>
        </div>

        <div className="mt-3 text-[0.98rem] text-[#8a8a8a]">
          <span className="font-bold text-[#1f1f1f]">S/N:</span>{" "}
          <span>{device.serial || "-"}</span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.86rem]">
          <span className="rounded-full bg-[#34363b] px-3 py-1 text-[0.68rem] font-bold tracking-wide text-white">
            {device.type}
          </span>
          <DeviceMeta label="ID" value={device.id} />
          <DeviceMeta label="NFC" value={device.nfc} />
          <DeviceMeta label="MODEL" value={device.model} />
          <DeviceMeta label="BANK" value={device.bank} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-[0.92rem] text-[#8a8f9b]">
          <span className="inline-flex items-center gap-1.5">
            <ClockIcon />
            <span>{device.lastSeen}</span>
          </span>
          <span className="h-5 w-px bg-[#d9dde8]" aria-hidden />
          <span>{device.owner}</span>
        </div>
      </div>

      <div className="flex items-start justify-between gap-3 md:justify-end">
        <span className="text-[0.78rem] font-semibold uppercase tracking-[0.24em] text-[#a8adba] md:hidden">
          #{index + 1}
        </span>
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-lg border border-[#ded4ff] bg-white text-[#E04420] shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition duration-200 hover:-translate-y-0.5 hover:border-[#E04420] hover:text-[#341CD6] hover:shadow-[0_14px_32px_rgba(52,28,214,0.18)]"
          aria-label={`Edit device ${device.mac}`}
        >
          <EditIcon className="h-4.5 w-4.5" />
        </button>
      </div>
    </article>
  );
}

export default function DeviceMasterList() {
  const [query, setQuery] = useState("");

  const filteredDevices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return DEVICES;

    return DEVICES.filter((device) =>
      [
        device.mac,
        device.name,
        device.serial,
        device.type,
        device.id,
        device.nfc,
        device.model,
        device.bank,
        device.owner,
        device.lastSeen
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery))
    );
  }, [query]);

  return (
    <section className="rounded-xl border border-[#ded4ff] border-l-[4px] border-l-[#E04420] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
      <div className="flex flex-col gap-4 border-b border-[#e4e6ee] px-5 py-5 lg:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[0.78rem] font-medium uppercase tracking-[0.18em] text-[#8b8f99]">
              Devices <span className="tracking-normal">( 8394 )</span>
            </p>
            <h1 className="mt-1 text-[1.9rem] font-bold leading-tight text-[#111827]">
              Device Master List
            </h1>
          </div>
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#1c1c1c] px-5 text-[0.9rem] font-semibold text-white shadow-[0_16px_30px_rgba(28,28,28,0.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#E04420]"
          >
            <PlusIcon className="h-4 w-4" />
            Add Device
          </button>
        </div>

        <label className="flex h-11 items-center gap-3 rounded-md border border-[#d6dbe7] bg-white px-4 text-[#8c96a8] focus-within:border-[#E04420] focus-within:ring-4 focus-within:ring-[#E04420]/10">
          <SearchIcon className="h-4.5 w-4.5 shrink-0" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search Device"
            className="h-full min-w-0 flex-1 bg-transparent text-[0.95rem] font-medium text-[#1f2937] outline-none placeholder:text-[#a4acbb]"
          />
        </label>
      </div>

      <div className="grid grid-cols-[1fr_160px] border-b border-[#dfe3ed] px-4 py-4 text-[1.05rem] font-medium uppercase tracking-[0.12em] text-[#E04420] md:px-6">
        <span>Device</span>
        <span className="hidden text-right md:block">Edit</span>
      </div>

      <div className="max-h-[calc(100vh-285px)] overflow-y-auto">
        {filteredDevices.length ? (
          filteredDevices.map((device, index) => (
            <DeviceRow key={`${device.mac}-${device.id}`} device={device} index={index} />
          ))
        ) : (
          <div className="px-6 py-14 text-center text-[0.95rem] font-medium text-[#7b8495]">
            No devices found.
          </div>
        )}
      </div>
    </section>
  );
}
