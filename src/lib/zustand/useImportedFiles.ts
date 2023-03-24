import { create } from 'zustand'

type File = { fileName: string, contents: string };

interface ImportedFiles {
	activeFiles: File[],
	setFiles: (files: File[]) => void;
	clearFiles: () => void;
	removeFile: (fileName: string) => void;
}

export const useImportedFiles = create<ImportedFiles>((set) => ({
	activeFiles: [],
	setFiles: (newFiles) => set(() => ({
		activeFiles: newFiles
	})),
	clearFiles: () => set(() => ({
		activeFiles: []
	})),
	removeFile: (fileName) => set(({ activeFiles }) => ({
		activeFiles: activeFiles.filter((file) => file.fileName !== fileName)
	}))
}))