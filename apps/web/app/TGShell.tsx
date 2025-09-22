"use client";

import type { PropsWithChildren, CSSProperties } from "react";
import { useTelegramInit } from "./telegram";
import Dock from "./components/Dock/Dock";
import { HeaderMegaMenu } from "./components/HeaderMegaMenu/HeaderMegaMenu";
import "./TGShell.css";

export default function TGShell({ children }: PropsWithChildren) {
  useTelegramInit();

  const style = { ["--app-max-w" as any]: "420px" } as CSSProperties;

  return (
    <div className="tg-shell" style={style}>
      <div className="tg-viewport">
        {/* Header en haut, sticky et notch-aware */}
        <HeaderMegaMenu />
        {children}
      </div>

      {/* Dock fixé en bas, notch-aware */}
      <Dock />
    </div>
  );
}
