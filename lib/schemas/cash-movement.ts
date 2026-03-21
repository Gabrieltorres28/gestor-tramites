import { CashMovementType, PaymentMethod } from '@prisma/client';
import { z } from 'zod';

export const cashMovementSchema = z.object({
  type: z.nativeEnum(CashMovementType),
  paymentMethod: z.nativeEnum(PaymentMethod),
  description: z.string().min(3, 'Ingresá una descripción.'),
  amount: z.coerce.number().positive('El monto debe ser mayor a cero.'),
  movementDate: z.string().min(1, 'Ingresá una fecha válida.'),
});

export const deleteCashMovementSchema = z.object({
  movementId: z.string().cuid(),
});
