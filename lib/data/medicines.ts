import { db } from '@/lib/db';
import { serializeDecimal } from '@/lib/utils';
import type { MedicineListItem } from '@/lib/types/app';

type DecimalLike = { toNumber(): number } | number | null | undefined;

type MedicineWithPrescription = {
  id: string;
  name: string;
  supplier: string | null;
  purchasePrice: DecimalLike;
  salePrice: DecimalLike;
  prescriptionIssuedAt: Date | null;
  prescriptionDurationMonths: number | null;
  batches: Array<{
    id: string;
    batchNumber: string;
    expirationDate: Date;
    quantityAvailable: number;
  }>;
};

type MedicineLegacy = {
  id: string;
  name: string;
  supplier: string | null;
  purchasePrice: DecimalLike;
  salePrice: DecimalLike;
  batches: Array<{
    id: string;
    batchNumber: string;
    expirationDate: Date;
    quantityAvailable: number;
  }>;
};

function calculateDaysUntil(date: Date) {
  const diff = date.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
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

function getPrescriptionStatus(issuedAt?: Date | null, durationMonths?: number | null) {
  if (!issuedAt || !durationMonths) {
    return {
      status: 'none' as const,
      expiresAt: undefined,
      days: undefined,
    };
  }

  const expiresAt = addMonths(issuedAt, durationMonths);
  const days = calculateDaysUntil(expiresAt);

  if (days < 0) {
    return {
      status: 'expired' as const,
      expiresAt,
      days,
    };
  }

  if (days <= 7) {
    return {
      status: 'expiring' as const,
      expiresAt,
      days,
    };
  }

  return {
    status: 'active' as const,
    expiresAt,
    days,
  };
}

function isMissingPrescriptionColumnError(error: unknown) {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  const prismaError = error as { code?: string; meta?: { column?: string } };
  return (
    prismaError.code === 'P2022' &&
    (prismaError.meta?.column === 'Medicine.prescriptionIssuedAt' ||
      prismaError.meta?.column === 'Medicine.prescriptionDurationMonths')
  );
}

async function getMedicinesWithPrescription(businessId: string): Promise<MedicineWithPrescription[]> {
  return db.medicine.findMany({
    where: { businessId },
    select: {
      id: true,
      name: true,
      supplier: true,
      purchasePrice: true,
      salePrice: true,
      prescriptionIssuedAt: true,
      prescriptionDurationMonths: true,
      batches: {
        select: {
          id: true,
          batchNumber: true,
          expirationDate: true,
          quantityAvailable: true,
        },
        orderBy: { expirationDate: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function getMedicinesLegacy(businessId: string): Promise<MedicineLegacy[]> {
  return db.medicine.findMany({
    where: { businessId },
    select: {
      id: true,
      name: true,
      supplier: true,
      purchasePrice: true,
      salePrice: true,
      batches: {
        select: {
          id: true,
          batchNumber: true,
          expirationDate: true,
          quantityAvailable: true,
        },
        orderBy: { expirationDate: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

function mapMedicine(medicine: MedicineWithPrescription | MedicineLegacy): MedicineListItem {
  const stockTotal = medicine.batches.reduce((sum, batch) => sum + batch.quantityAvailable, 0);
  const nextExpiration = medicine.batches[0]?.expirationDate;
  const expiration = getExpirationStatus(nextExpiration);
  const hasPrescriptionFields = 'prescriptionIssuedAt' in medicine;
  const prescription = getPrescriptionStatus(
    hasPrescriptionFields ? medicine.prescriptionIssuedAt : undefined,
    hasPrescriptionFields ? medicine.prescriptionDurationMonths : undefined,
  );

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
    prescriptionIssuedAt:
      hasPrescriptionFields && medicine.prescriptionIssuedAt
        ? medicine.prescriptionIssuedAt.toISOString()
        : undefined,
    prescriptionDurationMonths:
      hasPrescriptionFields ? medicine.prescriptionDurationMonths ?? undefined : undefined,
    prescriptionExpiresAt: prescription.expiresAt ? prescription.expiresAt.toISOString() : undefined,
    prescriptionStatus: prescription.status,
    prescriptionDaysRemaining: prescription.days,
    batches: medicine.batches.map((batch) => ({
      id: batch.id,
      batchNumber: batch.batchNumber,
      expirationDate: batch.expirationDate.toISOString(),
      quantityAvailable: batch.quantityAvailable,
    })),
  };
}

export async function getMedicines(businessId: string): Promise<MedicineListItem[]> {
  try {
    const medicines = await getMedicinesWithPrescription(businessId);
    return medicines.map(mapMedicine);
  } catch (error) {
    if (!isMissingPrescriptionColumnError(error)) {
      throw error;
    }

    console.warn('[medicines] prescription columns missing in database, using legacy query');
    const medicines = await getMedicinesLegacy(businessId);
    return medicines.map(mapMedicine);
  }
}
