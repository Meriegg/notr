import { prisma } from "../db";
import { getServerAuthSession } from "../auth";
import type { User } from "@prisma/client";
import type { Session } from "next-auth";
import type { GetServerSideProps, GetServerSidePropsContext } from "next";

export type VerifyAuthStateReturnType = {
	authSession?: Session | null
}

const redirectTo = <T>(url: string, ctx: GetServerSidePropsContext, propsReturn?: T) => {
	if (ctx.req.url !== url) {
		return {
			redirect: {
				destination: url,
				permanent: false
			}
		}
	}

	return {
		props: {
			...propsReturn
		}
	}
}

export const verifyAuthState: GetServerSideProps<VerifyAuthStateReturnType> = async (ctx: GetServerSidePropsContext) => {
	const session = await getServerAuthSession(ctx);
	if (!session) {
		return redirectTo('/auth/signIn', ctx)
	}

	if (!session.user.didCompleteSignup) {
		type UserEntry = keyof User;
		const requiredFields: UserEntry[] = ['email', 'name']

		let isCompleted = true;

		for (let i = 0; i < requiredFields.length; i++) {
			const key = requiredFields[i];
			if (!key) break;

			const value = session.user[key];

			if (!value) {
				isCompleted = false;
				break;
			}
		}

		if (isCompleted) {
			await prisma.user.update({
				where: {
					id: session.user.id
				},
				data: {
					didCompleteSignup: true
				}
			});

			return redirectTo<VerifyAuthStateReturnType>('/', ctx, {
				authSession: session
			})
		}

		return redirectTo<VerifyAuthStateReturnType>("/auth/completeSignup", ctx, {
			authSession: session
		})
	}

	if (ctx.req.url?.startsWith("/auth")) {
		return redirectTo<VerifyAuthStateReturnType>('/', ctx, {
			authSession: session
		})
	}

	return {
		props: {
			authSession: session
		},
	}
}