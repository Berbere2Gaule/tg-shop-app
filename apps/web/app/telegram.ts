// apps/web/app/telegram.ts
"use client";

import { useEffect } from "react";

/** Mesure réellement env(safe-area-inset-bottom) sur iOS via une sonde DOM */
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
      // 1) Hauteur stable Telegram si dispo
      const vh =
        tg?.viewportStableHeight ||
        tg?.viewportHeight ||
        window.innerHeight;

      // 2) Safe area estimée par delta
      const fromVH = Math.max(0, window.innerHeight - vh);

      // 3) Safe area mesurée via env()
      const fromEnv = readIOSSafeBottom();

      // 4) Valeur retenue
      const safeBottom = Math.max(fromVH, fromEnv);

      html.style.setProperty("--tg-vh", `${vh}px`);
      html.style.setProperty("--safe-bottom", `${safeBottom}px`);
      html.classList.add("tg-ready");
    };

    try {
      if (tg?.colorScheme) html.dataset.tgTheme = tg.colorScheme;
      tg?.ready?.();
      tg?.expand?.();

      applyViewport();
      tg?.onEvent?.("viewportChanged", applyViewport);

      if (!tg) {
        // Hors Telegram : valeurs neutres
        html.style.setProperty("--tg-vh", `${window.innerHeight}px`);
        html.style.setProperty("--safe-bottom", `0px`);
        html.classList.add("tg-ready");
      }

      return () => tg?.offEvent?.("viewportChanged", applyViewport);
    } catch {
      /* noop */
    }
  }, []);
}
