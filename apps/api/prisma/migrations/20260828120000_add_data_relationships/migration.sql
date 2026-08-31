CREATE TYPE "RelationshipStatus" AS ENUM ('DISCOVERED', 'ACCEPTED', 'REJECTED');

CREATE TABLE "DataRelationship" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "sourceDataSourceId" TEXT NOT NULL,
    "sourceEntity" TEXT NOT NULL,
    "sourceField" TEXT NOT NULL,
    "targetDataSourceId" TEXT NOT NULL,
    "targetEntity" TEXT NOT NULL,
    "targetField" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "rationale" TEXT NOT NULL,
    "status" "RelationshipStatus" NOT NULL DEFAULT 'DISCOVERED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DataRelationship_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DataRelationship_organizationId_status_idx" ON "DataRelationship"("organizationId", "status");
ALTER TABLE "DataRelationship" ADD CONSTRAINT "DataRelationship_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DataRelationship" ADD CONSTRAINT "DataRelationship_sourceDataSourceId_fkey" FOREIGN KEY ("sourceDataSourceId") REFERENCES "DataSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DataRelationship" ADD CONSTRAINT "DataRelationship_targetDataSourceId_fkey" FOREIGN KEY ("targetDataSourceId") REFERENCES "DataSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;