import { z } from 'zod';

export const medicineSchema = z
  .object({
    name: z.string().min(2, 'Ingresá un nombre.'),
    supplier: z.string().trim().optional().or(z.literal('')),
    purchasePrice: z.coerce.number().min(0),
    salePrice: z.coerce.number().min(0),
    prescriptionIssuedAt: z.string().trim().optional().or(z.literal('')),
    prescriptionDurationMonths: z
      .union([z.literal(''), z.coerce.number().int().positive('La duración debe ser mayor a cero.')])
      .optional(),
  })
  .superRefine((data, ctx) => {
    const hasIssuedAt = Boolean(data.prescriptionIssuedAt);
    const hasDuration = data.prescriptionDurationMonths !== undefined && data.prescriptionDurationMonths !== '';

    if (hasDuration && !hasIssuedAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['prescriptionIssuedAt'],
        message: 'Ingresá la fecha de la receta para guardar su vigencia.',
      });
    }

    if (hasIssuedAt && !hasDuration) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['prescriptionDurationMonths'],
        message: 'Indicá cuántos meses dura la receta.',
      });
    }
  });

export const medicineBatchSchema = z.object({
  medicineId: z.string().min(1, 'Medicamento inválido.'),
  batchNumber: z.string().min(1, 'Ingresá el número de lote.'),
  expirationDate: z.string().min(1, 'Ingresá la fecha de vencimiento.'),
  quantityAvailable: z.coerce.number().int().positive('La cantidad debe ser mayor a cero.'),
});

export const medicineSaleSchema = z.object({
  medicineId: z.string().min(1, 'Medicamento inválido.'),
  quantity: z.coerce.number().int().positive('La cantidad debe ser mayor a cero.'),
});

export const deleteMedicineSchema = z.object({
  medicineId: z.string().min(1, 'Medicamento inválido.'),
});

export const deleteBatchSchema = z.object({
  batchId: z.string().min(1, 'Lote inválido.'),
});
