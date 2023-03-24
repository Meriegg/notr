import { z } from "zod";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { NoteTypeSchema } from "@/constants/zodSchemas";
import { useForm, zodResolver } from "@mantine/form";
import {
  TextInput,
  Text,
  Textarea,
  Divider,
  Flex,
  MultiSelect,
  Chip,
  SegmentedControl,
  Button,
} from "@mantine/core";
import type { NextPage } from "next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSession } from "next-auth/react";

const AddNote: NextPage = () => {
  useSession({
    required: true,
  });

  const router = useRouter();
  const createNote = api.notes.createNote.useMutation({
    onSuccess: () => {
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

  const { onSubmit, getInputProps, values, errors, setFieldValue } = useForm<
    z.infer<typeof validationSchema>
  >({
    validate: zodResolver(validationSchema),
    initialValues: {
      title: "",
      content: "",
      tags: [] as string[],
      typeOfNote: "general",
      requiresAttention: false,
    },
  });

  return (
    <Flex mt="lg" direction="column" gap="sm">
      <Text size="xl" weight="600">
        Add note
      </Text>
      <Divider />
      <form
        style={{
          height: "100%",
        }}
        onSubmit={onSubmit((values) => {
          createNote.mutate({ ...values });
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
          </Flex>
          <Divider orientation="vertical" />
          <Flex
            direction="column"
            gap="lg"
            py="lg"
            style={{
              flexGrow: "1",
              maxWidth: "450px",
            }}
          >
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
              loading={createNote.isLoading}
            >
              Save note!
            </Button>
            {/* <pre>{JSON.stringify(values, null, 2)}</pre> */}
          </Flex>
        </Flex>
      </form>
    </Flex>
  );
};

export default AddNote;
