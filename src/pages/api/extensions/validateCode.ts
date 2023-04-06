import { prisma } from "@/server/db";
import { v4 as uuidv4 } from 'uuid'
import { createSign, generateKeyPairSync } from "crypto";
import { env } from "@/env.mjs";
import type { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(404).json({
      message: "Invalid HTTP Verb!"
    })
  }

  // Verify and validate the code
  const code = req.body?.code;
  if (!code) {
    return res.status(400).json({
      message: "Invalid code!"
    })
  }

  if (code.split("").length < 6) {
    return res.status(400).json({
      message: "Invalid code length!"
    })
  }

  // Find the code in database
  // We won't need to check if the codes match since we already
  // check it at the database level
  const dbCode = await prisma.extensionConnectCode.findFirst({
    where: {
      code: code
    },
    include: {
      user: true
    }
  });
  if (!dbCode) {
    return res.status(401).json({
      message: "Code was already used or doesn't exist!"
    })
  }

  // Check if the code is expired
  const minutesLeftUntilExpiration = Math.floor(
    (new Date(dbCode.expires).getTime() - new Date(Date.now()).getTime()) / 60000
  );

  if (minutesLeftUntilExpiration <= 0) {
    await prisma.extensionConnectCode.delete({
      where: {
        id: dbCode.id
      }
    })

    return res.status(401).json({
      message: "This code is expired!"
    })
  }

  const encryptionAlgorithm = "sha256";
  const cipherAlgorithm = "aes-256-cbc";

  // Crate a cryptographic key pair used to sign and verify the extension access token (sessionId)
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
      cipher: cipherAlgorithm,
      passphrase: env.NEXTAUTH_SECRET,
    },
  });

  // Create a new session Id
  const sessionId = uuidv4();

  // Sign the session id using the key paid generated earlier
  const signer = createSign(encryptionAlgorithm);

  signer.write(sessionId);
  signer.end();

  const signature = signer.sign({
    key: privateKey,
    passphrase: env.NEXTAUTH_SECRET
  }, "hex")

  // Create a new extension connection in the database
  // this is the same as creating a session but without an expiration date
  // since we don't need it
  const newExtensionConnection = await prisma.connectedExtension.create({
    data: {
      userId: dbCode.userId,
      sessionId,
      publicVerificationKey: publicKey
    }
  })

  // This will be stored and verified on the client
  const authToken = `${sessionId}:${signature}`;

  // Delete the used code
  await prisma.extensionConnectCode.delete({
    where: {
      id: dbCode.id
    }
  })

  res.status(200).json({
    authToken,
    newExtensionConnection
  })
}