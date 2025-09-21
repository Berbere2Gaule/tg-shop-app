// app/telegram.ts
"use client";

import { useEffect } from "react";

export function useTelegramInit() {
  useEffect(() => {
    const tg = (window as any)?.Telegram?.WebApp;

    // Hors Telegram : on donne juste une hauteur et on n’écrit PAS --safe-bottom
    if (!tg) {
      document.documentElement.style.setProperty("--tg-vh", `${window.innerHeight}px`);
      document.documentElement.style.removeProperty("--safe-bottom");
      return;
    }

    try {
      document.documentElement.dataset.tgTheme = tg.colorScheme || "unknown";
      if (typeof tg.expand === "function") tg.expand();

      const applyViewport = () => {
        const vh = tg.viewportStableHeight || tg.viewportHeight || window.innerHeight;
        const safeBottomFromVH = Math.max(0, window.innerHeight - vh);

        const r = document.documentElement;
        r.style.setProperty("--tg-vh", `${vh}px`);

        // ✅ si 0 → on supprime pour laisser le fallback CSS à env(safe-area-inset-bottom)
        if (safeBottomFromVH > 0) {
          r.style.setProperty("--safe-bottom", `${safeBottomFromVH}px`);
        } else {
          r.style.removeProperty("--safe-bottom");
        }
      };

      applyViewport();
      tg.onEvent?.("viewportChanged", applyViewport);
      return () => tg.offEvent?.("viewportChanged", applyViewport);
    } catch {
      /* noop */
    }
  }, []);
}
