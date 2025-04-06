/*
  Warnings:

  - You are about to drop the column `metadata` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `Activity` table. All the data in the column will be lost.
  - Added the required column `project_id` to the `Activity` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_projectId_fkey";

-- DropForeignKey
ALTER TABLE "PlanShare" DROP CONSTRAINT "PlanShare_projectId_fkey";

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "metadata",
DROP COLUMN "projectId",
ADD COLUMN     "details" VARCHAR(500),
ADD COLUMN     "plan_id" TEXT,
ADD COLUMN     "project_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Activity_plan_id_idx" ON "Activity"("plan_id");

-- AddForeignKey
ALTER TABLE "PlanShare" ADD CONSTRAINT "PlanShare_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
