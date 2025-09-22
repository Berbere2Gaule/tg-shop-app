// apps/web/app/TGShell.tsx
"use client";

import type { PropsWithChildren, CSSProperties } from "react";
import { useTelegramInit } from "./telegram";
import Dock from "./components/Dock/Dock";
import HeaderMegaMenu from "./components/HeaderMegaMenu/HeaderMegaMenu";
import "./TGShell.css";

export default function TGShell({ children }: PropsWithChildren) {
  useTelegramInit();

  // largeur “téléphone”
  const style = { ["--app-max-w" as any]: "420px" } as CSSProperties;

  return (
    <div className="tg-shell" style={style}>
      <header className="tg-header">
        <div className="tg-headerRow">
          <HeaderMegaMenu />
        </div>
      </header>

      <main className="tg-viewport">{children}</main>

      <Dock />
    </div>
  );
}
