"use client";

type EventProps = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    posthog?: { capture: (event: string, properties?: EventProps) => void };
  }
}

export function trackEvent(event: string, properties: EventProps = {}) {
  if (typeof window === "undefined") return;
  try {
    if (window.localStorage.getItem("tj-cookie-consent") !== "accepted") return;
  } catch {
    return;
  }
  window.posthog?.capture(event, {
    ...properties,
    locale: window.location.pathname.startsWith("/en") ? "en" : "es",
  });
}
