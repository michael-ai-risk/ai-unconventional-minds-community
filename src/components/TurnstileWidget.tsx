import { useEffect, useRef } from "react";

type TurnstileOptions = {
  sitekey: string;
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
  theme?: "light" | "dark" | "auto";
};

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: TurnstileOptions) => string;
      remove: (widgetId: string) => void;
    };
  }
}

const scriptUrl = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export function TurnstileWidget({
  siteKey,
  onToken,
}: {
  siteKey: string;
  onToken: (token: string) => void;
}) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!siteKey || !host.current) {
      onToken("");
      return;
    }
    let widgetId: string | undefined;
    let cancelled = false;
    const mount = () => {
      if (!cancelled && host.current && window.turnstile && !widgetId) {
        widgetId = window.turnstile.render(host.current, {
          sitekey: siteKey,
          theme: "auto",
          callback: onToken,
          "expired-callback": () => onToken(""),
          "error-callback": () => onToken(""),
        });
      }
    };
    let script = document.querySelector<HTMLScriptElement>(`script[src="${scriptUrl}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = scriptUrl;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", mount);
    mount();
    return () => {
      cancelled = true;
      script?.removeEventListener("load", mount);
      if (widgetId) window.turnstile?.remove(widgetId);
    };
  }, [siteKey, onToken]);

  if (!siteKey) return null;
  return <div ref={host} aria-label="Cloudflare anti-spam verification" />;
}
