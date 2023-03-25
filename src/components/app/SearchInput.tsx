import { useSearch } from "@/lib/zustand/useSearch";
import { api } from "@/utils/api";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TextInput } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useEffect, useState } from "react";

interface Props {
  isOpen: boolean;
}

const SearchInput = ({ isOpen }: Props) => {
  const { setResults, setError, setLoading, setQuery, tags, setTagResults } =
    useSearch();
  const [localQuery, setLocalQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(localQuery, 200);
  const searchQuery = api.notes.searchNotes.useQuery(
    {
      query: debouncedQuery || "",
      tags: tags,
    },
    {
      enabled: debouncedQuery || tags.length ? true : false,
    }
  );

  useEffect(() => {
    setError({
      active: searchQuery.isError,
      message: searchQuery.error?.message || null,
    });
    setLoading(searchQuery.isLoading);

    if (!searchQuery.isLoading && !searchQuery.isError) {
      setResults(searchQuery.data);

      const tagResults = searchQuery.data.resultsByTag;
      setTagResults(!tagResults ? [] : tagResults);
    }
  }, [searchQuery.isLoading, searchQuery.isError, searchQuery.data]);

  useEffect(() => {
    setQuery(debouncedQuery.trim() ? debouncedQuery : null);
  }, [debouncedQuery]);

  return (
    <TextInput
      placeholder="Search"
      size="xs"
      icon={<FontAwesomeIcon icon={faSearch} />}
      rightSectionWidth={isOpen ? 70 : 0}
      onChange={(e) => setLocalQuery(e.target.value)}
      value={localQuery}
      styles={{ rightSection: { pointerEvents: "none" } }}
      mb="sm"
    />
  );
};

export default SearchInput;
