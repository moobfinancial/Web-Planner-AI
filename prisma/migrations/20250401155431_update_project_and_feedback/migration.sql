/*
  Warnings:

  - You are about to drop the column `description` on the `AIProvider` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `AIProvider` table. All the data in the column will be lost.
  - You are about to drop the column `planId` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Feedback` table. All the data in the column will be lost.
  - You are about to drop the column `planVersionId` on the `Feedback` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `planId` on the `PlanShare` table. All the data in the column will be lost.
  - You are about to drop the `PlanVersion` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[projectId,versionNumber]` on the table `Plan` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[projectId,userId]` on the table `PlanShare` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `projectId` to the `PlanShare` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('INITIAL', 'REFINED');

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_planId_fkey";

-- DropForeignKey
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_planId_fkey";

-- DropForeignKey
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_planVersionId_fkey";

-- DropForeignKey
ALTER TABLE "Plan" DROP CONSTRAINT "Plan_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "PlanShare" DROP CONSTRAINT "PlanShare_planId_fkey";

-- DropForeignKey
ALTER TABLE "PlanVersion" DROP CONSTRAINT "PlanVersion_planId_fkey";

-- DropIndex
DROP INDEX "PlanShare_planId_userId_key";

-- AlterTable
ALTER TABLE "AIProvider" DROP COLUMN "description",
DROP COLUMN "isActive",
ADD COLUMN     "baseUrl" TEXT,
ALTER COLUMN "apiKey" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "planId",
ADD COLUMN     "projectId" TEXT;

-- AlterTable
ALTER TABLE "Feedback" DROP COLUMN "content",
DROP COLUMN "planVersionId",
ADD COLUMN     "originalText" TEXT,
ADD COLUMN     "projectId" TEXT,
ADD COLUMN     "sectionIdentifier" TEXT,
ADD COLUMN     "userComment" TEXT;

-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "description",
DROP COLUMN "ownerId",
DROP COLUMN "title",
DROP COLUMN "updatedAt",
ADD COLUMN     "planContent" TEXT,
ADD COLUMN     "planType" "PlanType",
ADD COLUMN     "projectId" TEXT,
ADD COLUMN     "prompts" JSONB,
ADD COLUMN     "triggeringFeedbackText" TEXT,
ADD COLUMN     "versionNumber" INTEGER;

-- AlterTable
ALTER TABLE "PlanShare" DROP COLUMN "planId",
ADD COLUMN     "projectId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerified" TIMESTAMP(3),
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;

-- DropTable
DROP TABLE "PlanVersion";

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
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "projectDescription" TEXT,
    "codeEditor" TEXT,
    "targetAudience" TEXT,
    "keyGoals" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIModel" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "description" TEXT,
    "inputCost" DOUBLE PRECISION,
    "outputCost" DOUBLE PRECISION,
    "contextWindow" INTEGER,

    CONSTRAINT "AIModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prompt" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "template" TEXT NOT NULL,
    "modelId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prompt_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "AIModel_providerId_modelName_key" ON "AIModel"("providerId", "modelName");

-- CreateIndex
CREATE UNIQUE INDEX "Prompt_name_key" ON "Prompt"("name");

-- CreateIndex
CREATE INDEX "Feedback_planId_idx" ON "Feedback"("planId");

-- CreateIndex
CREATE INDEX "Feedback_userId_idx" ON "Feedback"("userId");

-- CreateIndex
CREATE INDEX "Plan_projectId_idx" ON "Plan"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_projectId_versionNumber_key" ON "Plan"("projectId", "versionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PlanShare_projectId_userId_key" ON "PlanShare"("projectId", "userId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanShare" ADD CONSTRAINT "PlanShare_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIModel" ADD CONSTRAINT "AIModel_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "AIProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AIModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
