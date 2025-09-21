import "@repo/ui/global.css";

import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";

import { Theme } from "@repo/ui/theme";
import type { PropsWithChildren } from "react";
import TGShell from "./TGShell";
import "./TGShell.css";

export const metadata = {
  title: "Mantine Next.js template",
  description: "I am using Mantine with Next.js!",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        {/* viewport-fit=cover pour gérer l’encoche iOS dans la webview */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider theme={Theme}>
          {/* TOUT ce qui dépend du client (Telegram, safe-bottom, Dock) vit ici */}
          <TGShell>{children}</TGShell>
        </MantineProvider>
      </body>
    </html>
  );
}
