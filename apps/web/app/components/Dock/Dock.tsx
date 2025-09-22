// apps/web/app/components/Dock/Dock.tsx
"use client";

import React, { type ReactNode } from "react";
import { Paper, ActionIcon, Box } from "@mantine/core";
import { Megaphone, ShoppingCart, Store, Package, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import s from "./Dock.module.css";

type Tab = "promo" | "cart" | "shop" | "orders" | "account";
type TabItem = { key: Tab; label: string; icon: ReactNode; href: string };

const items: TabItem[] = [
  { key: "promo",   label: "Promos",    icon: <Megaphone />,     href: "/promo" },
  { key: "cart",    label: "Panier",    icon: <ShoppingCart />,  href: "/cart" },
  { key: "shop",    label: "Shop",      icon: <Store />,         href: "/" },
  { key: "orders",  label: "Commandes", icon: <Package />,       href: "/orders" },
  { key: "account", label: "Compte",    icon: <User />,          href: "/account" },
];

function keyFromPath(pathname: string): Tab {
  if (pathname.startsWith("/promo"))   return "promo";
  if (pathname.startsWith("/cart"))    return "cart";
  if (pathname === "/" || pathname.startsWith("/shop")) return "shop";
  if (pathname.startsWith("/orders"))  return "orders";
  if (pathname.startsWith("/account")) return "account";
  return "shop";
}

export default function Dock() {
  const pathname = usePathname();
  const active = keyFromPath(pathname || "/");

  return (
    <Box className={s.root}>
      <Paper className={s.barFill} radius={0} withBorder>
        <nav className={s.row} aria-label="Navigation principale">
          {items.map((it) => {
            const isActive = active === it.key;
            return (
              <ActionIcon
                key={it.key}
                aria-label={it.label}
                aria-current={isActive ? "page" : undefined}
                size={52}
                radius="xl"
                variant="transparent"
                className={`${s.item} ${isActive ? s.active : ""}`}
                component={Link}
                href={it.href}
                prefetch={false}
              >
                {it.icon}
              </ActionIcon>
            );
          })}
        </nav>
      </Paper>
    </Box>
  );
}
