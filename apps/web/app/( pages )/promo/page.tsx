import { Title, Text, Stack, Button } from "@mantine/core";

export const metadata = { title: "Promos" };

export default function PromoPage() {
  return (
    <Stack gap="md" p="md">
      <Title order={2}>Promotions</Title>
      <Text c="dimmed">
        Page de démo – liste de promos à venir. Remplace-moi par ton vrai contenu.
      </Text>
      <Button variant="light">Voir toutes les promos</Button>
    </Stack>
  );
}
