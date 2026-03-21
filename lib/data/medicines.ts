import { db } from '@/lib/db';
import { serializeDecimal } from '@/lib/utils';
import type { MedicineListItem } from '@/lib/types/app';

function calculateDaysUntil(date: Date) {
  const diff = date.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getExpirationStatus(nextExpiration?: Date) {
  if (nextExpiration === undefined) {
    return { status: 'ok' as const, days: undefined };
  }

  const days = calculateDaysUntil(nextExpiration);

  if (days < 0) {
    return { status: 'vencido' as const, days };
  }

  if (days <= 60) {
    return { status: 'proximo' as const, days };
  }

  return { status: 'ok' as const, days };
}

export async function getMedicines(businessId: string): Promise<MedicineListItem[]> {
  const medicines = await db.medicine.findMany({
    where: { businessId },
    include: {
      batches: {
        orderBy: { expirationDate: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return medicines.map((medicine) => {
    const stockTotal = medicine.batches.reduce((sum, batch) => sum + batch.quantityAvailable, 0);
    const nextExpiration = medicine.batches[0]?.expirationDate;
    const expiration = getExpirationStatus(nextExpiration);

    return {
      id: medicine.id,
      name: medicine.name,
      supplier: medicine.supplier || '',
      purchasePrice: serializeDecimal(medicine.purchasePrice),
      salePrice: serializeDecimal(medicine.salePrice),
      stockTotal,
      nextExpiration: nextExpiration ? nextExpiration.toISOString() : undefined,
      expirationStatus: expiration.status,
      expirationDays: expiration.days,
      batches: medicine.batches.map((batch) => ({
        id: batch.id,
        batchNumber: batch.batchNumber,
        expirationDate: batch.expirationDate.toISOString(),
        quantityAvailable: batch.quantityAvailable,
      })),
    };
  });
}
