"use client";

import { useEffect } from "react";
import { initPostHog } from "@atomx/global-components";

export default function PostHogInit() {
  useEffect(() => {
    initPostHog("dashboard");
  }, []);

  return null;
}
