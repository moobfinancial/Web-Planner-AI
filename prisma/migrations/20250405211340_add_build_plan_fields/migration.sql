-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "buildPlanChangelog" JSONB,
ADD COLUMN     "buildPlanMetadata" JSONB,
ADD COLUMN     "buildPlanProgress" JSONB,
ADD COLUMN     "oneShotPrompt" TEXT;
