-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'OPERATOR');
CREATE TYPE "ClientStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "ProcedureStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'PAID');
CREATE TYPE "ProcedureType" AS ENUM ('RETIREMENT', 'PENSION', 'MEDICINES', 'SUBSIDY', 'OTHER');
CREATE TYPE "CashMovementType" AS ENUM ('COMMISSION_INCOME', 'CLIENT_INCOME', 'EXPENSE', 'WITHDRAWAL');
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'CHECK', 'DEBIT', 'CREDIT');
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT');

CREATE TABLE "BusinessSettings" (
  "id" TEXT NOT NULL,
  "businessName" TEXT NOT NULL,
  "ownerName" TEXT NOT NULL,
  "defaultCommissionRate" DECIMAL(5,2) NOT NULL DEFAULT 15,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BusinessSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'OPERATOR',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Client" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "createdByUserId" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "dni" TEXT NOT NULL,
  "phone" TEXT,
  "email" TEXT,
  "notes" TEXT,
  "status" "ClientStatus" NOT NULL DEFAULT 'ACTIVE',
  "procedureType" "ProcedureType" NOT NULL,
  "commissionRate" DECIMAL(5,2) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Procedure" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "createdByUserId" TEXT NOT NULL,
  "type" "ProcedureType" NOT NULL,
  "status" "ProcedureStatus" NOT NULL DEFAULT 'IN_PROGRESS',
  "amountManaged" DECIMAL(14,2) NOT NULL,
  "commissionRate" DECIMAL(5,2) NOT NULL,
  "commissionAmount" DECIMAL(14,2) NOT NULL,
  "startedAt" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3),
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Procedure_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CashMovement" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "createdByUserId" TEXT NOT NULL,
  "procedureId" TEXT,
  "type" "CashMovementType" NOT NULL,
  "paymentMethod" "PaymentMethod" NOT NULL,
  "description" TEXT NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL,
  "movementDate" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CashMovement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Medicine" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "createdByUserId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "supplier" TEXT,
  "purchasePrice" DECIMAL(14,2) NOT NULL,
  "salePrice" DECIMAL(14,2) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Medicine_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MedicineBatch" (
  "id" TEXT NOT NULL,
  "medicineId" TEXT NOT NULL,
  "batchNumber" TEXT NOT NULL,
  "expirationDate" TIMESTAMP(3) NOT NULL,
  "quantityAvailable" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MedicineBatch_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MedicineSale" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "medicineId" TEXT NOT NULL,
  "createdByUserId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unitPrice" DECIMAL(14,2) NOT NULL,
  "totalAmount" DECIMAL(14,2) NOT NULL,
  "soldAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MedicineSale_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "actorUserId" TEXT,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "action" "AuditAction" NOT NULL,
  "description" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Client_businessId_dni_key" ON "Client"("businessId", "dni");
CREATE INDEX "User_businessId_idx" ON "User"("businessId");
CREATE INDEX "Client_businessId_fullName_idx" ON "Client"("businessId", "fullName");
CREATE INDEX "Procedure_businessId_status_idx" ON "Procedure"("businessId", "status");
CREATE INDEX "Procedure_clientId_idx" ON "Procedure"("clientId");
CREATE INDEX "CashMovement_businessId_movementDate_idx" ON "CashMovement"("businessId", "movementDate");
CREATE INDEX "Medicine_businessId_name_idx" ON "Medicine"("businessId", "name");
CREATE INDEX "MedicineBatch_medicineId_expirationDate_idx" ON "MedicineBatch"("medicineId", "expirationDate");
CREATE INDEX "MedicineSale_businessId_soldAt_idx" ON "MedicineSale"("businessId", "soldAt");
CREATE INDEX "AuditLog_businessId_createdAt_idx" ON "AuditLog"("businessId", "createdAt");
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

ALTER TABLE "User" ADD CONSTRAINT "User_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BusinessSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Client" ADD CONSTRAINT "Client_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BusinessSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Client" ADD CONSTRAINT "Client_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Procedure" ADD CONSTRAINT "Procedure_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BusinessSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Procedure" ADD CONSTRAINT "Procedure_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Procedure" ADD CONSTRAINT "Procedure_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CashMovement" ADD CONSTRAINT "CashMovement_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BusinessSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CashMovement" ADD CONSTRAINT "CashMovement_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CashMovement" ADD CONSTRAINT "CashMovement_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "Procedure"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Medicine" ADD CONSTRAINT "Medicine_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BusinessSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Medicine" ADD CONSTRAINT "Medicine_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MedicineBatch" ADD CONSTRAINT "MedicineBatch_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MedicineSale" ADD CONSTRAINT "MedicineSale_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BusinessSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MedicineSale" ADD CONSTRAINT "MedicineSale_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MedicineSale" ADD CONSTRAINT "MedicineSale_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BusinessSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
