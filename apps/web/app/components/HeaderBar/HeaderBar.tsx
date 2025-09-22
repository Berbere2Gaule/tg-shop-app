"use client";

import { Paper, Group, Button } from "@mantine/core";
import classes from "./HeaderBar.module.css";

export default function HeaderBar() {
  return (
    <div className={classes.root} role="banner">
      <Paper className={classes.barFill} radius={0} withBorder>
        <div className={classes.row}>
          <div className={classes.logoWrap} aria-label="Shop">
            {/* Deux versions => le thème masque la mauvaise, pas de mismatch SSR */}
            <img src="/logo-light.svg" className={`logoLight ${classes.logo}`} alt="Shop" />
            <img src="/logo-dark.svg"  className={`logoDark ${classes.logo}`}  alt="Shop" />
          </div>

          <Group className={classes.actions}>
            <Button variant="default" className={classes.btn}>Se connecter</Button>
            <Button className={classes.btn}>Créer un compte</Button>
          </Group>
        </div>
      </Paper>
    </div>
  );
}
