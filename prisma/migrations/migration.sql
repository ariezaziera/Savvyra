-- CreateTable: InvestmentAccount
CREATE TABLE "InvestmentAccount" (
  "id"        TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "name"      TEXT NOT NULL,
  "platform"  TEXT NOT NULL,
  "type"      TEXT NOT NULL DEFAULT 'General',
  "note"      TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InvestmentAccount_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "InvestmentAccount_userId_idx" ON "InvestmentAccount"("userId");

ALTER TABLE "InvestmentAccount"
  ADD CONSTRAINT "InvestmentAccount_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: add investmentAccountId to Investment
ALTER TABLE "Investment"
  ADD COLUMN "investmentAccountId" TEXT;

CREATE INDEX "Investment_investmentAccountId_idx" ON "Investment"("investmentAccountId");

ALTER TABLE "Investment"
  ADD CONSTRAINT "Investment_investmentAccountId_fkey"
  FOREIGN KEY ("investmentAccountId") REFERENCES "InvestmentAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
