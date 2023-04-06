-- CreateTable
CREATE TABLE "extensionConnectCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "extensionConnectCode_pkey" PRIMARY KEY ("id")
);
