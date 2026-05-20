/*
  Warnings:

  - A unique constraint covering the columns `[googleId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `SavingsGoal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Transaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE', 'DEBT', 'COMMITMENT', 'SAVINGS', 'INVESTMENT');

-- AlterTable
ALTER TABLE "SavingsGoal" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "monthlyContribution" DOUBLE PRECISION,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Completed',
ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "TransactionType" NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "provider" TEXT,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "basicSalary" DOUBLE PRECISION NOT NULL,
    "allowances" JSONB NOT NULL DEFAULT '[]',
    "epfRate" DOUBLE PRECISION NOT NULL DEFAULT 11,
    "socsoRate" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "eisRate" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
    "customDeductions" JSONB NOT NULL DEFAULT '[]',
    "otRate" DOUBLE PRECISION NOT NULL DEFAULT 1.5,
    "doublePayRate" DOUBLE PRECISION NOT NULL DEFAULT 2.0,
    "dailyRateFormula" TEXT NOT NULL DEFAULT 'basic/26',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryMonth" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "basicSalary" DOUBLE PRECISION NOT NULL,
    "allowances" JSONB NOT NULL DEFAULT '[]',
    "epfRate" DOUBLE PRECISION NOT NULL,
    "socsoRate" DOUBLE PRECISION NOT NULL,
    "eisRate" DOUBLE PRECISION NOT NULL,
    "customDeductions" JSONB NOT NULL DEFAULT '[]',
    "otRate" DOUBLE PRECISION NOT NULL,
    "doublePayRate" DOUBLE PRECISION NOT NULL,
    "dailyRateFormula" TEXT NOT NULL DEFAULT 'basic/26',
    "unpaidLeaveDays" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "annualLeaveDays" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "medicalLeaveDays" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "replacementDays" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "doublePayHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grossSalary" DOUBLE PRECISION NOT NULL,
    "epfAmount" DOUBLE PRECISION NOT NULL,
    "socsoAmount" DOUBLE PRECISION NOT NULL,
    "eisAmount" DOUBLE PRECISION NOT NULL,
    "customDeductTotal" DOUBLE PRECISION NOT NULL,
    "expectedNet" DOUBLE PRECISION NOT NULL,
    "actualNet" DOUBLE PRECISION,
    "allocations" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryMonth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "Category_userId_idx" ON "Category"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_userId_name_type_key" ON "Category"("userId", "name", "type");

-- CreateIndex
CREATE UNIQUE INDEX "SalaryProfile_userId_key" ON "SalaryProfile"("userId");

-- CreateIndex
CREATE INDEX "SalaryMonth_userId_idx" ON "SalaryMonth"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SalaryMonth_userId_month_year_key" ON "SalaryMonth"("userId", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryProfile" ADD CONSTRAINT "SalaryProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryMonth" ADD CONSTRAINT "SalaryMonth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
