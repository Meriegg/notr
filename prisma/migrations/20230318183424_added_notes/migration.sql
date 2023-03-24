-- CreateEnum
CREATE TYPE "TypeOfNote" AS ENUM ('code', 'username', 'password', 'fullAccount', 'linkSource', 'general');

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "tags" TEXT[],
    "typeOfNote" "TypeOfNote" NOT NULL DEFAULT 'general',
    "requiresAttention" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
