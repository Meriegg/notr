import { z } from "zod";
import { api } from "@/utils/api";
import { useRouter } from "next/router";
import { useForm, zodResolver } from "@mantine/form";
import { IconAlertCircle } from "@tabler/icons-react";
import { TextInput, Flex, Text, Box, Button, Alert } from "@mantine/core";
import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import {
  verifyAuthState,
  type VerifyAuthStateReturnType,
} from "@/server/utils/verifyAuthState";
import { useState } from "react";

const CompleteSignup: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ authSession }) => {
  const [error, setError] = useState<string | null>("Error");
  const router = useRouter();
  const completeSignup = api.auth.completeSignup.useMutation({
    onSuccess: () => {
      router.push("/");
    },
    onError: (error) => {
      setError(error.message);
    },
  });
  const validationSchema = z.object({
    name: z.string(),
    email: z.string().email(),
  });

  const { onSubmit, getInputProps } = useForm({
    initialValues: {
      name: authSession?.user.name || "",
      email: authSession?.user.email || "",
    },
    validate: zodResolver(validationSchema),
  });

  return (
    <Flex direction="column" gap="lg" align="center" mt="2rem">
      {error && (
        <Alert
          w="min(450px, 100%)"
          icon={<IconAlertCircle size="1rem" />}
          title="Bummer!"
          color="red"
          withCloseButton
          closeButtonLabel="Dismiss"
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      <Text size="2rem" weight="bold">
        Complete signup!
      </Text>

      <Box w="min(450px, 100%)">
        <form
          onSubmit={onSubmit((values) => {
            completeSignup.mutate(values);
          })}
        >
          <Flex direction="column" gap="0.5rem">
            <TextInput
              label="Email"
              withAsterisk
              placeholder="johndoe@example.com"
              disabled={!!authSession?.user.email}
              {...getInputProps("email")}
            />
            <TextInput
              label="Name"
              withAsterisk
              placeholder="John Doe"
              disabled={!!authSession?.user.name}
              {...getInputProps("name")}
            />
          </Flex>

          <Button type="submit" mt="sm" color="dark" fullWidth>
            Continue!
          </Button>
        </form>
      </Box>
    </Flex>
  );
};

export const getServerSideProps: GetServerSideProps<
  VerifyAuthStateReturnType
> = async (ctx: GetServerSidePropsContext) => {
  return await verifyAuthState(ctx);
};

export default CompleteSignup;
