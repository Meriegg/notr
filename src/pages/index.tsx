import Notes from "@/Components/App/Notes";
import Link from "next/link";
import ImportFiles from "@/Components/App/ImportFilesModal";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Flex, Group, Text, rem } from "@mantine/core";
import { Divider } from "@mantine/core";
import { verifyAuthState } from "@/server/utils/verifyAuthState";
import type { GetServerSideProps, GetServerSidePropsContext, NextPage } from "next";

const Home: NextPage = () => {
  return (
    <>
      <Flex justify="space-between" align="center" wrap="wrap">
        <h1>Your Notes</h1>
        <Flex align="center" gap="sm">
          <Button
            component={Link}
            href="/addNote"
            rightIcon={<FontAwesomeIcon icon={faPlus} />}
            color="gray"
          >
            Add note!
          </Button>
          <ImportFiles />
        </Flex>
      </Flex>
      <Divider />
      <Notes />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx: GetServerSidePropsContext) =>
  await verifyAuthState(ctx);

export default Home;
