"use client";

import type { PropsWithChildren, CSSProperties } from "react";
import "./TGShell.css";               // ✅ global (plus de .module.css)
import Dock from "./components/Dock/Dock";
import { useTelegramInit } from "./telegram";

type TGShellProps = PropsWithChildren<{
  /** largeur max “téléphone” (ex: 385 | "420px") */
  maxWidth?: number | string;
}>;

export default function TGShell({ children, maxWidth = 385 }: TGShellProps) {
  // Initialise WebApp, calcule --safe-bottom / --tg-vh, etc.
  useTelegramInit();

  const style = {
    ["--app-max-w" as any]:
      typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth,
  } as CSSProperties;

  return (
    <div className="tg-shell" style={style}>
      <div className="tg-viewport">{children}</div>
      <Dock />
    </div>
  );
}
