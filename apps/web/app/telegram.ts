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
  } catch {
    return 0;
  }
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
  } catch {
    return 0;
  }
}
function isLikelyIOS() {
  const ua = navigator.userAgent || "";
  return /iPhone|iPad|iPod/i.test(ua) || (/Mac/i.test(ua) && "ontouchend" in window);
}
function setCssVar(name: string, value: string | number) {
  document.documentElement.style.setProperty(name, String(value));
}

export function useTelegramInit() {
  useEffect(() => {
    const tg = (window as any)?.Telegram?.WebApp;
    const html = document.documentElement;

    // ——— réglages d’aisance (tu peux ajuster) ———
    const IOS_TOP_BASELINE = 90;   // descendre la headbar sur iOS
    const IOS_BOTTOM_BASELINE = 8; // rapprocher le dock de la barre iPhone
    const HEADER_EXTRA_GAP_IOS = 12;
    const HEADER_EXTRA_GAP_DEFAULT = 6;

    const applyTheme = () => {
      const tp = tg?.themeParams ?? {};
      const bg =
        (tp as any).bg_color ||
        (tp as any).secondary_bg_color ||
        "";
      if (bg) setCssVar("--tg-app-bg", bg);
      if (tg?.colorScheme) html.setAttribute("data-mantine-color-scheme", tg.colorScheme);
      if (tg?.platform) html.setAttribute("data-tg-platform", tg.platform);
    };

    const computeVH = () => {
      // Sur desktop, viewportStableHeight peut être généreux → on prend le MIN
      const cand = [
        tg?.viewportHeight,
        tg?.viewportStableHeight,
        window.innerHeight,
      ].filter((n): n is number => typeof n === "number" && Number.isFinite(n));
      return cand.length ? Math.min(...cand) : window.innerHeight;
    };

    const applyInsets = () => {
      const isIOS = (tg?.platform === "ios") || isLikelyIOS();

      const vh = computeVH();

      // bas (home-indicator / barre)
      const fromVH = Math.max(0, window.innerHeight - vh);
      const fromEnvBottom = readIOSSafeBottom();
      let bottom = Math.max(fromVH, fromEnvBottom);
      if (isIOS) bottom = Math.max(bottom, IOS_BOTTOM_BASELINE);

      // haut (encoche / barre Telegram)
      const fromEnvTop = readIOSSafeTop();
      const fromVisual = Math.max(0, (window.visualViewport?.offsetTop ?? 0));
      let top = Math.max(fromEnvTop, fromVisual);
      if (isIOS) top = Math.max(top, IOS_TOP_BASELINE);

      // expose
      setCssVar("--tg-vh", `${Math.round(vh)}px`);
      setCssVar("--dock-inset", `${Math.round(bottom)}px`);
      setCssVar("--safe-bottom", `${Math.round(bottom)}px`); // compat CSS existant
      setCssVar("--header-inset", `${Math.round(top)}px`);

      // paper du dock : taille de base (synchronisée avec la taille de tes boutons)
      if (tg?.platform === "tdesktop") setCssVar("--dock-height", "70px");
      else setCssVar("--dock-height", "70px");

      // petit rab visuel sous les boutons Telegram
      setCssVar("--header-extra-gap", isIOS ? `${HEADER_EXTRA_GAP_IOS}px` : `${HEADER_EXTRA_GAP_DEFAULT}px`);

      html.classList.add("tg-ready");
    };

    const stabilized = () => {
      applyInsets();
      requestAnimationFrame(() => requestAnimationFrame(applyInsets));
    };

    try {
      applyTheme();
      tg?.ready?.();
      tg?.expand?.();

      stabilized();
      tg?.onEvent?.("viewportChanged", stabilized);
      tg?.onEvent?.("themeChanged", applyTheme);

      // iOS/desktop: capter variations de visualViewport
      const onVV = () => applyInsets();
      const vv = window.visualViewport;
      vv?.addEventListener("resize", onVV, { passive: true });
      vv?.addEventListener("scroll", onVV, { passive: true });

      const onOrient = () => stabilized();
      window.addEventListener("orientationchange", onOrient, { passive: true });

      // fallback hors Telegram
      if (!tg) {
        const isIOS = isLikelyIOS();
        setCssVar("--tg-vh", `${window.innerHeight}px`);
        setCssVar("--header-inset", isIOS ? `${IOS_TOP_BASELINE}px` : "0px");
        setCssVar("--dock-inset", isIOS ? `${IOS_BOTTOM_BASELINE}px` : "0px");
        setCssVar("--safe-bottom", isIOS ? `${IOS_BOTTOM_BASELINE}px` : "0px");
        setCssVar("--dock-height", "60px");
        setCssVar("--header-extra-gap", isIOS ? `${HEADER_EXTRA_GAP_IOS}px` : `${HEADER_EXTRA_GAP_DEFAULT}px`);
        html.classList.add("tg-ready");
      }

      return () => {
        tg?.offEvent?.("viewportChanged", stabilized);
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
