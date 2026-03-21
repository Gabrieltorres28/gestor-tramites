import { ProcedureType } from '@prisma/client';
import { z } from 'zod';

export const clientSchema = z.object({
  fullName: z.string().min(3, 'Ingresá el nombre completo.'),
  dni: z.string().min(6, 'Ingresá un DNI válido.'),
  phone: z.string().trim().optional().or(z.literal('')),
  email: z.string().trim().email('Ingresá un email válido.').optional().or(z.literal('')),
  notes: z.string().trim().optional().or(z.literal('')),
  procedureType: z.nativeEnum(ProcedureType),
  commissionRate: z.coerce.number().min(0).max(100),
});

export const deleteClientSchema = z.object({
  clientId: z.string().cuid(),
});
