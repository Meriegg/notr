import { z } from 'zod'

export const NoteTypeSchema = z.union([z.literal("code"), z.literal("username"), z.literal("password"), z.literal("fullAccount"), z.literal("linkSource"), z.literal("general")])