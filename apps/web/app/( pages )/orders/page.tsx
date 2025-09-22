import { Title, Text, Stack } from "@mantine/core";

export const metadata = { title: "Commandes" };

export default function OrdersPage() {
  return (
    <Stack gap="md" p="md">
      <Title order={2}>Historique des commandes</Title>
      <Text c="dimmed">Aucune commande pour l’instant.</Text>
    </Stack>
  );
}
