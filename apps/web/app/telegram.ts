// apps/web/app/telegram.ts
"use client";

import { useEffect } from "react";

/** Probe env(safe-area-inset-bottom) in iOS webview */
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

/** Probe env(safe-area-inset-top) in iOS webview */
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

    // Baselines to avoid 0 on iOS when Telegram reports nothing
    const IOS_BOTTOM_BASELINE = 14; // little comfort above the home bar
    const IOS_TOP_BASELINE = 44;    // ensure we’re below the notch

    let maxObservedBottom = 0;

    const applyViewport = () => {
      const isIOS = tg?.platform === "ios" || isLikelyIOS();

      // “Visible” height from Telegram when available
      const vh = tg?.viewportStableHeight || tg?.viewportHeight || window.innerHeight;

      // Often equals the iOS home bar area inside Telegram webview
      const fromVH = Math.max(0, window.innerHeight - vh);

      // CSS real measurements
      const bottomFromEnv = readIOSSafeBottom();
      const topFromEnv = readIOSSafeTop();

      // Bottom inset with iOS baseline and anti-rebound
      let bottomMeasured = Math.max(fromVH, bottomFromEnv);
      if (isIOS) bottomMeasured = Math.max(bottomMeasured, IOS_BOTTOM_BASELINE);
      maxObservedBottom = Math.max(maxObservedBottom, bottomMeasured);

      // Top inset (iOS only needs a baseline)
      const topMeasured = isIOS ? Math.max(topFromEnv, IOS_TOP_BASELINE) : topFromEnv;

      // Expose to CSS
      html.style.setProperty("--tg-vh", `${vh}px`);
      html.style.setProperty("--dock-inset", `${maxObservedBottom}px`);
      html.style.setProperty("--safe-bottom", `${maxObservedBottom}px`); // legacy compat

      html.style.setProperty("--header-inset", `${topMeasured}px`);
      html.style.setProperty("--safe-top", `${topMeasured}px`); // legacy compat

      html.classList.add("tg-ready");
    };

    // Align background/headers to the Telegram theme when possible
    const applyTheme = () => {
      const tp = tg?.themeParams ?? {};
      const bg =
        (tp as any).bg_color ||
        (tp as any).secondary_bg_color ||
        "";
      if (bg) html.style.setProperty("--tg-app-bg", bg);

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

      // Outside Telegram: neutral values (with iOS baselines)
      if (!tg) {
        const bottomBase = isLikelyIOS() ? IOS_BOTTOM_BASELINE : 0;
        const topBase = isLikelyIOS() ? IOS_TOP_BASELINE : 0;

        html.style.setProperty("--tg-vh", `${window.innerHeight}px`);
        html.style.setProperty("--dock-inset", `${bottomBase}px`);
        html.style.setProperty("--safe-bottom", `${bottomBase}px`);
        html.style.setProperty("--header-inset", `${topBase}px`);
        html.style.setProperty("--safe-top", `${topBase}px`);
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
