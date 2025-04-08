/*
  Warnings:

  - A unique constraint covering the columns `[emailVerificationToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerificationToken" TEXT,
ADD COLUMN     "verificationTokenExpiry" TIMESTAMP(3),
ALTER COLUMN "email" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_emailVerificationToken_key" ON "User"("emailVerificationToken");
