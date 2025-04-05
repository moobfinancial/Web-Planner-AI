-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "planVersionId" TEXT;

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "researchData" JSONB;

-- AlterTable
ALTER TABLE "PlanVersion" ADD COLUMN     "prompts" JSONB;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_planVersionId_fkey" FOREIGN KEY ("planVersionId") REFERENCES "PlanVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
