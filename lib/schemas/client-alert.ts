import { ClientAlertType } from '@prisma/client';
import { z } from 'zod';

function isValidDate(value: string) {
  return !Number.isNaN(new Date(value).getTime());
}

export const clientAlertSchema = z
  .object({
    clientId: z.string().cuid('Seleccioná un cliente válido.'),
    type: z.nativeEnum(ClientAlertType),
    title: z.string().trim().min(3, 'Escribí un título claro.'),
    notes: z.string().trim().optional().or(z.literal('')),
    startsAt: z.string().trim().optional().or(z.literal('')),
    expiresAt: z.string().trim().min(1, 'Indicá la fecha de vencimiento.'),
  })
  .superRefine((value, ctx) => {
    if (!isValidDate(value.expiresAt)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['expiresAt'], message: 'Indicá una fecha de vencimiento válida.' });
    }

    if (value.startsAt && !isValidDate(value.startsAt)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['startsAt'], message: 'La fecha de inicio no es válida.' });
    }

    if (value.startsAt && isValidDate(value.startsAt) && isValidDate(value.expiresAt)) {
      if (new Date(value.startsAt) > new Date(value.expiresAt)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['startsAt'],
          message: 'La fecha de inicio no puede ser posterior al vencimiento.',
        });
      }
    }
  });

export const deleteClientAlertSchema = z.object({
  clientAlertId: z.string().cuid('Vigencia inválida.'),
});

export const resolveClientAlertSchema = z.object({
  clientAlertId: z.string().cuid('Vigencia inválida.'),
});
