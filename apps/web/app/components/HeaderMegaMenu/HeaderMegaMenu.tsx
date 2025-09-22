// apps/web/app/components/HeaderMegaMenu/HeaderMegaMenu.tsx
"use client";

import Link from "next/link";
import { Button, Group } from "@mantine/core";
import classes from "./HeaderMegaMenu.module.css";

export default function HeaderMegaMenu() {
  return (
    <div className={classes.row}>
      <Link href="/" className={classes.brand} aria-label="Accueil">
        <picture>
          <source srcSet="/logo-dark.svg" media="(prefers-color-scheme: dark)" />
          <img src="/logo-light.svg" alt="Shop" className={classes.logo} />
        </picture>
        <span className={classes.title}>Shop</span>
      </Link>

      <Group gap="xs" className={classes.actions}>
        <Button variant="default" size="xs">Se connecter</Button>
        <Button size="xs">Créer un compte</Button>
      </Group>
    </div>
  );
}
