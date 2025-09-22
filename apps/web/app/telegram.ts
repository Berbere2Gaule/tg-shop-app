// apps/web/app/telegram.ts
"use client";

import { useEffect } from "react";

/** Sonde CSS iOS pour lire env(safe-area-inset-*) en px */
function readIOSSafeInset(side: "top" | "bottom"): number {
  try {
    const el = document.createElement("div");
    el.style.cssText = `
      position:fixed;left:0;${side}:0;height:0;visibility:hidden;
      padding-${side}: env(safe-area-inset-${side})
    `;
    document.body.appendChild(el);
    const v =
      parseFloat(getComputedStyle(el).getPropertyValue(`padding-${side}`)) || 0;
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

    // petit confort au-dessus de la home bar quand iOS "oublie" la safe-area
    const IOS_BOTTOM_BASELINE = 14;

    let maxBottom = 0;
    let maxTop = 0;

    const applyTheme = () => {
      const tp = tg?.themeParams ?? {};
      const bg =
        (tp as any).bg_color ||
        (tp as any).secondary_bg_color ||
        "";
      if (bg) html.style.setProperty("--tg-app-bg", bg);
      if (tg?.colorScheme) html.dataset.tgTheme = tg.colorScheme;
      if (tg?.platform) html.dataset.tgPlatform = tg.platform;
    };

    const applyViewport = () => {
      const isIOS = (tg?.platform === "ios") || isLikelyIOS();

      const vh =
        tg?.viewportStableHeight ||
        tg?.viewportHeight ||
        window.innerHeight;

      // bas
      const fromVH = Math.max(0, window.innerHeight - vh);
      const fromEnvBottom = readIOSSafeInset("bottom");
      let bottom = Math.max(fromVH, fromEnvBottom);
      if (isIOS) bottom = Math.max(bottom, IOS_BOTTOM_BASELINE);
      maxBottom = Math.max(maxBottom, bottom);

      // haut
      const top = readIOSSafeInset("top");
      maxTop = Math.max(maxTop, top);

      html.style.setProperty("--tg-vh", `${vh}px`);
      html.style.setProperty("--dock-inset", `${maxBottom}px`);
      html.style.setProperty("--safe-bottom", `${maxBottom}px`); // compat
      html.style.setProperty("--safe-top", `${maxTop}px`);

      html.classList.add("tg-ready");
    };

    try {
      applyTheme();
      tg?.ready?.();
      tg?.expand?.();

      applyViewport();
      tg?.onEvent?.("viewportChanged", applyViewport);
      tg?.onEvent?.("themeChanged", applyTheme);

      // hors Telegram (ou si tg absent)
      if (!tg) {
        const baseline = isLikelyIOS() ? IOS_BOTTOM_BASELINE : 0;
        html.style.setProperty("--tg-vh", `${window.innerHeight}px`);
        html.style.setProperty("--dock-inset", `${baseline}px`);
        html.style.setProperty("--safe-bottom", `${baseline}px`);
        html.style.setProperty("--safe-top", `${readIOSSafeInset("top")}px`);
        html.classList.add("tg-ready");
        window.addEventListener("resize", applyViewport);
      }

      return () => {
        tg?.offEvent?.("viewportChanged", applyViewport);
        tg?.offEvent?.("themeChanged", applyTheme);
        window.removeEventListener?.("resize", applyViewport);
      };
    } catch {
      /* noop */
    }
  }, []);
}
