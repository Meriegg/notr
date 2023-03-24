import { useImportedFiles } from "@/lib/zustand/useImportedFiles";
import { faEye, faFileImport, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Flex, Text, Button } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import { useSession } from "next-auth/react";
import type { NextPage } from "next";

const ConfirmFiles: NextPage = () => {
  useSession({
    required: true,
  });

  const { activeFiles, removeFile, clearFiles } = useImportedFiles((state) => state);
  const router = useRouter();
  const importFiles = api.notes.importFiles.useMutation({
    onSuccess: () => {
      clearFiles();
      router.push("/");
    },
  });

  const openContentModal = (content: string) =>
    modals.open({
      title: "Content",
      children: (
        <Text lineClamp={4} weight="700">
          {content}
        </Text>
      ),
    });

  return (
    <Box>
      <h1>Are you sure you want to import these files?</h1>

      <Flex direction="column" gap="sm">
        {!activeFiles.length && <Text>Choose at least 1 file to continue!</Text>}
        {activeFiles.map((file, idx) => (
          <Flex
            key={idx}
            gap="xl"
            align="center"
            justify="space-between"
            w="min(600px, 100%)"
            wrap="wrap"
          >
            <Text weight={500} size="md">
              {file.fileName}
            </Text>
            <Flex align="center" gap="sm" wrap="wrap">
              <Button
                size="xs"
                color="gray"
                onClick={() => openContentModal(file.contents)}
                rightIcon={<FontAwesomeIcon icon={faEye} />}
              >
                View contents
              </Button>
              <Button
                color="red"
                size="xs"
                rightIcon={<FontAwesomeIcon icon={faTrash} />}
                onClick={() => removeFile(file.fileName)}
              >
                Remove File
              </Button>
            </Flex>
          </Flex>
        ))}
      </Flex>
      {!!activeFiles.length && (
        <Button
          color="gray"
          mt="lg"
          rightIcon={<FontAwesomeIcon icon={faFileImport} />}
          onClick={() => importFiles.mutate({ files: activeFiles })}
          loading={importFiles.isLoading}
        >
          Import all files
        </Button>
      )}
    </Box>
  );
};

export default ConfirmFiles;
