import Link from "next/link";
import { Button, Card, CopyButton, Flex, Text, Group, Box } from "@mantine/core";
import { ExtensionConnectCode } from "@prisma/client";
import { api } from "@/utils/api";

interface Props {
  pending: ExtensionConnectCode;
}

const PendingConnectCodeDisplay = ({ pending }: Props) => {
  const ctx = api.useContext();
  const deleteCode = api.extensions.deleteExtensionCode.useMutation({
    onSuccess: () => {
      ctx.extensions.getExtensionConnections.invalidate();
    },
  });

  const minutesLeft = Math.floor(
    (new Date(pending.expires).getTime() - new Date(Date.now()).getTime()) / 60000
  );

  return (
    <Card withBorder={true}>
      <Flex direction="column">
        <Text>Connection code</Text>
        <Flex gap="sm" align="center" mt="0.15rem">
          <Text weight={600} size="md">
            {pending.code}
          </Text>
          {minutesLeft > 0 && (
            <CopyButton value={pending.code}>
              {({ copied, copy }) => (
                <Button color={copied ? "teal" : "dark"} onClick={copy}>
                  {copied ? "Copied code" : "Copy code"}
                </Button>
              )}
            </CopyButton>
          )}
        </Flex>

        <Box mt="sm">
          {minutesLeft > 0 ? (
            <Text>Expires in {minutesLeft} Minute(s)</Text>
          ) : (
            <Text color="red">This code is expired!</Text>
          )}
          <Group>
            {minutesLeft > 0 && (
              <Button component={Link} href={`/extensions/v/${pending.id}`} mt="lg" color="red">
                Instructions
              </Button>
            )}
            <Button
              mt="lg"
              color="red"
              loading={deleteCode.isLoading}
              onClick={() =>
                deleteCode.mutate({
                  id: pending.id,
                })
              }
            >
              Delete
            </Button>
          </Group>
        </Box>
      </Flex>
    </Card>
  );
};
export default PendingConnectCodeDisplay;
