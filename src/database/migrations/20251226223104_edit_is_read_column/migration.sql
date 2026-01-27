/*
  Warnings:

  - You are about to drop the column `isRead` on the `Message` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Message_isRead_idx";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "isRead",
ADD COLUMN     "readAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Message_readAt_idx" ON "Message"("readAt");
