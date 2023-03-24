import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const authRouter = createTRPCRouter({
	completeSignup: protectedProcedure.input(z.object({
		name: z.string(),
		email: z.string().email()
	})).mutation(async ({ ctx: { prisma, session }, input }) => {
		const dbUser = await prisma.user.findUnique({
			where: {
				id: session.user.id
			}
		})
		if (!dbUser) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Could not user!"
			})
		}

		if (dbUser.didCompleteSignup) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "You already completed your signup!"
			})
		}

		const modifiedUser = await prisma.user.update({
			where: {
				id: session.user.id
			},
			data: {
				...input,
				didCompleteSignup: true
			}
		})

		return modifiedUser
	})
})