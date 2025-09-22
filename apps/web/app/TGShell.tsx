"use client";

import type { PropsWithChildren, CSSProperties } from "react";
import { useTelegramInit } from "./telegram";
import Dock from "./components/Dock/Dock";
import HeaderBar from "./components/HeaderBar/HeaderBar";
import "./TGShell.css";

export default function TGShell({ children }: PropsWithChildren) {
  useTelegramInit();
  const style = { ["--app-max-w" as any]: "420px" } as CSSProperties;

  return (
    <div className="tg-shell" style={style}>
      <HeaderBar />
      <main className="tg-viewport">{children}</main>
      <Dock />
    </div>
  );
}
