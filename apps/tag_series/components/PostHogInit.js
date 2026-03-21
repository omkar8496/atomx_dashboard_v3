"use client";

import { useEffect } from "react";
import { initPostHog } from "@atomx/global-components";

export function PostHogInit() {
  useEffect(() => {
    initPostHog("tag_series");
  }, []);

  return null;
}
