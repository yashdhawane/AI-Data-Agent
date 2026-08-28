-- Store a normalized organization name so names are unique regardless of case or surrounding whitespace.
ALTER TABLE "Organization" ADD COLUMN "normalizedName" TEXT NOT NULL DEFAULT '';
UPDATE "Organization" SET "normalizedName" = lower(trim("name"));
ALTER TABLE "Organization" ALTER COLUMN "normalizedName" DROP DEFAULT;
CREATE UNIQUE INDEX "Organization_normalizedName_key" ON "Organization"("normalizedName");

CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MEMBER');
ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'MEMBER';
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;