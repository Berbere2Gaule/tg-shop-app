"use client";

import { useEffect } from "react";

export function useTelegramInit() {
  useEffect(() => {
    const tg = (window as any)?.Telegram?.WebApp;
    if (!tg) {
      // fallback hors Telegram: on force des valeurs neutres
      const r = document.documentElement;
      r.style.setProperty("--tg-vh", `${window.innerHeight}px`);
      r.style.setProperty("--safe-bottom", `0px`);
      return;
    }

    try {
      // Thème Telegram -> data-attr (utile si tu veux relier Mantine ensuite)
      document.documentElement.dataset.tgTheme = tg.colorScheme || "unknown";

      // Étend la webview quand c’est possible
      if (typeof tg.expand === "function") tg.expand();

      const applyViewport = () => {
        const vh = tg.viewportStableHeight || tg.viewportHeight || window.innerHeight;
        const safeBottom = Math.max(0, window.innerHeight - vh);

        const r = document.documentElement;
        r.style.setProperty("--tg-vh", `${vh}px`);
        r.style.setProperty("--safe-bottom", `${safeBottom}px`);
      };

      applyViewport();
      tg.onEvent?.("viewportChanged", applyViewport);

      return () => {
        tg.offEvent?.("viewportChanged", applyViewport);
      };
    } catch {
      // noop
    }
  }, []);
}
