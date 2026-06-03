/*
  Warnings:

  - A unique constraint covering the columns `[debtId]` on the table `Commitment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Commitment" ADD COLUMN     "debtId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Commitment_debtId_key" ON "Commitment"("debtId");

-- AddForeignKey
ALTER TABLE "Commitment" ADD CONSTRAINT "Commitment_debtId_fkey" FOREIGN KEY ("debtId") REFERENCES "Debt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
