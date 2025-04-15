/*
  Warnings:

  - You are about to drop the column `apiKey` on the `AIProvider` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AIProvider" DROP COLUMN "apiKey",
ADD COLUMN     "apiKeyEnvVarName" TEXT;
