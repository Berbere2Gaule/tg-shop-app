// apps/web/app/telegram.ts
"use client";

import { useEffect } from "react";

/** Mesure réellement env(safe-area-inset-bottom) côté iOS via une sonde DOM */
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

    const HOME_BAR_GAP = 14; // petit confort au-dessus de la home-bar iOS

    const applyViewport = () => {
      // 1) Hauteur “stable” fournie par Telegram si dispo
      const vh = tg?.viewportStableHeight || tg?.viewportHeight || window.innerHeight;

      // 2) Différence avec innerHeight (souvent = safe-area dans TG iOS)
      const fromVH = Math.max(0, window.innerHeight - vh);

      // 3) Mesure CSS réelle d’iOS (fallback fiable)
      const fromEnv = readIOSSafeBottom();

      // 4) On garde le max + petit gap confort
      const safeBottom = Math.max(fromVH, fromEnv) + HOME_BAR_GAP;

      html.style.setProperty("--tg-vh", `${vh}px`);
      html.style.setProperty("--safe-bottom", `${safeBottom}px`);
      // active les transitions côté CSS une fois la 1ère mesure appliquée
      html.classList.add("tg-ready");
    };

    try {
      if (tg?.colorScheme) html.dataset.tgTheme = tg.colorScheme;
      tg?.ready?.();
      tg?.expand?.();

      applyViewport();
      tg?.onEvent?.("viewportChanged", applyViewport);

      // Hors Telegram (ou si tg absent) : valeurs neutres + gap
      if (!tg) {
        html.style.setProperty("--tg-vh", `${window.innerHeight}px`);
        html.style.setProperty("--safe-bottom", `${HOME_BAR_GAP}px`);
        html.classList.add("tg-ready");
      }

      return () => tg?.offEvent?.("viewportChanged", applyViewport);
    } catch {
      /* noop */
    }
  }, []);
}
