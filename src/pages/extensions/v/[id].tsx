import { prisma } from "@/server/db";
import { Alert, Box, Button, CopyButton, Flex, PinInput, Text } from "@mantine/core";
import { ExtensionConnectCode } from "@prisma/client";
import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import Link from "next/link";

const ExtensionCodeDetails: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({
  notFound,
  connectionCode,
}) => {
  if (notFound || !connectionCode) {
    return (
      <Alert color="red" title="Oops, an error happened" mt="lg">
        Connection code not found, it may not exist or it may be expired / already used
      </Alert>
    );
  }

  const minutesLeft = Math.floor(
    (new Date(connectionCode.expires).getTime() - new Date(Date.now()).getTime()) / 60000
  );

  return (
    <Flex align="center" mt="xl" direction="column">
      <Flex direction="column" gap="sm" align="center">
        <Text size="2rem" weight={700} my="0">
          Your extension authorization code
        </Text>
        {minutesLeft > 0 && <Text>Expires in {minutesLeft} Minute(s)</Text>}
        {minutesLeft <= 0 && <Text color="red">This code is expired!</Text>}
      </Flex>
      <PinInput
        size="md"
        length={6}
        value={connectionCode.code}
        mt="lg"
        contentEditable={false}
        error={minutesLeft <= 0 ? true : false}
      />
      {minutesLeft > 0 ? (
        <CopyButton value={connectionCode.code}>
          {({ copied, copy }) => (
            <Button color={copied ? "teal" : "dark"} onClick={copy} mt="sm">
              {copied ? "Copied code" : "Copy code"}
            </Button>
          )}
        </CopyButton>
      ) : (
        <Button color="red" component={Link} href="/extensions" mt="sm">
          Go back
        </Button>
      )}

      <Text size="1.5rem" mt="lg" weight={700}>
        Instructions
      </Text>
      <Text
        align="center"
        style={{
          maxWidth: "650px",
        }}
      >
        Open your notr browser extension, follow the necessary steps until the login screen, from
        there press the "Log in" button and enter the code you see on your screen!
      </Text>
    </Flex>
  );
};

export const getServerSideProps: GetServerSideProps<{
  notFound: boolean;
  connectionCode: ExtensionConnectCode | null;
}> = async (ctx: GetServerSidePropsContext) => {
  const params = ctx.params;
  const id = params?.id;
  if (!id) {
    return {
      props: {
        notFound: true,
        connectionCode: null,
      },
    };
  }

  const connectionCode = await prisma.extensionConnectCode.findUnique({
    where: {
      id: typeof id === "object" ? id.join("") : id,
    },
  });
  if (!connectionCode) {
    return {
      props: {
        notFound: true,
        connectionCode: null,
      },
    };
  }

  return {
    props: {
      connectionCode: JSON.parse(JSON.stringify(connectionCode)),
      notFound: false,
    },
  };
};

export default ExtensionCodeDetails;
