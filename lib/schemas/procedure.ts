import { ProcedureStatus, ProcedureType } from '@prisma/client';
import { z } from 'zod';

export const procedureSchema = z.object({
  clientId: z.string().cuid(),
  type: z.nativeEnum(ProcedureType),
  status: z.nativeEnum(ProcedureStatus),
  amountManaged: z.coerce.number().positive('El monto debe ser mayor a cero.'),
  commissionRate: z.coerce.number().min(0).max(100),
  startedAt: z.string().min(1, 'Ingresá una fecha válida.'),
  description: z.string().trim().optional().or(z.literal('')),
});

export const updateProcedureStatusSchema = z.object({
  procedureId: z.string().cuid(),
  status: z.nativeEnum(ProcedureStatus),
});

export const deleteProcedureSchema = z.object({
  procedureId: z.string().cuid(),
});
