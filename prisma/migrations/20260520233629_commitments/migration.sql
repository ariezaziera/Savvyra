/*
  Warnings:

  - Added the required column `updatedAt` to the `Commitment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Commitment" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'General',
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "frequency" TEXT NOT NULL DEFAULT 'Monthly',
ADD COLUMN     "note" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Commitment_userId_dueDate_idx" ON "Commitment"("userId", "dueDate");
