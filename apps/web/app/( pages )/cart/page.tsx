import { Title, Text, Stack, Button } from "@mantine/core";

export const metadata = { title: "Panier" };

export default function CartPage() {
  return (
    <Stack gap="md" p="md">
      <Title order={2}>Ton panier</Title>
      <Text c="dimmed">Aucun article pour le moment.</Text>
      <Button variant="light">Continuer mes achats</Button>
    </Stack>
  );
}
