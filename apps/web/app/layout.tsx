import "@repo/ui/global.css";

import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";

import { Theme } from "@repo/ui/theme";
import type { PropsWithChildren } from "react";
import Dock from "./components/Dock/Dock";

export const metadata = {
  title: "Mantine Next.js template",
  description: "I am using Mantine with Next.js!",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="fr" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        {/* Boot minimal Telegram WebApp : expand + hauteur stable */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  try {
    var tg = window?.Telegram?.WebApp;
    if (!tg) return;
    tg.expand?.();
    var h = tg.viewportStableHeight || tg.viewportHeight || window.innerHeight;
    document.documentElement.style.setProperty("--tg-viewport-stable-height", h + "px");
  } catch (_) {}
})();`,
          }}
        />
      </head>
      <body>
        <MantineProvider theme={Theme}>
          {children}
          <Dock />
        </MantineProvider>
      </body>
    </html>
  );
}
