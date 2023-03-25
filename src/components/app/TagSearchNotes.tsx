import { useSearch } from "@/lib/zustand/useSearch";
import { Box } from "@mantine/core";
import SearchNote from "./SearchNote";

const TagSearchNotes = () => {
  const { tagResults } = useSearch();

  return (
    <Box>
      <div>
        {tagResults && (
          <div
            style={{
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
              justifyContent: "start",
              marginTop: "2rem",
            }}
          >
            {!!tagResults?.length && (
              <>
                {tagResults.map((result, idx) => (
                  <SearchNote
                    key={idx}
                    note={result.note}
                    matchCount={result.matchCount}
                    contentMatches={[]}
                    titleMatches={[]}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </Box>
  );
};

export default TagSearchNotes;
