"use client";

import { useEffect, useState } from "react";
import { Button, Group, Paper, useMantineColorScheme } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";
import classes from "./HeaderBar.module.css";

export default function HeaderBar() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  // ✅ Empêche le mismatch: on fige l'état à "clair" avant le montage
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted ? colorScheme === "dark" : false;
  const toggleTheme = () => setColorScheme(isDark ? "light" : "dark");

  return (
    <div className={classes.root} role="banner">
      {/* Peint la zone notch (au-dessus du header) */}
      <div className={classes.topPaint} aria-hidden />

      <Paper className={classes.barFill} radius={0} withBorder>
        <div className={classes.row}>
          {/* Logos : masqués par CSS selon le thème => pas de mismatch */}
          <a className={classes.logoWrap} href="/" aria-label="Shop">
            <img src="/logo-light.svg" alt="Shop" className={`${classes.logo} ${classes.logoLight}`} />
            <img src="/logo-dark.svg"  alt="Shop" className={`${classes.logo} ${classes.logoDark}`} />
          </a>

          <Group className={classes.actions} gap="xs">
            <Button variant="default" className={classes.btn}>Se connecter</Button>
            <Button className={classes.btn}>Créer un compte</Button>

            {/* Switch thème (rend stable avant montage) */}
            <button
              type="button"
              className={classes.themeSwitch}
              aria-pressed={isDark}
              title={isDark ? "Passer en clair" : "Passer en sombre"}
              onClick={toggleTheme}
            >
              <span className={classes.knob}>
                {isDark ? <IconMoon size={16} stroke={2} /> : <IconSun size={16} stroke={2} />}
              </span>
            </button>
          </Group>
        </div>
      </Paper>
    </div>
  );
}
