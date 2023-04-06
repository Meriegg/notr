import { createTRPCRouter } from "@/server/api/trpc";
import { authRouter } from "./routers/auth";
import { notesRouter } from "./routers/notes";
import { extensionRouter } from "./routers/extension";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  notes: notesRouter,
  extensions: extensionRouter
});

export type AppRouter = typeof appRouter;
