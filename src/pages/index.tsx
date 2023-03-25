import Notes from "@/Components/App/Notes";
import Link from "next/link";
import ImportFiles from "@/Components/App/ImportFilesModal";
import TagSearchNotes from "@/Components/App/TagSearchNotes";
import { useSearch } from "@/lib/zustand/useSearch";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Flex } from "@mantine/core";
import { Divider, Tabs } from "@mantine/core";
import { verifyAuthState } from "@/server/utils/verifyAuthState";
import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  NextPage,
} from "next";

const Home: NextPage = () => {
  const { tagResults } = useSearch();

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
      {!tagResults.length && <Divider />}
      {!!tagResults.length && (
        <Tabs defaultValue="query">
          <Tabs.List>
            <Tabs.Tab value="query">Query Results</Tabs.Tab>
            <Tabs.Tab value="tags">Tags Results</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="query">
            <Notes />
          </Tabs.Panel>
          <Tabs.Panel value="tags">
            <TagSearchNotes />
          </Tabs.Panel>
        </Tabs>
      )}
      {!tagResults.length && <Notes />}
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext
) => await verifyAuthState(ctx);

export default Home;
