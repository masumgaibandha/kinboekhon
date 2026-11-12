"use client";

import { useEffect, useRef, useState } from "react";

interface TurnstileOptions {
  sitekey: string;
  action: string;
  appearance: "interaction-only";
  size: "flexible";
  language: string;
  "refresh-expired": "auto";
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
}

interface TurnstileApi {
  render: (element: HTMLElement, options: TurnstileOptions) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const TOKEN_WAIT_MS = 15000;

let scriptLoad: Promise<void> | null = null;

function loadScript(): Promise<void> {
  scriptLoad ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptLoad = null;
      reject(new Error("Turnstile script did not load"));
    };
    document.head.appendChild(script);
  });
  return scriptLoad;
}

// Cloudflare Turnstile, loaded only when the form comes near the screen; most customers never see it.
export function useTurnstile() {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const token = useRef("");
  const waiting = useRef<((value: string) => void)[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = ref.current;
    const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!element) return;

    const settle = (value: string) => {
      token.current = value;
      if (value) waiting.current.splice(0).forEach((resolve) => resolve(value));
    };
    const fail = () => {
      setFailed(true);
      waiting.current.splice(0).forEach((resolve) => resolve(""));
    };

    let active = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        if (!sitekey) return fail();
        loadScript()
          .then(() => {
            if (!active || !window.turnstile) return;
            widgetId.current = window.turnstile.render(element, {
              sitekey,
              action: "order",
              appearance: "interaction-only",
              size: "flexible",
              language: "bn",
              "refresh-expired": "auto",
              callback: settle,
              "expired-callback": () => settle(""),
              "error-callback": fail,
            });
          })
          .catch(() => active && fail());
      },
      { rootMargin: "800px 0px" },
    );
    // Watching the whole form starts the check while the customer is still typing.
    observer.observe(element.closest("form") ?? element);

    return () => {
      active = false;
      observer.disconnect();
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
      widgetId.current = null;
    };
  }, []);

  // The current token, or waits for one; "" when none comes in time.
  function getToken(): Promise<string> {
    if (token.current) return Promise.resolve(token.current);
    if (failed) return Promise.resolve("");
    return new Promise((resolve) => {
      waiting.current.push(resolve);
      setTimeout(() => resolve(token.current), TOKEN_WAIT_MS);
    });
  }

  // A token works once, so every refused order asks Cloudflare for a new one.
  function reset() {
    token.current = "";
    if (widgetId.current) window.turnstile?.reset(widgetId.current);
  }

  return { ref, failed, getToken, reset };
}
