CREATE TYPE "OrganizationPlan" AS ENUM ('SMALL', 'MID_SCALE', 'ENTERPRISE');

ALTER TABLE "Organization" ADD COLUMN "plan" "OrganizationPlan" NOT NULL DEFAULT 'SMALL';