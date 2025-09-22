// apps/web/app/telegram.ts
"use client";

import { useEffect } from "react";

/** Mesure env(safe-area-inset-bottom) via une sonde DOM (iOS) */
function readIOSSafeInset(): number {
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

function isLikelyIOS() {
  const ua = navigator.userAgent || "";
  return /iPhone|iPad|iPod/i.test(ua) || (/Mac/i.test(ua) && "ontouchend" in window);
}

export function useTelegramInit() {
  useEffect(() => {
    const tg = (window as any)?.Telegram?.WebApp;
    const html = document.documentElement;

    // petit confort au-dessus de la home bar même quand TG/iOS "oublie" la safe-area
    const IOS_BASELINE = 14;
    let maxObservedInset = 0;

    const applyViewport = () => {
      const isIOS = (tg?.platform === "ios") || isLikelyIOS();

      // hauteur visible côté TG (quand dispo)
      const vh = tg?.viewportStableHeight || tg?.viewportHeight || window.innerHeight;

      // delta avec la vraie fenêtre -> souvent la zone "home bar" côté iOS TG
      const fromVH = Math.max(0, window.innerHeight - vh);

      // mesure CSS réelle d’iOS
      const fromEnv = readIOSSafeInset();

      // valeur mesurée
      let measured = Math.max(fromVH, fromEnv);

      // baseline iOS pour éviter les retours à 0
      if (isIOS) measured = Math.max(measured, IOS_BASELINE);

      // on ne descend jamais (anti-rebond lors de viewportChanged)
      maxObservedInset = Math.max(maxObservedInset, measured);

      // expose aux styles
      html.style.setProperty("--tg-vh", `${vh}px`);
      html.style.setProperty("--dock-inset", `${maxObservedInset}px`);
      // compat anciens styles
      html.style.setProperty("--safe-bottom", `${maxObservedInset}px`);

      html.classList.add("tg-ready");
    };

    // Aligne le fond avec le thème de Telegram (si fourni)
    const applyTheme = () => {
      const tp = tg?.themeParams ?? {};
      const bg =
        (tp as any).bg_color ||
        (tp as any).secondary_bg_color ||
        "";
      if (bg) {
        html.style.setProperty("--tg-app-bg", bg);
      }
    };

    try {
      if (tg?.colorScheme) html.dataset.tgTheme = tg.colorScheme;
      if (tg?.platform) html.dataset.tgPlatform = tg.platform;

      applyTheme();
      tg?.ready?.();
      tg?.expand?.();

      applyViewport();
      tg?.onEvent?.("viewportChanged", applyViewport);
      tg?.onEvent?.("themeChanged", applyTheme);

      // Hors Telegram : valeurs neutres (+ petit confort iOS)
      if (!tg) {
        const baseline = isLikelyIOS() ? IOS_BASELINE : 0;
        html.style.setProperty("--tg-vh", `${window.innerHeight}px`);
        html.style.setProperty("--dock-inset", `${baseline}px`);
        html.style.setProperty("--safe-bottom", `${baseline}px`);
        html.classList.add("tg-ready");
      }

      return () => {
        tg?.offEvent?.("viewportChanged", applyViewport);
        tg?.offEvent?.("themeChanged", applyTheme);
      };
    } catch {
      /* noop */
    }
  }, []);
}
