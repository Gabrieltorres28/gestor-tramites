import { z } from 'zod';

const optionalDateString = z.string().trim().optional().or(z.literal(''));
const optionalPositiveInt = z.union([z.coerce.number().int().positive('Ingresá una cantidad válida de meses.'), z.literal('')]).optional();

export const medicineSchema = z.object({
  name: z.string().min(2, 'Ingresá un nombre.'),
  supplier: z.string().trim().optional().or(z.literal('')),
  purchasePrice: z.coerce.number().min(0),
  salePrice: z.coerce.number().min(0),
  prescriptionIssuedAt: optionalDateString,
  prescriptionDurationMonths: optionalPositiveInt,
}).superRefine((data, ctx) => {
  const hasIssuedAt = Boolean(data.prescriptionIssuedAt);
  const hasDuration = data.prescriptionDurationMonths !== undefined && data.prescriptionDurationMonths !== '';

  if (hasIssuedAt && !hasDuration) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['prescriptionDurationMonths'],
      message: 'Ingresá cuántos meses dura la receta.',
    });
  }

  if (!hasIssuedAt && hasDuration) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['prescriptionIssuedAt'],
      message: 'Ingresá la fecha de la receta.',
    });
  }
});

export const medicineBatchSchema = z.object({
  medicineId: z.string().cuid(),
  batchNumber: z.string().min(1, 'Ingresá el número de lote.'),
  expirationDate: z.string().min(1, 'Ingresá la fecha de vencimiento.'),
  quantityAvailable: z.coerce.number().int().positive('La cantidad debe ser mayor a cero.'),
});

export const medicineSaleSchema = z.object({
  medicineId: z.string().cuid(),
  quantity: z.coerce.number().int().positive('La cantidad debe ser mayor a cero.'),
});

export const deleteMedicineSchema = z.object({
  medicineId: z.string().cuid(),
});

export const deleteBatchSchema = z.object({
  batchId: z.string().cuid(),
});
