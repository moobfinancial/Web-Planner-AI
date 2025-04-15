/*
  Warnings:

  - A unique constraint covering the columns `[category,name]` on the table `Prompt` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PromptStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'DRAFT');

-- CreateEnum
CREATE TYPE "PromptCategory" AS ENUM ('PLAN_GENERATION', 'PLAN_REFINEMENT', 'DEVELOPMENT', 'GENERAL');

-- DropIndex
DROP INDEX "Prompt_name_key";

-- AlterTable
ALTER TABLE "Prompt" ADD COLUMN     "category" "PromptCategory" NOT NULL DEFAULT 'GENERAL',
ADD COLUMN     "status" "PromptStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "variables" TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "Prompt_category_name_key" ON "Prompt"("category", "name");
