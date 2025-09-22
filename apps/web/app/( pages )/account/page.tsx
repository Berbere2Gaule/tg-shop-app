import { Title, Text, Stack, Button } from "@mantine/core";

export const metadata = { title: "Compte" };

export default function AccountPage() {
  return (
    <Stack gap="md" p="md">
      <Title order={2}>Mon compte</Title>
      <Text c="dimmed">Connecte-toi pour accéder à tes informations.</Text>
      <Button>Se connecter</Button>
    </Stack>
  );
}
