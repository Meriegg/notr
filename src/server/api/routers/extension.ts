import { v4 as uuidv4 } from 'uuid'
import { env } from "@/env.mjs";
import { createSign, generateKeyPairSync } from "crypto";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const extensionRouter = createTRPCRouter({
  createExtensionAuthorizationCode: protectedProcedure.mutation(async ({ ctx: { prisma, session } }) => {
    // Generate a 6 digit random number
    var minm = 100000;
    var maxm = 999999;
    const newCode = Math.floor(Math.random() * (maxm - minm + 1)) + minm;

    // Create the expiration date
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 15);

    const newAuthCode = await prisma.extensionConnectCode.create({
      data: {
        code: newCode.toString(),
        userId: session.user.id,
        expires: expirationDate
      }
    })

    return newAuthCode;
  }),
  getExtensionConnections: protectedProcedure.query(async ({ ctx: { prisma, session } }) => {
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      },
      include: {
        connectedExtensions: true,
        extensionConnectionCodes: true
      }
    });
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Could not find user!"
      })
    }

    return {
      pending: user?.extensionConnectionCodes,
      connected: user?.connectedExtensions
    }
  }),
  deleteExtensionCode: protectedProcedure.input(z.object({
    id: z.string()
  })).mutation(async ({ ctx: { prisma, session }, input: { id } }) => {
    const dbCode = await prisma.extensionConnectCode.findUnique({
      where: {
        id
      }
    });
    if (!dbCode) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Could not find code!"
      })
    }

    if (dbCode.userId !== session.user.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to delete this code!"
      })
    }

    const deletedCode = await prisma.extensionConnectCode.delete({
      where: {
        id
      }
    });

    return {
      deletedCode
    }
  }),
  deleteExtensionConnection: protectedProcedure.input(z.object({
    id: z.string()
  })).mutation(async ({ ctx: { prisma, session }, input: { id } }) => {
    const dbCode = await prisma.connectedExtension.findUnique({
      where: {
        id
      }
    });
    if (!dbCode) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Could not find code!"
      })
    }

    if (dbCode.userId !== session.user.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to delete this code!"
      })
    }

    const deletedConnection = await prisma.connectedExtension.delete({
      where: {
        id
      }
    });

    return {
      deletedConnection
    }
  }),


  // connectAccount: protectedProcedure.mutation(async ({ ctx: { prisma, session } }) => {
  //   const encryptionAlgorithm = "sha256";
  //   const cipherAlgorithm = "aes-256-cbc";

  //   // Crate a cryptographic key pair used to sign and verify the extension access token (sessionId)
  //   const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  //     modulusLength: 4096,
  //     publicKeyEncoding: {
  //       type: "spki",
  //       format: "pem",
  //     },
  //     privateKeyEncoding: {
  //       type: "pkcs8",
  //       format: "pem",
  //       cipher: cipherAlgorithm,
  //       passphrase: env.NEXTAUTH_SECRET,
  //     },
  //   });

  //   // Create a new session Id
  //   const sessionId = uuidv4();

  //   // Sign the session id using the key paid generated earlier
  //   const signer = createSign(encryptionAlgorithm);

  //   signer.write(sessionId);
  //   signer.end();

  //   const signature = signer.sign({
  //     key: privateKey,
  //     passphrase: env.NEXTAUTH_SECRET
  //   }, "hex")

  //   // Create a new extension connection in the database
  //   // this is the same as creating a session but without an expiration date
  //   // since we don't need it
  //   const newExtensionConnection = await prisma.connectedExtension.create({
  //     data: {
  //       userId: session.user.id,
  //       sessionId,
  //       publicVerificationKey: publicKey
  //     }
  //   })

  //   // This will be stored and verified on the client
  //   const authToken = `${sessionId}:${signature}`;

  //   return {
  //     authToken,
  //     newExtensionConnection
  //   }
  // })
})