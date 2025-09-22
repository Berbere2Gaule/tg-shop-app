"use client";

import Link from "next/link";
import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Megaphone, ShoppingCart, Package, User, Sparkles } from "lucide-react";
import s from "./HomeScreen.module.css";

type Cat = { slug: string; label: string; emoji: string };
type Product = {
  id: string;
  title: string;
  price: string;
  tag?: string;
};

const CATEGORIES: Cat[] = [
  { slug: "nouveautes", label: "Nouveautés", emoji: "✨" },
  { slug: "mode", label: "Mode", emoji: "👗" },
  { slug: "electronique", label: "Électronique", emoji: "🔌" },
  { slug: "beaute", label: "Beauté", emoji: "💄" },
  { slug: "maison", label: "Maison", emoji: "🏠" },
];

const FEATURED: Product[] = [
  { id: "p1", title: "Casque sans fil", price: "59,90 €", tag: "Top vente" },
  { id: "p2", title: "Sneakers daily", price: "89,00 €" },
  { id: "p3", title: "Montre connectée", price: "129,00 €", tag: "-20%" },
  { id: "p4", title: "Diffuseur d'ambiance", price: "29,90 €" },
];

export default function HomeScreen() {
  return (
    <Stack className={s.root} gap="md">
      {/* HERO */}
      <Card className={s.hero} radius="lg" withBorder={false}>
        <div className={s.heroDecor} aria-hidden="true" />
        <Title className={s.heroTitle} order={2}>
          Bienvenue dans le shop
        </Title>
        <Text className={s.heroSubtitle}>
          Les meilleures offres, directement dans Telegram.
        </Text>

        <Group gap="xs" mt="sm">
          <Button
            component={Link}
            href="/promo"
            leftSection={<Megaphone size={18} />}
          >
            Promos du jour
          </Button>
          <Button
            component={Link}
            href="/cart"
            variant="light"
            leftSection={<ShoppingCart size={18} />}
          >
            Panier
          </Button>
        </Group>
      </Card>

      {/* RACCOURCIS */}
      <Card withBorder radius="lg">
        <Group justify="space-between">
          <Title order={3} size="h4">
            Raccourcis
          </Title>
          <Group gap="xs">
            <Button
              size="xs"
              variant="subtle"
              component={Link}
              href="/orders"
              leftSection={<Package size={16} />}
            >
              Commandes
            </Button>
            <Button
              size="xs"
              variant="subtle"
              component={Link}
              href="/account"
              leftSection={<User size={16} />}
            >
              Mon compte
            </Button>
          </Group>
        </Group>

        <div className={s.cats}>
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`} className={s.cat}>
              <span className={s.catEmoji}>{c.emoji}</span>
              <span className={s.catLabel}>{c.label}</span>
            </Link>
          ))}
        </div>
      </Card>

      {/* À LA UNE */}
      <Card withBorder radius="lg">
        <Group justify="space-between" mb="xs">
          <Title order={3} size="h4">
            À la une
          </Title>
          <Button
            size="xs"
            variant="subtle"
            component={Link}
            href="/promo"
            rightSection={<Sparkles size={16} />}
          >
            Voir tout
          </Button>
        </Group>

        <SimpleGrid cols={2} spacing="sm">
          {FEATURED.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </SimpleGrid>
      </Card>

      {/* Bandeau info */}
      <Card withBorder radius="lg" className={s.note}>
        <Text size="sm">
          Astuce : ajoute au panier depuis la page produit, puis règle sans
          quitter Telegram.
        </Text>
      </Card>

      {/* petit espace au-dessus du Dock (au cas où) */}
      <Box h={8} />
    </Stack>
  );
}

function ProductCard({ p }: { p: Product }) {
  return (
    <Card withBorder radius="md" className={s.product}>
      <div className={s.thumb} aria-hidden="true" />
      <div className={s.info}>
        <Text fw={600} lineClamp={2}>
          {p.title}
        </Text>
        <Group gap="xs" mt={4} align="center">
          <Text fw={700} className={s.price}>
            {p.price}
          </Text>
          {p.tag && (
            <Badge size="sm" variant="light">
              {p.tag}
            </Badge>
          )}
        </Group>
      </div>
      <Button size="xs" fullWidth mt="sm" variant="light" leftSection={<ShoppingCart size={16} />}>
        Ajouter
      </Button>
    </Card>
  );
}
