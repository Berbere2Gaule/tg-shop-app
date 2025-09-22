// apps/web/app/telegram.ts
"use client";

import { useEffect } from "react";

/* Sondes CSS iOS pour safe-area */
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

/* Heuristique iOS */
function isLikelyIOS() {
  const ua = navigator.userAgent || "";
  return /iPhone|iPad|iPod/i.test(ua) || (/Mac/i.test(ua) && "ontouchend" in window);
}

export function useTelegramInit() {
  useEffect(() => {
    const tg = (window as any)?.Telegram?.WebApp;
    const html = document.documentElement;

    // mêmes “baselines” que pour le dock (petit confort)
    const IOS_BOTTOM_BASELINE = 14;
    const IOS_TOP_BASELINE = 6;

    let maxBottomInset = 0; // ↙️ on ne redescend jamais (anti "rebond")
    let maxTopInset = 0;

    const applyViewport = () => {
      const isIOS = (tg?.platform === "ios") || isLikelyIOS();

      // Hauteur stable Telegram quand dispo
      const vh = tg?.viewportStableHeight || tg?.viewportHeight || window.innerHeight;

      // ---------- BAS (dock) : même logique qu'avant ----------
      const fromVH = Math.max(0, window.innerHeight - vh); // delta = home bar iOS dans TG
      const fromEnvBottom = readIOSSafeBottom();
      let bottom = Math.max(fromVH, fromEnvBottom);
      if (isIOS) bottom = Math.max(bottom, IOS_BOTTOM_BASELINE);
      maxBottomInset = Math.max(maxBottomInset, bottom);

      // ---------- HAUT (header) : on fait PAREIL ----------
      // 1) mesure CSS
      const fromEnvTop = readIOSSafeTop();
      // 2) mesure “réelle” via visualViewport (iOS place souvent un offsetTop)
      const fromVisual = Math.max(0, (window.visualViewport?.offsetTop ?? 0));
      let top = Math.max(fromEnvTop, fromVisual);
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

      // Hors Telegram : valeurs neutres + baselines iOS
      if (!tg) {
        const bottomBaseline = isLikelyIOS() ? IOS_BOTTOM_BASELINE : 0;
        const topBaseline = isLikelyIOS() ? IOS_TOP_BASELINE : 0;
        html.style.setProperty("--tg-vh", `${window.innerHeight}px`);
        html.style.setProperty("--dock-inset", `${bottomBaseline}px`);
        html.style.setProperty("--safe-bottom", `${bottomBaseline}px`);
        html.style.setProperty("--header-inset", `${topBaseline}px`);
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
