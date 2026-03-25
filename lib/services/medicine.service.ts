import { randomUUID } from 'node:crypto';
import { AuditAction, Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { deleteBatchSchema, deleteMedicineSchema, medicineBatchSchema, medicineSaleSchema, medicineSchema } from '@/lib/schemas/medicine';
import { createAuditLog } from '@/lib/services/audit.service';
import type { UserContext } from '@/lib/types/app';

function isMissingPrescriptionColumnError(error: unknown) {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  const prismaError = error as { code?: string; meta?: { column?: string } };
  const column = prismaError.meta?.column ?? '';

  return (
    prismaError.code === 'P2022' &&
    (column === 'Medicine.prescriptionIssuedAt' ||
      column === 'prescriptionIssuedAt' ||
      column === 'Medicine.prescriptionDurationMonths' ||
      column === 'prescriptionDurationMonths')
  );
}

export async function createMedicine(user: UserContext, input: unknown) {
  const parsed = medicineSchema.safeParse(input);

  if (parsed.success === false) {
    return { ok: false as const, message: parsed.error.issues[0]?.message || 'Datos inválidos.' };
  }

  let medicine;

  try {
    medicine = await db.medicine.create({
      data: {
        businessId: user.businessId,
        createdByUserId: user.userId,
        name: parsed.data.name,
        supplier: parsed.data.supplier || null,
        purchasePrice: parsed.data.purchasePrice,
        salePrice: parsed.data.salePrice,
        prescriptionIssuedAt: parsed.data.prescriptionIssuedAt ? new Date(parsed.data.prescriptionIssuedAt) : null,
        prescriptionDurationMonths:
          parsed.data.prescriptionDurationMonths === '' || parsed.data.prescriptionDurationMonths === undefined
            ? null
            : parsed.data.prescriptionDurationMonths,
      },
    });
  } catch (error) {
    if (!isMissingPrescriptionColumnError(error)) {
      throw error;
    }

    console.warn('[medicine] prescription columns missing in database, creating medicine without prescription fields');
    const legacyMedicineId = randomUUID();

    await db.$executeRaw(Prisma.sql`
      INSERT INTO "Medicine" ("id", "businessId", "createdByUserId", "name", "supplier", "purchasePrice", "salePrice", "createdAt", "updatedAt")
      VALUES (
        ${legacyMedicineId},
        ${user.businessId},
        ${user.userId},
        ${parsed.data.name},
        ${parsed.data.supplier || null},
        ${parsed.data.purchasePrice},
        ${parsed.data.salePrice},
        NOW(),
        NOW()
      )
    `);

    medicine = {
      id: legacyMedicineId,
    };
  }

  await createAuditLog({
    businessId: user.businessId,
    actorUserId: user.userId,
    entityType: 'medicine',
    entityId: medicine.id,
    action: AuditAction.CREATE,
    description: 'Alta de medicamento.',
  });

  return { ok: true as const };
}

export async function deleteMedicine(user: UserContext, input: unknown) {
  const parsed = deleteMedicineSchema.safeParse(input);

  if (parsed.success === false) {
    return { ok: false as const, message: 'Medicamento inválido.' };
  }

  const medicine = await db.medicine.findFirst({
    where: { id: parsed.data.medicineId, businessId: user.businessId },
    select: { id: true },
  });

  if (medicine === null) {
    return { ok: false as const, message: 'Medicamento no encontrado.' };
  }

  await db.$transaction(async (tx) => {
    await tx.medicineSale.deleteMany({
      where: {
        medicineId: medicine.id,
        businessId: user.businessId,
      },
    });

    await tx.medicineBatch.deleteMany({
      where: {
        medicineId: medicine.id,
      },
    });

    await tx.medicine.deleteMany({
      where: {
        id: medicine.id,
        businessId: user.businessId,
      },
    });
  });

  await createAuditLog({
    businessId: user.businessId,
    actorUserId: user.userId,
    entityType: 'medicine',
    entityId: medicine.id,
    action: AuditAction.DELETE,
    description: 'Baja de medicamento.',
  });

  return { ok: true as const };
}

export async function createMedicineBatch(user: UserContext, input: unknown) {
  const parsed = medicineBatchSchema.safeParse(input);

  if (parsed.success === false) {
    return { ok: false as const, message: parsed.error.issues[0]?.message || 'Datos inválidos.' };
  }

  const medicine = await db.medicine.findFirst({
    where: { id: parsed.data.medicineId, businessId: user.businessId },
    select: { id: true },
  });

  if (medicine === null) {
    return { ok: false as const, message: 'Medicamento no encontrado.' };
  }

  const batch = await db.medicineBatch.create({
    data: {
      medicineId: medicine.id,
      batchNumber: parsed.data.batchNumber,
      expirationDate: new Date(parsed.data.expirationDate),
      quantityAvailable: parsed.data.quantityAvailable,
    },
  });

  await createAuditLog({
    businessId: user.businessId,
    actorUserId: user.userId,
    entityType: 'medicine_batch',
    entityId: batch.id,
    action: AuditAction.CREATE,
    description: 'Alta de lote de medicamento.',
  });

  return { ok: true as const };
}

export async function deleteMedicineBatch(user: UserContext, input: unknown) {
  const parsed = deleteBatchSchema.safeParse(input);

  if (parsed.success === false) {
    return { ok: false as const, message: 'Lote inválido.' };
  }

  const batch = await db.medicineBatch.findFirst({
    where: {
      id: parsed.data.batchId,
      medicine: { businessId: user.businessId },
    },
  });

  if (batch === null) {
    return { ok: false as const, message: 'Lote no encontrado.' };
  }

  await db.medicineBatch.delete({ where: { id: batch.id } });

  await createAuditLog({
    businessId: user.businessId,
    actorUserId: user.userId,
    entityType: 'medicine_batch',
    entityId: batch.id,
    action: AuditAction.DELETE,
    description: 'Baja de lote de medicamento.',
  });

  return { ok: true as const };
}

export async function sellMedicine(user: UserContext, input: unknown) {
  const parsed = medicineSaleSchema.safeParse(input);

  if (parsed.success === false) {
    return { ok: false as const, message: parsed.error.issues[0]?.message || 'Datos inválidos.' };
  }

  const medicine = await db.medicine.findFirst({
    where: { id: parsed.data.medicineId, businessId: user.businessId },
    select: {
      id: true,
      salePrice: true,
      batches: {
        where: { quantityAvailable: { gt: 0 } },
        orderBy: { expirationDate: 'asc' },
        select: {
          id: true,
          quantityAvailable: true,
          expirationDate: true,
        },
      },
    },
  });

  if (medicine === null) {
    return { ok: false as const, message: 'Medicamento no encontrado.' };
  }

  const stockTotal = medicine.batches.reduce((sum, batch) => sum + batch.quantityAvailable, 0);

  if (stockTotal < parsed.data.quantity) {
    return { ok: false as const, message: 'Stock insuficiente. Disponible: ' + stockTotal + '.' };
  }

  await db.$transaction(async (tx) => {
    let quantityRemaining = parsed.data.quantity;

    for (const batch of medicine.batches) {
      if (quantityRemaining <= 0) {
        break;
      }

      const consumed = Math.min(batch.quantityAvailable, quantityRemaining);
      quantityRemaining -= consumed;

      await tx.medicineBatch.update({
        where: { id: batch.id },
        data: { quantityAvailable: batch.quantityAvailable - consumed },
      });
    }

    await tx.medicineSale.create({
      data: {
        businessId: user.businessId,
        medicineId: medicine.id,
        createdByUserId: user.userId,
        quantity: parsed.data.quantity,
        unitPrice: medicine.salePrice,
        totalAmount: Number(medicine.salePrice) * parsed.data.quantity,
        soldAt: new Date(),
      },
    });
  });

  await createAuditLog({
    businessId: user.businessId,
    actorUserId: user.userId,
    entityType: 'medicine_sale',
    entityId: medicine.id,
    action: AuditAction.CREATE,
    description: 'Salida de medicamento con descuento FIFO.',
    metadata: { quantity: parsed.data.quantity },
  });

  return { ok: true as const, message: 'Salida registrada correctamente.' };
}
