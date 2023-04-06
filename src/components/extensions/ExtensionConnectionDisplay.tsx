import { api } from "@/utils/api";
import { Button, Card, CopyButton, Flex, Group, Text } from "@mantine/core";
import { ConnectedExtension } from "@prisma/client";

interface Props {
  connection: ConnectedExtension;
}

const ExtensionConnectionDisplay = ({ connection }: Props) => {
  const ctx = api.useContext();
  const deleteConnection = api.extensions.deleteExtensionConnection.useMutation({
    onSuccess: () => {
      ctx.extensions.getExtensionConnections.invalidate();
    },
  });

  return (
    <Card withBorder={true}>
      <Flex direction="column">
        <Text>Session ID</Text>
        <Flex gap="0.5rem" align="center">
          <Text weight={600}>{connection.sessionId}</Text>
          <CopyButton value={connection.sessionId}>
            {({ copied, copy }) => (
              <Button color={copied ? "teal" : "dark"} onClick={copy}>
                {copied ? "Copied ID" : "Copy ID"}
              </Button>
            )}
          </CopyButton>
        </Flex>

        <Group spacing="xs" mt="lg">
          <Button
            color="red"
            onClick={() => deleteConnection.mutate({ id: connection.id })}
            loading={deleteConnection.isLoading}
          >
            Delete connection
          </Button>
          <CopyButton value={connection.publicVerificationKey}>
            {({ copied, copy }) => (
              <Button color={copied ? "teal" : "dark"} onClick={copy}>
                {copied ? "Copied key" : "Copy signed verification key"}
              </Button>
            )}
          </CopyButton>
        </Group>
      </Flex>
    </Card>
  );
};

export default ExtensionConnectionDisplay;
