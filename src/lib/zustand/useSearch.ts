import { create } from 'zustand';
import type { Note } from '@prisma/client';

interface ResultType {
	note: Note;
	matchCount: number;
	titleMatches?: RegExpMatchArray[];
	contentMatches: RegExpMatchArray[];
}

interface SearchResponse {
	results: ResultType[],
	rankedResults: ResultType[]
}

interface ErrorType {
	active: boolean;
	message: string | null;
};


interface UseSearch {
	query: string | null;
	results: SearchResponse | null;
	error: ErrorType;
	loading: boolean;
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
		active: false
	},
	loading: false,
	query: null,
	clearQuery: () => set(() => ({
		query: null
	})),
	setQuery: (query) => set(() => ({
		query
	})),
	setResults: (results) => set(() => ({
		results
	})),
	setError: (val) => set(() => ({
		error: val
	})),
	setLoading: (val) => set(() => ({
		loading: val
	}))
}))

