"use client";

import { useEffect } from "react";

/** Fallback CSS : lit env(safe-area-inset-bottom) via une sonde DOM */
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

function isIOSUA() {
  return /iPad|iPhone|iPod/i.test(navigator.userAgent);
}
const TG_IOS_FALLBACK = 20; // hauteur “pilule” raisonnable si tout renvoie 0

/** Ajoute # si Telegram fournit une couleur hex sans # */
function tgHex(c?: string) {
  if (!c) return undefined;
  return c.startsWith("#") ? c : `#${c}`;
}

export function useTelegramInit() {
  useEffect(() => {
    const tg = (window as any)?.Telegram?.WebApp;
    const html = document.documentElement;

    const measure = () => {
      // 1) visualViewport (fiable iOS) : zone réellement masquée en bas
      const vv = window.visualViewport;
      let fromVV = 0;
      if (vv) {
        fromVV = Math.max(0, Math.round(window.innerHeight - (vv.height + vv.offsetTop)));
      }

      // 2) delta innerHeight vs viewport(Stable)Height
      const vh = tg?.viewportStableHeight || tg?.viewportHeight || 0;
      const fromVH = vh ? Math.max(0, window.innerHeight - vh) : 0;

      // 3) env() CSS
      const fromEnv = readIOSSafeBottom();

      // 4) max + fallback iOS si tout vaut 0
      let safeBottom = Math.max(fromVV, fromVH, fromEnv);
      const platformIsIOS = (tg?.platform === "ios") || isIOSUA();
      if (platformIsIOS && safeBottom === 0) {
        safeBottom = TG_IOS_FALLBACK;
      }

      const usedVH = vh || window.innerHeight;

      html.style.setProperty("--safe-bottom", `${safeBottom}px`);
      html.style.setProperty("--tg-vh", `${usedVH}px`);
      html.classList.add("tg-ready");
    };

    try {
      // Couleur de surface pour matcher le fond Telegram derrière la pilule
      const p = tg?.themeParams;
      const surface =
        tgHex(p?.bottom_bar_bg_color) ||
        tgHex(p?.secondary_bg_color) ||
        tgHex(p?.bg_color);
      if (surface) html.style.setProperty("--tg-surface", surface);

      tg?.ready?.();
      tg?.expand?.();

      measure();
      tg?.onEvent?.("viewportChanged", measure);
      window.visualViewport?.addEventListener("resize", measure);
      window.visualViewport?.addEventListener("scroll", measure);

      if (!tg) {
        // Hors Telegram : pas de safe-area
        html.style.setProperty("--safe-bottom", `0px`);
        html.style.setProperty("--tg-vh", `${window.innerHeight}px`);
        html.classList.add("tg-ready");
      }

      return () => {
        tg?.offEvent?.("viewportChanged", measure);
        window.visualViewport?.removeEventListener("resize", measure);
        window.visualViewport?.removeEventListener("scroll", measure);
      };
    } catch {
      /* noop */
    }
  }, []);
}
