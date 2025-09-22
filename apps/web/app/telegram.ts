// apps/web/app/telegram.ts
"use client";

import { useEffect } from "react";

/* Mesures CSS réelles des safe-areas iOS via “sondes” DOM */
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

    const IOS_BOTTOM_BASELINE = 14; // petit confort au-dessus de la home bar
    const IOS_TOP_BASELINE = 6;     // marge min. sous l’encoche
    let maxBottomInset = 0;
    let maxTopInset = 0;

    const applyViewport = () => {
      const isIOS = (tg?.platform === "ios") || isLikelyIOS();

      // Hauteur visible fournie par TG (quand dispo)
      const vh = tg?.viewportStableHeight || tg?.viewportHeight || window.innerHeight;

      // Bas — delta innerHeight/vh + mesure CSS réelle
      const fromVH = Math.max(0, window.innerHeight - vh);
      const fromEnvBottom = readIOSSafeBottom();
      let bottom = Math.max(fromVH, fromEnvBottom);
      if (isIOS) bottom = Math.max(bottom, IOS_BOTTOM_BASELINE);
      maxBottomInset = Math.max(maxBottomInset, bottom);

      // Haut — mesure CSS réelle + baseline iOS
      let top = readIOSSafeTop();
      if (isIOS) top = Math.max(top, IOS_TOP_BASELINE);
      maxTopInset = Math.max(maxTopInset, top);

      // Expose aux styles
      html.style.setProperty("--tg-vh", `${vh}px`);
      html.style.setProperty("--dock-inset", `${maxBottomInset}px`);
      html.style.setProperty("--safe-bottom", `${maxBottomInset}px`); // compat
      html.style.setProperty("--header-inset", `${maxTopInset}px`);
      html.classList.add("tg-ready");
    };

    const applyTheme = () => {
      const tp = tg?.themeParams ?? {};
      const bg = (tp as any).bg_color || (tp as any).secondary_bg_color || "";
      if (bg) html.style.setProperty("--tg-app-bg", bg);
      if (tg?.colorScheme) html.dataset.tgTheme = tg.colorScheme;
      if (tg?.platform) html.dataset.tgPlatform = tg.platform;
    };

    try {
      applyTheme();
      tg?.ready?.();
      tg?.expand?.();

      applyViewport();
      tg?.onEvent?.("viewportChanged", applyViewport);
      tg?.onEvent?.("themeChanged", applyTheme);

      // Hors Telegram : valeurs neutres
      if (!tg) {
        const baselineBottom = isLikelyIOS() ? IOS_BOTTOM_BASELINE : 0;
        const baselineTop = isLikelyIOS() ? IOS_TOP_BASELINE : 0;
        html.style.setProperty("--tg-vh", `${window.innerHeight}px`);
        html.style.setProperty("--dock-inset", `${baselineBottom}px`);
        html.style.setProperty("--safe-bottom", `${baselineBottom}px`);
        html.style.setProperty("--header-inset", `${baselineTop}px`);
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
