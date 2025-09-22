// apps/web/app/telegram.ts
"use client";

import { useEffect } from "react";

/** Sonde CSS pour env(safe-area-inset-bottom) – utile en fallback */
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

/** Convertit une couleur Telegram hex (sans #) → #rrggbb */
function tgHex(c?: string) {
  if (!c) return undefined;
  return c.startsWith("#") ? c : `#${c}`;
}

export function useTelegramInit() {
  useEffect(() => {
    const tg = (window as any)?.Telegram?.WebApp;
    const html = document.documentElement;

    // ————— Mesure robuste du "safe bottom" —————
    const measure = () => {
      const vv = window.visualViewport;

      // 1) visualViewport : zone réellement masquée en bas (iOS fiable)
      let fromVV = 0;
      if (vv) {
        fromVV = Math.max(
          0,
          Math.round(window.innerHeight - (vv.height + vv.offsetTop))
        );
      }

      // 2) Différence innerHeight vs viewportStableHeight/viewportHeight
      const vh = tg?.viewportStableHeight || tg?.viewportHeight || 0;
      const fromVH = vh ? Math.max(0, window.innerHeight - vh) : 0;

      // 3) Fallback CSS env()
      const fromEnv = readIOSSafeBottom();

      // 4) Prends le max des 3 (fiable sur iOS, neutre ailleurs)
      const safeBottom = Math.max(fromVV, fromVH, fromEnv);

      // On expose aussi la hauteur utile (pour .tg-viewport)
      const usedVH = vh || window.innerHeight;

      html.style.setProperty("--safe-bottom", `${safeBottom}px`);
      html.style.setProperty("--tg-vh", `${usedVH}px`);
      html.classList.add("tg-ready");
    };

    try {
      // Thème -> couleur de surface du dock si dispo (continuité visuelle TG)
      const p = tg?.themeParams;
      const surface =
        tgHex(p?.bottom_bar_bg_color) ||
        tgHex(p?.secondary_bg_color) ||
        tgHex(p?.bg_color);
      if (surface) {
        html.style.setProperty("--tg-surface", surface);
      }

      tg?.ready?.();
      tg?.expand?.();

      // 1ère mesure
      measure();

      // Suivre les évolutions (clavier, gestures, etc.)
      tg?.onEvent?.("viewportChanged", measure);
      window.visualViewport?.addEventListener("resize", measure);
      window.visualViewport?.addEventListener("scroll", measure);

      // Hors Telegram : neutre (pas de home bar)
      if (!tg) {
        html.style.setProperty("--safe-bottom", `0px`);
        html.style.setProperty("--tg-vh", `${window.innerHeight}px`);
        html.classList.add("tg-ready");
      }

      // Nettoyage
      return () => {
        tg?.offEvent?.("viewportChanged", measure);
        window.visualViewport?.removeEventListener("resize", measure);
        window.visualViewport?.removeEventListener("scroll", measure);
      };
    } catch {
      // noop
    }
  }, []);
}
