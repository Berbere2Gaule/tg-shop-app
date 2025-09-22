// apps/web/app/telegram.ts
"use client";

import { useEffect } from "react";

/** Mesure env(safe-area-inset-bottom) via une sonde DOM (iOS) */
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

/** Mesure env(safe-area-inset-top) via une sonde DOM (iOS) */
function readIOSSafeTop(): number {
  try {
    const el = document.createElement("div");
    el.style.cssText =
      "position:fixed;top:0;left:0;height:0;visibility:hidden;padding-top:env(safe-area-inset-top)";
    document.body.appendChild(el);
    const v = parseFloat(getComputedStyle(el).paddingTop || "0") || 0;
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

    // Petit confort au-dessus de la home bar iOS (même si TG "oublie" la safe-area)
    const IOS_BASELINE = 14;
    let maxObservedBottom = 0;

    const applyViewport = () => {
      const isIOS = tg?.platform === "ios" || isLikelyIOS();

      // Hauteur visible côté TG (quand dispo)
      const vh = tg?.viewportStableHeight || tg?.viewportHeight || window.innerHeight;

      // Delta avec la fenêtre -> souvent la zone "home bar" côté iOS TG
      const fromVH = Math.max(0, window.innerHeight - vh);

      // Mesures CSS réelles d’iOS
      const bottomFromEnv = readIOSSafeBottom();
      const safeTop = readIOSSafeTop();

      // Valeur bottom mesurée
      let bottomMeasured = Math.max(fromVH, bottomFromEnv);

      // Baseline iOS pour éviter les retours à 0
      if (isIOS) bottomMeasured = Math.max(bottomMeasured, IOS_BASELINE);

      // Anti-rebond : on ne descend jamais
      maxObservedBottom = Math.max(maxObservedBottom, bottomMeasured);

      // Expose aux styles
      html.style.setProperty("--tg-vh", `${vh}px`);
      html.style.setProperty("--dock-inset", `${maxObservedBottom}px`);
      html.style.setProperty("--safe-bottom", `${maxObservedBottom}px`); // compat
      html.style.setProperty("--safe-top", `${safeTop}px`);

      html.classList.add("tg-ready");
    };

    // Aligne le fond avec le thème de Telegram (si fourni) et force les teintes natives
    const applyTheme = () => {
      const tp = tg?.themeParams ?? {};
      const bg =
        (tp as any).bg_color ||
        (tp as any).secondary_bg_color ||
        "";
      if (bg) html.style.setProperty("--tg-app-bg", bg);

      // Conseillé par l’API pour harmoniser l’UI native (si supporté par le client)
      tg?.setBackgroundColor?.("bg_color");
      tg?.setHeaderColor?.("secondary_bg_color");
      tg?.setBottomBarColor?.("bg_color");
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

      // Hors Telegram : valeurs neutres (baseline iOS en bas, top via env)
      if (!tg) {
        const baselineBottom = isLikelyIOS() ? IOS_BASELINE : 0;
        const topEnv = readIOSSafeTop();

        html.style.setProperty("--tg-vh", `${window.innerHeight}px`);
        html.style.setProperty("--dock-inset", `${baselineBottom}px`);
        html.style.setProperty("--safe-bottom", `${baselineBottom}px`);
        html.style.setProperty("--safe-top", `${topEnv}px`);
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
