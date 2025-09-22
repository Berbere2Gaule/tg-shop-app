// apps/web/app/telegram.ts
"use client";

import { useEffect } from "react";

/** lit env(safe-area-inset-bottom) */
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

/** lit env(safe-area-inset-top) */
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

    const IOS_BOTTOM_BASELINE = 14; // confort au-dessus de la home bar
    let maxBottom = 0;
    let maxTop = 0;

    const applyViewport = () => {
      const isIOS = (tg?.platform === "ios") || isLikelyIOS();

      const vh = tg?.viewportStableHeight || tg?.viewportHeight || window.innerHeight;

      // bottoms
      const fromVHBottom = Math.max(0, window.innerHeight - vh);
      const fromEnvBottom = readIOSSafeBottom();
      let bottom = Math.max(fromVHBottom, fromEnvBottom);
      if (isIOS) bottom = Math.max(bottom, IOS_BOTTOM_BASELINE);
      maxBottom = Math.max(maxBottom, bottom);

      // tops
      const fromEnvTop = readIOSSafeTop();
      maxTop = Math.max(maxTop, fromEnvTop);

      html.style.setProperty("--tg-vh", `${vh}px`);
      html.style.setProperty("--dock-inset", `${maxBottom}px`);
      html.style.setProperty("--safe-bottom", `${maxBottom}px`);
      html.style.setProperty("--header-inset", `${maxTop}px`);
      html.classList.add("tg-ready");
    };

    // aligne le fond avec le thème Telegram si fourni
    const applyTheme = () => {
      const tp = tg?.themeParams ?? {};
      const bg = (tp as any).bg_color || (tp as any).secondary_bg_color || "";
      if (bg) html.style.setProperty("--tg-app-bg", bg);
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
        // hors Telegram : valeurs neutres
        const bottomBase = isLikelyIOS() ? IOS_BOTTOM_BASELINE : 0;
        html.style.setProperty("--tg-vh", `${window.innerHeight}px`);
        html.style.setProperty("--dock-inset", `${bottomBase}px`);
        html.style.setProperty("--safe-bottom", `${bottomBase}px`);
        html.style.setProperty("--header-inset", `0px`);
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
