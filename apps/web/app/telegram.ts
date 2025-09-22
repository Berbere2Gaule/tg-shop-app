// apps/web/app/telegram.ts
"use client";

import { useEffect } from "react";

/** lit env(safe-area-inset-bottom) côté iOS */
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

/** lit env(safe-area-inset-top) côté iOS */
function readIOSSafeTop(): number {
  try {
    const el = document.createElement("div");
    el.style.cssText =
      "position:fixed;left:0;top:0;height:0;visibility:hidden;padding-top:env(safe-area-inset-top)";
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

    const IOS_BASELINE_BOTTOM = 14; // petit confort au-dessus de la home bar
    let maxObservedInset = 0;

    const applyTheme = () => {
      const tp = tg?.themeParams ?? {};
      const bg =
        (tp as any).bg_color ||
        (tp as any).secondary_bg_color ||
        "";
      if (bg) html.style.setProperty("--tg-app-bg", bg);
    };

    const applyViewport = () => {
      const isIOS = tg?.platform === "ios" || isLikelyIOS();

      // Hauteur visible
      const vh = tg?.viewportStableHeight || tg?.viewportHeight || window.innerHeight;

      // Bottom (home bar)
      const fromVH = Math.max(0, window.innerHeight - vh);
      const fromEnvBottom = readIOSSafeBottom();
      let measuredBottom = Math.max(fromVH, fromEnvBottom);
      if (isIOS) measuredBottom = Math.max(measuredBottom, IOS_BASELINE_BOTTOM);
      maxObservedInset = Math.max(maxObservedInset, measuredBottom);

      // Top (encoche / status bar)
      const topInset = isIOS ? readIOSSafeTop() : 0;

      // Expose aux styles
      html.style.setProperty("--tg-vh", `${vh}px`);
      html.style.setProperty("--dock-inset", `${maxObservedInset}px`);
      html.style.setProperty("--safe-bottom", `${maxObservedInset}px`); // compat
      html.style.setProperty("--safe-top", `${topInset}px`);
      html.classList.add("tg-ready");
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

      if (!tg) {
        // Hors Telegram
        const baseline = isLikelyIOS() ? IOS_BASELINE_BOTTOM : 0;
        const topInset = isLikelyIOS() ? readIOSSafeTop() : 0;
        html.style.setProperty("--tg-vh", `${window.innerHeight}px`);
        html.style.setProperty("--dock-inset", `${baseline}px`);
        html.style.setProperty("--safe-bottom", `${baseline}px`);
        html.style.setProperty("--safe-top", `${topInset}px`);
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
