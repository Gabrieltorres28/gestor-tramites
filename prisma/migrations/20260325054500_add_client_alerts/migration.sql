-- CreateEnum
CREATE TYPE "ClientAlertType" AS ENUM ('PRESCRIPTION', 'SUBSIDY', 'DOCUMENT', 'APPOINTMENT', 'OTHER');

-- CreateTable
CREATE TABLE "ClientAlert" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "createdByUserId" TEXT NOT NULL,
  "type" "ClientAlertType" NOT NULL,
  "title" TEXT NOT NULL,
  "notes" TEXT,
  "startsAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ClientAlert_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ClientAlert_businessId_expiresAt_idx" ON "ClientAlert"("businessId", "expiresAt");
CREATE INDEX "ClientAlert_clientId_expiresAt_idx" ON "ClientAlert"("clientId", "expiresAt");
CREATE INDEX "ClientAlert_businessId_resolvedAt_idx" ON "ClientAlert"("businessId", "resolvedAt");

ALTER TABLE "ClientAlert" ADD CONSTRAINT "ClientAlert_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BusinessSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClientAlert" ADD CONSTRAINT "ClientAlert_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClientAlert" ADD CONSTRAINT "ClientAlert_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
