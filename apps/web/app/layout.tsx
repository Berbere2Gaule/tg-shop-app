import "@repo/ui/global.css";
import { Theme } from "@repo/ui/theme";

import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";

import type { PropsWithChildren } from "react";
import TGShell from "./TGShell";
import "./TGShell.css";

// Vercel analytics & speed insights (App Router)
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
        {/* viewport-fit=cover pour gérer l’encoche iOS */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no"
        />
      </head>

      <body>
        <MantineProvider theme={Theme}>
          {/* Toute l’app (webview Telegram + Dock) */}
          <TGShell>{children}</TGShell>
        </MantineProvider>

        {/* Place-les dans le body (une seule fois) */}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
