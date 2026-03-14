"use client";

import { useEffect, useState } from "react";

const SERVICES = [
  "NFC Cashless",
  "Online Topup",
  "Use Pin",
  "Access Control",
  "Maker Checker",
  "Taxation"
];

const SERVICE_FIELDS = {
  "NFC Cashless": "event.useNfc",
  "Online Topup": "event.onlineTopup",
  "Use Pin": "event.usePin",
  "Access Control": "event.useAccessx",
  "Maker Checker": "event.useMakerChecker",
  Taxation: "event.gstSetting"
};

export default function ActiveService({ event, onFieldChange }) {
  const [active, setActive] = useState({});

  useEffect(() => {
    if (!event) return;
    setActive({
      "NFC Cashless": Boolean(event.useNfc),
      "Online Topup": Boolean(event.onlineTopup),
      "Use Pin": Boolean(event.usePin),
      "Access Control": Boolean(event.useAccessx),
      "Maker Checker": Boolean(event.useMakerChecker),
      Taxation: Boolean(event.gstSetting)
    });
  }, [event]);

  const toggle = (key) => {
    setActive((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      return next;
    });
    if (onFieldChange) {
      requestAnimationFrame(() => onFieldChange());
    }
  };

  return (
    <div className="rounded-lg border border-[#e8d9d3] bg-white px-6 py-5 shadow-[0_8px_18px_rgba(15,23,42,0.08)]">
      <div className="grid gap-4 md:grid-cols-2">
        {SERVICES.map((service) => {
          const isOn = Boolean(active[service]);
          return (
            <button
              key={service}
              type="button"
              onClick={() => toggle(service)}
              className="flex items-center justify-start gap-4 px-1 py-1 text-sm text-slate-700"
            >
              <span
                className={`relative h-5 w-10 rounded-full transition ${
                  isOn ? "bg-[color:rgb(var(--color-teal))]" : "bg-slate-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
                    isOn ? "left-5" : "left-1"
                  }`}
                />
              </span>
              <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
                {service}
              </span>
              <input
                type="hidden"
                name={SERVICE_FIELDS[service]}
                value={isOn ? "1" : "0"}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
