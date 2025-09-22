// apps/web/app/telegram.ts
"use client";

import { useEffect } from "react";

/* --- Sondes CSS pour safe-areas iOS --- */
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

/* Lit une var CSS pour “seeder” les maxima si le hook remonte */
function readCssVarPx(name: string): number {
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    if (!v) return 0;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

export function useTelegramInit() {
  useEffect(() => {
    const tg = (window as any)?.Telegram?.WebApp;
    const html = document.documentElement;

    // ⬇️ utilitaires
    const round = (n: number) => Math.max(0, Math.round(n));
    const clamp = (n: number, min = 0, max = 9999) => Math.min(max, Math.max(min, n));

    // petits “conforts” pour iOS
    const IOS_BOTTOM_BASELINE = 8;
    const IOS_TOP_BASELINE = 44; // status bar iOS "classique" (monte si tu veux + de marge)

    // ⬇️ valeurs monotones, seedées depuis les var CSS existantes
    let maxBottomInset =
      readCssVarPx("--dock-inset") || readCssVarPx("--safe-bottom") || 0;
    let maxTopInset = readCssVarPx("--header-inset") || 0;

    const computeAndApply = () => {
      const isIOS = (tg?.platform === "ios") || isLikelyIOS();

      // hauteur visible Telegram quand dispo
      const vh = tg?.viewportStableHeight || tg?.viewportHeight || window.innerHeight;

      // ----- BAS (dock) -----
      const fromVH = Math.max(0, window.innerHeight - vh); // souvent la home-bar
      const fromEnvBottom = readIOSSafeBottom();
      let bottom = round(Math.max(fromVH, fromEnvBottom));
      if (isIOS) bottom = Math.max(bottom, IOS_BOTTOM_BASELINE);
      maxBottomInset = Math.max(maxBottomInset, bottom);

      // ----- HAUT (header) -----
      const fromEnvTop = readIOSSafeTop();
      const fromVisual = Math.max(0, (window.visualViewport?.offsetTop ?? 0));
      let top = round(Math.max(fromEnvTop, fromVisual));
      if (isIOS) top = Math.max(top, IOS_TOP_BASELINE);
      maxTopInset = Math.max(maxTopInset, top);

      // expose aux styles
      html.style.setProperty("--tg-vh", `${round(vh)}px`);
      html.style.setProperty("--dock-inset", `${clamp(maxBottomInset)}px`);
      html.style.setProperty("--safe-bottom", `${clamp(maxBottomInset)}px`); // compat
      html.style.setProperty("--header-inset", `${clamp(maxTopInset)}px`);

      // (optionnel) petit plus sous l’encoche pour iOS seulement
      if (isIOS && !html.style.getPropertyValue("--header-extra-gap")) {
        html.style.setProperty("--header-extra-gap", "10px"); // ajuste 8–12px selon modèle
      }

      html.classList.add("tg-ready");
    };

    // Telegram thème/fond
    const applyTheme = () => {
      const tp = tg?.themeParams ?? {};
      const bg = (tp as any).bg_color || (tp as any).secondary_bg_color || "";
      if (bg) html.style.setProperty("--tg-app-bg", bg);
      if (tg?.colorScheme) html.dataset.tgTheme = tg.colorScheme;
      if (tg?.platform) html.dataset.tgPlatform = tg.platform;
    };

    // pour capturer l’offset final après “expand”
    const computeStabilized = () => {
      computeAndApply();
      // 2× rAF = après layout + paint → évite le rebond
      requestAnimationFrame(() => requestAnimationFrame(computeAndApply));
    };

    try {
      applyTheme();
      tg?.ready?.();
      tg?.expand?.();

      computeStabilized();
      tg?.onEvent?.("viewportChanged", computeStabilized);
      tg?.onEvent?.("themeChanged", applyTheme);

      // iOS bouge offsetTop sur visualViewport → même handler partagé
      const onVV = () => computeAndApply();
      const vv = window.visualViewport;
      vv?.addEventListener("resize", onVV, { passive: true });
      vv?.addEventListener("scroll", onVV, { passive: true });
      const onOrient = () => computeStabilized();
      window.addEventListener("orientationchange", onOrient, { passive: true });

      // Hors Telegram
      if (!tg) {
        const bottomBaseline = isLikelyIOS() ? IOS_BOTTOM_BASELINE : 0;
        const topBaseline = isLikelyIOS() ? IOS_TOP_BASELINE : 0;
        html.style.setProperty("--tg-vh", `${window.innerHeight}px`);
        html.style.setProperty("--dock-inset", `${bottomBaseline}px`);
        html.style.setProperty("--safe-bottom", `${bottomBaseline}px`);
        html.style.setProperty("--header-inset", `${topBaseline}px`);
        if (isLikelyIOS()) html.style.setProperty("--header-extra-gap", "10px");
        html.classList.add("tg-ready");
      }

      return () => {
        tg?.offEvent?.("viewportChanged", computeStabilized);
        tg?.offEvent?.("themeChanged", applyTheme);
        const vv2 = window.visualViewport;
        vv2?.removeEventListener("resize", onVV);
        vv2?.removeEventListener("scroll", onVV);
        window.removeEventListener("orientationchange", onOrient);
      };
    } catch {
      /* noop */
    }
  }, []);
}
