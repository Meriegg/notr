import { prisma } from "@/server/db";
import { useRouter } from "next/router";
import {
  Button,
  Chip,
  Divider,
  Flex,
  MultiSelect,
  SegmentedControl,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import type { Note } from "@prisma/client";
import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm, zodResolver } from "@mantine/form";
import { NoteTypeSchema } from "@/constants/zodSchemas";
import { api } from "@/utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useSession } from "next-auth/react";

const Note: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ note }) => {
  useSession({
    required: true,
  });
  const router = useRouter();
  const [isEditing, setEditing] = useState(false);
  const editNote = api.notes.updateNote.useMutation({
    onSuccess: () => {
      setEditing(false);
      router.push("/");
    },
  });

  const validationSchema = z.object({
    title: z.string().optional(),
    content: z.string().min(1),
    tags: z.string().array(),
    typeOfNote: NoteTypeSchema,
    requiresAttention: z.boolean(),
  });

  const { onSubmit, getInputProps, values, errors, setFieldValue, ...form } = useForm<
    z.infer<typeof validationSchema>
  >({
    validate: zodResolver(validationSchema),
    initialValues: {
      title: note?.title || "",
      content: note?.content || "",
      tags: note?.tags || ([] as string[]),
      typeOfNote: note?.typeOfNote || "general",
      requiresAttention: note?.requiresAttention || false,
    },
  });
  useEffect(() => {
    const isEditing = router.query.edit;
    setEditing(isEditing === "true" ? true : false);
  }, []);

  if (!note) {
    return <Text>Could not find note!</Text>;
  }

  return (
    <Flex mt="lg" direction="column" gap="sm">
      <Flex align="center" gap="0.5rem">
        <Text style={{ transition: "all .3s ease" }} size={isEditing ? "xl" : "2rem"} weight="600">
          {note.title || "Untitled"}
        </Text>
        <Text size={isEditing ? "1rem" : "0px"} style={{ transition: "all .3s ease" }}>
          Edit
        </Text>
      </Flex>
      <Divider
        style={{
          transform: `scaleX(${isEditing ? "1" : "0"})`,
          transition: "all .6s ease",
        }}
      />

      <form
        style={{
          height: "100%",
        }}
        onSubmit={onSubmit((values) => {
          editNote.mutate({ ...values, noteId: note.id });
        })}
      >
        <Flex gap="lg" mt="md" wrap="wrap">
          <Flex
            direction="column"
            gap="lg"
            style={{
              flexGrow: "2",
            }}
          >
            {isEditing ? (
              <>
                <TextInput
                  label="Note Title"
                  placeholder="Youtube acc password"
                  {...getInputProps("title")}
                />
                <Textarea
                  label="File contents"
                  placeholder="Contents..."
                  variant="unstyled"
                  withAsterisk
                  size="md"
                  autosize
                  error={errors.content}
                  {...getInputProps("content")}
                />
              </>
            ) : (
              <Textarea
                autosize
                size="md"
                variant="unstyled"
                value={note.content}
                contentEditable={false}
              />
            )}
          </Flex>
          <Flex
            gap="xl"
            style={{
              flexGrow: "1",
              maxWidth: "450px",
              position: isEditing ? "relative" : "absolute",
              right: "0",
              transition: "all .3s ease",
              transform: `translateX(${isEditing ? "0px" : "100%"})`,
            }}
          >
            <Divider
              orientation="vertical"
              style={{
                transform: `scaleY(${isEditing ? "1" : "0"})`,
                transition: "all .6s ease",
              }}
            />

            <Flex direction="column" gap="lg" py="lg">
              <Text size="lg" weight="600">
                File metadata
              </Text>
              <MultiSelect
                label="Tags"
                placeholder="Type in your tags!"
                searchable
                creatable
                getCreateLabel={(query) => `+ Add ${query}`}
                onCreate={(query) => {
                  setFieldValue("tags", [...values.tags, query]);
                  return query;
                }}
                data={values.tags}
                {...getInputProps("tags")}
              />
              <Flex direction="column" gap="0.5rem">
                <Text weight="600">Select a type of file</Text>
                <Chip.Group
                  multiple={false}
                  value={values.typeOfNote}
                  onChange={(value) =>
                    setFieldValue("typeOfNote", value as z.infer<typeof NoteTypeSchema>)
                  }
                >
                  <Flex justify="evenly" wrap="wrap" gap="sm">
                    <Chip variant="light" value="general">
                      General
                    </Chip>
                    <Chip variant="light" value="code">
                      Code
                    </Chip>
                    <Chip variant="light" value="username">
                      Username
                    </Chip>
                    <Chip variant="light" value="password">
                      Password
                    </Chip>
                    <Chip variant="light" value="fullAccount">
                      Full Account
                    </Chip>
                    <Chip variant="light" value="linkSource">
                      Link Source
                    </Chip>
                  </Flex>
                </Chip.Group>
              </Flex>
              <Flex direction="column" gap="0.5rem">
                <Text weight="600">Do you want to highligh this note?</Text>
                <SegmentedControl
                  value={values.requiresAttention ? "y" : "n"}
                  onChange={(val) => {
                    setFieldValue("requiresAttention", val === "n" ? false : true);
                  }}
                  data={[
                    { label: "Nope", value: "n" },
                    { label: "Yes", value: "y" },
                  ]}
                />
              </Flex>
              <Button
                color="gray"
                rightIcon={<FontAwesomeIcon icon={faPlus} />}
                type="submit"
                disabled={!form.isDirty()}
                loading={editNote.isLoading}
              >
                Save note!
              </Button>
              {/* <pre>{JSON.stringify(values, null, 2)}</pre> */}
            </Flex>
          </Flex>
        </Flex>
      </form>
      <Button
        size="lg"
        pos="fixed"
        right="30px"
        bottom="30px"
        color="red"
        style={{
          transform: `translateX(${isEditing ? "200%" : "0px"})`,
          transition: "all .3s ease",
        }}
        onClick={() => setEditing(!isEditing)}
        rightIcon={<FontAwesomeIcon icon={faEdit} />}
      >
        Edit!
      </Button>
      <Button
        size="lg"
        pos="fixed"
        right="30px"
        bottom="30px"
        color="gray"
        style={{
          transform: `translateY(${isEditing ? "0px" : "200%"})`,
          transition: "all .3s ease",
        }}
        onClick={() => setEditing(!isEditing)}
        rightIcon={<FontAwesomeIcon icon={faXmark} />}
      >
        Discard changes!
      </Button>
    </Flex>
  );
};

export const getServerSideProps: GetServerSideProps<{
  note: Note | null;
}> = async (ctx: GetServerSidePropsContext) => {
  const noteId = ctx?.params?.id;
  if (!noteId) {
    return {
      props: {
        note: null,
      },
    };
  }

  // Because apparently `noteId` can also be a string array
  const parsedId = typeof noteId === "object" ? noteId.join("") : noteId;

  const note = await prisma.note.findUnique({
    where: {
      id: parsedId,
    },
  });
  if (!note) {
    return {
      props: {
        note: null,
      },
    };
  }

  return {
    props: {
      note: JSON.parse(JSON.stringify(note)),
    },
  };
};

export default Note;
