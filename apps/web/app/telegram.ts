// apps/web/app/telegram.ts
"use client";

import { useEffect, useRef } from "react";

/** Sonde CSS: lit réellement env(safe-area-inset-bottom) sous iOS. */
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

export function useTelegramInit() {
  const lastSafeRef = useRef(0); // empêche la valeur de redescendre (anti-rebond)

  useEffect(() => {
    const tg = (window as any)?.Telegram?.WebApp;
    const html = document.documentElement;

    const apply = () => {
      const inner = window.innerHeight;
      const vh = tg?.viewportStableHeight ?? tg?.viewportHeight ?? inner;

      // 1) delta innerHeight → hauteur viewport Telegram
      let sb = Math.max(0, inner - vh);

      // 2) fallback iOS réel via env()
      if (sb < 1) sb = readIOSSafeBottom();

      // 3) clamp upward-only (évite le “rebond” quand Telegram renvoie 0 ensuite)
      sb = Math.max(lastSafeRef.current, sb);
      lastSafeRef.current = sb;

      html.style.setProperty("--tg-vh", `${vh}px`);
      html.style.setProperty("--safe-bottom", `${sb}px`);

      // Couleurs Telegram pour fond d’app et surface (optionnel mais propre)
      const p = tg?.themeParams ?? {};
      const appBg =
        (typeof p.bg_color === "string" && p.bg_color) ||
        (typeof p.secondary_bg_color === "string" && p.secondary_bg_color);
      if (appBg) html.style.setProperty("--tg-app-bg", appBg);

      const surface =
        (typeof p.bottom_bar_bg_color === "string" && p.bottom_bar_bg_color) ||
        (typeof p.secondary_bg_color === "string" && p.secondary_bg_color);
      if (surface) html.style.setProperty("--tg-surface", surface);

      if (tg?.colorScheme) html.dataset.tgTheme = tg.colorScheme;
    };

    try {
      tg?.ready?.();
      tg?.expand?.();

      apply();

      const handler = () => apply();
      tg?.onEvent?.("viewportChanged", handler);
      window.addEventListener("resize", handler);

      if (!tg) {
        // Hors Telegram: valeurs neutres.
        lastSafeRef.current = 0;
        html.style.setProperty("--tg-vh", `${window.innerHeight}px`);
        html.style.setProperty("--safe-bottom", `0px`);
      }

      return () => {
        tg?.offEvent?.("viewportChanged", handler);
        window.removeEventListener("resize", handler);
      };
    } catch {
      /* noop */
    }
  }, []);
}
