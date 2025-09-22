// apps/web/app/telegram.ts
"use client";

import { useEffect } from "react";

/** Lit réellement env(safe-area-inset-bottom) via une sonde DOM */
function readIOSSafeBottom(): number {
  try {
    const el = document.createElement("div");
    // sonde invisible; on demande au moteur de calculer la padding-bottom = env(...)
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

    const applyViewport = () => {
      // 1) hauteur stable fournie par Telegram si dispo
      const vh =
        tg?.viewportStableHeight ||
        tg?.viewportHeight ||
        window.innerHeight;

      // 2) delta avec innerHeight (souvent = safe area dans TG iOS)
      const fromVH = Math.max(0, window.innerHeight - vh);

      // 3) mesure CSS réelle d’iOS (fallback fiable)
      const fromEnv = readIOSSafeBottom();

      // 4) on garde le max des deux mesures
      const safeBottom = Math.max(fromVH, fromEnv);

      const r = document.documentElement;
      r.style.setProperty("--tg-vh", `${vh}px`);
      r.style.setProperty("--safe-bottom", `${safeBottom}px`);
    };

    try {
      // thème (optionnel)
      if (tg?.colorScheme)
        document.documentElement.dataset.tgTheme = tg.colorScheme;

      // séquence recommandée TG
      tg?.ready?.();
      tg?.expand?.();

      applyViewport();
      tg?.onEvent?.("viewportChanged", applyViewport);

      // Fallback hors Telegram : valeurs neutres
      if (!tg) {
        const r = document.documentElement;
        r.style.setProperty("--tg-vh", `${window.innerHeight}px`);
        r.style.setProperty("--safe-bottom", `0px`);
      }

      return () => tg?.offEvent?.("viewportChanged", applyViewport);
    } catch {
      /* noop */
    }
  }, []);
}
