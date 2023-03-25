import { create } from "zustand";
import type { Note } from "@prisma/client";
import { ResultsByTag } from "@/server/api/routers/notes";

interface ResultType {
  note: Note;
  matchCount: number;
  titleMatches?: RegExpMatchArray[];
  contentMatches: RegExpMatchArray[];
}

interface SearchResponse {
  results: ResultType[];
  rankedResults: ResultType[];
}

interface ErrorType {
  active: boolean;
  message: string | null;
}

interface UseSearch {
  query: string | null;
  results: SearchResponse | null;
  tagResults: ResultsByTag;
  tags: string[];
  error: ErrorType;
  loading: boolean;
  setTagResults: (val: ResultsByTag) => void;
  setQuery: (val: string | null) => void;
  clearQuery: () => void;
  setError: (val: ErrorType) => void;
  setLoading: (val: boolean) => void;
  setResults: (results: SearchResponse) => void;
}

export const useSearch = create<UseSearch>((set) => ({
  results: null,
  error: {
    message: null,
    active: false,
  },
  tags: [],
  tagResults: [],
  loading: false,
  query: null,
  setTagResults: (results) =>
    set(() => ({
      tagResults: results,
    })),
  clearQuery: () =>
    set(() => ({
      query: null,
    })),
  setQuery: (query) =>
    set(() => {
      const splitQuery = query?.split(" ");
      let tagArray: string[] = [];

      splitQuery?.forEach((tag) => {
        if (tag.startsWith("#") && tag.length > 1) {
          tagArray.push(tag.replace("#", ""));
        }
      });

      const cleanQuery = query
        ?.replace(tagArray.map((tag) => `#${tag}`).join(" "), "")
        .replace(" ", "");
      console.log(cleanQuery);

      return {
        query: cleanQuery,
        tags: tagArray,
      };
    }),
  setResults: (results) =>
    set(() => ({
      results,
    })),
  setError: (val) =>
    set(() => ({
      error: val,
    })),
  setLoading: (val) =>
    set(() => ({
      loading: val,
    })),
}));
