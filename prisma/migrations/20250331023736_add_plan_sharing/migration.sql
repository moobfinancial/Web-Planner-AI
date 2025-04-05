/*
  Warnings:

  - You are about to drop the column `data` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `Feedback` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `published` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the `Version` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `Activity` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `Activity` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `Feedback` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `Plan` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ShareRole" AS ENUM ('VIEWER', 'EDITOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('VIEW', 'EDIT', 'COMMENT', 'SHARE', 'DELETE');

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_userId_fkey";

-- DropForeignKey
ALTER TABLE "Plan" DROP CONSTRAINT "Plan_userId_fkey";

-- DropForeignKey
ALTER TABLE "Version" DROP CONSTRAINT "Version_planId_fkey";

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "data",
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Feedback" DROP COLUMN "rating",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "content",
DROP COLUMN "published",
DROP COLUMN "userId",
ADD COLUMN     "ownerId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Version";

-- CreateTable
CREATE TABLE "PlanVersion" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "planId" TEXT NOT NULL,

    CONSTRAINT "PlanVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanShare" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "ShareRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanPermission" (
    "id" TEXT NOT NULL,
    "shareId" TEXT NOT NULL,
    "permission" "Permission" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanPermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlanShare_planId_userId_key" ON "PlanShare"("planId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanPermission_shareId_permission_key" ON "PlanPermission"("shareId", "permission");

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanVersion" ADD CONSTRAINT "PlanVersion_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanShare" ADD CONSTRAINT "PlanShare_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanShare" ADD CONSTRAINT "PlanShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanPermission" ADD CONSTRAINT "PlanPermission_shareId_fkey" FOREIGN KEY ("shareId") REFERENCES "PlanShare"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
