"use client";

import type { PropsWithChildren, CSSProperties } from "react";
import s from "./TGShell.module.css";
import Dock from "./components/Dock/Dock";
import { useTelegramInit } from "./telegram";

export default function TGShell({ children }: PropsWithChildren) {
  // Initialise WebApp, calcule --safe-bottom / --tg-vh, etc.
  useTelegramInit();

  // largeur “téléphone” (tu peux changer 385px selon ton rendu)
  const style = { ["--app-max-w" as any]: "385px" } as CSSProperties;

  return (
    <div className={s["tg-shell"]} style={style}>
      <div className={s["tg-viewport"]}>{children}</div>
      <Dock />
    </div>
  );
}
