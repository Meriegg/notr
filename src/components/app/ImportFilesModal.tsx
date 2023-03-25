import { IconUpload, IconX, IconPhoto } from "@tabler/icons-react";
import { Button, Flex, Group, rem, Text } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { modals } from "@mantine/modals";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useImportedFiles } from "@/lib/zustand/useImportedFiles";
import { faFileImport } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";

const ImportFiles = () => {
  const router = useRouter();
  const { setFiles, activeFiles } = useImportedFiles((state) => state);

  function readFileContent(file: any) {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = (event: any) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  }

  const openImportModal = () =>
    modals.open({
      title: "Drag your files",
      children: (
        <Flex direction="column" w="100%">
          <Dropzone
            onDrop={(files) => {
              let selectedFiles: { fileName: string; contents: string }[] = [];

              files.forEach(async (file) => {
                console.log(file);

                readFileContent(file).then((content) => {
                  const fileData = {
                    fileName: file.name,
                    contents: (content as string).toString(),
                  };

                  selectedFiles.push(fileData);
                });
              });

              setFiles(selectedFiles);
              modals.closeAll();
              router.push("/confirmFiles");
            }}
            onReject={(files) => console.log("rejected files", files)}
            maxSize={3 * 1024 ** 2}
          >
            <Group
              position="center"
              spacing="xl"
              style={{ minHeight: rem(220), pointerEvents: "none" }}
            >
              <Dropzone.Accept>
                <IconUpload size="3.2rem" stroke={1.5} />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <IconX size="3.2rem" stroke={1.5} />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <IconPhoto size="3.2rem" stroke={1.5} />
              </Dropzone.Idle>

              <div>
                <Text size="xl" inline ta="center">
                  Drag your text files here or click to select files
                </Text>
                <Text size="sm" color="dimmed" inline mt={7} ta="center">
                  Attach as many files as you like, each file should not exceed
                  5mb
                </Text>
              </div>
            </Group>
          </Dropzone>
        </Flex>
      ),
    });

  return (
    <>
      <Button
        rightIcon={<FontAwesomeIcon icon={faFileImport} />}
        color="gray"
        onClick={() => openImportModal()}
      >
        Import text files
      </Button>
    </>
  );
};

export default ImportFiles;
