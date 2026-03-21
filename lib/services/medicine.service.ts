import { AuditAction } from '@prisma/client';
import { db } from '@/lib/db';
import { deleteBatchSchema, deleteMedicineSchema, medicineBatchSchema, medicineSaleSchema, medicineSchema } from '@/lib/schemas/medicine';
import { createAuditLog } from '@/lib/services/audit.service';
import type { UserContext } from '@/lib/types/app';

export async function createMedicine(user: UserContext, input: unknown) {
  const parsed = medicineSchema.safeParse(input);

  if (parsed.success === false) {
    return { ok: false as const, message: parsed.error.issues[0]?.message || 'Datos inválidos.' };
  }

  const medicine = await db.medicine.create({
    data: {
      businessId: user.businessId,
      createdByUserId: user.userId,
      name: parsed.data.name,
      supplier: parsed.data.supplier || null,
      purchasePrice: parsed.data.purchasePrice,
      salePrice: parsed.data.salePrice,
    },
  });

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
  });

  if (medicine === null) {
    return { ok: false as const, message: 'Medicamento no encontrado.' };
  }

  await db.medicine.delete({ where: { id: medicine.id } });

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
    include: {
      batches: {
        where: { quantityAvailable: { gt: 0 } },
        orderBy: { expirationDate: 'asc' },
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
    description: 'Venta de medicamento con descuento FIFO.',
    metadata: { quantity: parsed.data.quantity },
  });

  return { ok: true as const, message: 'Venta procesada correctamente.' };
}
