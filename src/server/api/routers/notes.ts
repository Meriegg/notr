import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { NoteTypeSchema } from "@/constants/zodSchemas";
import type { Note, TypeOfNote } from "@prisma/client";

export type ResultsByTag = { note: Note; matchCount: number }[];

export const notesRouter = createTRPCRouter({
  createNote: protectedProcedure
    .input(
      z.object({
        title: z.string().optional(),
        content: z.string(),
        tags: z.string().array().optional(),
        typeOfNote: NoteTypeSchema.optional(),
        requiresAttention: z.boolean(),
      })
    )
    .mutation(async ({ ctx: { prisma, session }, input }) => {
      const newNote = await prisma.note.create({
        data: {
          ...input,
          userId: session.user.id,
        },
      });

      return newNote;
    }),
  updateNote: protectedProcedure
    .input(
      z.object({
        title: z.string().optional(),
        content: z.string(),
        tags: z.string().array().optional(),
        typeOfNote: NoteTypeSchema.optional(),
        requiresAttention: z.boolean(),
        noteId: z.string(),
      })
    )
    .mutation(async ({ ctx: { prisma }, input: { noteId, ...input } }) => {
      const updatedNote = await prisma.note.update({
        where: {
          id: noteId,
        },
        data: {
          ...input,
        },
      });

      return updatedNote;
    }),
  getNotes: protectedProcedure.query(async ({ ctx: { prisma, session } }) => {
    const dbUser = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        notes: true,
      },
    });
    if (!dbUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Could not get user!",
      });
    }

    return dbUser.notes;
  }),
  deleteNote: protectedProcedure
    .input(
      z.object({
        noteId: z.string(),
      })
    )
    .mutation(async ({ ctx: { prisma, session }, input: { noteId } }) => {
      const dbNote = await prisma.note.findUnique({
        where: {
          id: noteId,
        },
      });
      if (!dbNote) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Could not find note!",
        });
      }

      if (dbNote.userId !== session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You do not own this note!",
        });
      }

      const deletedNote = await prisma.note.delete({
        where: {
          id: noteId,
        },
      });

      return deletedNote;
    }),
  getNote: protectedProcedure
    .input(
      z.object({
        noteId: z.string(),
      })
    )
    .query(async ({ ctx: { prisma }, input: { noteId } }) => {
      const note = await prisma.note.findUnique({
        where: {
          id: noteId,
        },
      });
      if (!note) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cannot find note!",
        });
      }

      return { note: note };
    }),
  importFiles: protectedProcedure
    .input(
      z.object({
        files: z
          .object({
            fileName: z.string(),
            contents: z.string(),
          })
          .array(),
      })
    )
    .mutation(async ({ ctx: { prisma, session }, input: { files } }) => {
      let parsedData: {
        title?: string;
        content: string;
        userId: string;
        tags?: string[];
        typeOfNote: TypeOfNote;
      }[] = [];

      files.forEach((file) => {
        let tags: string[] = [];
        tags.push("IMPORTED");

        let typeOfNote: TypeOfNote = "general";

        const matches = [
          ...file.contents.matchAll(
            /acc|pass|password|account|email|gmail|mail/gi
          ),
        ];
        if (matches.length >= 1) {
          tags.push("POTENTIAL ACOCUNT");
          tags.push("ACCOUNT");
          typeOfNote = "fullAccount";
        }

        parsedData.push({
          content: file.contents,
          title: file.fileName.replace(".txt", ""),
          userId: session.user.id,
          tags: tags,
          typeOfNote: typeOfNote,
        });
      });

      const newNotes = await prisma.note.createMany({
        data: parsedData,
      });

      return newNotes;
    }),
  searchNotes: protectedProcedure
    .input(
      z.object({
        query: z.string(),
        tags: z.string().array().optional(),
      })
    )
    .query(async ({ ctx: { prisma, session }, input: { query, tags } }) => {
      // Find the user in the database so we can
      // do a join to get all of their notes
      const dbUser = await prisma.user.findUnique({
        where: {
          id: session.user.id,
        },
        include: {
          notes: true,
        },
      });
      // Check if the user exists
      if (!dbUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cannot find user!",
        });
      }

      const notes = dbUser.notes;
      // Check if user has any notes
      if (!notes.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You have no notes, searching makes no sense!",
        });
      }

      // The final results will go here
      let finalNotes: {
        note: Note;
        contentMatches: RegExpMatchArray[];
        titleMatches?: RegExpMatchArray[];
        tagMatches?: string[];
        matchCount: number;
      }[] = [];

      for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        if (!note) {
          break;
        }

        // Inser whitespace before every capital letter so that I can
        // split by whispace after and I won't lose any letters
        const splitQuery = query.split("");
        let finalQuery: string[] = [];

        splitQuery.forEach((letter, idx) => {
          if (/[A-Z]/g.test(letter) && idx > 0) {
            finalQuery.push(" ");
            finalQuery.push(letter);
          } else {
            finalQuery.push(letter);
          }
        });

        query = finalQuery.join("");

        // Split query by whitespace or capital characters
        const queryWords = query.split(/\s+/g);

        // Create a regular expression with the query inside
        // so that we can use the String.matchAll() function which
        // only accepts regular expessions.
        // We want to use the `matchAll()` function because it returns
        // a list of matches and we can rank results based on the number of
        // matches that result has
        const queryRegexp = new RegExp(
          queryWords.join("|").toLowerCase(),
          "gi"
        );
        console.log(queryRegexp);

        // Find matches inside the title
        const titleMatches = note.title
          ? [...note.title.matchAll(queryRegexp)]
          : [];
        // Find matches inside the note's content
        const contentMatches = [...note.content.matchAll(queryRegexp)];

        // Calculate the total number of matches
        const totalNumberOfMatches =
          titleMatches.length + contentMatches.length;

        // Check if the result is relevant
        // aka. if the note doesn't have any matches
        // ignore it
        if (totalNumberOfMatches <= 0) {
          continue;
        }

        // Otherwise append the note to the final list with the
        // appropriate metadata
        finalNotes.push({
          note,
          matchCount: totalNumberOfMatches,
          titleMatches: titleMatches || [],
          contentMatches: contentMatches || [],
        });
      }

      const resultsSortedByRanking = finalNotes.sort(
        (a, b) => a.matchCount - b.matchCount
      );

      // Filter results by tags
      let resultsByTag: ResultsByTag = [];

      if (tags) {
        notes.forEach((note) => {
          tags.forEach((tag) => {
            if (
              note.tags.findIndex(
                (noteTag) => tag.toLowerCase() === noteTag.toLowerCase()
              ) !== -1
            ) {
              const existingNoteIdx = resultsByTag?.findIndex(
                (resultNote) => resultNote.note.id === note.id
              );

              const isNoteAlreadyAdded = existingNoteIdx !== -1;

              if (isNoteAlreadyAdded && resultsByTag[existingNoteIdx]) {
                const existingNote = resultsByTag[existingNoteIdx];
                if (existingNote) {
                  existingNote.matchCount += 1;
                }
              } else {
                resultsByTag.push({ note, matchCount: 1 });
              }
            }
          });
        });
      }

      return {
        results: finalNotes,
        rankedResults: resultsSortedByRanking.reverse(),
        resultsByTag: !resultsByTag.length
          ? null
          : resultsByTag.sort((a, b) => a.matchCount - b.matchCount).reverse(),
      };
    }),
});
