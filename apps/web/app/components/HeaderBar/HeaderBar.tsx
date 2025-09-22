"use client";

import { useEffect, useState } from "react";
import { Paper, Group, Button, ActionIcon, Tooltip } from "@mantine/core";
import { useMantineColorScheme } from "@mantine/core";
import { Moon, Sun } from "lucide-react";
import classes from "./HeaderBar.module.css";

/** Petit switch de thème — rendu seulement après le mount pour éviter tout mismatch SSR */
function ThemeSwitch() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Placeholder neutre pour l’hydratation (pas d’aria dynamique avant le mount)
    return <ActionIcon className={classes.switch} variant="default" aria-hidden="true" />;
  }

  const isDark = colorScheme === "dark";
  const next = isDark ? "light" : "dark";
  const label = isDark ? "Passer en clair" : "Passer en sombre";

  return (
    <Tooltip label={label} withArrow>
      <ActionIcon
        className={classes.switch}
        variant="default"
        aria-label={label}
        onClick={() => setColorScheme(next)}
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </ActionIcon>
    </Tooltip>
  );
}

export default function HeaderBar() {
  return (
    <div className={classes.root} role="banner">
      <Paper className={classes.barFill} radius={0} withBorder>
        <div className={classes.row}>
          {/* Logo: 2 versions, masquées par CSS selon le thème ⇒ pas de mismatch */}
          <div className={classes.logoWrap} aria-label="Shop">
            <img src="/logo-light.svg" className={`${classes.logo} ${classes.logoLight}`} alt="Shop" />
            <img src="/logo-dark.svg"  className={`${classes.logo} ${classes.logoDark}`}  alt="Shop" />
          </div>

          <Group className={classes.actions} gap={8}>
            <Button variant="default" className={classes.btn}>Se connecter</Button>
            <Button className={classes.btn}>Créer un compte</Button>
            <ThemeSwitch />
          </Group>
        </div>
      </Paper>
    </div>
  );
}
