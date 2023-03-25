import { signIn } from "next-auth/react";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Flex, Button, Text, Box } from "@mantine/core";
import { verifyAuthState } from "@/server/utils/verifyAuthState";
import type { GetServerSideProps, GetServerSidePropsContext, NextPage } from "next";

const SignIn: NextPage = () => {
  return (
    <Flex direction="column" align="center" mt="4rem" gap="2rem" px="md">
      <Flex direction="column" gap="xs" align="center">
        <Text size="2rem" weight="bold">
          Sign In!
        </Text>
        <Text weight="bold">
          {"Don't"} worry if you {"don't"} have an account
        </Text>
      </Flex>
      <Box w="min(300px, 100%)">
        <Button
          color="dark"
          fullWidth
          onClick={() => signIn("github")}
          rightIcon={<FontAwesomeIcon icon={faGithub} />}
        >
          Continue with Github
        </Button>
      </Box>
    </Flex>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx: GetServerSidePropsContext) =>
  await verifyAuthState(ctx);

export default SignIn;
