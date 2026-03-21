import { z } from 'zod';

export const businessSettingsSchema = z.object({
  businessName: z.string().min(3, 'Ingresá un nombre comercial.'),
  ownerName: z.string().min(2, 'Ingresá un responsable.'),
  defaultCommissionRate: z.coerce.number().min(0).max(100),
});
