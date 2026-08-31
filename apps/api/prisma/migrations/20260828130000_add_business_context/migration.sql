CREATE TABLE "BusinessContext" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BusinessContext_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BusinessContext_organizationId_key" ON "BusinessContext"("organizationId");
ALTER TABLE "BusinessContext" ADD CONSTRAINT "BusinessContext_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;