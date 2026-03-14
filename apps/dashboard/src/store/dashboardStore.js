"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { decodeJwt } from "@atomx/lib";

function normalizeService(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-");
}

function safeDecode(token) {
  try {
    return decodeJwt(token);
  } catch (error) {
    console.error("Failed to decode dashboard token", error);
    return null;
  }
}

function shallowEqual(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) => a[key] === b[key]);
}

export const useDashboardStore = create(
  persist(
    (set, get) => ({
      token: null,
      profile: null,
      eventMeta: null,
      eventDetails: null,
      selectedService: null,
      vendorsByEventId: {},
      stallsByEventId: {},
      setToken: (token) => {
        if (!token) {
          set({ token: null, profile: null });
          return;
        }
        if (get().token === token) return;
        const decoded = safeDecode(token);
        set({ token, profile: decoded });
      },
      setEventMeta: (meta) => {
        if (!meta) return;
        set((state) => {
          const next = { ...(state.eventMeta ?? {}), ...meta };
          if (shallowEqual(state.eventMeta ?? {}, next)) {
            return state;
          }
          return { eventMeta: next };
        });
      },
      setEventDetails: (details) => {
        if (!details) return;
        set({ eventDetails: details });
      },
      setSelectedService: (service) => {
        const normalized = normalizeService(service);
        if (get().selectedService === (normalized || null)) return;
        set({ selectedService: normalized || null });
      },
      setVendorsForEvent: (eventId, vendors) => {
        if (!eventId) return;
        set((state) => ({
          vendorsByEventId: {
            ...(state.vendorsByEventId ?? {}),
            [eventId]: Array.isArray(vendors) ? vendors : []
          }
        }));
      },
      setStallsForEvent: (eventId, stalls) => {
        if (!eventId) return;
        set((state) => ({
          stallsByEventId: {
            ...(state.stallsByEventId ?? {}),
            [eventId]: Array.isArray(stalls) ? stalls : []
          }
        }));
      }
    }),
    {
      name: "atomx.dashboard.store",
      partialize: (state) => ({
        token: state.token,
        profile: state.profile,
        eventMeta: state.eventMeta,
        eventDetails: state.eventDetails,
        selectedService: state.selectedService,
        vendorsByEventId: state.vendorsByEventId,
        stallsByEventId: state.stallsByEventId
      }),
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : undefined
      )
    }
  )
);
