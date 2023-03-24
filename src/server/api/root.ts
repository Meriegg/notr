import { createTRPCRouter } from "@/server/api/trpc";
import { authRouter } from "./routers/auth";
import { notesRouter } from "./routers/notes";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  notes: notesRouter
});

export type AppRouter = typeof appRouter;
