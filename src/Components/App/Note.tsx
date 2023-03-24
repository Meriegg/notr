import Link from "next/link";
import { api } from "@/utils/api";
import { IconAdjustmentsHorizontal } from "@tabler/icons-react";
import {
  faDownload,
  faEdit,
  faEye,
  faListDots,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Badge, Card, Text, Flex, Button, Menu, Box } from "@mantine/core";
import { modals } from "@mantine/modals";
import type { Note } from "@prisma/client";

interface Props {
  note: Note;
}

const Note = ({ note }: Props) => {
  const ctx = api.useContext();
  const deleteNote = api.notes.deleteNote.useMutation({
    onSuccess: () => {
      ctx.notes.getNotes.invalidate();
    },
  });
  const openConfirmModal = () =>
    modals.openConfirmModal({
      title: "Are you sure you want to delete this note?",
      children: (
        <Text size="sm">Please click one of these buttons to proceed.</Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onCancel: () => console.log("Cancel"),
      onConfirm: () => deleteNote.mutate({ noteId: note.id }),
    });

  return (
    <Box
      pos="relative"
      w="fit-content"
      style={{
        width: "min(375px, 100%)",
        minHeight: "150px",
      }}
    >
      <Menu
        shadow="md"
        width={200}
        styles={{
          dropdown: {
            zIndex: 30,
          },
        }}
      >
        <Box
          pos="absolute"
          top="15px"
          right="15px"
          style={{
            zIndex: "1",
          }}
        >
          <Menu.Target>
            <Button size="xs" color="dark" variant="subtle">
              <IconAdjustmentsHorizontal size="1rem" />
            </Button>
          </Menu.Target>
        </Box>

        <Menu.Dropdown>
          <Menu.Label>Application</Menu.Label>
          <Menu.Item
            color="red"
            disabled={deleteNote.isLoading}
            onClick={() => openConfirmModal()}
            rightSection={<FontAwesomeIcon icon={faTrash} />}
          >
            Delete
          </Menu.Item>

          <Menu.Item
            component={Link}
            href={`/note/${note.id}?edit=true`}
            rightSection={<FontAwesomeIcon icon={faEdit} />}
          >
            Edit
          </Menu.Item>
          <Menu.Item
            component={Link}
            href={`/note/${note.id}`}
            rightSection={<FontAwesomeIcon icon={faEye} />}
          >
            View
          </Menu.Item>

          <Menu.Divider />

          <Menu.Label>Other</Menu.Label>
          <Menu.Item rightSection={<FontAwesomeIcon icon={faDownload} />}>
            Export as text file
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
      <Card
        shadow="sm"
        padding="md"
        radius="md"
        w="100%"
        style={{
          display: "flex",
          alignItems: "start",
          justifyContent: "space-between",
          flexDirection: "column",
          height: "100%",
        }}
        withBorder
      >
        <Flex direction="column" gap="0.125rem" w="100%">
          {!!note.tags.length && (
            <div
              style={{
                display: "flex",
                justifyContent: "start",
                alignItems: "center",
                gap: "0.5rem",
                maxWidth: "85%",
                flexWrap: "wrap",
              }}
            >
              {note.tags.map((tag) => (
                <Badge color="pink" size="sm">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          <Text mt="sm" size="lg" weight="600">
            {note.title || "Untitled"}
          </Text>

          <Text
            size="sm"
            color="dimmed"
            w="fit"
            mt="0.125rem"
            style={{
              wordWrap: "break-word",
              wordBreak: "break-all",
              width: "100%",
            }}
            truncate
          >
            {note.typeOfNote === "password" || note.typeOfNote === "fullAccount"
              ? note.content.replace(/./g, "*")
              : note.content}
          </Text>
        </Flex>

        <Flex
          justify={"space-between"}
          mt="md"
          w="100%"
          style={{
            alignItems: "center",
          }}
        >
          <Text size="sm" color="dimmed" weight="600">
            Created on {new Intl.DateTimeFormat().format(note.createdOn)}
          </Text>
          <Flex align="center" gap="6px">
            <Badge size="sm" color="blue">
              {note.typeOfNote}
            </Badge>
            {note.requiresAttention && (
              <Badge size="sm" color="yellow">
                ATTENTION
              </Badge>
            )}
          </Flex>
        </Flex>
      </Card>
    </Box>
  );
};

export default Note;
