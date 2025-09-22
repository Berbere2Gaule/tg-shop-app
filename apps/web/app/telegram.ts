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

    const isIOS =
      /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      tg?.platform === "ios";

    const DEFAULT_IOS_HOME_BAR = 44; // fallback standard (portrait)
    const MIN_BELIEVABLE = 10;       // en-dessous => suspect

    const applyViewport = () => {
      const vh =
        tg?.viewportStableHeight ||
        tg?.viewportHeight ||
        window.innerHeight;

      const fromVH = Math.max(0, window.innerHeight - vh); // TG delta
      const fromEnv = readIOSSafeBottom();                  // iOS env()

      let safeBottom = Math.max(fromVH, fromEnv);

      // 🔒 Fallback robuste pour Telegram iOS quand tout remonte 0
      if (isIOS && safeBottom < MIN_BELIEVABLE) {
        safeBottom = DEFAULT_IOS_HOME_BAR;
      }

      html.style.setProperty("--tg-vh", `${vh}px`);
      html.style.setProperty("--safe-bottom", `${safeBottom}px`);
      html.classList.add("tg-ready");
    };

    try {
      // Thème Telegram -> CSS vars + hint au conteneur
      const p = tg?.themeParams || {};
      const bg = (p as any).bg_color as string | undefined;
      const secondary = (p as any).secondary_bg_color as string | undefined;
      const bottom = (p as any).bottom_bar_bg_color as string | undefined;

      const appBg = bg || secondary;
      const surface = bottom || secondary || bg;

      if (appBg) {
        html.style.setProperty("--tg-app-bg", appBg);
        tg?.setBackgroundColor?.(appBg);
        tg?.setHeaderColor?.("bg_color"); // ou "secondary_bg_color"
      }
      if (surface) {
        html.style.setProperty("--tg-surface", surface); // utilisé par le Dock
      }

      if (tg?.colorScheme) html.dataset.tgTheme = tg.colorScheme;

      tg?.ready?.();
      tg?.expand?.();

      applyViewport();
      tg?.onEvent?.("viewportChanged", applyViewport);
      window.addEventListener("resize", applyViewport, { passive: true });

      if (!tg) {
        // Hors Telegram : valeurs neutres
        html.style.setProperty("--tg-vh", `${window.innerHeight}px`);
        html.style.setProperty("--safe-bottom", `0px`);
        html.classList.add("tg-ready");
      }

      return () => {
        tg?.offEvent?.("viewportChanged", applyViewport);
        window.removeEventListener("resize", applyViewport);
      };
    } catch {
      /* noop */
    }
  }, []);
}
