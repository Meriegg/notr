import Note from "./Note";
import SearchNote from "./SearchNote";
import { Text, Loader, Flex, Box, Divider } from "@mantine/core";
import { api } from "@/utils/api";
import { useSearch } from "@/lib/zustand/useSearch";

const Notes = () => {
  const { status, data } = api.notes.getNotes.useQuery();
  const { results, loading, error, query, tagResults } = useSearch();

  if (status === "loading") {
    return (
      <Text
        display="flex"
        mt="lg"
        w="100%"
        style={{
          justifyContent: "center",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <Loader size="xs" />
        Loading...
      </Text>
    );
  }

  return (
    <Box>
      <pre>{JSON.stringify(tagResults, null, 2)}</pre>
      {!data?.length && (
        <Text
          display="flex"
          mt="lg"
          w="100%"
          style={{
            justifyContent: "center",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          You don't have any notes yet!
        </Text>
      )}
      {results && query ? (
        <div>
          {loading && <Text>Loading results</Text>}
          {error.active && <Text>An error happened: {error.message}</Text>}
          {results && (
            <div
              style={{
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
                justifyContent: "start",
                marginTop: "2rem",
              }}
            >
              {!!data?.length && (
                <>
                  {results.rankedResults.map((result, idx) => (
                    <SearchNote
                      key={idx}
                      note={result.note}
                      matchCount={result.matchCount}
                      contentMatches={result.contentMatches}
                      titleMatches={result.titleMatches || []}
                    />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          {!!data?.filter((note) => note.requiresAttention).length ? (
            <>
              <Text size="1rem" mt="lg" weight={700}>
                The following require attention
              </Text>
              <Flex justify="start" mt="lg" gap="lg" wrap="wrap">
                {!!data?.length && (
                  <>
                    {data
                      .filter((note) => note.requiresAttention)
                      .map((note, idx) => (
                        <Note key={idx} note={note} />
                      ))}
                  </>
                )}
              </Flex>
              <Divider mt="lg" />
            </>
          ) : null}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
              justifyContent: "start",
              marginTop: "2rem",
            }}
          >
            {!!data?.length && (
              <>
                {data
                  .filter((note) => !note.requiresAttention)
                  .map((note, idx) => (
                    <Note key={idx} note={note} />
                  ))}
              </>
            )}
          </div>
        </>
      )}
    </Box>
  );
};

export default Notes;
