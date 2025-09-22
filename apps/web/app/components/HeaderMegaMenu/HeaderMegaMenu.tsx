"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Anchor,
  Box,
  Burger,
  Button,
  Center,
  Collapse,
  Divider,
  Drawer,
  Group,
  HoverCard,
  ScrollArea,
  SimpleGrid,
  Text,
  ThemeIcon,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBook,
  IconChartPie3,
  IconChevronDown,
  IconCode,
  IconCoin,
  IconFingerprint,
  IconNotification,
} from "@tabler/icons-react";
import classes from "./HeaderMegaMenu.module.css";

const mockdata = [
  { icon: IconCode,         title: "Open source",       description: "This Pokémon’s cry is very loud and distracting" },
  { icon: IconCoin,         title: "Free for everyone", description: "The fluid of Smeargle’s tail secretions changes" },
  { icon: IconBook,         title: "Documentation",     description: "Yanma is capable of seeing 360 degrees without" },
  { icon: IconFingerprint,  title: "Security",          description: "The shell’s rounded shape and the grooves on its." },
  { icon: IconChartPie3,    title: "Analytics",         description: "This Pokémon uses its flying ability to quickly chase" },
  { icon: IconNotification, title: "Notifications",     description: "Combusken battles with the intensely hot flames it spews" },
];

export function HeaderMegaMenu() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false);
  const theme = useMantineTheme();
  const primary = theme.colors[theme.primaryColor]?.[6] ?? theme.colors.blue[6];

  const links = mockdata.map((item) => (
    <UnstyledButton className={classes.subLink} key={item.title}>
      <Group wrap="nowrap" align="flex-start">
        <ThemeIcon size={34} variant="default" radius="md">
          <item.icon size={22} color={primary} />
        </ThemeIcon>
        <div>
          <Text size="sm" fw={500}>{item.title}</Text>
          <Text size="xs" c="dimmed">{item.description}</Text>
        </div>
      </Group>
    </UnstyledButton>
  ));

  return (
    <Box className={classes.header}>
      <div className={classes.inner}>
        {/* Logo: pas de JS, switch via CSS pour éviter tout mismatch SSR/CSR */}
        <Link href="/" aria-label="Accueil" className={classes.brand}>
          <span className={classes.logo}>
            <Image className={classes.logoLight} src="/logo-light.svg" alt="" width={28} height={28} priority />
            <Image className={classes.logoDark}  src="/logo-dark.svg"  alt="" width={28} height={28} priority />
          </span>
          <span className={classes.brandName}>Shop</span>
        </Link>

        <Group visibleFrom="sm">
          <Button variant="default">Canal</Button>
          <Button>Créer un compte</Button>
        </Group>

        <Burger opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="sm" />
      </div>

      {/* Drawer mobile */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title="Navigation"
        hiddenFrom="sm"
        zIndex={1000000}
      >
        <ScrollArea h="calc(100vh - var(--header-height))" mx="-md">
          <Divider my="sm" />

          <Link href="#" className={classes.link}>Accueil</Link>
          <UnstyledButton className={classes.link} onClick={toggleLinks}>
            <Center inline>
              <Box component="span" mr={5}>Features</Box>
              <IconChevronDown size={16} color={primary} />
            </Center>
          </UnstyledButton>

          <Collapse in={linksOpened}>{links}</Collapse>

          <Link href="#" className={classes.link}>Learn</Link>
          <Link href="#" className={classes.link}>Academy</Link>

          <Divider my="sm" />
          <Group justify="center" grow pb="xl" px="md">
            <Button variant="default">Se connecter</Button>
            <Button>Créer un compte</Button>
          </Group>
        </ScrollArea>
      </Drawer>
    </Box>
  );
}
