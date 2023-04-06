-- CreateTable
CREATE TABLE "connectedExtension" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "publicVerificationKey" TEXT NOT NULL,

    CONSTRAINT "connectedExtension_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "connectedExtension_userId_key" ON "connectedExtension"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "connectedExtension_sessionId_key" ON "connectedExtension"("sessionId");

-- AddForeignKey
ALTER TABLE "connectedExtension" ADD CONSTRAINT "connectedExtension_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
