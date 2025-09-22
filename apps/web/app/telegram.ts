// apps/web/app/telegram.ts
"use client";

import { useEffect } from "react";

/* ---------- helpers safe-areas iOS ---------- */
function readIOSSafeTop(): number {
  try {
    const el = document.createElement("div");
    el.style.cssText =
      "position:fixed;left:0;top:0;height:0;visibility:hidden;padding-top:env(safe-area-inset-top)";
    document.body.appendChild(el);
    const v = parseFloat(getComputedStyle(el).paddingTop || "0") || 0;
    el.remove();
    return v;
  } catch { return 0; }
}
function readIOSSafeBottom(): number {
  try {
    const el = document.createElement("div");
    el.style.cssText =
      "position:fixed;left:0;bottom:0;height:0;visibility:hidden;padding-bottom:env(safe-area-inset-bottom)";
    document.body.appendChild(el);
    const v = parseFloat(getComputedStyle(el).paddingBottom || "0") || 0;
    el.remove();
    return v;
  } catch { return 0; }
}
function isLikelyIOS() {
  const ua = navigator.userAgent || "";
  return /iPhone|iPad|iPod/i.test(ua) || (/Mac/i.test(ua) && "ontouchend" in window);
}
function readCssVarPx(name: string): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
}

export function useTelegramInit() {
  useEffect(() => {
    const tg = (window as any)?.Telegram?.WebApp;
    const html = document.documentElement;

    // --------- constantes d’aisance (tu peux ajuster ici) ---------
    const IOS_TOP_BASELINE = 90;   // ⇣ DESCENDRE la headbar (tu avais demandé 90)
    const IOS_BOTTOM_BASELINE = 8; // ↓ rapprocher le dock de la barre iPhone
    const HEADER_EXTRA_GAP = 10;   // petit rab visuel sous les boutons Telegram

    const round = (n: number) => Math.max(0, Math.round(n));
    const clamp = (n: number, min = 0, max = 9999) => Math.min(max, Math.max(min, n));

    // seed pour éviter les “sauts”
    let maxTopInset = readCssVarPx("--header-inset") || 0;
    let maxBottomInset = readCssVarPx("--dock-inset") || readCssVarPx("--safe-bottom") || 0;

    const applyTheme = () => {
      const tp = tg?.themeParams ?? {};
      const bg = (tp as any).bg_color || (tp as any).secondary_bg_color || "";
      if (bg) html.style.setProperty("--tg-app-bg", bg);
      if (tg?.colorScheme) html.dataset.mantineColorScheme = tg.colorScheme;
      if (tg?.platform) html.dataset.tgPlatform = tg.platform; // "tdesktop" | "android" | "ios"...
    };

    const applyInsets = () => {
      const isIOS = (tg?.platform === "ios") || isLikelyIOS();

      const vh = tg?.viewportStableHeight || tg?.viewportHeight || window.innerHeight;

      // BAS
      const fromVH = Math.max(0, window.innerHeight - vh);
      const fromEnvBottom = readIOSSafeBottom();
      let bottom = round(Math.max(fromVH, fromEnvBottom));
      if (isIOS) bottom = Math.max(bottom, IOS_BOTTOM_BASELINE);
      maxBottomInset = Math.max(maxBottomInset, bottom);

      // HAUT
      const fromEnvTop = readIOSSafeTop();
      const fromVisual = Math.max(0, (window.visualViewport?.offsetTop ?? 0));
      let top = round(Math.max(fromEnvTop, fromVisual));
      if (isIOS) top = Math.max(top, IOS_TOP_BASELINE);
      maxTopInset = Math.max(maxTopInset, top);

      // expose
      html.style.setProperty("--tg-vh", `${round(vh)}px`);
      html.style.setProperty("--header-inset", `${clamp(maxTopInset)}px`);
      html.style.setProperty("--dock-inset", `${clamp(maxBottomInset)}px`);
      html.style.setProperty("--safe-bottom", `${clamp(maxBottomInset)}px`);
      html.style.setProperty("--header-extra-gap", `${HEADER_EXTRA_GAP}px`);

      html.classList.add("tg-ready");
    };

    const computeStabilized = () => {
      applyInsets();
      requestAnimationFrame(() => requestAnimationFrame(applyInsets));
    };

    try {
      applyTheme();
      tg?.ready?.();
      tg?.expand?.();

      computeStabilized();
      tg?.onEvent?.("viewportChanged", computeStabilized);
      tg?.onEvent?.("themeChanged", applyTheme);

      const onVV = () => applyInsets();
      const vv = window.visualViewport;
      vv?.addEventListener("resize", onVV, { passive: true });
      vv?.addEventListener("scroll", onVV, { passive: true });
      const onOrient = () => computeStabilized();
      window.addEventListener("orientationchange", onOrient, { passive: true });

      // fallback hors Telegram
      if (!tg) {
        const isIOS = isLikelyIOS();
        html.style.setProperty("--tg-vh", `${window.innerHeight}px`);
        html.style.setProperty("--header-inset", `${isIOS ? IOS_TOP_BASELINE : 0}px`);
        html.style.setProperty("--dock-inset", `${isIOS ? IOS_BOTTOM_BASELINE : 0}px`);
        html.style.setProperty("--safe-bottom", `${isIOS ? IOS_BOTTOM_BASELINE : 0}px`);
        html.style.setProperty("--header-extra-gap", `${HEADER_EXTRA_GAP}px`);
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
    } catch { /* noop */ }
  }, []);
}
