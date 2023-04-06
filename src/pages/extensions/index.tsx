import PendingConnectCodeDisplay from "@/components/extensions/PendingConnectCodeDisplay";
import ExtensionConnectionDisplay from "@/components/extensions/ExtensionConnectionDisplay";
import {
  Alert,
  Box,
  Button,
  Flex,
  Loader,
  Text,
  Card,
  Divider,
  CopyButton,
  Group,
} from "@mantine/core";
import { api } from "@/utils/api";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import Link from "next/link";

const Extensions: NextPage = () => {
  const router = useRouter();
  const [createError, setCreateError] = useState<string | null>(null);
  const createConnection = api.extensions.createExtensionAuthorizationCode.useMutation({
    onSuccess: (data) => {
      router.push(`/extensions/v/${data.id}`);
    },
    onError: (error) => {
      setCreateError(error.message);
    },
  });
  const { isLoading, data, isError, error } = api.extensions.getExtensionConnections.useQuery();

  return (
    <Box>
      <h1>Your extensions</h1>
      {isLoading && (
        <Flex gap="1rem" align="center">
          <Loader size="sm" />
          <p>Loading...</p>
        </Flex>
      )}

      {isError && (
        <Alert title="Bummer, an error happened!" color="red">
          {error?.message}
        </Alert>
      )}

      {createError && (
        <Alert title="Creating a new connection failed!" color="red">
          {createError}
        </Alert>
      )}

      <Button
        color="dark"
        onClick={() => createConnection.mutate()}
        loading={createConnection.isLoading}
      >
        Add a new connection
      </Button>

      {!data?.pending.length && null}
      {!!data?.pending.length && (
        <Divider
          label="Pending connections"
          my="lg"
          labelProps={{
            size: "md",
            ml: "md",
          }}
        />
      )}

      <Flex direction="column" gap="sm">
        {data?.pending.map((pending) => (
          <PendingConnectCodeDisplay pending={pending} />
        ))}
      </Flex>

      <Divider
        label="Extension connections"
        my="lg"
        labelProps={{
          size: "md",
          ml: "md",
        }}
      />

      {!data?.connected.length && (
        <Box>
          <Text>You don't have any extensions connected!</Text>
        </Box>
      )}
      <Flex direction="column" gap="sm">
        {data?.connected.map((connection) => (
          <ExtensionConnectionDisplay connection={connection} />
        ))}
      </Flex>
    </Box>
  );
};

export default Extensions;
