"use client";

import React, { useState, type ReactNode } from "react";
import { Paper, ActionIcon, Box } from "@mantine/core";
import { Megaphone, ShoppingCart, Store, Package, User } from "lucide-react";
import s from "./Dock.module.css";

type Tab = "promo" | "cart" | "shop" | "orders" | "account";
type TabItem = { key: Tab; label: string; icon: ReactNode };

const items: TabItem[] = [
  { key: "promo",  label: "Promos",    icon: <Megaphone /> },
  { key: "cart",   label: "Panier",    icon: <ShoppingCart /> },
  { key: "shop",   label: "Shop",      icon: <Store /> },
  { key: "orders", label: "Commandes", icon: <Package /> },
  { key: "account",label: "Compte",    icon: <User /> },
];

export default function Dock() {
  const [active, setActive] = useState<Tab>("shop");

  return (
    <Box className={s.root}>
      {/* plein bas, full width, le contenu défile dessous */}
      <Paper className={s.barFill} radius={0} withBorder>
        <nav className={s.row} aria-label="Navigation principale">
          {items.map((it) => {
            const isActive = active === it.key;
            return (
              <ActionIcon
                key={it.key}
                aria-label={it.label}
                size={46}
                radius="xl"
                variant="transparent"
                className={`${s.item} ${isActive ? s.active : ""}`}
                onClick={() => setActive(it.key)}
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
