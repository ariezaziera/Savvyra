-- AlterTable
ALTER TABLE "Debt" ADD COLUMN     "creditLimit" DOUBLE PRECISION,
ADD COLUMN     "debtType" TEXT NOT NULL DEFAULT 'FIXED',
ADD COLUMN     "minimumPayment" DOUBLE PRECISION DEFAULT 0,
ALTER COLUMN "monthlyPayment" SET DEFAULT 0;

-- CreateIndex
CREATE INDEX "Debt_userId_debtType_idx" ON "Debt"("userId", "debtType");
