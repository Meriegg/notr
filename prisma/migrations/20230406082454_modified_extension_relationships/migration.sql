/*
  Warnings:

  - Added the required column `userId` to the `extensionConnectCode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "extensionConnectCode" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "extensionConnectCode" ADD CONSTRAINT "extensionConnectCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
