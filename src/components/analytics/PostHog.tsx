"use client";

import { useEffect } from "react";

const CONSENT_KEY = "tj-cookie-consent";
const POSTHOG_KEY = (process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "").trim();

export function PostHog() {
  useEffect(() => {
    if (!POSTHOG_KEY) return;

    const stop = () => {
      const posthog = (window as Window & { posthog?: { opt_out_capturing?: () => void } }).posthog;
      posthog?.opt_out_capturing?.();
    };

    const load = () => {
      if (window.localStorage.getItem(CONSENT_KEY) !== "accepted") {
        stop();
        return;
      }
      if (window.posthog || document.querySelector("script[data-countpips-posthog]")) return;

      const script = document.createElement("script");
      script.async = true;
      script.dataset.countpipsPosthog = "true";
      script.src = "https://eu-assets.i.posthog.com/static/array.js";
      script.onload = () => {
        const posthog = (window as Window & { posthog?: { init?: (key: string, options: Record<string, unknown>) => void } }).posthog;
        posthog?.init?.(POSTHOG_KEY, {
          api_host: "https://eu.i.posthog.com",
          autocapture: false,
          capture_pageview: true,
          capture_pageleave: true,
          disable_session_recording: false,
          mask_all_text: true,
          mask_all_element_attributes: true,
          persistence: "localStorage+cookie",
        });
      };
      document.head.appendChild(script);
    };

    load();
    window.addEventListener("tj-consent-change", load);
    const onConsentChange = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== "accepted") stop();
    };
    window.addEventListener("tj-consent-change", onConsentChange);
    return () => {
      window.removeEventListener("tj-consent-change", load);
      window.removeEventListener("tj-consent-change", onConsentChange);
    };
  }, []);

  return null;
}
