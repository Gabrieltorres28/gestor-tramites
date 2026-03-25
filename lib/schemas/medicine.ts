import { z } from 'zod';

export const medicineSchema = z.object({
  name: z.string().min(2, 'Ingresá un nombre.'),
  supplier: z.string().trim().optional().or(z.literal('')),
  purchasePrice: z.coerce.number().min(0),
  salePrice: z.coerce.number().min(0),
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
