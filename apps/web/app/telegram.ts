// apps/web/app/telegram.ts
"use client";

import { useEffect } from "react";

/** Sonde CSS pour lire réellement env(safe-area-inset-bottom) sur iOS */
function readIOSSafeBottom(): number {
  try {
    const el = document.createElement("div");
    el.style.cssText =
      "position:fixed;left:0;bottom:0;height:0;visibility:hidden;padding-bottom:env(safe-area-inset-bottom)";
    document.body.appendChild(el);
    const v = parseFloat(getComputedStyle(el).paddingBottom || "0") || 0;
    el.remove();
    return v;
  } catch {
    return 0;
  }
}

export function useTelegramInit() {
  useEffect(() => {
    const tg = (window as any)?.Telegram?.WebApp;
    const html = document.documentElement;

    const applyViewport = () => {
      // Hauteur stable proposée par Telegram si dispo
      const vh = tg?.viewportStableHeight || tg?.viewportHeight || window.innerHeight;

      // Différence avec innerHeight (souvent = safe area dans TG iOS)
      const fromVH = Math.max(0, window.innerHeight - vh);

      // Mesure CSS iOS réelle (fallback fiable)
      const fromEnv = readIOSSafeBottom();

      // Base de la safe area (sans bonus)
      const safeBase = Math.max(fromVH, fromEnv);

      // Petit confort 14px seulement s’il existe une safe area
      const homebarGap = safeBase > 0 ? 14 : 0;

      html.style.setProperty("--tg-vh", `${vh}px`);
      html.style.setProperty("--safe-bottom", `${safeBase}px`);
      html.style.setProperty("--homebar-gap", `${homebarGap}px`);
    };

    try {
      if (tg?.colorScheme) html.dataset.tgTheme = tg.colorScheme;
      tg?.ready?.();
      tg?.expand?.();

      applyViewport();
      tg?.onEvent?.("viewportChanged", applyViewport);

      // Hors Telegram : valeurs neutres (aucun gap)
      if (!tg) {
        html.style.setProperty("--tg-vh", `${window.innerHeight}px`);
        html.style.setProperty("--safe-bottom", `0px`);
        html.style.setProperty("--homebar-gap", `0px`);
      }

      return () => tg?.offEvent?.("viewportChanged", applyViewport);
    } catch {
      /* noop */
    }
  }, []);
}
